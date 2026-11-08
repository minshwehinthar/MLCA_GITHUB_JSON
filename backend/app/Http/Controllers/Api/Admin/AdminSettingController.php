<?php

namespace App\Http\Controllers\Api\Admin;

use App\Models\WebsiteSetting;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AdminSettingController extends AdminController
{
    public function index(): JsonResponse
    {
        $settings = WebsiteSetting::orderBy('group')->orderBy('key')->get();

        return $this->success([
            'settings' => $settings->map(fn ($s) => [
                'id' => $s->id,
                'key' => $s->key,
                'value' => $s->value,
                'group' => $s->group,
                'type' => $s->type,
                'label' => $s->label,
            ])->values(),
            'map' => $settings->pluck('value', 'key'),
        ]);
    }

    public function update(Request $request): JsonResponse
    {
        $payload = $request->input('settings', $request->all());
        $groups = $request->input('groups', []);
        $labels = $request->input('labels', []);
        $types = $request->input('types', []);

        if (is_string($payload)) {
            $payload = json_decode($payload, true) ?: [];
        }

        foreach ($payload as $key => $value) {
            if (! is_string($key)) {
                continue;
            }

            WebsiteSetting::updateOrCreate(
                ['key' => $key],
                [
                    'value' => is_array($value) ? json_encode($value) : $value,
                    'group' => $groups[$key] ?? 'general',
                    'label' => $labels[$key] ?? null,
                    'type' => $types[$key] ?? 'text',
                ]
            );
        }

        $this->logAction('update', null, 'Updated website settings');

        return $this->success(WebsiteSetting::orderBy('group')->get()->pluck('value', 'key'), 'Settings updated successfully.');
    }
}
