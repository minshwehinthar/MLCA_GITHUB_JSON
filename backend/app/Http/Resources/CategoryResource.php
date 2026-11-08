<?php

namespace App\Http\Resources;

use App\Http\Resources\Concerns\Localizes;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class CategoryResource extends JsonResource
{
    use Localizes;

    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'name' => $this->loc($this->name, $this->name_my, $this->name_mnw),
            'name_en' => $this->name,
            'name_my' => $this->name_my,
            'name_mnw' => $this->name_mnw,
            'slug' => $this->slug,
            'type' => $this->type,
            'description' => $this->description,
            'is_active' => $this->is_active,
            'order' => $this->order,
        ];
    }
}
