<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Resources\AchievementResource;
use App\Models\Achievement;
use App\Support\Uploads;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AdminAchievementController extends AdminController
{
    public function index(Request $request): JsonResponse
    {
        $items = Achievement::orderBy('order')->get();

        return $this->success(AchievementResource::collection($items)->resolve($request));
    }

    public function store(Request $request): JsonResponse
    {
        $achievement = Achievement::create($this->validateAchievement($request));
        $this->logAction('create', $achievement, 'Created achievement');

        return $this->success((new AchievementResource($achievement))->resolve($request), 'Achievement created successfully.', 201);
    }

    public function update(Request $request, int $id): JsonResponse
    {
        $achievement = Achievement::findOrFail($id);
        $data = $this->validateAchievement($request);

        if (array_key_exists('image', $data) && $achievement->image && $data['image'] !== $achievement->image) {
            Uploads::delete($achievement->image);
        }

        $achievement->update($data);
        $this->logAction('update', $achievement, 'Updated achievement');

        return $this->success((new AchievementResource($achievement->fresh()))->resolve($request), 'Achievement updated successfully.');
    }

    public function destroy(int $id): JsonResponse
    {
        $achievement = Achievement::findOrFail($id);
        Uploads::delete($achievement->image);
        $this->logAction('delete', $achievement, 'Deleted achievement');
        $achievement->delete();

        return $this->success(null, 'Achievement deleted successfully.');
    }

    protected function validateAchievement(Request $request): array
    {
        $data = $request->validate([
            'title' => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
            'year' => ['nullable', 'string', 'max:10'],
            'icon' => ['nullable', 'string', 'max:50'],
            'image' => ['nullable', 'string', 'max:2048'],
            'order' => ['nullable', 'integer', 'min:0'],
            'is_published' => ['nullable', 'boolean'],
        ]);

        $data['order'] = $data['order'] ?? 0;
        $data['is_published'] = $request->boolean('is_published', true);

        return $data;
    }
}
