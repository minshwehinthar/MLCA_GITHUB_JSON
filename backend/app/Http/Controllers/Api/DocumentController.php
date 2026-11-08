<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Concerns\ApiResponse;
use App\Http\Controllers\Controller;
use App\Http\Resources\DocumentResource;
use App\Models\Document;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class DocumentController extends Controller
{
    use ApiResponse;

    public function index(Request $request): JsonResponse
    {
        $query = Document::with('category')->where('is_published', true)->latest();

        if ($category = $request->query('category')) {
            $query->whereHas('category', fn ($q) => $q->where('slug', $category));
        }

        if ($search = $request->query('search')) {
            $query->where(fn ($q) => $q->where('title', 'like', "%{$search}%")
                ->orWhere('description', 'like', "%{$search}%"));
        }

        $documents = $query->paginate((int) $request->query('per_page', 12))->withQueryString();

        return $this->paginated($documents, 'Documents retrieved.', fn ($document) => (new DocumentResource($document))->resolve($request));
    }

    public function download(int $id)
    {
        $document = Document::where('is_published', true)->findOrFail($id);
        $path = Storage::disk('public')->path($document->file_path);

        abort_unless(file_exists($path), 404, 'File not found.');

        $document->increment('downloads');

        return response()->download($path, $document->file_name);
    }
}
