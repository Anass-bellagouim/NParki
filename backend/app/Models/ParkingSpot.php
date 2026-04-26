<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Str;

class ParkingSpot extends Model
{
    use HasFactory;

    protected $fillable = [
        'owner_id',
        'title',
        'description',
        'address',
        'city',
        'latitude',
        'longitude',
        'price_per_hour',
        'price_per_day',
        'available_from',
        'available_to',
        'is_available',
        'approval_mode',
        'gate_code',
        'status',
    ];

    protected function casts(): array
    {
        return [
            'latitude' => 'decimal:7',
            'longitude' => 'decimal:7',
            'price_per_hour' => 'decimal:2',
            'price_per_day' => 'decimal:2',
            'is_available' => 'boolean',
            'approval_mode' => 'boolean',
        ];
    }

    protected static function booted(): void
    {
        static::creating(function (ParkingSpot $spot) {
            if (! $spot->gate_code) {
                $spot->gate_code = 'NP-'.Str::upper(Str::random(10));
            }
        });
    }

    public function owner(): BelongsTo
    {
        return $this->belongsTo(User::class, 'owner_id');
    }

    public function images(): HasMany
    {
        return $this->hasMany(ParkingImage::class);
    }

    public function bookings(): HasMany
    {
        return $this->hasMany(Booking::class);
    }
}
