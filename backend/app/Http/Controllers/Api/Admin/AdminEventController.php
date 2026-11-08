<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Resources\EventResource;
use App\Models\Event;
use App\Models\EventTranslation;
use App\Support\Uploads;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AdminEventController extends AdminController
{
    public function index(Request $request): JsonResponse
    {
        $query = Event::with(['translations', 'category', 'media'])->latest('start_date');

        if ($status = $request->query('status')) {
            $query->where('status', $status);
        }

        if ($category = $request->query('category')) {
            $query->where('category_id', $category);
        }

        if ($search = $request->query('search')) {
            $query->whereHas('translations', fn ($q) => $q->where('title', 'like', "%{$search}%"));
        }

        $events = $query->paginate((int) $request->query('per_page', 12))->withQueryString();

        return $this->paginated($events, 'Events retrieved.', fn ($event) => (new EventResource($event))->resolve($request));
    }

    public function show(Request $request, int $id): JsonResponse
    {
        $event = Event::with(['translations', 'category', 'media'])->findOrFail($id);

        return $this->success((new EventResource($event))->resolve($request));
    }

    public function store(Request $request): JsonResponse
    {
        $translations = $this->translationsInput();
        $data = $request->validate([
            'category_id' => ['nullable', 'exists:categories,id'],
            'status' => ['required', 'in:upcoming,ongoing,completed,cancelled'],
            'start_date' => ['required', 'date'],
            'end_date' => ['nullable', 'date', 'after_or_equal:start_date'],
            'start_time' => ['nullable', 'date_format:H:i'],
            'end_time' => ['nullable', 'date_format:H:i'],
            'location' => ['nullable', 'string', 'max:255'],
            'cover_image' => ['nullable', 'string', 'max:2048'],
            'registration_info' => ['nullable', 'string'],
            'is_featured' => ['nullable', 'boolean'],
        ]);

        $event = Event::create([...$data, 'is_featured' => $request->boolean('is_featured')]);

        $this->syncTranslations($event, $translations);
        $this->ensureUniqueSlugs($event, EventTranslation::class);
        $this->syncMedia($event, $this->mediaPayload());
        $this->logAction('create', $event, 'Created event');

        return $this->success(
            (new EventResource($event->fresh()->load(['translations', 'category', 'media'])))->resolve($request),
            'Event created successfully.',
            201
        );
    }

    public function update(Request $request, int $id): JsonResponse
    {
        $event = Event::findOrFail($id);
        $translations = $this->translationsInput();

        $data = $request->validate([
            'category_id' => ['nullable', 'exists:categories,id'],
            'status' => ['required', 'in:upcoming,ongoing,completed,cancelled'],
            'start_date' => ['required', 'date'],
            'end_date' => ['nullable', 'date', 'after_or_equal:start_date'],
            'start_time' => ['nullable', 'date_format:H:i'],
            'end_time' => ['nullable', 'date_format:H:i'],
            'location' => ['nullable', 'string', 'max:255'],
            'cover_image' => ['nullable', 'string', 'max:2048'],
            'registration_info' => ['nullable', 'string'],
            'is_featured' => ['nullable', 'boolean'],
        ]);

        if (array_key_exists('cover_image', $data) && $event->cover_image && $data['cover_image'] !== $event->cover_image) {
            Uploads::delete($event->cover_image);
        }

        $event->update([
            ...$data,
            'cover_image' => array_key_exists('cover_image', $data) ? $data['cover_image'] : $event->cover_image,
            'is_featured' => $request->has('is_featured') ? $request->boolean('is_featured') : $event->is_featured,
        ]);

        $this->syncTranslations($event, $translations);
        $this->ensureUniqueSlugs($event, EventTranslation::class);
        $this->syncMedia($event, $this->mediaPayload());
        $this->logAction('update', $event, 'Updated event');

        return $this->success(
            (new EventResource($event->fresh()->load(['translations', 'category', 'media'])))->resolve($request),
            'Event updated successfully.'
        );
    }

    public function destroy(int $id): JsonResponse
    {
        $event = Event::with('media')->findOrFail($id);

        Uploads::delete($event->cover_image);
        foreach ($event->media as $media) {
            Uploads::delete($media->file_path);
        }

        $this->logAction('delete', $event, 'Deleted event');
        $event->delete();

        return $this->success(null, 'Event deleted successfully.');
    }
}
