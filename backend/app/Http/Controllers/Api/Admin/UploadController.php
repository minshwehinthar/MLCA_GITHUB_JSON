<?php

namespace App\Http\Controllers\Api\Admin;

use App\Support\Uploads;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class UploadController extends AdminController
{
    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'file' => [
                'required', 'file', 'max:51200',
                'mimes:jpg,jpeg,png,gif,webp,svg,mp4,webm,ogg,mov,mp3,wav,pdf,doc,docx,xls,xlsx,ppt,pptx,txt,csv,zip',
            ],
            'folder' => ['nullable', 'string', 'max:100', 'regex:/^[a-zA-Z0-9_\-\/]+$/'],
        ]);

        $folder = 'uploads/'.trim($data['folder'] ?? 'general', '/');
        $stored = Uploads::store($data['file'], $folder);

        return $this->success([
            'path' => $stored['file_path'],
            'url' => Uploads::url($stored['file_path']),
            'name' => $stored['file_name'],
            'original_name' => $stored['original_name'],
            'mime_type' => $stored['mime_type'],
            'size' => $stored['size'],
            'type' => $stored['type'],
        ], 'File uploaded successfully.', 201);
    }

    public function destroy(Request $request): JsonResponse
    {
        $data = $request->validate(['path' => ['required', 'string', 'max:2048']]);

        abort_unless(str_starts_with($data['path'], 'uploads/'), 403, 'Invalid file path.');

        Uploads::delete($data['path']);

        return $this->success(null, 'File deleted successfully.');
    }
}
