<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ActivityTranslation extends Model
{
    protected $fillable = ['activity_id', 'locale', 'title', 'slug', 'description', 'content'];

    public function activity(): BelongsTo
    {
        return $this->belongsTo(Activity::class);
    }
}
