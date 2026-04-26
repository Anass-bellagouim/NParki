<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\CarRequest;
use App\Http\Resources\CarResource;
use App\Models\Car;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class CarController extends Controller
{
    public function index(Request $request)
    {
        return CarResource::collection(
            Car::where('user_id', $request->user()->id)->latest()->get()
        );
    }

    public function store(CarRequest $request): JsonResponse
    {
        $car = Car::create([
            ...$request->validated(),
            'user_id' => $request->user()->id,
        ]);

        return response()->json([
            'message' => 'Car added successfully.',
            'car' => new CarResource($car),
        ], 201);
    }

    public function update(CarRequest $request, Car $car): JsonResponse
    {
        $this->ensureOwner($request, $car);

        $car->update($request->validated());

        return response()->json([
            'message' => 'Car updated successfully.',
            'car' => new CarResource($car),
        ]);
    }

    public function destroy(Request $request, Car $car): JsonResponse
    {
        $this->ensureOwner($request, $car);
        $car->delete();

        return response()->json([
            'message' => 'Car deleted successfully.',
        ]);
    }

    private function ensureOwner(Request $request, Car $car): void
    {
        abort_if($car->user_id !== $request->user()->id, 403, 'You can only manage your own cars.');
    }
}
