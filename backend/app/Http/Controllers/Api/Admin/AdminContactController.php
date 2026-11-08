<?php

namespace App\Http\Controllers\Api\Admin;

use App\Models\ContactMessage;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AdminContactController extends AdminController
{
    public function index(Request $request): JsonResponse
    {
        $query = ContactMessage::latest();

        if ($request->has('is_read')) {
            $query->where('is_read', $request->boolean('is_read'));
        }

        if ($search = $request->query('search')) {
            $query->where(fn ($q) => $q->where('name', 'like', "%{$search}%")
                ->orWhere('email', 'like', "%{$search}%")
                ->orWhere('subject', 'like', "%{$search}%"));
        }

        return $this->paginated($query->paginate((int) $request->query('per_page', 15)), 'Messages retrieved.');
    }

    public function show(int $id): JsonResponse
    {
        $message = ContactMessage::findOrFail($id);
        $message->update(['is_read' => true]);

        return $this->success($message);
    }

    public function markRead(int $id): JsonResponse
    {
        $message = ContactMessage::findOrFail($id);
        $message->update(['is_read' => ! $message->is_read]);

        return $this->success($message, 'Message status updated.');
    }

    public function destroy(int $id): JsonResponse
    {
        $message = ContactMessage::findOrFail($id);
        $message->delete();

        return $this->success(null, 'Message deleted successfully.');
    }
}
