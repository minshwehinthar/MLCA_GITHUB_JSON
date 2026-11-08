<?php

namespace App\Http\Resources;

use App\Http\Resources\Concerns\Localizes;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class VideoResource extends JsonResource
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
            'thumbnail' => $this->thumbnail_url,
            'thumbnail_path' => $this->thumbnail,
            'video_path' => $this->video_path,
            'video_url' => $this->video_url,
            'external_url' => $this->external_url,
            'embed_url' => $this->embed_url,
            'type' => $this->type,
            'is_published' => $this->is_published,
            'published_at' => optional($this->published_at)->toIso8601String(),
            'views' => $this->views,
            'category' => $this->whenLoaded('category', fn () => new CategoryResource($this->category)),
            'created_at' => optional($this->created_at)->toIso8601String(),
        ];
    }
}
