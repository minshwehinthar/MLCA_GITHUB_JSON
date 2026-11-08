<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;

class Document extends Model
{
    use SoftDeletes;

    protected $fillable = [
        'category_id', 'title', 'title_my', 'title_mnw', 'description',
        'file_path', 'file_name', 'mime_type', 'file_size', 'downloads', 'is_published',
    ];

    protected function casts(): array
    {
        return ['is_published' => 'boolean', 'file_size' => 'integer', 'downloads' => 'integer'];
    }

    protected $appends = ['url', 'extension'];

    public function getUrlAttribute(): string
    {
        return asset('storage/'.$this->file_path);
    }

    public function getExtensionAttribute(): string
    {
        return strtoupper(pathinfo($this->file_name, PATHINFO_EXTENSION));
    }

    public function category(): BelongsTo
    {
        return $this->belongsTo(Category::class);
    }
}
