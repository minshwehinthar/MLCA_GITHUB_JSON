<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Resources\DocumentResource;
use App\Models\Document;
use App\Support\Uploads;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AdminDocumentController extends AdminController
{
    public function index(Request $request): JsonResponse
    {
        $query = Document::with('category')->latest();

        if ($search = $request->query('search')) {
            $query->where('title', 'like', "%{$search}%");
        }

        if ($category = $request->query('category')) {
            $query->where('category_id', $category);
        }

        $documents = $query->paginate((int) $request->query('per_page', 12))->withQueryString();

        return $this->paginated($documents, 'Documents retrieved.', fn ($document) => (new DocumentResource($document))->resolve($request));
    }

    public function show(Request $request, int $id): JsonResponse
    {
        return $this->success((new DocumentResource(Document::with('category')->findOrFail($id)))->resolve($request));
    }

    public function store(Request $request): JsonResponse
    {
        $data = $this->validateDocument($request);
        $document = Document::create($data);
        $this->logAction('create', $document, 'Created document');

        return $this->success((new DocumentResource($document->load('category')))->resolve($request), 'Document created successfully.', 201);
    }

    public function update(Request $request, int $id): JsonResponse
    {
        $document = Document::findOrFail($id);
        $data = $this->validateDocument($request);

        if ($document->file_path && $document->file_path !== $data['file_path']) {
            Uploads::delete($document->file_path);
        }

        $document->update($data);
        $this->logAction('update', $document, 'Updated document');

        return $this->success((new DocumentResource($document->fresh()->load('category')))->resolve($request), 'Document updated successfully.');
    }

    public function destroy(int $id): JsonResponse
    {
        $document = Document::findOrFail($id);
        Uploads::delete($document->file_path);
        $this->logAction('delete', $document, 'Deleted document');
        $document->delete();

        return $this->success(null, 'Document deleted successfully.');
    }

    protected function validateDocument(Request $request): array
    {
        $data = $request->validate([
            'title' => ['required', 'string', 'max:255'],
            'title_my' => ['nullable', 'string', 'max:255'],
            'title_mnw' => ['nullable', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
            'file_path' => ['required', 'string', 'max:2048'],
            'file_name' => ['required', 'string', 'max:255'],
            'mime_type' => ['nullable', 'string', 'max:150'],
            'file_size' => ['nullable', 'integer', 'min:0'],
            'is_published' => ['nullable', 'boolean'],
            'category_id' => ['nullable', 'exists:categories,id'],
        ]);

        $data['is_published'] = $request->boolean('is_published', true);
        $data['file_size'] = $data['file_size'] ?? 0;

        return $data;
    }
}
