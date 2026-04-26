<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Booking extends Model
{
    use HasFactory;

    public const PRE_ARRIVAL_STATUSES = ['pending', 'accepted'];

    public const ACTIVE_STATUSES = ['pending', 'accepted', 'checked_in', 'awaiting_payment'];

    protected $fillable = [
        'qr_code',
        'user_id',
        'parking_spot_id',
        'car_id',
        'start_time',
        'end_time',
        'reserved_until',
        'checked_in_at',
        'checked_out_at',
        'duration_minutes',
        'total_price',
        'status',
        'payment_method',
        'payment_status',
        'payment_reference',
    ];

    protected function casts(): array
    {
        return [
            'start_time' => 'datetime',
            'end_time' => 'datetime',
            'reserved_until' => 'datetime',
            'checked_in_at' => 'datetime',
            'checked_out_at' => 'datetime',
            'duration_minutes' => 'integer',
            'total_price' => 'decimal:2',
        ];
    }

    public static function expireNoShows(): int
    {
        return static::query()
            ->whereIn('status', self::PRE_ARRIVAL_STATUSES)
            ->whereNull('checked_in_at')
            ->whereNotNull('reserved_until')
            ->where('reserved_until', '<=', now())
            ->update(['status' => 'cancelled']);
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function parkingSpot(): BelongsTo
    {
        return $this->belongsTo(ParkingSpot::class);
    }

    public function car(): BelongsTo
    {
        return $this->belongsTo(Car::class);
    }
}
