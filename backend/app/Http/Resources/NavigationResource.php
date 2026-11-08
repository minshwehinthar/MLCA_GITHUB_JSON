<?php

namespace App\Http\Resources;

use App\Http\Resources\Concerns\Localizes;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class NavigationResource extends JsonResource
{
    use Localizes;

    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'label' => $this->loc($this->label_en, $this->label_my, $this->label_mnw),
            'label_en' => $this->label_en,
            'label_my' => $this->label_my,
            'label_mnw' => $this->label_mnw,
            'url' => $this->url,
            'location' => $this->location,
            'target' => $this->target,
            'order' => $this->order,
            'is_visible' => $this->is_visible,
            'children' => NavigationResource::collection($this->whenLoaded('children')),
        ];
    }
}
