<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Resources\CategoryResource;
use App\Models\Category;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class AdminCategoryController extends AdminController
{
    public function index(Request $request): JsonResponse
    {
        $query = Category::orderBy('type')->orderBy('order');

        if ($type = $request->query('type')) {
            $query->where('type', $type);
        }

        if ($search = $request->query('search')) {
            $query->where('name', 'like', "%{$search}%");
        }

        return $this->success(CategoryResource::collection($query->get())->resolve($request));
    }

    public function store(Request $request): JsonResponse
    {
        $data = $this->validateCategory($request);
        $data['slug'] = $this->uniqueSlug($data['slug'] ?? $data['name']);
        $category = Category::create($data);
        $this->logAction('create', $category, 'Created category');

        return $this->success((new CategoryResource($category))->resolve($request), 'Category created successfully.', 201);
    }

    public function update(Request $request, int $id): JsonResponse
    {
        $category = Category::findOrFail($id);
        $data = $this->validateCategory($request);
        $data['slug'] = $this->uniqueSlug($data['slug'] ?? $category->slug, $category->id);
        $category->update($data);
        $this->logAction('update', $category, 'Updated category');

        return $this->success((new CategoryResource($category->fresh()))->resolve($request), 'Category updated successfully.');
    }

    public function destroy(int $id): JsonResponse
    {
        $category = Category::findOrFail($id);
        $this->logAction('delete', $category, 'Deleted category');
        $category->delete();

        return $this->success(null, 'Category deleted successfully.');
    }

    protected function validateCategory(Request $request): array
    {
        $data = $request->validate([
            'name' => ['required', 'string', 'max:150'],
            'name_my' => ['nullable', 'string', 'max:150'],
            'name_mnw' => ['nullable', 'string', 'max:150'],
            'slug' => ['nullable', 'string', 'max:150'],
            'type' => ['required', 'in:post,announcement,activity,event,gallery,video,document'],
            'description' => ['nullable', 'string'],
            'order' => ['nullable', 'integer', 'min:0'],
            'is_active' => ['nullable', 'boolean'],
        ]);

        $data['is_active'] = $request->boolean('is_active', true);
        $data['order'] = $data['order'] ?? 0;

        return $data;
    }

    protected function uniqueSlug(string $value, ?int $ignoreId = null): string
    {
        $base = Str::slug($value) ?: (string) Str::uuid();
        $slug = $base;
        $i = 1;

        while (Category::where('slug', $slug)->when($ignoreId, fn ($q) => $q->where('id', '!=', $ignoreId))->exists()) {
            $slug = $base.'-'.$i++;
        }

        return $slug;
    }
}
