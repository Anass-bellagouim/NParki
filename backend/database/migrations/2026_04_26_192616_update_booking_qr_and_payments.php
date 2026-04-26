<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('bookings', function (Blueprint $table) {
            $table->string('qr_code')->unique()->nullable()->after('id');
        });

        if (\Illuminate\Support\Facades\DB::connection()->getDriverName() === 'mysql') {
            \Illuminate\Support\Facades\DB::statement("ALTER TABLE bookings MODIFY payment_status ENUM('unpaid', 'paid', 'cash_pending') DEFAULT 'unpaid'");
        }
    }

    public function down(): void
    {
        if (\Illuminate\Support\Facades\DB::connection()->getDriverName() === 'mysql') {
            \Illuminate\Support\Facades\DB::statement("ALTER TABLE bookings MODIFY payment_status ENUM('unpaid', 'paid') DEFAULT 'unpaid'");
        }

        Schema::table('bookings', function (Blueprint $table) {
            $table->dropUnique(['qr_code']);
            $table->dropColumn('qr_code');
        });
    }
};
