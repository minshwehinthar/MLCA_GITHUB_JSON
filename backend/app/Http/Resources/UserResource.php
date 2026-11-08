<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class UserResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'email' => $this->email,
            'phone' => $this->phone,
            'avatar' => $this->avatar ? asset('storage/'.$this->avatar) : null,
            'avatar_path' => $this->avatar,
            'bio' => $this->bio,
            'is_active' => $this->is_active,
            'last_login_at' => optional($this->last_login_at)->toIso8601String(),
            'roles' => $this->whenLoaded('roles', fn () => $this->roles->map(fn ($role) => [
                'id' => $role->id,
                'name' => $role->name,
                'slug' => $role->slug,
            ])),
            'permissions' => $this->permissionSlugs(),
            'is_super_admin' => $this->isSuperAdmin(),
            'created_at' => optional($this->created_at)->toIso8601String(),
        ];
    }
}
