<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Resources\GalleryAlbumResource;
use App\Models\GalleryAlbum;
use App\Models\GalleryImage;
use App\Support\Uploads;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class AdminGalleryController extends AdminController
{
    public function index(Request $request): JsonResponse
    {
        $query = GalleryAlbum::with(['category', 'images'])->latest();

        if ($search = $request->query('search')) {
            $query->where('title', 'like', "%{$search}%");
        }

        if ($category = $request->query('category')) {
            $query->where('category_id', $category);
        }

        $albums = $query->paginate((int) $request->query('per_page', 12))->withQueryString();

        return $this->paginated($albums, 'Albums retrieved.', fn ($album) => (new GalleryAlbumResource($album))->resolve($request));
    }

    public function show(Request $request, int $id): JsonResponse
    {
        $album = GalleryAlbum::with(['category', 'images', 'event.translations'])->findOrFail($id);

        return $this->success((new GalleryAlbumResource($album))->resolve($request));
    }

    public function store(Request $request): JsonResponse
    {
        $data = $this->validateAlbum($request);
        $data['slug'] = $this->uniqueSlug($data['slug'] ?? $data['title']);
        $album = GalleryAlbum::create($data);

        $this->syncImages($album, $this->decodeArray($request->input('images', [])));
        $this->logAction('create', $album, 'Created gallery album');

        return $this->success(
            (new GalleryAlbumResource($album->fresh()->load(['category', 'images'])))->resolve($request),
            'Album created successfully.',
            201
        );
    }

    public function update(Request $request, int $id): JsonResponse
    {
        $album = GalleryAlbum::findOrFail($id);
        $data = $this->validateAlbum($request);

        if (array_key_exists('cover_image', $data) && $album->cover_image && $data['cover_image'] !== $album->cover_image) {
            Uploads::delete($album->cover_image);
        }

        $data['slug'] = $this->uniqueSlug($data['slug'] ?? $album->slug, $album->id);
        $album->update($data);

        if ($request->has('images')) {
            $this->syncImages($album, $this->decodeArray($request->input('images', [])));
        }

        $this->logAction('update', $album, 'Updated gallery album');

        return $this->success(
            (new GalleryAlbumResource($album->fresh()->load(['category', 'images'])))->resolve($request),
            'Album updated successfully.'
        );
    }

    public function destroy(int $id): JsonResponse
    {
        $album = GalleryAlbum::with('images')->findOrFail($id);
        Uploads::delete($album->cover_image);

        foreach ($album->images as $image) {
            Uploads::delete($image->image_path);
        }

        $this->logAction('delete', $album, 'Deleted gallery album');
        $album->delete();

        return $this->success(null, 'Album deleted successfully.');
    }

    public function storeImage(Request $request, int $albumId): JsonResponse
    {
        $album = GalleryAlbum::findOrFail($albumId);
        $data = $request->validate([
            'image_path' => ['required', 'string', 'max:2048'],
            'caption' => ['nullable', 'string', 'max:255'],
        ]);

        $image = $album->images()->create([
            'image_path' => $data['image_path'],
            'caption' => $data['caption'] ?? null,
            'order' => $album->images()->count(),
        ]);

        return $this->success($image, 'Image added successfully.', 201);
    }

    public function destroyImage(int $imageId): JsonResponse
    {
        $image = GalleryImage::findOrFail($imageId);
        Uploads::delete($image->image_path);
        $image->delete();

        return $this->success(null, 'Image deleted successfully.');
    }

    protected function validateAlbum(Request $request): array
    {
        $data = $request->validate([
            'title' => ['required', 'string', 'max:255'],
            'title_my' => ['nullable', 'string', 'max:255'],
            'title_mnw' => ['nullable', 'string', 'max:255'],
            'slug' => ['nullable', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
            'cover_image' => ['nullable', 'string', 'max:2048'],
            'category_id' => ['nullable', 'exists:categories,id'],
            'event_id' => ['nullable', 'exists:events,id'],
            'is_published' => ['nullable', 'boolean'],
            'order' => ['nullable', 'integer', 'min:0'],
        ]);

        $data['is_published'] = $request->boolean('is_published', true);
        $data['order'] = $data['order'] ?? 0;

        return $data;
    }

    protected function syncImages(GalleryAlbum $album, array $images): void
    {
        $existing = $album->images()->get();
        $keepIds = collect($images)->pluck('id')->filter()->map(fn ($id) => (int) $id)->all();

        foreach ($existing as $image) {
            if (! in_array($image->id, $keepIds, true)) {
                Uploads::delete($image->image_path);
                $image->delete();
            }
        }

        foreach (array_values($images) as $index => $item) {
            if (! empty($item['id'])) {
                $image = $existing->firstWhere('id', (int) $item['id']);
                if ($image) {
                    $image->update(['caption' => $item['caption'] ?? $image->caption, 'order' => $index]);
                }

                continue;
            }

            $path = $item['image_path'] ?? $item['path'] ?? null;
            if (! $path) {
                continue;
            }

            $album->images()->create([
                'image_path' => $path,
                'caption' => $item['caption'] ?? null,
                'order' => $index,
            ]);
        }
    }

    protected function uniqueSlug(string $value, ?int $ignoreId = null): string
    {
        $base = Str::slug($value) ?: (string) Str::uuid();
        $slug = $base;
        $i = 1;

        while (GalleryAlbum::where('slug', $slug)->when($ignoreId, fn ($q) => $q->where('id', '!=', $ignoreId))->exists()) {
            $slug = $base.'-'.$i++;
        }

        return $slug;
    }
}
