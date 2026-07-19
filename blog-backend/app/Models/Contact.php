<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Contact extends Model
{
    protected $fillable = ['name', 'email', 'phone', 'subject', 'message', 'is_read', 'user_id', 'replied'];

    protected function casts(): array
    {
        return [
            'is_read'  => 'boolean',
            'replied'  => 'boolean',
        ];
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
