<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('parking_spots', function (Blueprint $table) {
            $table->id();
            $table->foreignId('owner_id')->constrained('users')->cascadeOnDelete();
            $table->string('title');
            $table->text('description')->nullable();
            $table->string('address');
            $table->string('city')->index();
            $table->decimal('latitude', 10, 7)->nullable();
            $table->decimal('longitude', 10, 7)->nullable();
            $table->decimal('price_per_hour', 10, 2);
            $table->decimal('price_per_day', 10, 2)->nullable();
            $table->time('available_from')->nullable();
            $table->time('available_to')->nullable();
            $table->boolean('is_available')->default(true)->index();
            $table->boolean('approval_mode')->default(false);
            $table->enum('status', ['draft', 'active', 'paused', 'archived'])->default('active')->index();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('parking_spots');
    }
};
