<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Concerns\ApiResponse;
use App\Http\Controllers\Controller;
use App\Http\Resources\EventResource;
use App\Models\Event;
use App\Models\EventTranslation;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class EventController extends Controller
{
    use ApiResponse;

    public function index(Request $request): JsonResponse
    {
        $query = Event::with(['translations', 'category', 'media']);
        $today = now()->toDateString();

        $period = $request->query('period');
        if ($period === 'upcoming') {
            $query->where('start_date', '>=', $today)->orderBy('start_date');
        } elseif ($period === 'past') {
            $query->where('start_date', '<', $today)->orderByDesc('start_date');
        } else {
            $query->orderByDesc('start_date');
        }

        if ($status = $request->query('status')) {
            $query->where('status', $status);
        }

        if ($category = $request->query('category')) {
            $query->whereHas('category', fn ($q) => $q->where('slug', $category));
        }

        if ($search = $request->query('search')) {
            $query->where(function ($q) use ($search) {
                $q->whereHas('translations', fn ($t) => $t->where('title', 'like', "%{$search}%"))
                    ->orWhere('location', 'like', "%{$search}%");
            });
        }

        $events = $query->paginate((int) $request->query('per_page', 9))->withQueryString();

        return $this->paginated($events, 'Events retrieved.', fn ($event) => (new EventResource($event))->resolve($request));
    }

    public function show(Request $request, string $slug): JsonResponse
    {
        $translation = EventTranslation::where('slug', $slug)->firstOrFail();
        $event = Event::with(['translations', 'category', 'media', 'albums.images'])->findOrFail($translation->event_id);

        return $this->success((new EventResource($event))->resolve($request));
    }
}
