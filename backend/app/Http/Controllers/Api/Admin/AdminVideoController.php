<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Resources\VideoResource;
use App\Models\Video;
use App\Support\Uploads;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class AdminVideoController extends AdminController
{
    public function index(Request $request): JsonResponse
    {
        $query = Video::with('category')->latest();

        if ($search = $request->query('search')) {
            $query->where('title', 'like', "%{$search}%");
        }

        if ($category = $request->query('category')) {
            $query->where('category_id', $category);
        }

        $videos = $query->paginate((int) $request->query('per_page', 12))->withQueryString();

        return $this->paginated($videos, 'Videos retrieved.', fn ($video) => (new VideoResource($video))->resolve($request));
    }

    public function show(Request $request, int $id): JsonResponse
    {
        return $this->success((new VideoResource(Video::with('category')->findOrFail($id)))->resolve($request));
    }

    public function store(Request $request): JsonResponse
    {
        $data = $this->validateVideo($request);
        $data['slug'] = $this->uniqueSlug($data['slug'] ?? $data['title']);
        $data['published_at'] = $data['published_at'] ?? now();
        $video = Video::create($data);

        $this->logAction('create', $video, 'Created video');

        return $this->success((new VideoResource($video->load('category')))->resolve($request), 'Video created successfully.', 201);
    }

    public function update(Request $request, int $id): JsonResponse
    {
        $video = Video::findOrFail($id);
        $data = $this->validateVideo($request);

        foreach (['thumbnail', 'video_path'] as $field) {
            if (! empty($data[$field]) && $video->{$field} && $data[$field] !== $video->{$field}) {
                Uploads::delete($video->{$field});
            }
        }

        $data['slug'] = $this->uniqueSlug($data['slug'] ?? $video->slug, $video->id);
        $video->update($data);
        $this->logAction('update', $video, 'Updated video');

        return $this->success((new VideoResource($video->fresh()->load('category')))->resolve($request), 'Video updated successfully.');
    }

    public function destroy(int $id): JsonResponse
    {
        $video = Video::findOrFail($id);
        Uploads::delete($video->thumbnail);
        Uploads::delete($video->video_path);
        $this->logAction('delete', $video, 'Deleted video');
        $video->delete();

        return $this->success(null, 'Video deleted successfully.');
    }

    protected function validateVideo(Request $request): array
    {
        $data = $request->validate([
            'title' => ['required', 'string', 'max:255'],
            'title_my' => ['nullable', 'string', 'max:255'],
            'title_mnw' => ['nullable', 'string', 'max:255'],
            'slug' => ['nullable', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
            'thumbnail' => ['nullable', 'string', 'max:2048'],
            'video_path' => ['nullable', 'string', 'max:2048'],
            'external_url' => ['nullable', 'url', 'max:2048'],
            'type' => ['required', 'in:upload,youtube,external'],
            'published_at' => ['nullable', 'date'],
            'is_published' => ['nullable', 'boolean'],
            'category_id' => ['nullable', 'exists:categories,id'],
        ]);

        if ($data['type'] !== 'upload' && empty($data['external_url'])) {
            abort(response()->json([
                'success' => false,
                'message' => 'An external URL is required for non-uploaded videos.',
            ], 422));
        }

        $data['is_published'] = $request->boolean('is_published', true);

        return $data;
    }

    protected function uniqueSlug(string $value, ?int $ignoreId = null): string
    {
        $base = Str::slug($value) ?: (string) Str::uuid();
        $slug = $base;
        $i = 1;

        while (Video::where('slug', $slug)->when($ignoreId, fn ($q) => $q->where('id', '!=', $ignoreId))->exists()) {
            $slug = $base.'-'.$i++;
        }

        return $slug;
    }
}
