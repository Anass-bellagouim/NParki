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
            'qr_code' => $this->qr_code,
            'driver' => new UserResource($this->whenLoaded('user')),
            'parking_spot' => new ParkingSpotResource($this->whenLoaded('parkingSpot')),
            'car' => new CarResource($this->whenLoaded('car')),
            'start_time' => $this->start_time,
            'end_time' => $this->end_time,
            'reserved_until' => $this->reserved_until,
            'checked_in_at' => $this->checked_in_at,
            'checked_out_at' => $this->checked_out_at,
            'duration_minutes' => $this->duration_minutes,
            'total_price' => $this->total_price,
            'status' => $this->status,
            'payment_method' => $this->payment_method,
            'payment_status' => $this->payment_status,
            'payment_reference' => $this->payment_reference,
            'created_at' => $this->created_at,
        ];
    }
}
