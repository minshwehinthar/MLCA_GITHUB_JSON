<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class GalleryAlbum extends Model
{
    use SoftDeletes;

    protected $fillable = [
        'category_id', 'event_id', 'title', 'title_my', 'title_mnw', 'slug',
        'description', 'cover_image', 'is_published', 'order',
    ];

    protected function casts(): array
    {
        return ['is_published' => 'boolean', 'order' => 'integer'];
    }

    protected $appends = ['cover_url', 'images_count'];

    public function getCoverUrlAttribute(): ?string
    {
        return $this->cover_image ? asset('storage/'.$this->cover_image) : null;
    }

    public function getImagesCountAttribute(): int
    {
        return $this->images()->count();
    }

    public function category(): BelongsTo
    {
        return $this->belongsTo(Category::class);
    }

    public function event(): BelongsTo
    {
        return $this->belongsTo(Event::class);
    }

    public function images(): HasMany
    {
        return $this->hasMany(GalleryImage::class)->orderBy('order');
    }
}
