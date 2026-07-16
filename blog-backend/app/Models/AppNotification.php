<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class AppNotification extends Model
{
    protected $fillable = ['recipient_id', 'action_by_id', 'blog_id', 'comment_id', 'friend_request_id', 'type', 'read'];

    protected function casts(): array
    {
        return [
            'read' => 'boolean',
        ];
    }

    public function recipient()
    {
        return $this->belongsTo(User::class, 'recipient_id');
    }

    public function actionBy()
    {
        return $this->belongsTo(User::class, 'action_by_id');
    }

    public function blog()
    {
        return $this->belongsTo(Blog::class);
    }

    public function comment()
    {
        return $this->belongsTo(Comment::class);
    }

    public function friendRequest()
    {
        return $this->belongsTo(FriendRequest::class);
    }
}
