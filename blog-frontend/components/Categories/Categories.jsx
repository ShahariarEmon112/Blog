'use client';

import Link from 'next/link';
import { Container, Title, Card, Text, Group, SimpleGrid } from '@mantine/core';
import { useQuery } from '@tanstack/react-query';
import { getCategories } from '@/api/categories.mjs';

export default function Categories() {
  const { data: categories, isLoading } = useQuery({
    queryKey: ['categories'],
    queryFn: getCategories,
  });

  if (isLoading || !categories?.length) return null;

  return (
    <Container size="lg" py="xl">
      <Title order={2} mb="md">Categories</Title>
      <SimpleGrid cols={{ base: 2, sm: 3, md: 5 }} spacing="md">
        {categories.map((cat) => (
          <Card
            key={cat.id}
            component={Link}
            href={`/blogs?category=${cat.slug}`}
            padding="lg"
            radius="md"
            withBorder
            style={{ textDecoration: 'none' }}
          >
            <Text fw={500} size="lg">{cat.name}</Text>
            <Text size="sm" c="dimmed">{cat.blogs_count} posts</Text>
          </Card>
        ))}
      </SimpleGrid>
    </Container>
  );
}
