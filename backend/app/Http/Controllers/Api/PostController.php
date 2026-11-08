<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Concerns\ApiResponse;
use App\Http\Controllers\Controller;
use App\Http\Resources\PostResource;
use App\Models\Post;
use App\Models\PostTranslation;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class PostController extends Controller
{
    use ApiResponse;

    public function index(Request $request): JsonResponse
    {
        $query = Post::published()
            ->with(['translations', 'category', 'author', 'media'])
            ->latest('published_at');

        if ($search = $request->query('search')) {
            $query->whereHas('translations', function ($q) use ($search) {
                $q->where('title', 'like', "%{$search}%")
                    ->orWhere('content', 'like', "%{$search}%")
                    ->orWhere('excerpt', 'like', "%{$search}%");
            });
        }

        if ($category = $request->query('category')) {
            $query->whereHas('category', fn ($q) => $q->where('slug', $category));
        }

        if ($type = $request->query('category_type')) {
            $query->whereHas('category', fn ($q) => $q->where('type', $type));
        }

        if ($request->boolean('featured')) {
            $query->where('is_featured', true);
        }

        $posts = $query->paginate((int) $request->query('per_page', 9))->withQueryString();

        return $this->paginated($posts, 'Posts retrieved.', fn ($post) => (new PostResource($post))->resolve($request));
    }

    public function show(Request $request, string $slug): JsonResponse
    {
        $translation = PostTranslation::where('slug', $slug)->firstOrFail();
        $post = Post::published()
            ->with(['translations', 'category', 'author', 'media'])
            ->findOrFail($translation->post_id);

        $post->increment('views');

        $related = Post::published()
            ->with(['translations', 'category', 'author', 'media'])
            ->where('id', '!=', $post->id)
            ->when($post->category_id, fn ($q) => $q->where('category_id', $post->category_id))
            ->latest('published_at')->limit(3)->get();

        return $this->success([
            'post' => (new PostResource($post))->resolve($request),
            'related' => PostResource::collection($related)->resolve($request),
        ]);
    }
}
