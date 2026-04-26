<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class ParkingSpotRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->role === 'owner';
    }

    public function prepareForValidation(): void
    {
        $this->merge([
            'available_from' => $this->available_from === 'null' || $this->available_from === '' ? null : $this->available_from,
            'available_to' => $this->available_to === 'null' || $this->available_to === '' ? null : $this->available_to,
        ]);
    }

    public function rules(): array
    {
        $required = $this->isMethod('post') ? 'required' : 'sometimes';

        return [
            'title' => [$required, 'string', 'max:160'],
            'description' => ['nullable', 'string', 'max:2000'],
            'address' => [$required, 'string', 'max:255'],
            'city' => [$required, 'string', 'max:120'],
            'latitude' => [$required, 'numeric', 'between:-90,90'],
            'longitude' => [$required, 'numeric', 'between:-180,180'],
            'price_per_hour' => [$required, 'numeric', 'min:0'],
            'price_per_day' => ['nullable', 'numeric', 'min:0'],
            'available_from' => ['nullable', 'date_format:H:i'],
            'available_to' => ['nullable', 'date_format:H:i'],
            'is_available' => ['sometimes', 'boolean'],
            'approval_mode' => ['sometimes', 'boolean'],
            'status' => ['sometimes', 'in:draft,active,paused,archived'],
            'images' => ['sometimes', 'array', 'max:6'],
            'images.*' => ['image', 'mimes:jpg,jpeg,png,webp', 'max:4096'],
        ];
    }
}
