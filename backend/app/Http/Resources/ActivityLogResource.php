<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ActivityLogResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'action' => $this->action,
            'model_type' => $this->model_type ? class_basename($this->model_type) : null,
            'model_id' => $this->model_id,
            'description' => $this->description,
            'ip_address' => $this->ip_address,
            'user' => $this->whenLoaded('user', fn () => [
                'id' => $this->user?->id,
                'name' => $this->user?->name,
            ]),
            'created_at' => optional($this->created_at)->toIso8601String(),
        ];
    }
}
