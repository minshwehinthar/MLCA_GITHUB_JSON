<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Resources\PageResource;
use App\Models\Page;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class AdminPageController extends AdminController
{
    public function index(Request $request): JsonResponse
    {
        $pages = Page::with('translations')->orderBy('slug')->get();

        return $this->success(PageResource::collection($pages)->resolve($request));
    }

    public function show(Request $request, string $slug): JsonResponse
    {
        $page = Page::with('translations')->where('slug', $slug)->firstOrFail();

        return $this->success((new PageResource($page))->resolve($request));
    }

    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'slug' => ['required', 'string', 'max:150', 'unique:pages,slug'],
            'is_published' => ['nullable', 'boolean'],
        ]);

        $page = Page::create([
            'slug' => Str::slug($data['slug']),
            'is_published' => $request->boolean('is_published', true),
        ]);

        $this->syncTranslations($page, $this->translationsInput());
        $this->logAction('create', $page, 'Created page');

        return $this->success((new PageResource($page->fresh()->load('translations')))->resolve($request), 'Page created successfully.', 201);
    }

    public function update(Request $request, string $slug): JsonResponse
    {
        $page = Page::with('translations')->where('slug', $slug)->firstOrFail();
        $page->update(['is_published' => $request->boolean('is_published', $page->is_published)]);
        $this->syncTranslations($page, $this->translationsInput());
        $this->logAction('update', $page, 'Updated page');

        return $this->success((new PageResource($page->fresh()->load('translations')))->resolve($request), 'Page updated successfully.');
    }

    public function destroy(string $slug): JsonResponse
    {
        $page = Page::where('slug', $slug)->firstOrFail();
        $this->logAction('delete', $page, 'Deleted page');
        $page->delete();

        return $this->success(null, 'Page deleted successfully.');
    }
}
