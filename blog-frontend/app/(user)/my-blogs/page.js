'use client';

import { Container, Title, SimpleGrid, Card, Text, Badge, Group, Image, Center, Loader } from '@mantine/core';
import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import { publicAxios } from '@/utilities/axios';
import RequireAuth from '@/components/RequireAuth';

function MyBlogsContent() {
  const { data, isLoading } = useQuery({
    queryKey: ['blogs', 'mine'],
    queryFn: () => publicAxios.get('/blogs/mine').then(r => r.data),
  });

  const blogs = data?.data || [];

  if (isLoading) return <Center h={400}><Loader /></Center>;

  return (
    <Container size="lg" py="xl">
      <Title order={2} mb="lg">My Blogs</Title>
      {blogs.length === 0 ? (
        <Text c="dimmed">You haven't written any blogs yet.</Text>
      ) : (
        <SimpleGrid cols={{ base: 1, sm: 2, md: 3 }} spacing="md">
          {blogs.map((blog) => (
            <Card key={blog.id} component={Link} href={`/blogs/${blog.id}`} padding="lg" radius="md" withBorder style={{ textDecoration: 'none' }}>
              {blog.blog_pic_url && (
                <Card.Section>
                  <Image src={blog.blog_pic_url} height={140} alt={blog.title} />
                </Card.Section>
              )}
              <Text fw={500} lineClamp={2} mt="xs">{blog.title}</Text>
              <Group mt="sm">
                {blog.category && <Badge variant="light">{blog.category.name}</Badge>}
                <Badge variant="outline">{blog.time_read || '3 min'}</Badge>
              </Group>
            </Card>
          ))}
        </SimpleGrid>
      )}
    </Container>
  );
}

export default function MyBlogsPage() {
  return (
    <RequireAuth>
      <MyBlogsContent />
    </RequireAuth>
  );
}
