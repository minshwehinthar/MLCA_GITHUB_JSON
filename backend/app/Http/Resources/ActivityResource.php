<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ActivityResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'number' => $this->id,
            'title' => $this->translated('title'),
            'slug' => $this->translated('slug'),
            'description' => $this->translated('description'),
            'content' => $this->translated('content'),
            'status' => $this->status,
            'start_date' => optional($this->start_date)->format('Y-m-d'),
            'end_date' => optional($this->end_date)->format('Y-m-d'),
            'start_time' => $this->start_time ? substr($this->start_time, 0, 5) : null,
            'end_time' => $this->end_time ? substr($this->end_time, 0, 5) : null,
            'location' => $this->location,
            'cover_image' => $this->cover_url,
            'cover_path' => $this->cover_image,
            'is_featured' => $this->is_featured,
            'category' => $this->whenLoaded('category', fn () => new CategoryResource($this->category)),
            'media' => MediaResource::collection($this->whenLoaded('media')),
            'translations' => $this->translationsArray(),
            'created_at' => optional($this->created_at)->toIso8601String(),
        ];
    }
}
