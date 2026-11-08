<?php

namespace App\Support;

use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class Uploads
{
    public const IMAGE_MIMES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml'];

    public const VIDEO_MIMES = ['video/mp4', 'video/webm', 'video/ogg', 'video/quicktime'];

    public static function store(UploadedFile $file, string $folder = 'uploads'): array
    {
        $extension = strtolower($file->getClientOriginalExtension());
        $name = Str::uuid().'-'.Str::slug(pathinfo($file->getClientOriginalName(), PATHINFO_FILENAME));
        $name = $name.'.'.$extension;
        $path = $file->storeAs($folder, $name, 'public');

        return [
            'file_path' => $path,
            'file_name' => $name,
            'original_name' => $file->getClientOriginalName(),
            'mime_type' => $file->getMimeType(),
            'size' => $file->getSize(),
            'type' => self::typeFromMime($file->getMimeType() ?? ''),
        ];
    }

    public static function delete(?string $path): void
    {
        if ($path && Storage::disk('public')->exists($path)) {
            Storage::disk('public')->delete($path);
        }
    }

    public static function typeFromMime(string $mime): string
    {
        if (in_array($mime, self::IMAGE_MIMES, true) || str_starts_with($mime, 'image/')) {
            return 'image';
        }

        if (in_array($mime, self::VIDEO_MIMES, true) || str_starts_with($mime, 'video/')) {
            return 'video';
        }

        if (str_starts_with($mime, 'audio/')) {
            return 'audio';
        }

        return 'document';
    }

    public static function url(?string $path): ?string
    {
        return $path ? asset('storage/'.$path) : null;
    }
}
