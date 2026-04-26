<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\BookingRequest;
use App\Http\Resources\BookingResource;
use App\Models\Booking;
use App\Models\Car;
use App\Models\ParkingSpot;
use Carbon\Carbon;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class BookingController extends Controller
{
    public function index(Request $request)
    {
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
        $car = Car::where('id', $request->car_id)
            ->where('user_id', $request->user()->id)
            ->firstOrFail();

        $spot = ParkingSpot::query()
            ->where('status', 'active')
            ->where('is_available', true)
            ->findOrFail($request->parking_spot_id);

        $start = Carbon::parse($request->start_time);
        $end = Carbon::parse($request->end_time);

        if ($this->hasOverlappingBooking($spot, $start, $end)) {
            return response()->json([
                'message' => 'This parking spot is not available for the selected time.',
            ], 422);
        }

        $booking = Booking::create([
            'user_id' => $request->user()->id,
            'parking_spot_id' => $spot->id,
            'car_id' => $car->id,
            'start_time' => $start,
            'end_time' => $end,
            'total_price' => $this->calculatePrice($spot, $start, $end),
            'status' => $spot->approval_mode ? 'pending' : 'accepted',
        ])->load(['parkingSpot.owner', 'parkingSpot.images', 'car', 'user']);

        return response()->json([
            'message' => $booking->status === 'pending'
                ? 'Booking request sent to the parking owner.'
                : 'Parking booked successfully.',
            'booking' => new BookingResource($booking),
        ], 201);
    }

    public function show(Request $request, Booking $booking): BookingResource
    {
        $this->ensureParticipant($request, $booking);

        return new BookingResource($booking->load(['parkingSpot.owner', 'parkingSpot.images', 'car', 'user']));
    }

    public function updateStatus(Request $request, Booking $booking): JsonResponse
    {
        $request->validate([
            'status' => ['required', 'in:accepted,rejected,completed'],
        ]);

        $booking->load('parkingSpot');

        abort_if($booking->parkingSpot->owner_id !== $request->user()->id, 403, 'You can only update bookings for your parking spots.');

        $booking->update([
            'status' => $request->status,
        ]);

        return response()->json([
            'message' => 'Booking status updated.',
            'booking' => new BookingResource($booking->fresh(['parkingSpot.owner', 'parkingSpot.images', 'car', 'user'])),
        ]);
    }

    public function cancel(Request $request, Booking $booking): JsonResponse
    {
        abort_if($booking->user_id !== $request->user()->id, 403, 'You can only cancel your own bookings.');
        abort_if(in_array($booking->status, ['completed', 'rejected'], true), 422, 'This booking can no longer be cancelled.');

        $booking->update(['status' => 'cancelled']);

        return response()->json([
            'message' => 'Booking cancelled.',
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

    private function hasOverlappingBooking(ParkingSpot $spot, Carbon $start, Carbon $end): bool
    {
        return Booking::query()
            ->where('parking_spot_id', $spot->id)
            ->whereIn('status', ['pending', 'accepted'])
            ->where('start_time', '<', $end)
            ->where('end_time', '>', $start)
            ->exists();
    }

    private function calculatePrice(ParkingSpot $spot, Carbon $start, Carbon $end): float
    {
        $minutes = max(60, $start->diffInMinutes($end));
        $hours = $minutes / 60;

        if ($spot->price_per_day && $hours >= 24) {
            $days = ceil($hours / 24);

            return round($days * (float) $spot->price_per_day, 2);
        }

        return round($hours * (float) $spot->price_per_hour, 2);
    }
}
