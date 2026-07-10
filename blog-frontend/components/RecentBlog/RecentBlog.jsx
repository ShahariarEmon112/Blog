'use client';

import Link from 'next/link';
import { Container, Title, Card, Text, Group } from '@mantine/core';
import { useQuery } from '@tanstack/react-query';
import { getBlogs } from '@/api/blogs.mjs';

export default function RecentBlog() {
  const { data, isLoading } = useQuery({
    queryKey: ['blogs', 'recent'],
    queryFn: () => getBlogs({ per_page: 6, sort: 'created_at', order: 'desc' }),
  });

  const blogs = data?.data || [];

  if (isLoading || !blogs.length) return null;

  return (
    <Container size="lg" py="xl">
      <Title order={2} mb="md">Recent Posts</Title>
      {blogs.map((blog) => (
        <Card
          key={blog.id}
          component={Link}
          href={`/blogs/${blog.id}`}
          padding="md"
          radius="md"
          withBorder
          mb="sm"
          style={{ textDecoration: 'none' }}
        >
          <Group justify="space-between">
            <div>
              <Text fw={500}>{blog.title}</Text>
              <Text size="sm" c="dimmed">By {blog.author_name} — {blog.category?.name}</Text>
            </div>
            <Text size="xs" c="dimmed">{blog.time_read || '3 mins read'}</Text>
          </Group>
        </Card>
      ))}
    </Container>
  );
}
