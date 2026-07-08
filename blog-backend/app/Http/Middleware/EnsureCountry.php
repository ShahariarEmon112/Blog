<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureCountry
{
    /**
     * Handle an incoming request.
     *
     * @param  Closure(Request): (Response)  $next
     */
    public function handle(Request $request, Closure $next, string $country): Response
    {
        $requestCountry = $request->header('X-Country')
            ?? $request->query('country')
            ?? config('app.default_country', 'BD');

        if (strtoupper($requestCountry) !== strtoupper($country)) {
            abort(403, "This section is only available in {$country}. Detected: {$requestCountry}");
        }

        return $next($request);
    }
}
