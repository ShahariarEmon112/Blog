'use client';

import Link from 'next/link';
import { Container, Title, SimpleGrid, Card, Text, Badge, Group, Image } from '@mantine/core';
import { useQuery } from '@tanstack/react-query';
import { getFeaturedBlogs } from '@/api/blogs.mjs';

export default function FeaturedBlog() {
  const { data, isLoading } = useQuery({
    queryKey: ['blogs', 'featured'],
    queryFn: getFeaturedBlogs,
  });

  const blogs = data?.data || [];

  if (isLoading || !blogs.length) return null;

  return (
    <Container size="lg" py="xl">
      <Title order={2} mb="md">Featured Posts</Title>
      <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="md">
        {blogs.map((blog) => (
          <Card
            key={blog.id}
            component={Link}
            href={`/blogs/${blog.id}`}
            padding="lg"
            radius="md"
            withBorder
            style={{ textDecoration: 'none' }}
          >
            {blog.blog_pic_url && (
              <Card.Section>
                <Image src={blog.blog_pic_url} height={180} alt={blog.title} />
              </Card.Section>
            )}
            <Group justify="space-between" mt="xs">
              <Text fw={500} size="lg" lineClamp={2}>{blog.title}</Text>
              <Badge>{blog.time_read || '3 mins read'}</Badge>
            </Group>
            <Text size="sm" c="dimmed" mt="xs">By {blog.author_name}</Text>
          </Card>
        ))}
      </SimpleGrid>
    </Container>
  );
}
