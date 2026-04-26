<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // Admin / Owner
        User::updateOrCreate(
            ['email' => 'admin@nparki.test'],
            [
                'name' => 'Admin NParki',
                'password' => 'password', // Automatically hashed by User model cast
                'role' => 'owner',
            ]
        );

        // Driver
        User::updateOrCreate(
            ['email' => 'driver@nparki.test'],
            [
                'name' => 'Driver NParki',
                'password' => 'password',
                'role' => 'driver',
            ]
        );
    }
}
