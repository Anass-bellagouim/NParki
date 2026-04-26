<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\ParkingSpotRequest;
use App\Http\Resources\ParkingSpotResource;
use App\Models\Booking;
use App\Models\ParkingImage;
use App\Models\ParkingSpot;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;

class ParkingSpotController extends Controller
{
    public function index(Request $request)
    {
        Booking::expireNoShows();

        $spots = ParkingSpot::query()
            ->with(['owner', 'images'])
            ->where('status', 'active')
            ->where('is_available', true)
            ->whereDoesntHave('bookings', fn ($query) => $query->whereIn('status', Booking::ACTIVE_STATUSES))
            ->when($request->filled('city'), fn ($query) => $query->where('city', 'like', '%'.$request->city.'%'))
            ->when($request->filled('location'), fn ($query) => $query->where(function ($inner) use ($request) {
                $inner->where('address', 'like', '%'.$request->location.'%')
                    ->orWhere('title', 'like', '%'.$request->location.'%');
            }))
            ->when($request->filled('min_price'), fn ($query) => $query->where('price_per_hour', '>=', $request->float('min_price')))
            ->when($request->filled('max_price'), fn ($query) => $query->where('price_per_hour', '<=', $request->float('max_price')))
            ->latest()
            ->paginate($request->integer('per_page', 12));

        return ParkingSpotResource::collection($spots);
    }

    public function ownerIndex(Request $request)
    {
        Booking::expireNoShows();

        $spots = ParkingSpot::query()
            ->with(['images'])
            ->where('owner_id', $request->user()->id)
            ->latest()
            ->get();

        return ParkingSpotResource::collection($spots);
    }

    public function store(ParkingSpotRequest $request): JsonResponse
    {
        $spot = DB::transaction(function () use ($request) {
            $spot = ParkingSpot::create([
                ...$request->safe()->except('images'),
                'owner_id' => $request->user()->id,
                'is_available' => $request->boolean('is_available', true),
                'approval_mode' => $request->boolean('approval_mode'),
                'status' => $request->input('status', 'active'),
            ]);

            $this->storeImages($request, $spot);

            return $spot->load(['owner', 'images']);
        });

        return response()->json([
            'message' => 'Parking spot created successfully.',
            'parking_spot' => new ParkingSpotResource($spot),
        ], 201);
    }

    public function show(ParkingSpot $parkingSpot): ParkingSpotResource
    {
        Booking::expireNoShows();

        return new ParkingSpotResource($parkingSpot->load(['owner', 'images']));
    }

    public function update(ParkingSpotRequest $request, ParkingSpot $parkingSpot): JsonResponse
    {
        $this->ensureOwner($request, $parkingSpot);

        $spot = DB::transaction(function () use ($request, $parkingSpot) {
            $parkingSpot->update($request->safe()->except('images'));
            $this->storeImages($request, $parkingSpot);

            return $parkingSpot->fresh(['owner', 'images']);
        });

        return response()->json([
            'message' => 'Parking spot updated successfully.',
            'parking_spot' => new ParkingSpotResource($spot),
        ]);
    }

    public function destroy(Request $request, ParkingSpot $parkingSpot): JsonResponse
    {
        $this->ensureOwner($request, $parkingSpot);

        foreach ($parkingSpot->images as $image) {
            Storage::disk('public')->delete($image->image_path);
        }

        $parkingSpot->delete();

        return response()->json([
            'message' => 'Parking spot deleted successfully.',
        ]);
    }

    public function destroyImage(Request $request, ParkingImage $image): JsonResponse
    {
        $image->load('parkingSpot');
        $this->ensureOwner($request, $image->parkingSpot);

        Storage::disk('public')->delete($image->image_path);
        $image->delete();

        return response()->json([
            'message' => 'Image deleted successfully.',
        ]);
    }

    private function ensureOwner(Request $request, ParkingSpot $parkingSpot): void
    {
        abort_if($parkingSpot->owner_id !== $request->user()->id, 403, 'You can only manage your own parking spots.');
    }

    private function storeImages(ParkingSpotRequest $request, ParkingSpot $spot): void
    {
        if (! $request->hasFile('images')) {
            return;
        }

        foreach ($request->file('images') as $image) {
            $path = $image->store('parking-spots', 'public');

            $spot->images()->create([
                'image_path' => $path,
            ]);
        }
    }
}
