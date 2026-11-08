<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Concerns\ApiResponse;
use App\Http\Controllers\Concerns\SyncsTranslations;
use App\Http\Controllers\Controller;
use App\Models\ActivityLog;
use App\Models\Media;
use App\Support\Uploads;
use Illuminate\Database\Eloquent\Model;

abstract class AdminController extends Controller
{
    use ApiResponse, SyncsTranslations;

    protected function syncMedia(Model $model, array $items): void
    {
        $existing = $model->media()->get();
        $keepIds = collect($items)->pluck('id')->filter()->map(fn ($id) => (int) $id)->all();

        foreach ($existing as $media) {
            if (! in_array($media->id, $keepIds, true)) {
                Uploads::delete($media->file_path);
                $media->delete();
            }
        }

        foreach (array_values($items) as $index => $item) {
            $path = $item['file_path'] ?? $item['path'] ?? null;
            if (! $path && empty($item['id'])) {
                continue;
            }

            if (! empty($item['id'])) {
                $media = $existing->firstWhere('id', (int) $item['id']);
                if ($media) {
                    $media->update(['order' => $index]);

                    continue;
                }
            }

            $mime = $item['mime_type'] ?? 'application/octet-stream';
            $model->media()->create([
                'collection' => $item['collection'] ?? 'attachment',
                'type' => $item['type'] ?? Uploads::typeFromMime($mime),
                'file_path' => $path,
                'file_name' => $item['file_name'] ?? basename($path),
                'original_name' => $item['original_name'] ?? basename($path),
                'mime_type' => $mime,
                'size' => $item['size'] ?? 0,
                'order' => $index,
            ]);
        }
    }

    protected function ensureUniqueSlugs(Model $model, string $translationClass): void
    {
        foreach ($model->translations()->get() as $translation) {
            if (! $translation->slug) {
                continue;
            }

            $exists = $translationClass::where('locale', $translation->locale)
                ->where('slug', $translation->slug)
                ->where('id', '!=', $translation->id)
                ->exists();

            if ($exists) {
                $translation->update([
                    'slug' => $translation->slug.'-'.substr(md5($translation->id.microtime()), 0, 6),
                ]);
            }
        }
    }

    protected function logAction(string $action, ?Model $model = null, ?string $description = null): void
    {
        ActivityLog::record($action, $model, $description);
    }

    protected function mediaPayload(): array
    {
        $media = request()->input('media', []);

        if (is_string($media)) {
            $decoded = json_decode($media, true);
            $media = is_array($decoded) ? $decoded : [];
        }

        return is_array($media) ? $media : [];
    }

    protected function translationsInput(): array
    {
        return $this->decodeTranslations(request()->input('translations', []));
    }
}
