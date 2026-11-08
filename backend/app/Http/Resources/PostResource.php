<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class PostResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'title' => $this->translated('title'),
            'slug' => $this->translated('slug'),
            'excerpt' => $this->translated('excerpt'),
            'content' => $this->translated('content'),
            'cover_image' => $this->cover_url,
            'cover_path' => $this->cover_image,
            'status' => $this->status,
            'is_featured' => $this->is_featured,
            'published_at' => optional($this->published_at)->toIso8601String(),
            'views' => $this->views,
            'category' => $this->whenLoaded('category', fn () => new CategoryResource($this->category)),
            'author' => $this->whenLoaded('author', fn () => [
                'id' => $this->author?->id,
                'name' => $this->author?->name,
                'avatar' => $this->author?->avatar ? asset('storage/'.$this->author->avatar) : null,
            ]),
            'media' => MediaResource::collection($this->whenLoaded('media')),
            'translations' => $this->translationsArray(),
            'created_at' => optional($this->created_at)->toIso8601String(),
            'updated_at' => optional($this->updated_at)->toIso8601String(),
        ];
    }
}
