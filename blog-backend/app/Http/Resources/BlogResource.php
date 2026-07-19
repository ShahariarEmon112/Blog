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
            'category'    => $this->relationLoaded('category') && $this->category ? [
                'id'   => $this->category->id,
                'name' => $this->category->name,
                'slug' => $this->category->slug,
            ] : null,
            'author'      => $this->relationLoaded('author') && $this->author ? [
                'id'     => $this->author->id,
                'name'   => $this->author->name,
                'avatar' => $this->author->avatar,
            ] : null,
            'comments'    => $this->whenLoaded('comments', function () {
                return $this->comments->map(fn($c) => [
                    'id'           => $c->id,
                    'text'         => $c->text,
                    'user_name'    => $c->is_anonymous ? 'Anonymous' : ($c->user?->name ?? 'Anonymous'),
                    'user_id'      => $c->user_id,
                    'parent_id'    => $c->parent_id,
                    'is_anonymous' => $c->is_anonymous,
                    'created_at'   => $c->created_at->diffForHumans(),
                    'replies'      => $c->relationLoaded('replies') ? $c->replies->map(fn($r) => [
                        'id'           => $r->id,
                        'text'         => $r->text,
                        'user_name'    => $r->is_anonymous ? 'Anonymous' : ($r->user?->name ?? 'Anonymous'),
                        'user_id'      => $r->user_id,
                        'parent_id'    => $r->parent_id,
                        'is_anonymous' => $r->is_anonymous,
                        'created_at'   => $r->created_at->diffForHumans(),
                    ]) : [],
                ]);
            }),
        ];
    }
}
