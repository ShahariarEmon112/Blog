'use client';

import { Container, Title, SimpleGrid, Card, Text, Image, Group, Badge, ActionIcon, Center, Loader } from '@mantine/core';
import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import { IconBookmarkOff } from '@tabler/icons-react';
import { toast } from 'sonner';
import { getFavorites, removeFavorite } from '@/api/favorites.mjs';
import RequireAuth from '@/components/RequireAuth';
import { useMutation, useQueryClient } from '@tanstack/react-query';

function FavoritesContent() {
  const qc = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['favorites'],
    queryFn: getFavorites,
  });

  const removeMut = useMutation({
    mutationFn: removeFavorite,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['favorites'] });
      toast.success('Removed from favorites');
    },
  });

  const favorites = data?.data || data || [];

  if (isLoading) return <Center h={400}><Loader /></Center>;

  return (
    <Container size="lg" py="xl">
      <Title order={2} mb="lg">My Favorites</Title>
      {favorites.length === 0 ? (
        <Text c="dimmed">No favorites yet.</Text>
      ) : (
        <SimpleGrid cols={{ base: 1, sm: 2, md: 3 }} spacing="md">
          {favorites.map((fav) => {
            const blog = fav.blog || fav;
            return (
              <Card key={fav.id} padding="lg" radius="md" withBorder>
                {blog.blog_pic_url && (
                  <Card.Section>
                    <Image src={blog.blog_pic_url} height={140} alt={blog.title} />
                  </Card.Section>
                )}
                <Text fw={500} lineClamp={2} component={Link} href={`/blogs/${blog.id}`} style={{ textDecoration: 'none' }} mt="xs">
                  {blog.title}
                </Text>
                <Group justify="space-between" mt="sm">
                  <Badge variant="light">{blog.time_read || '3 min'}</Badge>
                  <ActionIcon variant="subtle" color="red" onClick={() => removeMut.mutate(blog.id)}>
                    <IconBookmarkOff size={18} />
                  </ActionIcon>
                </Group>
              </Card>
            );
          })}
        </SimpleGrid>
      )}
    </Container>
  );
}

export default function FavouritesPage() {
  return (
    <RequireAuth>
      <FavoritesContent />
    </RequireAuth>
  );
}
