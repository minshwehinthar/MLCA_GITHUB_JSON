<?php

namespace App\Http\Controllers\Concerns;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Str;

trait SyncsTranslations
{
    protected array $translationFields = [
        'title', 'slug', 'excerpt', 'description', 'content', 'name', 'position',
        'biography', 'history', 'vision', 'mission', 'objectives',
        'meta_title', 'meta_description',
    ];

    protected function syncTranslations(Model $model, array $translations): void
    {
        foreach (['en', 'my', 'mnw'] as $locale) {
            $data = $translations[$locale] ?? null;

            if (! is_array($data)) {
                continue;
            }

            $payload = array_intersect_key($data, array_flip($this->translationFields));
            $payload['locale'] = $locale;

            if (empty($payload['title']) && empty($payload['name'])) {
                continue;
            }

            if (empty($payload['slug']) && ! empty($payload['title'])) {
                $payload['slug'] = Str::slug($payload['title']).'-'.substr(md5($locale.$model->getKey().$payload['title']), 0, 6);
            }

            $model->translations()->updateOrCreate(['locale' => $locale], $payload);
        }
    }

    protected function decodeTranslations(mixed $translations): array
    {
        if (is_string($translations)) {
            $decoded = json_decode($translations, true);
            $translations = is_array($decoded) ? $decoded : [];
        }

        return is_array($translations) ? $translations : [];
    }

    protected function decodeArray(mixed $value): array
    {
        if (is_string($value)) {
            $decoded = json_decode($value, true);
            $value = is_array($decoded) ? $decoded : [];
        }

        return is_array($value) ? $value : [];
    }
}
