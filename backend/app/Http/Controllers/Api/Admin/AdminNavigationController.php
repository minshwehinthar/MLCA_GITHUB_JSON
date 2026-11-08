<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Resources\NavigationResource;
use App\Models\NavigationItem;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AdminNavigationController extends AdminController
{
    public function index(Request $request): JsonResponse
    {
        $items = NavigationItem::with('children')->whereNull('parent_id')->orderBy('location')->orderBy('order')->get();

        return $this->success(NavigationResource::collection($items)->resolve($request));
    }

    public function store(Request $request): JsonResponse
    {
        $item = NavigationItem::create($this->validateNavigation($request));
        $this->logAction('create', $item, 'Created navigation item');

        return $this->success((new NavigationResource($item))->resolve($request), 'Navigation item created successfully.', 201);
    }

    public function update(Request $request, int $id): JsonResponse
    {
        $item = NavigationItem::findOrFail($id);
        $item->update($this->validateNavigation($request));
        $this->logAction('update', $item, 'Updated navigation item');

        return $this->success((new NavigationResource($item->fresh()))->resolve($request), 'Navigation item updated successfully.');
    }

    public function destroy(int $id): JsonResponse
    {
        $item = NavigationItem::findOrFail($id);
        $this->logAction('delete', $item, 'Deleted navigation item');
        $item->delete();

        return $this->success(null, 'Navigation item deleted successfully.');
    }

    protected function validateNavigation(Request $request): array
    {
        $data = $request->validate([
            'parent_id' => ['nullable', 'exists:navigation_items,id'],
            'label_en' => ['required', 'string', 'max:150'],
            'label_my' => ['nullable', 'string', 'max:150'],
            'label_mnw' => ['nullable', 'string', 'max:150'],
            'url' => ['required', 'string', 'max:255'],
            'location' => ['required', 'in:header,footer'],
            'target' => ['nullable', 'in:_self,_blank'],
            'order' => ['nullable', 'integer', 'min:0'],
            'is_visible' => ['nullable', 'boolean'],
        ]);

        $data['target'] = $data['target'] ?? '_self';
        $data['order'] = $data['order'] ?? 0;
        $data['is_visible'] = $request->boolean('is_visible', true);

        return $data;
    }
}
