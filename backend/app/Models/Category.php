<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Category extends Model
{
    protected $fillable = [
        'name', 'name_my', 'name_mnw', 'slug', 'type', 'description', 'order', 'is_active',
    ];

    protected function casts(): array
    {
        return ['is_active' => 'boolean', 'order' => 'integer'];
    }

    public function posts(): HasMany
    {
        return $this->hasMany(Post::class);
    }

    public function activities(): HasMany
    {
        return $this->hasMany(Activity::class);
    }

    public function events(): HasMany
    {
        return $this->hasMany(Event::class);
    }

    public function albums(): HasMany
    {
        return $this->hasMany(GalleryAlbum::class);
    }

    public function videos(): HasMany
    {
        return $this->hasMany(Video::class);
    }

    public function documents(): HasMany
    {
        return $this->hasMany(Document::class);
    }
}
