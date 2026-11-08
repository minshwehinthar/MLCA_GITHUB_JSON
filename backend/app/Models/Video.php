<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;

class Video extends Model
{
    use SoftDeletes;

    protected $fillable = [
        'category_id', 'title', 'title_my', 'title_mnw', 'slug', 'description',
        'thumbnail', 'video_path', 'external_url', 'type', 'published_at',
        'is_published', 'views',
    ];

    protected function casts(): array
    {
        return [
            'is_published' => 'boolean',
            'published_at' => 'datetime',
            'views' => 'integer',
        ];
    }

    protected $appends = ['thumbnail_url', 'video_url', 'embed_url'];

    public function getThumbnailUrlAttribute(): ?string
    {
        return $this->thumbnail ? asset('storage/'.$this->thumbnail) : null;
    }

    public function getVideoUrlAttribute(): ?string
    {
        return $this->video_path ? asset('storage/'.$this->video_path) : null;
    }

    public function getEmbedUrlAttribute(): ?string
    {
        if (! $this->external_url) {
            return null;
        }

        if (preg_match('/(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([A-Za-z0-9_-]{6,})/', $this->external_url, $m)) {
            return 'https://www.youtube.com/embed/'.$m[1];
        }

        if (preg_match('/vimeo\.com\/(\d+)/', $this->external_url, $m)) {
            return 'https://player.vimeo.com/video/'.$m[1];
        }

        return $this->external_url;
    }

    public function category(): BelongsTo
    {
        return $this->belongsTo(Category::class);
    }
}
