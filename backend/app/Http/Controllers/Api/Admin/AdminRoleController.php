<?php

namespace App\Http\Controllers\Api\Admin;

use App\Models\Permission;
use App\Models\Role;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AdminRoleController extends AdminController
{
    public function index(): JsonResponse
    {
        $roles = Role::with('permissions')->orderBy('id')->get()->map(fn ($role) => [
            'id' => $role->id,
            'name' => $role->name,
            'slug' => $role->slug,
            'description' => $role->description,
            'permissions' => $role->permissions->map(fn ($p) => ['id' => $p->id, 'slug' => $p->slug, 'name' => $p->name, 'module' => $p->module]),
        ]);

        $permissions = Permission::orderBy('module')->orderBy('name')->get()->map(fn ($p) => [
            'id' => $p->id, 'slug' => $p->slug, 'name' => $p->name, 'module' => $p->module,
        ]);

        return $this->success(['roles' => $roles, 'permissions' => $permissions]);
    }

    public function updatePermissions(Request $request, int $id): JsonResponse
    {
        $role = Role::findOrFail($id);

        if ($role->slug === 'super-admin') {
            return $this->error('Super Administrator permissions cannot be modified.', 422);
        }

        $data = $request->validate([
            'permissions' => ['present', 'array'],
            'permissions.*' => ['exists:permissions,id'],
        ]);

        $role->permissions()->sync($data['permissions']);
        $this->logAction('update', $role, 'Updated role permissions for '.$role->name);

        return $this->success(null, 'Role permissions updated successfully.');
    }
}
