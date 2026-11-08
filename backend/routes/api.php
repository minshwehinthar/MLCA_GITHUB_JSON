<?php

use App\Http\Controllers\Api\ActivityController;
use App\Http\Controllers\Api\Admin\AdminAchievementController;
use App\Http\Controllers\Api\Admin\AdminActivityController;
use App\Http\Controllers\Api\Admin\AdminActivityLogController;
use App\Http\Controllers\Api\Admin\AdminCategoryController;
use App\Http\Controllers\Api\Admin\AdminContactController;
use App\Http\Controllers\Api\Admin\AdminDashboardController;
use App\Http\Controllers\Api\Admin\AdminDocumentController;
use App\Http\Controllers\Api\Admin\AdminEventController;
use App\Http\Controllers\Api\Admin\AdminGalleryController;
use App\Http\Controllers\Api\Admin\AdminMemberController;
use App\Http\Controllers\Api\Admin\AdminNavigationController;
use App\Http\Controllers\Api\Admin\AdminPageController;
use App\Http\Controllers\Api\Admin\AdminPostController;
use App\Http\Controllers\Api\Admin\AdminRoleController;
use App\Http\Controllers\Api\Admin\AdminSettingController;
use App\Http\Controllers\Api\Admin\AdminUserController;
use App\Http\Controllers\Api\Admin\AdminVideoController;
use App\Http\Controllers\Api\Admin\UploadController;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\CategoryController;
use App\Http\Controllers\Api\ContactController;
use App\Http\Controllers\Api\DocumentController;
use App\Http\Controllers\Api\EventController;
use App\Http\Controllers\Api\GalleryController;
use App\Http\Controllers\Api\MemberController;
use App\Http\Controllers\Api\PageController;
use App\Http\Controllers\Api\PostController;
use App\Http\Controllers\Api\SiteController;
use App\Http\Controllers\Api\VideoController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| Public API
|--------------------------------------------------------------------------
*/

Route::get('/site', [SiteController::class, 'site']);
Route::get('/home', [SiteController::class, 'home']);
Route::get('/achievements', [SiteController::class, 'achievements']);
Route::get('/categories', [CategoryController::class, 'index']);

Route::get('/posts', [PostController::class, 'index']);
Route::get('/posts/{slug}', [PostController::class, 'show']);

Route::get('/activities', [ActivityController::class, 'index']);
Route::get('/activities/{slug}', [ActivityController::class, 'show']);

Route::get('/events', [EventController::class, 'index']);
Route::get('/events/{slug}', [EventController::class, 'show']);

Route::get('/gallery/albums', [GalleryController::class, 'index']);
Route::get('/gallery/albums/{slug}', [GalleryController::class, 'show']);

Route::get('/videos', [VideoController::class, 'index']);
Route::get('/videos/{slug}', [VideoController::class, 'show']);

Route::get('/documents', [DocumentController::class, 'index']);
Route::get('/documents/{id}/download', [DocumentController::class, 'download']);

Route::get('/members', [MemberController::class, 'index']);
Route::get('/members/years', [MemberController::class, 'years']);
Route::get('/members/{id}', [MemberController::class, 'show']);

Route::get('/pages/{slug}', [PageController::class, 'show']);

Route::post('/contact', [ContactController::class, 'store'])->middleware('throttle:contact');

/*
|--------------------------------------------------------------------------
| Authentication
|--------------------------------------------------------------------------
*/

Route::prefix('auth')->group(function () {
    Route::post('/login', [AuthController::class, 'login'])->middleware('throttle:login');

    Route::middleware(['auth:sanctum', 'active'])->group(function () {
        Route::get('/me', [AuthController::class, 'me']);
        Route::post('/logout', [AuthController::class, 'logout']);
        Route::put('/profile', [AuthController::class, 'updateProfile']);
        Route::post('/change-password', [AuthController::class, 'changePassword']);
    });
});

/*
|--------------------------------------------------------------------------
| Admin API
|--------------------------------------------------------------------------
*/

Route::middleware(['auth:sanctum', 'active'])
    ->prefix('admin')
    ->group(function () {
        Route::get('/dashboard', [AdminDashboardController::class, 'index'])
            ->middleware('permission:dashboard.view');

        // Posts
        Route::get('/posts', [AdminPostController::class, 'index'])->middleware('permission:posts.view');
        Route::post('/posts', [AdminPostController::class, 'store'])->middleware('permission:posts.create');
        Route::get('/posts/{id}', [AdminPostController::class, 'show'])->middleware('permission:posts.view');
        Route::put('/posts/{id}', [AdminPostController::class, 'update'])->middleware('permission:posts.update');
        Route::delete('/posts/{id}', [AdminPostController::class, 'destroy'])->middleware('permission:posts.delete');

        // Activities
        Route::get('/activities', [AdminActivityController::class, 'index'])->middleware('permission:activities.view');
        Route::post('/activities', [AdminActivityController::class, 'store'])->middleware('permission:activities.create');
        Route::get('/activities/{id}', [AdminActivityController::class, 'show'])->middleware('permission:activities.view');
        Route::put('/activities/{id}', [AdminActivityController::class, 'update'])->middleware('permission:activities.update');
        Route::delete('/activities/{id}', [AdminActivityController::class, 'destroy'])->middleware('permission:activities.delete');

        // Events
        Route::get('/events', [AdminEventController::class, 'index'])->middleware('permission:events.view');
        Route::post('/events', [AdminEventController::class, 'store'])->middleware('permission:events.create');
        Route::get('/events/{id}', [AdminEventController::class, 'show'])->middleware('permission:events.view');
        Route::put('/events/{id}', [AdminEventController::class, 'update'])->middleware('permission:events.update');
        Route::delete('/events/{id}', [AdminEventController::class, 'destroy'])->middleware('permission:events.delete');

        // Gallery
        Route::get('/gallery/albums', [AdminGalleryController::class, 'index'])->middleware('permission:gallery.view');
        Route::post('/gallery/albums', [AdminGalleryController::class, 'store'])->middleware('permission:gallery.create');
        Route::get('/gallery/albums/{id}', [AdminGalleryController::class, 'show'])->middleware('permission:gallery.view');
        Route::put('/gallery/albums/{id}', [AdminGalleryController::class, 'update'])->middleware('permission:gallery.update');
        Route::delete('/gallery/albums/{id}', [AdminGalleryController::class, 'destroy'])->middleware('permission:gallery.delete');
        Route::post('/gallery/albums/{album}/images', [AdminGalleryController::class, 'storeImage'])->middleware('permission:gallery.update');
        Route::delete('/gallery/images/{image}', [AdminGalleryController::class, 'destroyImage'])->middleware('permission:gallery.update');

        // Videos
        Route::get('/videos', [AdminVideoController::class, 'index'])->middleware('permission:videos.view');
        Route::post('/videos', [AdminVideoController::class, 'store'])->middleware('permission:videos.create');
        Route::get('/videos/{id}', [AdminVideoController::class, 'show'])->middleware('permission:videos.view');
        Route::put('/videos/{id}', [AdminVideoController::class, 'update'])->middleware('permission:videos.update');
        Route::delete('/videos/{id}', [AdminVideoController::class, 'destroy'])->middleware('permission:videos.delete');

        // Documents
        Route::get('/documents', [AdminDocumentController::class, 'index'])->middleware('permission:documents.view');
        Route::post('/documents', [AdminDocumentController::class, 'store'])->middleware('permission:documents.create');
        Route::get('/documents/{id}', [AdminDocumentController::class, 'show'])->middleware('permission:documents.view');
        Route::put('/documents/{id}', [AdminDocumentController::class, 'update'])->middleware('permission:documents.update');
        Route::delete('/documents/{id}', [AdminDocumentController::class, 'destroy'])->middleware('permission:documents.delete');

        // Members
        Route::get('/members', [AdminMemberController::class, 'index'])->middleware('permission:members.view');
        Route::post('/members', [AdminMemberController::class, 'store'])->middleware('permission:members.create');
        Route::get('/members/{id}', [AdminMemberController::class, 'show'])->middleware('permission:members.view');
        Route::put('/members/{id}', [AdminMemberController::class, 'update'])->middleware('permission:members.update');
        Route::delete('/members/{id}', [AdminMemberController::class, 'destroy'])->middleware('permission:members.delete');

        // Categories
        Route::get('/categories', [AdminCategoryController::class, 'index'])->middleware('permission:categories.view');
        Route::post('/categories', [AdminCategoryController::class, 'store'])->middleware('permission:categories.manage');
        Route::put('/categories/{id}', [AdminCategoryController::class, 'update'])->middleware('permission:categories.manage');
        Route::delete('/categories/{id}', [AdminCategoryController::class, 'destroy'])->middleware('permission:categories.manage');

        // Pages (About Us, etc.)
        Route::get('/pages', [AdminPageController::class, 'index'])->middleware('permission:pages.view');
        Route::post('/pages', [AdminPageController::class, 'store'])->middleware('permission:pages.manage');
        Route::get('/pages/{slug}', [AdminPageController::class, 'show'])->middleware('permission:pages.view');
        Route::put('/pages/{slug}', [AdminPageController::class, 'update'])->middleware('permission:pages.manage');
        Route::delete('/pages/{slug}', [AdminPageController::class, 'destroy'])->middleware('permission:pages.manage');

        // Achievements
        Route::get('/achievements', [AdminAchievementController::class, 'index'])->middleware('permission:achievements.view');
        Route::post('/achievements', [AdminAchievementController::class, 'store'])->middleware('permission:achievements.manage');
        Route::put('/achievements/{id}', [AdminAchievementController::class, 'update'])->middleware('permission:achievements.manage');
        Route::delete('/achievements/{id}', [AdminAchievementController::class, 'destroy'])->middleware('permission:achievements.manage');

        // Navigation
        Route::get('/navigation', [AdminNavigationController::class, 'index'])->middleware('permission:navigation.manage');
        Route::post('/navigation', [AdminNavigationController::class, 'store'])->middleware('permission:navigation.manage');
        Route::put('/navigation/{id}', [AdminNavigationController::class, 'update'])->middleware('permission:navigation.manage');
        Route::delete('/navigation/{id}', [AdminNavigationController::class, 'destroy'])->middleware('permission:navigation.manage');

        // Website settings
        Route::get('/settings', [AdminSettingController::class, 'index'])->middleware('permission:settings.manage');
        Route::put('/settings', [AdminSettingController::class, 'update'])->middleware('permission:settings.manage');

        // Administrators & roles
        Route::get('/administrators', [AdminUserController::class, 'index'])->middleware('permission:admins.manage');
        Route::post('/administrators', [AdminUserController::class, 'store'])->middleware('permission:admins.manage');
        Route::get('/administrators/{id}', [AdminUserController::class, 'show'])->middleware('permission:admins.manage');
        Route::put('/administrators/{id}', [AdminUserController::class, 'update'])->middleware('permission:admins.manage');
        Route::delete('/administrators/{id}', [AdminUserController::class, 'destroy'])->middleware('permission:admins.manage');
        Route::get('/roles', [AdminRoleController::class, 'index'])->middleware('permission:admins.manage');
        Route::put('/roles/{id}/permissions', [AdminRoleController::class, 'updatePermissions'])->middleware('permission:admins.manage');

        // Contact messages
        Route::get('/messages', [AdminContactController::class, 'index'])->middleware('permission:messages.view');
        Route::get('/messages/{id}', [AdminContactController::class, 'show'])->middleware('permission:messages.view');
        Route::put('/messages/{id}/toggle-read', [AdminContactController::class, 'markRead'])->middleware('permission:messages.view');
        Route::delete('/messages/{id}', [AdminContactController::class, 'destroy'])->middleware('permission:messages.view');

        // Activity logs
        Route::get('/activity-logs', [AdminActivityLogController::class, 'index'])->middleware('permission:logs.view');

        // File uploads
        Route::post('/uploads', [UploadController::class, 'store'])->middleware('permission:media.upload');
        Route::delete('/uploads', [UploadController::class, 'destroy'])->middleware('permission:media.delete');
    });
