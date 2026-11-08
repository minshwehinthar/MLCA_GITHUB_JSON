<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Concerns\ApiResponse;
use App\Http\Controllers\Controller;
use App\Http\Resources\AchievementResource;
use App\Http\Resources\ActivityResource;
use App\Http\Resources\DocumentResource;
use App\Http\Resources\EventResource;
use App\Http\Resources\GalleryAlbumResource;
use App\Http\Resources\MemberResource;
use App\Http\Resources\NavigationResource;
use App\Http\Resources\PostResource;
use App\Http\Resources\VideoResource;
use App\Models\Achievement;
use App\Models\Activity;
use App\Models\Document;
use App\Models\Event;
use App\Models\GalleryAlbum;
use App\Models\Member;
use App\Models\NavigationItem;
use App\Models\Post;
use App\Models\Video;
use App\Models\WebsiteSetting;
use App\Support\AcademicYear;
use Illuminate\Http\JsonResponse;

class SiteController extends Controller
{
    use ApiResponse;

    public const IMAGE_KEYS = [
        'site_logo', 'footer_logo', 'favicon', 'hero_image', 'hero_background',
        'about_image', 'og_image', 'contact_image',
    ];

    protected function settingMap(bool $convertImages = true): array
    {
        $settings = WebsiteSetting::all()->pluck('value', 'key')->toArray();

        if ($convertImages) {
            foreach (self::IMAGE_KEYS as $key) {
                if (! empty($settings[$key]) && ! str_starts_with($settings[$key], 'http')) {
                    $settings[$key] = asset('storage/'.$settings[$key]);
                }
            }
        }

        return $settings;
    }

    protected function navigation(): array
    {
        $items = NavigationItem::with('children')
            ->whereNull('parent_id')
            ->where('is_visible', true)
            ->orderBy('order')
            ->get();

        return [
            'header' => NavigationResource::collection($items->where('location', 'header')->values())->resolve(),
            'footer' => NavigationResource::collection($items->where('location', 'footer')->values())->resolve(),
        ];
    }

    public function site(): JsonResponse
    {
        return $this->success([
            'settings' => $this->settingMap(),
            'navigation' => $this->navigation(),
        ]);
    }

    public function home(): JsonResponse
    {
        $published = fn () => Post::published()->with(['translations', 'category', 'author', 'media']);

        $latestAnnouncements = $published()
            ->whereHas('category', fn ($q) => $q->where('type', 'announcement'))
            ->latest('published_at')->limit(3)->get();

        $recentPosts = $published()->latest('published_at')->limit(6)->get();

        $upcomingActivities = Activity::with(['translations', 'category', 'media'])
            ->whereIn('status', ['upcoming', 'ongoing'])
            ->orderBy('start_date')->limit(4)->get();

        $upcomingEvents = Event::with(['translations', 'category', 'media'])
            ->where('start_date', '>=', now()->toDateString())
            ->orderBy('start_date')->limit(3)->get();

        $recentEvents = Event::with(['translations', 'category', 'media'])
            ->where('start_date', '<', now()->toDateString())
            ->latest('start_date')->limit(3)->get();

        $albums = GalleryAlbum::with(['images', 'category'])
            ->where('is_published', true)->orderBy('order')->latest()->limit(6)->get();

        $videos = Video::with('category')->where('is_published', true)->latest('published_at')->limit(3)->get();

        $documents = Document::with('category')->where('is_published', true)->latest()->limit(4)->get();

        $achievements = Achievement::where('is_published', true)->orderBy('order')->limit(6)->get();

        $currentAcademicYear = AcademicYear::current();

        $executives = Member::with('translations')
            ->where('is_executive', true)
            ->where('is_active', true)
            ->where('academic_year', $currentAcademicYear)
            ->orderBy('order')->limit(6)->get();

        return $this->success([
            'settings' => $this->settingMap(),
            'navigation' => $this->navigation(),
            'latest_announcements' => PostResource::collection($latestAnnouncements)->resolve(),
            'recent_posts' => PostResource::collection($recentPosts)->resolve(),
            'upcoming_activities' => ActivityResource::collection($upcomingActivities)->resolve(),
            'upcoming_events' => EventResource::collection($upcomingEvents)->resolve(),
            'recent_events' => EventResource::collection($recentEvents)->resolve(),
            'gallery' => GalleryAlbumResource::collection($albums)->resolve(),
            'videos' => VideoResource::collection($videos)->resolve(),
            'documents' => DocumentResource::collection($documents)->resolve(),
            'achievements' => AchievementResource::collection($achievements)->resolve(),
            'executives' => MemberResource::collection($executives)->resolve(),
            'current_academic_year' => $currentAcademicYear,
            'stats' => [
                'posts' => Post::published()->count(),
                'activities' => Activity::count(),
                'events' => Event::count(),
                'members' => Member::where('is_active', true)->where('academic_year', $currentAcademicYear)->count(),
                'gallery_images' => \App\Models\GalleryImage::count(),
                'videos' => Video::where('is_published', true)->count(),
                'documents' => Document::where('is_published', true)->count(),
            ],
        ]);
    }

    public function achievements(): JsonResponse
    {
        $items = Achievement::where('is_published', true)->orderBy('order')->get();

        return $this->success(AchievementResource::collection($items)->resolve());
    }
}
