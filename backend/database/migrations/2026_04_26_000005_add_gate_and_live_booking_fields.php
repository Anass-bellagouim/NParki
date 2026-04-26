<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Str;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('parking_spots', function (Blueprint $table) {
            $table->string('gate_code')->nullable()->unique()->after('approval_mode');
        });

        DB::table('parking_spots')
            ->whereNull('gate_code')
            ->orderBy('id')
            ->get(['id'])
            ->each(function ($spot) {
                DB::table('parking_spots')
                    ->where('id', $spot->id)
                    ->update(['gate_code' => 'NP-'.Str::upper(Str::random(10))]);
            });

        if (DB::connection()->getDriverName() === 'mysql') {
            DB::statement("ALTER TABLE bookings MODIFY status ENUM('pending', 'accepted', 'rejected', 'cancelled', 'checked_in', 'awaiting_payment', 'completed') DEFAULT 'pending'");
        }

        Schema::table('bookings', function (Blueprint $table) {
            $table->dateTime('reserved_until')->nullable()->index()->after('end_time');
            $table->dateTime('checked_in_at')->nullable()->index()->after('reserved_until');
            $table->dateTime('checked_out_at')->nullable()->after('checked_in_at');
            $table->unsignedInteger('duration_minutes')->nullable()->after('checked_out_at');
            $table->enum('payment_method', ['cash', 'online'])->nullable()->after('status');
            $table->enum('payment_status', ['unpaid', 'paid'])->default('unpaid')->after('payment_method');
            $table->string('payment_reference')->nullable()->after('payment_status');
        });
    }

    public function down(): void
    {
        Schema::table('bookings', function (Blueprint $table) {
            $table->dropColumn([
                'reserved_until',
                'checked_in_at',
                'checked_out_at',
                'duration_minutes',
                'payment_method',
                'payment_status',
                'payment_reference',
            ]);
        });

        if (DB::connection()->getDriverName() === 'mysql') {
            DB::statement("ALTER TABLE bookings MODIFY status ENUM('pending', 'accepted', 'rejected', 'cancelled', 'completed') DEFAULT 'pending'");
        }

        Schema::table('parking_spots', function (Blueprint $table) {
            $table->dropUnique(['gate_code']);
            $table->dropColumn('gate_code');
        });
    }
};
