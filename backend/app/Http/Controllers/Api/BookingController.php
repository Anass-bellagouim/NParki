<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\BookingRequest;
use App\Http\Resources\BookingResource;
use App\Models\Booking;
use App\Models\Car;
use App\Models\ParkingSpot;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class BookingController extends Controller
{
    public function index(Request $request)
    {
        Booking::expireNoShows();

        $query = Booking::query()
            ->with(['parkingSpot.owner', 'parkingSpot.images', 'car', 'user'])
            ->latest();

        if ($request->user()->role === 'owner') {
            $query->whereHas('parkingSpot', fn ($spot) => $spot->where('owner_id', $request->user()->id));
        } else {
            $query->where('user_id', $request->user()->id);
        }

        return BookingResource::collection($query->get());
    }

    public function store(BookingRequest $request): JsonResponse
    {
        Booking::expireNoShows();

        $car = Car::where('id', $request->car_id)
            ->where('user_id', $request->user()->id)
            ->firstOrFail();

        $spot = ParkingSpot::query()
            ->where('status', 'active')
            ->where('is_available', true)
            ->findOrFail($request->parking_spot_id);

        if ($this->hasActiveBooking($spot)) {
            return response()->json([
                'message' => 'This parking spot already has an active reservation or parking session.',
            ], 422);
        }

        $now = now();
        $reservedUntil = $now->copy()->addMinutes(20);

        $booking = Booking::create([
            'qr_code' => 'NP-'.Str::upper(Str::random(12)),
            'user_id' => $request->user()->id,
            'parking_spot_id' => $spot->id,
            'car_id' => $car->id,
            'start_time' => $now,
            'end_time' => $reservedUntil,
            'reserved_until' => $reservedUntil,
            'total_price' => 0,
            'status' => $spot->approval_mode ? 'pending' : 'accepted',
            'payment_status' => 'unpaid',
        ])->load(['parkingSpot.owner', 'parkingSpot.images', 'car', 'user']);

        return response()->json([
            'message' => $booking->status === 'pending'
                ? 'Booking request sent to the parking owner.'
                : 'Parking reserved. Arrive and scan the gate QR code within 20 minutes.',
            'booking' => new BookingResource($booking),
        ], 201);
    }

    public function show(Request $request, Booking $booking): BookingResource
    {
        Booking::expireNoShows();
        $this->ensureParticipant($request, $booking);

        return new BookingResource($booking->load(['parkingSpot.owner', 'parkingSpot.images', 'car', 'user']));
    }

    public function updateStatus(Request $request, Booking $booking): JsonResponse
    {
        Booking::expireNoShows();

        $request->validate([
            'status' => ['required', 'in:accepted,rejected,completed'],
        ]);

        $booking->load('parkingSpot');

        abort_if($booking->parkingSpot->owner_id !== $request->user()->id, 403, 'You can only update bookings for your parking spots.');

        abort_if(in_array($booking->status, ['cancelled', 'rejected', 'completed'], true), 422, 'This booking can no longer be updated.');

        $payload = ['status' => $request->status];

        if ($request->status === 'accepted') {
            $reservedUntil = now()->addMinutes(20);
            $payload['start_time'] = now();
            $payload['end_time'] = $reservedUntil;
            $payload['reserved_until'] = $reservedUntil;
        }

        if ($request->status === 'completed') {
            $payload['payment_status'] = 'paid';
            $payload['payment_reference'] = $booking->payment_reference ?: 'NP-'.Str::upper(Str::random(8));
        }

        $booking->update($payload);

        return response()->json([
            'message' => 'Booking status updated.',
            'booking' => new BookingResource($booking->fresh(['parkingSpot.owner', 'parkingSpot.images', 'car', 'user'])),
        ]);
    }

    public function cancel(Request $request, Booking $booking): JsonResponse
    {
        Booking::expireNoShows();

        abort_if($booking->user_id !== $request->user()->id, 403, 'You can only cancel your own bookings.');
        abort_if(! in_array($booking->status, ['pending', 'accepted'], true), 422, 'This booking can no longer be cancelled.');

        $booking->update(['status' => 'cancelled']);

        return response()->json([
            'message' => 'Booking cancelled.',
            'booking' => new BookingResource($booking->fresh(['parkingSpot.owner', 'parkingSpot.images', 'car', 'user'])),
        ]);
    }

    public function scanQr(Request $request): JsonResponse
    {
        Booking::expireNoShows();

        $request->validate([
            'qr_code' => ['required', 'string'],
        ]);

        $qrCode = Str::upper(trim((string) $request->string('qr_code')));

        $booking = Booking::with(['parkingSpot.owner', 'parkingSpot.images', 'car', 'user'])
            ->where('qr_code', $qrCode)
            ->first();

        if (! $booking) {
            return response()->json(['message' => 'Invalid QR code. No booking found.'], 404);
        }

        abort_if($booking->parkingSpot->owner_id !== $request->user()->id, 403, 'You do not own the parking spot for this booking.');

        if ($booking->status === 'pending') {
            return response()->json([
                'message' => 'You must accept this booking before scanning entry.',
            ], 422);
        }

        if ($booking->status === 'accepted') {
            if ($booking->reserved_until && $booking->reserved_until->lte(now())) {
                $booking->update(['status' => 'cancelled']);

                return response()->json([
                    'message' => 'This booking expired because the driver did not arrive within 20 minutes.',
                    'booking' => new BookingResource($booking->fresh(['parkingSpot.owner', 'parkingSpot.images', 'car', 'user'])),
                ], 422);
            }

            $checkedInAt = now();
            $booking->update([
                'checked_in_at' => $checkedInAt,
                'start_time' => $checkedInAt,
                'end_time' => $checkedInAt,
                'status' => 'checked_in',
                'total_price' => 0,
            ]);

            return response()->json([
                'message' => 'Entry recorded. Car is now parked.',
                'booking' => new BookingResource($booking->fresh(['parkingSpot.owner', 'parkingSpot.images', 'car', 'user'])),
            ]);
        }

        if ($booking->status === 'checked_in') {
            $checkedOutAt = now();
            $durationMinutes = max(1, (int) ceil($booking->checked_in_at->diffInMinutes($checkedOutAt)));

            $booking->update([
                'checked_out_at' => $checkedOutAt,
                'end_time' => $checkedOutAt,
                'duration_minutes' => $durationMinutes,
                'total_price' => $this->calculateRuntimePrice($booking->parkingSpot, $durationMinutes),
                'status' => 'awaiting_payment',
            ]);

            return response()->json([
                'message' => 'Exit recorded. Waiting for driver payment.',
                'booking' => new BookingResource($booking->fresh(['parkingSpot.owner', 'parkingSpot.images', 'car', 'user'])),
            ]);
        }

        return response()->json([
            'message' => 'This booking is not currently active for entry/exit scanning.',
        ], 422);
    }

    public function pay(Request $request, Booking $booking): JsonResponse
    {
        Booking::expireNoShows();

        $request->validate([
            'payment_method' => ['required', 'in:cash,online'],
        ]);

        abort_if($booking->user_id !== $request->user()->id, 403, 'You can only pay for your own booking.');
        abort_if($booking->status !== 'awaiting_payment', 422, 'This booking is not awaiting payment.');

        if ($request->payment_method === 'cash') {
            $booking->update([
                'payment_method' => 'cash',
                'payment_status' => 'cash_pending',
            ]);

            return response()->json([
                'message' => 'Please pay the parking owner in cash. The owner must confirm receipt.',
                'booking' => new BookingResource($booking->fresh(['parkingSpot.owner', 'parkingSpot.images', 'car', 'user'])),
            ]);
        }

        // Online payment logic
        $booking->update([
            'payment_method' => 'online',
            'payment_status' => 'paid',
            'payment_reference' => 'NP-'.Str::upper(Str::random(10)),
            'status' => 'completed',
        ]);

        return response()->json([
            'message' => 'Online payment successful. Booking completed.',
            'booking' => new BookingResource($booking->fresh(['parkingSpot.owner', 'parkingSpot.images', 'car', 'user'])),
        ]);
    }

    public function confirmCash(Request $request, Booking $booking): JsonResponse
    {
        Booking::expireNoShows();
        $booking->loadMissing('parkingSpot');

        abort_if($booking->parkingSpot->owner_id !== $request->user()->id, 403, 'You do not own the parking spot for this booking.');
        abort_if($booking->payment_status !== 'cash_pending', 422, 'This booking is not awaiting cash confirmation.');

        $booking->update([
            'payment_status' => 'paid',
            'payment_reference' => 'CASH-'.Str::upper(Str::random(10)),
            'status' => 'completed',
        ]);

        return response()->json([
            'message' => 'Cash receipt confirmed. Booking completed.',
            'booking' => new BookingResource($booking->fresh(['parkingSpot.owner', 'parkingSpot.images', 'car', 'user'])),
        ]);
    }

    private function ensureParticipant(Request $request, Booking $booking): void
    {
        $booking->loadMissing('parkingSpot');

        abort_if(
            $booking->user_id !== $request->user()->id && $booking->parkingSpot->owner_id !== $request->user()->id,
            403,
            'You are not allowed to view this booking.'
        );
    }

    private function hasActiveBooking(ParkingSpot $spot): bool
    {
        return Booking::query()
            ->where('parking_spot_id', $spot->id)
            ->whereIn('status', Booking::ACTIVE_STATUSES)
            ->exists();
    }

    private function calculateRuntimePrice(ParkingSpot $spot, int $minutes): float
    {
        if ($spot->price_per_day && $minutes >= 1440) {
            $days = ceil($minutes / 1440);

            return round($days * (float) $spot->price_per_day, 2);
        }

        $hours = max(1, ceil($minutes / 60));

        return round($hours * (float) $spot->price_per_hour, 2);
    }
}
