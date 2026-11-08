<?php

namespace App\Models;

use App\Models\Concerns\HasTranslations;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class Member extends Model
{
    use HasTranslations, SoftDeletes;

    protected $fillable = [
        'user_id', 'photo', 'email', 'phone', 'department', 'academic_year',
        'position', 'facebook', 'telegram', 'is_executive', 'is_active', 'order',
    ];

    protected function casts(): array
    {
        return [
            'is_executive' => 'boolean',
            'is_active' => 'boolean',
            'order' => 'integer',
        ];
    }

    protected $appends = ['photo_url'];

    public function getPhotoUrlAttribute(): ?string
    {
        return $this->photo ? asset('storage/'.$this->photo) : null;
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function translations(): HasMany
    {
        return $this->hasMany(MemberTranslation::class);
    }
}
