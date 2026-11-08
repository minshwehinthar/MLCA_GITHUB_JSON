<?php

namespace App\Models\Concerns;

use Illuminate\Database\Eloquent\Model;

trait HasTranslations
{
    public function translationFor(?string $locale = null): ?Model
    {
        $locale = $locale ?: app()->getLocale();
        $translations = $this->relationLoaded('translations')
            ? $this->translations
            : $this->translations()->get();

        return $translations->firstWhere('locale', $locale)
            ?? $translations->firstWhere('locale', config('app.fallback_locale', 'en'))
            ?? $translations->first();
    }

    public function translated(string $field, ?string $locale = null): mixed
    {
        $translation = $this->translationFor($locale);

        return $translation?->{$field};
    }

    public function translationsArray(): array
    {
        $translations = $this->relationLoaded('translations')
            ? $this->translations
            : $this->translations()->get();

        return $translations->keyBy('locale')
            ->map(fn ($translation) => $translation->only([
                'locale', 'title', 'slug', 'excerpt', 'description', 'content',
                'name', 'position', 'biography', 'history', 'vision', 'mission',
                'objectives', 'meta_title', 'meta_description',
            ]))
            ->toArray();
    }
}
