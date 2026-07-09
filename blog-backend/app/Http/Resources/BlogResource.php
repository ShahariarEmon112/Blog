<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class BlogResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id'          => $this->id,
            'title'       => $this->title,
            'content'     => $this->content,
            'blog_pic_url' => $this->blog_pic_url,
            'author_name' => $this->author_name,
            'author_avatar' => $this->author_avatar,
            'author_details' => $this->author_details,
            'time_read'   => $this->time_read,
            'is_featured' => $this->is_featured,
            'is_popular'  => $this->is_popular,
            'likes_count' => $this->likes_count,
            'publish_date' => $this->publish_date?->toDateString(),
            'created_at'  => $this->created_at?->toISOString(),
            'category'    => $this->whenLoaded('category', fn() => [
                'id'   => $this->category->id,
                'name' => $this->category->name,
                'slug' => $this->category->slug,
            ]),
            'author'      => $this->whenLoaded('author', fn() => [
                'id'     => $this->author->id,
                'name'   => $this->author->name,
                'avatar' => $this->author->avatar,
            ]),
            'comments'    => $this->whenLoaded('comments', function () {
                return $this->comments->map(fn($c) => [
                    'id'        => $c->id,
                    'text'      => $c->text,
                    'user'      => $c->user ? ['id' => $c->user->id, 'name' => $c->user->name, 'avatar' => $c->user->avatar] : null,
                    'parent_id' => $c->parent_id,
                    'created_at' => $c->created_at->diffForHumans(),
                    'replies'   => $c->relationLoaded('replies') ? $c->replies->map(fn($r) => [
                        'id'         => $r->id,
                        'text'       => $r->text,
                        'user'       => $r->user ? ['id' => $r->user->id, 'name' => $r->user->name, 'avatar' => $r->user->avatar] : null,
                        'parent_id'  => $r->parent_id,
                        'created_at' => $r->created_at->diffForHumans(),
                    ]) : [],
                ]);
            }),
        ];
    }
}
