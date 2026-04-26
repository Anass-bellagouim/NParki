<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Booking;
use App\Models\ParkingSpot;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class DashboardController extends Controller
{
    public function owner(Request $request): JsonResponse
    {
        Booking::expireNoShows();

        $spotIds = ParkingSpot::where('owner_id', $request->user()->id)->pluck('id');

        return response()->json([
            'total_parking_spots' => $spotIds->count(),
            'active_bookings' => Booking::whereIn('parking_spot_id', $spotIds)->whereIn('status', ['accepted', 'checked_in', 'awaiting_payment'])->count(),
            'total_earnings' => Booking::whereIn('parking_spot_id', $spotIds)->where('status', 'completed')->sum('total_price'),
            'pending_requests' => Booking::whereIn('parking_spot_id', $spotIds)->where('status', 'pending')->count(),
        ]);
    }

    public function driver(Request $request): JsonResponse
    {
        Booking::expireNoShows();

        return response()->json([
            'upcoming_bookings' => Booking::where('user_id', $request->user()->id)
                ->where('status', 'accepted')
                ->count(),
            'pending_bookings' => Booking::where('user_id', $request->user()->id)->where('status', 'pending')->count(),
            'completed_bookings' => Booking::where('user_id', $request->user()->id)->where('status', 'completed')->count(),
            'cars' => $request->user()->cars()->count(),
        ]);
    }
}
