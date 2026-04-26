<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class BookingRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->role === 'driver';
    }

    public function rules(): array
    {
        return [
            'parking_spot_id' => ['required', 'exists:parking_spots,id'],
            'car_id' => ['required', 'exists:cars,id'],
            'start_time' => ['nullable', 'date', 'after_or_equal:now'],
            'end_time' => ['nullable', 'date', 'after:start_time'],
        ];
    }
}
