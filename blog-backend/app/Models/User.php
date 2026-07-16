<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Database\Factories\UserFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Attributes\Hidden;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

#[Fillable(['name', 'email', 'password', 'status', 'is_super_user', 'avatar', 'author_details', 'age', 'gmail', 'education_status'])]
#[Hidden(['password', 'remember_token'])]
class User extends Authenticatable
{
    /** @use HasFactory<UserFactory> */
    use HasApiTokens, HasFactory, Notifiable;

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
            'is_super_user' => 'boolean',
        ];
    }

    public function scopeActive($query)
    {
        return $query->where('status', 'active');
    }

    public function blogs()
    {
        return $this->hasMany(Blog::class, 'submitted_by');
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

    public function sentRequests()
    {
        return $this->hasMany(FriendRequest::class, 'sender_id');
    }

    public function receivedRequests()
    {
        return $this->hasMany(FriendRequest::class, 'receiver_id');
    }

    public function friends()
    {
        $sent = $this->sentRequests()->where('status', 'accepted')->pluck('receiver_id');
        $received = $this->receivedRequests()->where('status', 'accepted')->pluck('sender_id');
        $ids = $sent->merge($received)->unique();
        return User::whereIn('id', $ids);
    }

    public function blogRequests()
    {
        return $this->hasMany(BlogRequest::class, 'submitted_by');
    }

    public function notifications()
    {
        return $this->hasMany(AppNotification::class, 'recipient_id');
    }
}
