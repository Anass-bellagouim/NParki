<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class CarRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->role === 'driver';
    }

    public function rules(): array
    {
        $carId = $this->route('car')?->id;
        $required = $this->isMethod('post') ? 'required' : 'sometimes';

        return [
            'brand' => [$required, 'string', 'max:80'],
            'model' => [$required, 'string', 'max:80'],
            'plate_number' => [
                $required,
                'string',
                'max:30',
                Rule::unique('cars', 'plate_number')->ignore($carId),
            ],
            'color' => ['nullable', 'string', 'max:50'],
        ];
    }
}
