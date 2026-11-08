<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Resources\UserResource;
use App\Models\Role;
use App\Models\User;
use App\Support\Uploads;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;

class AdminUserController extends AdminController
{
    public function index(Request $request): JsonResponse
    {
        $query = User::with('roles')->latest();

        if ($search = $request->query('search')) {
            $query->where(fn ($q) => $q->where('name', 'like', "%{$search}%")
                ->orWhere('email', 'like', "%{$search}%"));
        }

        if ($role = $request->query('role')) {
            $query->whereHas('roles', fn ($q) => $q->where('slug', $role));
        }

        $users = $query->paginate((int) $request->query('per_page', 12))->withQueryString();

        return $this->paginated($users, 'Administrators retrieved.', fn ($user) => (new UserResource($user))->resolve($request));
    }

    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'name' => ['required', 'string', 'max:150'],
            'email' => ['required', 'email', 'max:150', 'unique:users,email'],
            'password' => ['required', 'string', 'min:8'],
            'phone' => ['nullable', 'string', 'max:40'],
            'avatar' => ['nullable', 'string', 'max:2048'],
            'bio' => ['nullable', 'string', 'max:2000'],
            'is_active' => ['nullable', 'boolean'],
            'roles' => ['required', 'array', 'min:1'],
            'roles.*' => ['exists:roles,id'],
        ]);

        $user = User::create([
            'name' => $data['name'],
            'email' => $data['email'],
            'password' => $data['password'],
            'phone' => $data['phone'] ?? null,
            'avatar' => $data['avatar'] ?? null,
            'bio' => $data['bio'] ?? null,
            'is_active' => $request->boolean('is_active', true),
        ]);

        $user->roles()->sync($data['roles']);
        $this->logAction('create', $user, 'Created administrator '.$user->name);

        return $this->success((new UserResource($user->fresh()->load('roles')))->resolve($request), 'Administrator created successfully.', 201);
    }

    public function show(Request $request, int $id): JsonResponse
    {
        return $this->success((new UserResource(User::with('roles')->findOrFail($id)))->resolve($request));
    }

    public function update(Request $request, int $id): JsonResponse
    {
        $user = User::findOrFail($id);

        $data = $request->validate([
            'name' => ['required', 'string', 'max:150'],
            'email' => ['required', 'email', 'max:150', 'unique:users,email,'.$user->id],
            'password' => ['nullable', 'string', 'min:8'],
            'phone' => ['nullable', 'string', 'max:40'],
            'avatar' => ['nullable', 'string', 'max:2048'],
            'bio' => ['nullable', 'string', 'max:2000'],
            'is_active' => ['nullable', 'boolean'],
            'roles' => ['required', 'array', 'min:1'],
            'roles.*' => ['exists:roles,id'],
        ]);

        if (array_key_exists('avatar', $data) && $user->avatar && $data['avatar'] !== $user->avatar) {
            Uploads::delete($user->avatar);
        }

        $update = [
            'name' => $data['name'],
            'email' => $data['email'],
            'phone' => $data['phone'] ?? null,
            'avatar' => array_key_exists('avatar', $data) ? $data['avatar'] : $user->avatar,
            'bio' => $data['bio'] ?? null,
            'is_active' => $request->boolean('is_active', true),
        ];

        if (! empty($data['password'])) {
            $update['password'] = $data['password'];
        }

        if ($user->id === $request->user()->id && ! $update['is_active']) {
            return $this->error('You cannot deactivate your own account.', 422);
        }

        $user->update($update);
        $user->roles()->sync($data['roles']);
        $this->logAction('update', $user, 'Updated administrator '.$user->name);

        return $this->success((new UserResource($user->fresh()->load('roles')))->resolve($request), 'Administrator updated successfully.');
    }

    public function destroy(Request $request, int $id): JsonResponse
    {
        $user = User::findOrFail($id);

        if ($user->id === $request->user()->id) {
            return $this->error('You cannot delete your own account.', 422);
        }

        if ($user->isSuperAdmin() && User::whereHas('roles', fn ($q) => $q->where('slug', 'super-admin'))->count() <= 1) {
            return $this->error('At least one super administrator must remain active.', 422);
        }

        Uploads::delete($user->avatar);
        $this->logAction('delete', $user, 'Deleted administrator '.$user->name);
        $user->tokens()->delete();
        $user->delete();

        return $this->success(null, 'Administrator deleted successfully.');
    }
}
