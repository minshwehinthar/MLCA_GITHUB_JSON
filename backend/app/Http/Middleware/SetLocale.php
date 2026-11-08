<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class SetLocale
{
    public const SUPPORTED = ['en', 'my', 'mnw'];

    public function handle(Request $request, Closure $next): Response
    {
        $locale = $request->query('locale')
            ?: $request->header('X-Locale')
            ?: config('app.locale', 'en');

        if (in_array($locale, self::SUPPORTED, true)) {
            app()->setLocale($locale);
        }

        return $next($request);
    }
}
