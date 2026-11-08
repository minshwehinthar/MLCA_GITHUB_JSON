<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Concerns\ApiResponse;
use App\Http\Controllers\Controller;
use App\Http\Resources\ActivityResource;
use App\Models\Activity;
use App\Models\ActivityTranslation;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ActivityController extends Controller
{
    use ApiResponse;

    public function index(Request $request): JsonResponse
    {
        $query = Activity::with(['translations', 'category', 'media']);

        if ($search = $request->query('search')) {
            $query->where(function ($q) use ($search) {
                $q->whereHas('translations', fn ($t) => $t->where('title', 'like', "%{$search}%"))
                    ->orWhere('location', 'like', "%{$search}%");
            });
        }

        if ($status = $request->query('status')) {
            $query->where('status', $status);
        }

        if ($category = $request->query('category')) {
            $query->whereHas('category', fn ($q) => $q->where('slug', $category));
        }

        $sort = $request->query('sort', 'date_desc');
        match ($sort) {
            'date_asc' => $query->orderBy('start_date')->orderBy('start_time'),
            'title' => $query->orderBy('id'),
            default => $query->orderByDesc('start_date')->orderByDesc('start_time'),
        };

        $activities = $query->paginate((int) $request->query('per_page', 10))->withQueryString();

        return $this->paginated($activities, 'Activities retrieved.', fn ($activity) => (new ActivityResource($activity))->resolve($request));
    }

    public function show(Request $request, string $slug): JsonResponse
    {
        $translation = ActivityTranslation::where('slug', $slug)->firstOrFail();
        $activity = Activity::with(['translations', 'category', 'media'])->findOrFail($translation->activity_id);

        return $this->success((new ActivityResource($activity))->resolve($request));
    }
}
