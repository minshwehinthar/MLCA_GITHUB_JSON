<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Concerns\ApiResponse;
use App\Http\Controllers\Controller;
use App\Http\Resources\PageResource;
use App\Models\Page;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class PageController extends Controller
{
    use ApiResponse;

    public function show(Request $request, string $slug): JsonResponse
    {
        $page = Page::with('translations')->where('slug', $slug)->where('is_published', true)->firstOrFail();

        return $this->success((new PageResource($page))->resolve($request));
    }
}
