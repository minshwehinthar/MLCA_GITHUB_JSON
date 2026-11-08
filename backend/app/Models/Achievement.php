<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Achievement extends Model
{
    protected $fillable = [
        'title', 'description', 'year', 'icon', 'image', 'order', 'is_published',
    ];

    protected function casts(): array
    {
        return ['is_published' => 'boolean', 'order' => 'integer'];
    }

    protected $appends = ['image_url'];

    public function getImageUrlAttribute(): ?string
    {
        return $this->image ? asset('storage/'.$this->image) : null;
    }
}
