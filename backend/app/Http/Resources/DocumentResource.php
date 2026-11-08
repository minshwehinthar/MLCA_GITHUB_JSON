<?php

namespace App\Http\Resources;

use App\Http\Resources\Concerns\Localizes;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class DocumentResource extends JsonResource
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
            'description' => $this->description,
            'file_path' => $this->file_path,
            'file_name' => $this->file_name,
            'mime_type' => $this->mime_type,
            'file_size' => $this->file_size,
            'downloads' => $this->downloads,
            'is_published' => $this->is_published,
            'url' => $this->url,
            'extension' => $this->extension,
            'download_url' => url('/api/documents/'.$this->id.'/download'),
            'category' => $this->whenLoaded('category', fn () => new CategoryResource($this->category)),
            'created_at' => optional($this->created_at)->toIso8601String(),
        ];
    }
}
