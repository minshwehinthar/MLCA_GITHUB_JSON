<?php

namespace Database\Seeders;

use App\Models\Permission;
use App\Models\Role;
use Illuminate\Database\Seeder;

class RolePermissionSeeder extends Seeder
{
    public function run(): void
    {
        $permissions = [
            ['Dashboard', 'dashboard.view', 'Dashboard'],
            ['View Posts', 'posts.view', 'Posts'],
            ['Create Posts', 'posts.create', 'Posts'],
            ['Update Posts', 'posts.update', 'Posts'],
            ['Delete Posts', 'posts.delete', 'Posts'],
            ['Publish Posts', 'posts.publish', 'Posts'],
            ['View Activities', 'activities.view', 'Activities'],
            ['Create Activities', 'activities.create', 'Activities'],
            ['Update Activities', 'activities.update', 'Activities'],
            ['Delete Activities', 'activities.delete', 'Activities'],
            ['View Events', 'events.view', 'Events'],
            ['Create Events', 'events.create', 'Events'],
            ['Update Events', 'events.update', 'Events'],
            ['Delete Events', 'events.delete', 'Events'],
            ['View Gallery', 'gallery.view', 'Gallery'],
            ['Create Gallery', 'gallery.create', 'Gallery'],
            ['Update Gallery', 'gallery.update', 'Gallery'],
            ['Delete Gallery', 'gallery.delete', 'Gallery'],
            ['View Videos', 'videos.view', 'Videos'],
            ['Create Videos', 'videos.create', 'Videos'],
            ['Update Videos', 'videos.update', 'Videos'],
            ['Delete Videos', 'videos.delete', 'Videos'],
            ['View Documents', 'documents.view', 'Documents'],
            ['Create Documents', 'documents.create', 'Documents'],
            ['Update Documents', 'documents.update', 'Documents'],
            ['Delete Documents', 'documents.delete', 'Documents'],
            ['View Members', 'members.view', 'Members'],
            ['Create Members', 'members.create', 'Members'],
            ['Update Members', 'members.update', 'Members'],
            ['Delete Members', 'members.delete', 'Members'],
            ['View Categories', 'categories.view', 'Categories'],
            ['Manage Categories', 'categories.manage', 'Categories'],
            ['View Pages', 'pages.view', 'Pages'],
            ['Manage Pages', 'pages.manage', 'Pages'],
            ['Manage Navigation', 'navigation.manage', 'Navigation'],
            ['Manage Settings', 'settings.manage', 'Settings'],
            ['View Achievements', 'achievements.view', 'Achievements'],
            ['Manage Achievements', 'achievements.manage', 'Achievements'],
            ['Manage Administrators', 'admins.manage', 'Administrators'],
            ['Manage Roles', 'roles.manage', 'Administrators'],
            ['View Messages', 'messages.view', 'Messages'],
            ['View Activity Logs', 'logs.view', 'Activity Logs'],
            ['Upload Media', 'media.upload', 'Media'],
            ['Delete Media', 'media.delete', 'Media'],
        ];

        foreach ($permissions as [$name, $slug, $module]) {
            Permission::updateOrCreate(['slug' => $slug], ['name' => $name, 'module' => $module]);
        }

        $all = Permission::pluck('id');

        $roles = [
            'super-admin' => ['name' => 'Super Administrator', 'description' => 'Full access to the entire system.', 'permissions' => $all],
            'admin' => [
                'name' => 'Administrator',
                'description' => 'Manages most website content and media.',
                'permissions' => Permission::whereNotIn('slug', ['admins.manage', 'roles.manage'])->pluck('id'),
            ],
            'editor' => [
                'name' => 'Editor',
                'description' => 'Creates and edits posts, announcements and content.',
                'permissions' => Permission::whereIn('slug', [
                    'dashboard.view', 'posts.view', 'posts.create', 'posts.update', 'posts.publish',
                    'activities.view', 'activities.create', 'activities.update',
                    'events.view', 'events.create', 'events.update',
                    'gallery.view', 'gallery.create', 'gallery.update',
                    'videos.view', 'videos.create', 'videos.update',
                    'documents.view', 'documents.create', 'documents.update',
                    'categories.view', 'pages.view', 'achievements.view', 'media.upload',
                ])->pluck('id'),
            ],
            'content-manager' => [
                'name' => 'Content Manager',
                'description' => 'Manages assigned content modules.',
                'permissions' => Permission::whereIn('slug', [
                    'dashboard.view', 'posts.view', 'posts.create', 'posts.update',
                    'activities.view', 'activities.create', 'activities.update',
                    'events.view', 'events.create', 'events.update',
                    'gallery.view', 'gallery.create', 'gallery.update',
                    'videos.view', 'videos.create', 'videos.update',
                    'documents.view', 'documents.create', 'documents.update',
                    'members.view', 'members.create', 'members.update',
                    'categories.view', 'media.upload',
                ])->pluck('id'),
            ],
        ];

        foreach ($roles as $slug => $data) {
            $role = Role::updateOrCreate(
                ['slug' => $slug],
                ['name' => $data['name'], 'description' => $data['description']]
            );
            $role->permissions()->sync($data['permissions']);
        }
    }
}
