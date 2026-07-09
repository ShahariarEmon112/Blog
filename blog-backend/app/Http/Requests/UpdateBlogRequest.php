<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateBlogRequest extends FormRequest
{
    public function authorize(): bool
    {
        return auth()->check() && auth()->user()->is_super_user;
    }

    public function rules(): array
    {
        return [
            'title'          => 'sometimes|required|string|max:255',
            'content'        => 'sometimes|required|string',
            'category_id'    => 'sometimes|required|exists:categories,id',
            'author_name'    => 'sometimes|required|string|max:255',
            'author_details' => 'nullable|string|max:500',
            'time_read'      => 'nullable|string|max:32',
            'blog_pic'       => 'nullable|image|max:5120',
            'author_avatar'  => 'nullable|image|max:2048',
            'is_featured'    => 'boolean',
            'publish_date'   => 'nullable|date',
        ];
    }
}
