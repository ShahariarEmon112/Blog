'use client';

import { useState } from 'react';
import { Container, SimpleGrid, Card, Text, Badge, Group, Image, TextInput, Select, Pagination, Stack } from '@mantine/core';
import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import { getBlogs } from '@/api/blogs.mjs';
import { getCategories } from '@/api/categories.mjs';

export default function BlogsPage({ searchParams: sp }) {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [categorySlug, setCategorySlug] = useState('');
  const [sort, setSort] = useState('created_at');

  const { data: blogsData, isLoading } = useQuery({
    queryKey: ['blogs', page, search, categorySlug, sort],
    queryFn: () => getBlogs({ page, per_page: 12, search, category: categorySlug, sort, order: 'desc' }),
  });

  const { data: categories } = useQuery({
    queryKey: ['categories'],
    queryFn: getCategories,
  });

  const blogs = blogsData?.data || [];
  const totalPages = blogsData?.last_page || 1;

  return (
    <Container size="lg" py="xl">
      <Stack gap="md" mb="lg">
        <Group>
          <TextInput
            placeholder="Search..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            style={{ flex: 1 }}
          />
          <Select
            placeholder="Category"
            data={[
              { value: '', label: 'All' },
              ...(categories || []).map((c) => ({ value: c.slug, label: c.name })),
            ]}
            value={categorySlug}
            onChange={(v) => { setCategorySlug(v || ''); setPage(1); }}
            clearable
          />
          <Select
            placeholder="Sort"
            data={[
              { value: 'created_at', label: 'Newest' },
              { value: 'likes_count', label: 'Most Liked' },
              { value: 'title', label: 'Title A-Z' },
            ]}
            value={sort}
            onChange={(v) => { setSort(v || 'created_at'); setPage(1); }}
          />
        </Group>
      </Stack>

      <SimpleGrid cols={{ base: 1, sm: 2, md: 3 }} spacing="md">
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
                <Image src={blog.blog_pic_url} height={160} alt={blog.title} />
              </Card.Section>
            )}
            <Group justify="space-between" mt="xs">
              <Text fw={500} size="lg" lineClamp={2}>{blog.title}</Text>
              <Badge>{blog.time_read || '3 min'}</Badge>
            </Group>
            <Text size="sm" c="dimmed" lineClamp={2}>{blog.excerpt}</Text>
            <Group mt="sm">
              <Text size="xs" c="dimmed">By {blog.author_name}</Text>
              {blog.category && <Badge variant="light" size="sm">{blog.category.name}</Badge>}
            </Group>
          </Card>
        ))}
      </SimpleGrid>

      {totalPages > 1 && (
        <Group justify="center" mt="xl">
          <Pagination total={totalPages} value={page} onChange={setPage} />
        </Group>
      )}
    </Container>
  );
}
