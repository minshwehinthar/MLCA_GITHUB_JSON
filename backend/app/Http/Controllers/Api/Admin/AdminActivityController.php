<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Resources\ActivityResource;
use App\Models\Activity;
use App\Models\ActivityTranslation;
use App\Support\Uploads;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AdminActivityController extends AdminController
{
    public function index(Request $request): JsonResponse
    {
        $query = Activity::with(['translations', 'category', 'media'])->latest('start_date');

        if ($status = $request->query('status')) {
            $query->where('status', $status);
        }

        if ($category = $request->query('category')) {
            $query->where('category_id', $category);
        }

        if ($search = $request->query('search')) {
            $query->where(function ($q) use ($search) {
                $q->whereHas('translations', fn ($t) => $t->where('title', 'like', "%{$search}%"))
                    ->orWhere('location', 'like', "%{$search}%");
            });
        }

        $activities = $query->paginate((int) $request->query('per_page', 12))->withQueryString();

        return $this->paginated($activities, 'Activities retrieved.', fn ($activity) => (new ActivityResource($activity))->resolve($request));
    }

    public function show(Request $request, int $id): JsonResponse
    {
        $activity = Activity::with(['translations', 'category', 'media'])->findOrFail($id);

        return $this->success((new ActivityResource($activity))->resolve($request));
    }

    public function store(Request $request): JsonResponse
    {
        $translations = $this->translationsInput();
        $data = $request->validate([
            'category_id' => ['nullable', 'exists:categories,id'],
            'status' => ['required', 'in:upcoming,ongoing,completed'],
            'start_date' => ['required', 'date'],
            'end_date' => ['nullable', 'date', 'after_or_equal:start_date'],
            'start_time' => ['nullable', 'date_format:H:i'],
            'end_time' => ['nullable', 'date_format:H:i'],
            'location' => ['nullable', 'string', 'max:255'],
            'cover_image' => ['nullable', 'string', 'max:2048'],
            'is_featured' => ['nullable', 'boolean'],
        ]);

        $activity = Activity::create([
            ...$data,
            'is_featured' => $request->boolean('is_featured'),
        ]);

        $this->syncTranslations($activity, $translations);
        $this->ensureUniqueSlugs($activity, ActivityTranslation::class);
        $this->syncMedia($activity, $this->mediaPayload());
        $this->logAction('create', $activity, 'Created activity');

        return $this->success(
            (new ActivityResource($activity->fresh()->load(['translations', 'category', 'media'])))->resolve($request),
            'Activity created successfully.',
            201
        );
    }

    public function update(Request $request, int $id): JsonResponse
    {
        $activity = Activity::findOrFail($id);
        $translations = $this->translationsInput();

        $data = $request->validate([
            'category_id' => ['nullable', 'exists:categories,id'],
            'status' => ['required', 'in:upcoming,ongoing,completed'],
            'start_date' => ['required', 'date'],
            'end_date' => ['nullable', 'date', 'after_or_equal:start_date'],
            'start_time' => ['nullable', 'date_format:H:i'],
            'end_time' => ['nullable', 'date_format:H:i'],
            'location' => ['nullable', 'string', 'max:255'],
            'cover_image' => ['nullable', 'string', 'max:2048'],
            'is_featured' => ['nullable', 'boolean'],
        ]);

        if (array_key_exists('cover_image', $data) && $activity->cover_image && $data['cover_image'] !== $activity->cover_image) {
            Uploads::delete($activity->cover_image);
        }

        $activity->update([
            ...$data,
            'cover_image' => array_key_exists('cover_image', $data) ? $data['cover_image'] : $activity->cover_image,
            'is_featured' => $request->has('is_featured') ? $request->boolean('is_featured') : $activity->is_featured,
        ]);

        $this->syncTranslations($activity, $translations);
        $this->ensureUniqueSlugs($activity, ActivityTranslation::class);
        $this->syncMedia($activity, $this->mediaPayload());
        $this->logAction('update', $activity, 'Updated activity');

        return $this->success(
            (new ActivityResource($activity->fresh()->load(['translations', 'category', 'media'])))->resolve($request),
            'Activity updated successfully.'
        );
    }

    public function destroy(int $id): JsonResponse
    {
        $activity = Activity::with('media')->findOrFail($id);

        Uploads::delete($activity->cover_image);
        foreach ($activity->media as $media) {
            Uploads::delete($media->file_path);
        }

        $this->logAction('delete', $activity, 'Deleted activity');
        $activity->delete();

        return $this->success(null, 'Activity deleted successfully.');
    }
}
