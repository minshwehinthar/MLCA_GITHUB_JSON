<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Resources\ActivityLogResource;
use App\Http\Resources\ActivityResource;
use App\Http\Resources\EventResource;
use App\Http\Resources\PostResource;
use App\Models\Activity;
use App\Models\ActivityLog;
use App\Models\ContactMessage;
use App\Models\Document;
use App\Models\Event;
use App\Models\GalleryImage;
use App\Models\Member;
use App\Models\Post;
use App\Models\Video;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class AdminDashboardController extends AdminController
{
    public function index(Request $request): JsonResponse
    {
        $recentPosts = Post::with(['translations', 'category', 'author', 'media'])
            ->latest()->limit(5)->get();

        $upcomingEvents = Event::with(['translations', 'category', 'media'])
            ->where('start_date', '>=', now()->toDateString())
            ->orderBy('start_date')->limit(5)->get();

        $recentActivities = Activity::with(['translations', 'category', 'media'])
            ->latest()->limit(5)->get();

        $recentLogs = ActivityLog::with('user')->latest()->limit(8)->get();

        $monthlyPosts = Post::select(
            DB::raw("DATE_FORMAT(created_at, '%Y-%m') as month"),
            DB::raw('COUNT(*) as total')
        )->where('created_at', '>=', now()->subMonths(5)->startOfMonth())
            ->groupBy('month')->orderBy('month')->get();

        return $this->success([
            'stats' => [
                'posts' => Post::count(),
                'published_posts' => Post::published()->count(),
                'draft_posts' => Post::where('status', 'draft')->count(),
                'activities' => Activity::count(),
                'events' => Event::count(),
                'gallery_images' => GalleryImage::count(),
                'gallery_albums' => \App\Models\GalleryAlbum::count(),
                'videos' => Video::count(),
                'documents' => Document::count(),
                'members' => Member::count(),
                'unread_messages' => ContactMessage::where('is_read', false)->count(),
                'administrators' => \App\Models\User::count(),
            ],
            'recent_posts' => PostResource::collection($recentPosts)->resolve($request),
            'upcoming_events' => EventResource::collection($upcomingEvents)->resolve($request),
            'recent_activities' => ActivityResource::collection($recentActivities)->resolve($request),
            'recent_logs' => ActivityLogResource::collection($recentLogs)->resolve($request),
            'monthly_posts' => $monthlyPosts,
        ]);
    }
}
