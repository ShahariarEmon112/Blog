<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class SiteSetting extends Model
{
    protected $fillable = [
        'site_title', 'site_logo', 'hero_title', 'hero_subtitle',
        'footer_text', 'social_links', 'about_page', 'contact_page',
    ];

    protected function casts(): array
    {
        return [
            'social_links' => 'array',
            'about_page' => 'array',
            'contact_page' => 'array',
        ];
    }
}
