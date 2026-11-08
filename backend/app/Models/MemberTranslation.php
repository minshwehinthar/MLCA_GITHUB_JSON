<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class MemberTranslation extends Model
{
    protected $fillable = ['member_id', 'locale', 'name', 'position', 'biography'];

    public function member(): BelongsTo
    {
        return $this->belongsTo(Member::class);
    }
}
