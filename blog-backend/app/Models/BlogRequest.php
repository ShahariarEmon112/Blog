<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class BlogRequest extends Model
{
    protected $fillable = [
        'title', 'content', 'category_id', 'blog_image',
        'author_name', 'author_avatar', 'author_details',
        'time_read', 'submitted_by', 'status', 'admin_note',
    ];

    public function user()
    {
        return $this->belongsTo(User::class, 'submitted_by');
    }

    public function category()
    {
        return $this->belongsTo(Category::class);
    }
}
