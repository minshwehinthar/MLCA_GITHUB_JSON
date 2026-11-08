<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Resources\ActivityLogResource;
use App\Models\ActivityLog;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AdminActivityLogController extends AdminController
{
    public function index(Request $request): JsonResponse
    {
        $query = ActivityLog::with('user')->latest();

        if ($action = $request->query('action')) {
            $query->where('action', $action);
        }

        if ($search = $request->query('search')) {
            $query->where('description', 'like', "%{$search}%");
        }

        $logs = $query->paginate((int) $request->query('per_page', 20))->withQueryString();

        return $this->paginated($logs, 'Activity logs retrieved.', fn ($log) => (new ActivityLogResource($log))->resolve($request));
    }
}
