<?php

namespace App\Http\Resources\Concerns;

trait Localizes
{
    protected function loc(?string $en, ?string $my = null, ?string $mnw = null, ?string $locale = null): ?string
    {
        $locale = $locale ?: app()->getLocale();

        return match ($locale) {
            'my' => $my ?: $en,
            'mnw' => $mnw ?: $en,
            default => $en,
        };
    }
}
