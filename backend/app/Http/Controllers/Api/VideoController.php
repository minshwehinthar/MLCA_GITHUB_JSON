<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Concerns\ApiResponse;
use App\Http\Controllers\Controller;
use App\Http\Resources\VideoResource;
use App\Models\Video;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class VideoController extends Controller
{
    use ApiResponse;

    public function index(Request $request): JsonResponse
    {
        $query = Video::with('category')->where('is_published', true)->latest('published_at');

        if ($category = $request->query('category')) {
            $query->whereHas('category', fn ($q) => $q->where('slug', $category));
        }

        if ($search = $request->query('search')) {
            $query->where('title', 'like', "%{$search}%");
        }

        $videos = $query->paginate((int) $request->query('per_page', 9))->withQueryString();

        return $this->paginated($videos, 'Videos retrieved.', fn ($video) => (new VideoResource($video))->resolve($request));
    }

    public function show(Request $request, string $slug): JsonResponse
    {
        $video = Video::with('category')->where('is_published', true)->where('slug', $slug)->firstOrFail();
        $video->increment('views');

        return $this->success((new VideoResource($video))->resolve($request));
    }
}
