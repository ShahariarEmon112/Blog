<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\SiteSetting;
use Illuminate\Http\Request;

class SiteSettingController extends Controller
{
    public function show()
    {
        $settings = SiteSetting::firstOrCreate([], [
            'site_title'    => config('app.name'),
            'hero_title'    => 'Welcome',
            'hero_subtitle' => 'Read our latest blog posts',
            'footer_text'   => '',
            'social_links'  => [],
            'about_page'    => [],
            'contact_page'  => [],
        ]);

        return response()->json($settings);
    }

    public function update(Request $request)
    {
        $settings = SiteSetting::firstOrCreate([], []);

        $validated = $request->validate([
            'site_title'    => 'sometimes|string|max:255',
            'site_logo'     => 'nullable|string|max:255',
            'hero_title'    => 'sometimes|string|max:255',
            'hero_subtitle' => 'sometimes|string|max:255',
            'footer_text'   => 'nullable|string',
            'social_links'  => 'nullable|array',
            'social_links.twitter'  => 'nullable|string',
            'social_links.facebook' => 'nullable|string',
            'social_links.linkedin' => 'nullable|string',
            'social_links.github'   => 'nullable|string',
            'about_page'    => 'nullable|array',
            'about_page.name'       => 'nullable|string',
            'about_page.bio'        => 'nullable|string',
            'about_page.image'      => 'nullable|string',
            'about_page.roles'      => 'nullable|array',
            'contact_page'  => 'nullable|array',
            'contact_page.heading'  => 'nullable|string',
            'contact_page.emails'   => 'nullable|array',
            'contact_page.phones'   => 'nullable|array',
            'contact_page.address'  => 'nullable|string',
            'contact_page.map_embed_url' => 'nullable|string',
        ]);

        $settings->update($validated);

        return response()->json($settings->fresh());
    }
}
