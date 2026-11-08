<?php

namespace App\Http\Middleware;

use App\Services\JsonVaultService;
use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Symfony\Component\HttpFoundation\Response;
use Throwable;

class SyncJsonVault
{
    public function handle(Request $request, Closure $next): Response
    {
        return $next($request);
    }

    public function terminate(Request $request, Response $response): void
    {
        if (! config('vault.auto_sync') || app()->runningUnitTests()) {
            return;
        }

        if (! in_array($request->method(), ['POST', 'PUT', 'PATCH', 'DELETE'], true)) {
            return;
        }

        if ($response->getStatusCode() >= 400) {
            return;
        }

        if (! $request->is('api/admin/*') && ! $request->is('api/contact')) {
            return;
        }

        try {
            app(JsonVaultService::class)->export(true, true);
        } catch (Throwable $exception) {
            Log::error('JSON vault auto-sync failed: '.$exception->getMessage());
        }
    }
}
