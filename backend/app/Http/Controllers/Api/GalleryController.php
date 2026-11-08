<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Concerns\ApiResponse;
use App\Http\Controllers\Controller;
use App\Http\Resources\GalleryAlbumResource;
use App\Models\GalleryAlbum;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class GalleryController extends Controller
{
    use ApiResponse;

    public function index(Request $request): JsonResponse
    {
        $query = GalleryAlbum::with(['category', 'images'])->where('is_published', true);

        if ($category = $request->query('category')) {
            $query->whereHas('category', fn ($q) => $q->where('slug', $category));
        }

        if ($search = $request->query('search')) {
            $query->where('title', 'like', "%{$search}%");
        }

        $albums = $query->orderBy('order')->latest()->paginate((int) $request->query('per_page', 9));

        return $this->paginated($albums, 'Albums retrieved.', fn ($album) => (new GalleryAlbumResource($album))->resolve($request));
    }

    public function show(Request $request, string $slug): JsonResponse
    {
        $album = GalleryAlbum::with(['category', 'images', 'event.translations'])
            ->where('is_published', true)->where('slug', $slug)->firstOrFail();

        return $this->success((new GalleryAlbumResource($album))->resolve($request));
    }
}
