'use client';

import { ActionIcon } from '@mantine/core';
import { IconHeart, IconHeartFilled } from '@tabler/icons-react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { addLike, removeLike } from '@/api/likes.mjs';
import useAuth from '@/hooks/useAuth';

export default function LikeButton({ blogId, likesCount: initialCount }) {
  const { isLoggedIn } = useAuth();
  const queryClient = useQueryClient();

  const blog = queryClient.getQueryData(['blog', blogId])?.data;

  // optimistically increment count so the UI feels instant
  // rollback to previous state if the server call fails
  const likeMut = useMutation({
    mutationFn: () => addLike(blogId),
    onMutate: async () => {
      const prev = queryClient.getQueryData(['blog', blogId]);
      if (prev) {
        queryClient.setQueryData(['blog', blogId], {
          ...prev,
          data: { ...prev.data, likes_count: (prev.data?.likes_count || 0) + 1, liked: true },
        });
      }
      return { prev };
    },
    onError: (_err, _vars, ctx) => {
      if (ctx?.prev) queryClient.setQueryData(['blog', blogId], ctx.prev);
      toast.error('Failed to like');
    },
  });

  const unlikeMut = useMutation({
    mutationFn: () => removeLike(blogId),
    onMutate: async () => {
      const prev = queryClient.getQueryData(['blog', blogId]);
      if (prev) {
        queryClient.setQueryData(['blog', blogId], {
          ...prev,
          data: { ...prev.data, likes_count: Math.max(0, (prev.data?.likes_count || 0) - 1), liked: false },
        });
      }
      return { prev };
    },
    onError: (_err, _vars, ctx) => {
      if (ctx?.prev) queryClient.setQueryData(['blog', blogId], ctx.prev);
      toast.error('Failed to unlike');
    },
  });

  const liked = blog?.data?.liked;
  const count = blog?.data?.likes_count ?? initialCount;

  if (!isLoggedIn) return null;

  return (
    <ActionIcon
      variant={liked ? 'filled' : 'default'}
      color="red"
      size="lg"
      onClick={() => (liked ? unlikeMut.mutate() : likeMut.mutate())}
      loading={likeMut.isPending || unlikeMut.isPending}
    >
      {liked ? <IconHeartFilled size={18} /> : <IconHeart size={18} />}
    </ActionIcon>
  );
}
