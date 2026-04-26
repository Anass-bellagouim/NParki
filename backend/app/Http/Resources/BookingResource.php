<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class BookingResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'driver' => new UserResource($this->whenLoaded('user')),
            'parking_spot' => new ParkingSpotResource($this->whenLoaded('parkingSpot')),
            'car' => new CarResource($this->whenLoaded('car')),
            'start_time' => $this->start_time,
            'end_time' => $this->end_time,
            'total_price' => $this->total_price,
            'status' => $this->status,
            'created_at' => $this->created_at,
        ];
    }
}
