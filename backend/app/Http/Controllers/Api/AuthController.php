<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Concerns\ApiResponse;
use App\Http\Controllers\Controller;
use App\Http\Resources\UserResource;
use App\Models\ActivityLog;
use App\Models\User;
use App\Support\Uploads;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;

class AuthController extends Controller
{
    use ApiResponse;

    public function login(Request $request): JsonResponse
    {
        $credentials = $request->validate([
            'email' => ['required', 'email'],
            'password' => ['required', 'string'],
        ]);

        $user = User::where('email', $credentials['email'])->with('roles.permissions')->first();

        if (! $user || ! Hash::check($credentials['password'], $user->password)) {
            throw ValidationException::withMessages([
                'email' => ['The provided credentials are incorrect.'],
            ]);
        }

        if (! $user->is_active) {
            return $this->error('Your account has been deactivated. Please contact an administrator.', 403);
        }

        $user->forceFill(['last_login_at' => now()])->save();
        $token = $user->createToken('admin-token')->plainTextToken;

        ActivityLog::record('login', $user, $user->name.' signed in');

        return $this->success([
            'token' => $token,
            'user' => (new UserResource($user->load('roles')))->resolve($request),
        ], 'Signed in successfully.');
    }

    public function me(Request $request): JsonResponse
    {
        return $this->success(
            (new UserResource($request->user()->load('roles')))->resolve($request)
        );
    }

    public function logout(Request $request): JsonResponse
    {
        ActivityLog::record('logout', $request->user(), $request->user()->name.' signed out');
        $request->user()->currentAccessToken()?->delete();

        return $this->success(null, 'Signed out successfully.');
    }

    public function updateProfile(Request $request): JsonResponse
    {
        $user = $request->user();

        $data = $request->validate([
            'name' => ['required', 'string', 'max:150'],
            'email' => ['required', 'email', 'max:150', 'unique:users,email,'.$user->id],
            'phone' => ['nullable', 'string', 'max:40'],
            'bio' => ['nullable', 'string', 'max:2000'],
            'avatar' => ['nullable', 'string', 'max:2048'],
        ]);

        if (! empty($data['avatar']) && $user->avatar && $data['avatar'] !== $user->avatar) {
            Uploads::delete($user->avatar);
        }

        $user->update($data);
        ActivityLog::record('update', $user, 'Updated profile');

        return $this->success(
            (new UserResource($user->fresh()->load('roles')))->resolve($request),
            'Profile updated successfully.'
        );
    }

    public function changePassword(Request $request): JsonResponse
    {
        $data = $request->validate([
            'current_password' => ['required', 'string'],
            'password' => ['required', 'string', 'min:8', 'confirmed'],
        ]);

        if (! Hash::check($data['current_password'], $request->user()->password)) {
            throw ValidationException::withMessages([
                'current_password' => ['The current password is incorrect.'],
            ]);
        }

        $request->user()->update(['password' => $data['password']]);
        $request->user()->tokens()->where('id', '!=', $request->user()->currentAccessToken()?->id)->delete();
        ActivityLog::record('change-password', $request->user(), 'Changed password');

        return $this->success(null, 'Password changed successfully.');
    }
}
