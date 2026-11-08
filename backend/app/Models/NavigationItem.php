<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class NavigationItem extends Model
{
    protected $fillable = [
        'parent_id', 'label_en', 'label_my', 'label_mnw', 'url',
        'location', 'target', 'order', 'is_visible',
    ];

    protected function casts(): array
    {
        return ['is_visible' => 'boolean', 'order' => 'integer'];
    }

    public function parent(): BelongsTo
    {
        return $this->belongsTo(NavigationItem::class, 'parent_id');
    }

    public function children(): HasMany
    {
        return $this->hasMany(NavigationItem::class, 'parent_id')->orderBy('order');
    }
}
