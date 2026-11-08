<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class CheckRole
{
    public function handle(Request $request, Closure $next, string ...$roles): Response
    {
        $user = $request->user();

        if (! $user) {
            return response()->json(['success' => false, 'message' => 'Unauthenticated.'], 401);
        }

        $allowed = collect($roles)->contains(fn ($role) => $user->hasRole($role));

        if (! $allowed) {
            return response()->json([
                'success' => false,
                'message' => 'You do not have the required role for this action.',
            ], 403);
        }

        return $next($request);
    }
}
