<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use Illuminate\Support\Facades\Storage;

class ParkingSpotResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'owner' => new UserResource($this->whenLoaded('owner')),
            'title' => $this->title,
            'description' => $this->description,
            'address' => $this->address,
            'city' => $this->city,
            'latitude' => $this->latitude,
            'longitude' => $this->longitude,
            'price_per_hour' => $this->price_per_hour,
            'price_per_day' => $this->price_per_day,
            'available_from' => $this->available_from,
            'available_to' => $this->available_to,
            'is_available' => $this->is_available,
            'approval_mode' => $this->approval_mode,
            'gate_code' => $this->gate_code,
            'status' => $this->status,
            'images' => $this->whenLoaded('images', fn () => $this->images->map(fn ($image) => [
                'id' => $image->id,
                'url' => Storage::disk('public')->url($image->image_path),
                'path' => $image->image_path,
            ])->values()),
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
        ];
    }
}
