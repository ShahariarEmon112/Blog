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
            'social_links.instagram' => 'nullable|string',
            'about_page'    => 'nullable|array',
            'about_page.name'       => 'nullable|string',
            'about_page.bio'        => 'nullable|string',
            'about_page.image'      => 'nullable|string',
            'about_page.roles'      => 'nullable|array',
            'about_page.social_links' => 'nullable|array',
            'contact_page'  => 'nullable|array',
            'contact_page.heading'  => 'nullable|string',
            'contact_page.description' => 'nullable|string',
            'contact_page.phone1'   => 'nullable|string',
            'contact_page.phone2'   => 'nullable|string',
            'contact_page.email1'   => 'nullable|string',
            'contact_page.email2'   => 'nullable|string',
            'contact_page.address1' => 'nullable|string',
            'contact_page.address2' => 'nullable|string',
            'contact_page.map_embed_url' => 'nullable|string',
            'contact_page.form_heading' => 'nullable|string',
            'contact_page.form_description' => 'nullable|string',
        ]);

        $settings->update($validated);

        return response()->json($settings->fresh());
    }
}
