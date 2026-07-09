<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreBlogRequest extends FormRequest
{
    public function authorize(): bool
    {
        return auth()->check() && auth()->user()->is_super_user;
    }

    public function rules(): array
    {
        return [
            'title'          => 'required|string|max:255',
            'content'        => 'required|string',
            'category_id'    => 'required|exists:categories,id',
            'author_name'    => 'required|string|max:255',
            'author_details' => 'nullable|string|max:500',
            'time_read'      => 'nullable|string|max:32',
            'blog_pic'       => 'nullable|image|max:5120',
            'author_avatar'  => 'nullable|image|max:2048',
            'is_featured'    => 'boolean',
            'publish_date'   => 'nullable|date',
        ];
    }
}
