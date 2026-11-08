<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class MemberResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'name' => $this->translated('name'),
            'position' => $this->translated('position') ?: $this->position,
            'biography' => $this->translated('biography'),
            'photo' => $this->photo_url,
            'photo_path' => $this->photo,
            'email' => $this->email,
            'phone' => $this->phone,
            'department' => $this->department,
            'academic_year' => $this->academic_year,
            'facebook' => $this->facebook,
            'telegram' => $this->telegram,
            'is_executive' => $this->is_executive,
            'is_active' => $this->is_active,
            'order' => $this->order,
            'translations' => $this->translationsArray(),
            'created_at' => optional($this->created_at)->toIso8601String(),
        ];
    }
}
