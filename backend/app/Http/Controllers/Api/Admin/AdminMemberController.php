<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Resources\MemberResource;
use App\Models\Member;
use App\Support\Uploads;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AdminMemberController extends AdminController
{
    public function index(Request $request): JsonResponse
    {
        $query = Member::with('translations')->latest();

        if ($search = $request->query('search')) {
            $query->where(function ($q) use ($search) {
                $q->where('department', 'like', "%{$search}%")
                    ->orWhereHas('translations', fn ($t) => $t->where('name', 'like', "%{$search}%"));
            });
        }

        if ($request->has('executive')) {
            $query->where('is_executive', $request->boolean('executive'));
        }

        $members = $query->orderBy('order')->paginate((int) $request->query('per_page', 12))->withQueryString();

        return $this->paginated($members, 'Members retrieved.', fn ($member) => (new MemberResource($member))->resolve($request));
    }

    public function show(Request $request, int $id): JsonResponse
    {
        return $this->success((new MemberResource(Member::with('translations')->findOrFail($id)))->resolve($request));
    }

    public function store(Request $request): JsonResponse
    {
        $translations = $this->translationsInput();
        $data = $this->validateMember($request);
        $member = Member::create($data);

        $this->syncTranslations($member, $translations);
        $this->logAction('create', $member, 'Created member');

        return $this->success((new MemberResource($member->fresh()->load('translations')))->resolve($request), 'Member created successfully.', 201);
    }

    public function update(Request $request, int $id): JsonResponse
    {
        $member = Member::findOrFail($id);
        $translations = $this->translationsInput();
        $data = $this->validateMember($request);

        if (array_key_exists('photo', $data) && $member->photo && $data['photo'] !== $member->photo) {
            Uploads::delete($member->photo);
        }

        $member->update($data);
        $this->syncTranslations($member, $translations);
        $this->logAction('update', $member, 'Updated member');

        return $this->success((new MemberResource($member->fresh()->load('translations')))->resolve($request), 'Member updated successfully.');
    }

    public function destroy(int $id): JsonResponse
    {
        $member = Member::findOrFail($id);
        Uploads::delete($member->photo);
        $this->logAction('delete', $member, 'Deleted member');
        $member->delete();

        return $this->success(null, 'Member deleted successfully.');
    }

    protected function validateMember(Request $request): array
    {
        $data = $request->validate([
            'photo' => ['nullable', 'string', 'max:2048'],
            'email' => ['nullable', 'email', 'max:150'],
            'phone' => ['nullable', 'string', 'max:40'],
            'department' => ['nullable', 'string', 'max:150'],
            'academic_year' => ['nullable', 'string', 'max:50'],
            'position' => ['nullable', 'string', 'max:150'],
            'facebook' => ['nullable', 'string', 'max:255'],
            'telegram' => ['nullable', 'string', 'max:255'],
            'is_executive' => ['nullable', 'boolean'],
            'is_active' => ['nullable', 'boolean'],
            'order' => ['nullable', 'integer', 'min:0'],
            'user_id' => ['nullable', 'exists:users,id'],
        ]);

        $data['is_executive'] = $request->boolean('is_executive');
        $data['is_active'] = $request->boolean('is_active', true);
        $data['order'] = $data['order'] ?? 0;

        return $data;
    }
}
