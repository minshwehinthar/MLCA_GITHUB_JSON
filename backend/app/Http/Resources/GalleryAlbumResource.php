<?php

namespace App\Http\Resources;

use App\Http\Resources\Concerns\Localizes;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class GalleryAlbumResource extends JsonResource
{
    use Localizes;

    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'title' => $this->loc($this->title, $this->title_my, $this->title_mnw),
            'title_en' => $this->title,
            'title_my' => $this->title_my,
            'title_mnw' => $this->title_mnw,
            'slug' => $this->slug,
            'description' => $this->description,
            'cover_image' => $this->cover_url,
            'cover_path' => $this->cover_image,
            'is_published' => $this->is_published,
            'order' => $this->order,
            'images_count' => $this->images_count,
            'category' => $this->whenLoaded('category', fn () => new CategoryResource($this->category)),
            'event' => $this->whenLoaded('event', fn () => [
                'id' => $this->event?->id,
                'title' => $this->event?->translated('title'),
            ]),
            'images' => GalleryImageResource::collection($this->whenLoaded('images')),
            'created_at' => optional($this->created_at)->toIso8601String(),
        ];
    }
}
