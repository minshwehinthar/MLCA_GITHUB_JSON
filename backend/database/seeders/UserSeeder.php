<?php

namespace Database\Seeders;

use App\Models\Role;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class UserSeeder extends Seeder
{
    public function run(): void
    {
        $users = [
            [
                'name' => 'Super Administrator',
                'email' => 'superadmin@mlca.edu',
                'password' => 'Admin@12345',
                'phone' => '+95 9 000 000 001',
                'role' => 'super-admin',
                'bio' => 'Primary system administrator of the Mon Literature and Culture Association.',
            ],
            [
                'name' => 'Association Administrator',
                'email' => 'admin@mlca.edu',
                'password' => 'Admin@12345',
                'phone' => '+95 9 000 000 002',
                'role' => 'admin',
                'bio' => 'Manages day to day content and media of the association.',
            ],
            [
                'name' => 'Content Editor',
                'email' => 'editor@mlca.edu',
                'password' => 'Editor@12345',
                'phone' => '+95 9 000 000 003',
                'role' => 'editor',
                'bio' => 'Writes and edits news, announcements and posts.',
            ],
            [
                'name' => 'Content Manager',
                'email' => 'content@mlca.edu',
                'password' => 'Content@12345',
                'phone' => '+95 9 000 000 004',
                'role' => 'content-manager',
                'bio' => 'Manages activities, events and media content.',
            ],
        ];

        foreach ($users as $data) {
            $user = User::updateOrCreate(
                ['email' => $data['email']],
                [
                    'name' => $data['name'],
                    'password' => Hash::make($data['password']),
                    'phone' => $data['phone'],
                    'bio' => $data['bio'],
                    'is_active' => true,
                    'email_verified_at' => now(),
                ]
            );

            $role = Role::where('slug', $data['role'])->first();
            if ($role) {
                $user->roles()->syncWithoutDetaching([$role->id]);
            }
        }
    }
}
