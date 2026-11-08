<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class PageResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        $t = $this->translationFor();

        return [
            'id' => $this->id,
            'slug' => $this->slug,
            'is_published' => $this->is_published,
            'title' => $t?->title,
            'excerpt' => $t?->excerpt,
            'content' => $t?->content,
            'history' => $t?->history,
            'vision' => $t?->vision,
            'mission' => $t?->mission,
            'objectives' => $t?->objectives,
            'meta_title' => $t?->meta_title,
            'meta_description' => $t?->meta_description,
            'translations' => $this->translationsArray(),
            'updated_at' => optional($this->updated_at)->toIso8601String(),
        ];
    }
}
