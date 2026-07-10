'use client';

import { ActionIcon } from '@mantine/core';
import { IconBookmark, IconBookmarkFilled } from '@tabler/icons-react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { addFavorite, removeFavorite, checkFavorite } from '@/api/favorites.mjs';
import useAuth from '@/hooks/useAuth';

export default function FavoriteButton({ blogId }) {
  const { isLoggedIn } = useAuth();
  const queryClient = useQueryClient();

  const { data: check } = useQuery({
    queryKey: ['favorite', 'check', blogId],
    queryFn: () => checkFavorite(blogId),
    enabled: isLoggedIn,
  });

  const addMut = useMutation({
    mutationFn: () => addFavorite(blogId),
    onSuccess: () => {
      queryClient.setQueryData(['favorite', 'check', blogId], { favorited: true });
      queryClient.invalidateQueries({ queryKey: ['favorites'] });
      toast.success('Added to favorites');
    },
    onError: () => toast.error('Failed to add favorite'),
  });

  const removeMut = useMutation({
    mutationFn: () => removeFavorite(blogId),
    onSuccess: () => {
      queryClient.setQueryData(['favorite', 'check', blogId], { favorited: false });
      queryClient.invalidateQueries({ queryKey: ['favorites'] });
      toast.success('Removed from favorites');
    },
    onError: () => toast.error('Failed to remove favorite'),
  });

  if (!isLoggedIn) return null;

  const favorited = check?.favorited;

  return (
    <ActionIcon
      variant={favorited ? 'filled' : 'default'}
      color="yellow"
      size="lg"
      onClick={() => (favorited ? removeMut.mutate() : addMut.mutate())}
      loading={addMut.isPending || removeMut.isPending}
    >
      {favorited ? <IconBookmarkFilled size={18} /> : <IconBookmark size={18} />}
    </ActionIcon>
  );
}
