<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Resources\PostResource;
use App\Models\Post;
use App\Models\PostTranslation;
use App\Support\Uploads;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AdminPostController extends AdminController
{
    public function index(Request $request): JsonResponse
    {
        $query = Post::with(['translations', 'category', 'author', 'media'])->latest();

        if ($status = $request->query('status')) {
            $query->where('status', $status);
        }

        if ($category = $request->query('category')) {
            $query->where('category_id', $category);
        }

        if ($search = $request->query('search')) {
            $query->whereHas('translations', fn ($q) => $q->where('title', 'like', "%{$search}%"));
        }

        $posts = $query->paginate((int) $request->query('per_page', 12))->withQueryString();

        return $this->paginated($posts, 'Posts retrieved.', fn ($post) => (new PostResource($post))->resolve($request));
    }

    public function show(Request $request, int $id): JsonResponse
    {
        $post = Post::with(['translations', 'category', 'author', 'media'])->findOrFail($id);

        return $this->success((new PostResource($post))->resolve($request));
    }

    public function store(Request $request): JsonResponse
    {
        $translations = $this->translationsInput();
        $data = $request->validate([
            'category_id' => ['nullable', 'exists:categories,id'],
            'status' => ['nullable', 'in:draft,published'],
            'is_featured' => ['nullable', 'boolean'],
            'published_at' => ['nullable', 'date'],
            'cover_image' => ['nullable', 'string', 'max:2048'],
        ]);

        $post = Post::create([
            'user_id' => $request->user()->id,
            'category_id' => $data['category_id'] ?? null,
            'cover_image' => $data['cover_image'] ?? null,
            'status' => $data['status'] ?? 'draft',
            'is_featured' => $request->boolean('is_featured'),
            'published_at' => $data['published_at'] ?? ($request->input('status') === 'published' ? now() : null),
        ]);

        $this->syncTranslations($post, $translations);
        $this->ensureUniqueSlugs($post, PostTranslation::class);
        $this->syncMedia($post, $this->mediaPayload());
        $this->logAction('create', $post, 'Created post');

        return $this->success(
            (new PostResource($post->fresh()->load(['translations', 'category', 'author', 'media'])))->resolve($request),
            'Post created successfully.',
            201
        );
    }

    public function update(Request $request, int $id): JsonResponse
    {
        $post = Post::findOrFail($id);
        $translations = $this->translationsInput();

        $data = $request->validate([
            'category_id' => ['nullable', 'exists:categories,id'],
            'status' => ['nullable', 'in:draft,published'],
            'is_featured' => ['nullable', 'boolean'],
            'published_at' => ['nullable', 'date'],
            'cover_image' => ['nullable', 'string', 'max:2048'],
        ]);

        if (array_key_exists('cover_image', $data) && $post->cover_image && $data['cover_image'] !== $post->cover_image) {
            Uploads::delete($post->cover_image);
        }

        $post->update([
            'category_id' => $data['category_id'] ?? null,
            'cover_image' => array_key_exists('cover_image', $data) ? $data['cover_image'] : $post->cover_image,
            'status' => $data['status'] ?? $post->status,
            'is_featured' => $request->has('is_featured') ? $request->boolean('is_featured') : $post->is_featured,
            'published_at' => array_key_exists('published_at', $data) ? $data['published_at'] : $post->published_at,
        ]);

        $this->syncTranslations($post, $translations);
        $this->ensureUniqueSlugs($post, PostTranslation::class);
        $this->syncMedia($post, $this->mediaPayload());
        $this->logAction('update', $post, 'Updated post');

        return $this->success(
            (new PostResource($post->fresh()->load(['translations', 'category', 'author', 'media'])))->resolve($request),
            'Post updated successfully.'
        );
    }

    public function destroy(int $id): JsonResponse
    {
        $post = Post::with('media')->findOrFail($id);

        Uploads::delete($post->cover_image);
        foreach ($post->media as $media) {
            Uploads::delete($media->file_path);
        }

        $this->logAction('delete', $post, 'Deleted post');
        $post->delete();

        return $this->success(null, 'Post deleted successfully.');
    }
}
