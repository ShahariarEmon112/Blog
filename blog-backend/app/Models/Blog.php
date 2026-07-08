<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Blog extends Model
{
    protected $fillable = [
        'title', 'content', 'category_id', 'submitted_by',
        'author_name', 'author_avatar', 'author_details',
        'blog_pic_url', 'time_read', 'is_featured', 'is_popular',
        'likes_count', 'publish_date',
    ];

    protected function casts(): array
    {
        return [
            'is_featured' => 'boolean',
            'is_popular' => 'boolean',
            'publish_date' => 'date',
        ];
    }

    public function category()
    {
        return $this->belongsTo(Category::class);
    }

    public function author()
    {
        return $this->belongsTo(User::class, 'submitted_by');
    }

    public function comments()
    {
        return $this->hasMany(Comment::class);
    }

    public function likes()
    {
        return $this->hasMany(Like::class);
    }

    public function favorites()
    {
        return $this->hasMany(Favorite::class);
    }
}
