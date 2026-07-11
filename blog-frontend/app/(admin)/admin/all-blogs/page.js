'use client';

import { useState } from 'react';
import { Container, Title, Table, TextInput, Group, Button, Badge, ActionIcon, Text } from '@mantine/core';
import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import { IconEdit, IconTrash, IconStar, IconStarFilled } from '@tabler/icons-react';
import { axiosPrivate } from '@/utilities/axios';
import { useDeleteBlog, useToggleFeatured } from '@/hooks/mutations/useBlogAdminMutation';

export default function AllBlogs() {
  const [search, setSearch] = useState('');
  const deleteMut = useDeleteBlog();
  const toggleMut = useToggleFeatured();

  const { data, isLoading } = useQuery({
    queryKey: ['admin', 'blogs', search],
    queryFn: () => axiosPrivate.get('/admin/blogs', { params: { search } }).then(r => r.data),
  });

  const blogs = data?.data || [];

  return (
    <Container size="lg" py="xl">
      <Group justify="space-between" mb="md">
        <Title order={2}>All Blogs</Title>
        <Button component={Link} href="/admin/create-blog">Create Blog</Button>
      </Group>

      <TextInput
        placeholder="Search blogs..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        mb="md"
      />

      <Table striped highlightOnHover>
        <Table.Thead>
          <Table.Tr>
            <Table.Th>Title</Table.Th>
            <Table.Th>Category</Table.Th>
            <Table.Th>Author</Table.Th>
            <Table.Th>Featured</Table.Th>
            <Table.Th>Actions</Table.Th>
          </Table.Tr>
        </Table.Thead>
        <Table.Tbody>
          {blogs.map((blog) => (
            <Table.Tr key={blog.id}>
              <Table.Td><Text lineClamp={1} maw={250}>{blog.title}</Text></Table.Td>
              <Table.Td>{blog.category?.name || '—'}</Table.Td>
              <Table.Td>{blog.author_name}</Table.Td>
              <Table.Td>
                <ActionIcon
                  variant="subtle"
                  color="yellow"
                  onClick={() => toggleMut.mutate(blog.id)}
                  loading={toggleMut.isPending}
                >
                  {blog.is_featured ? <IconStarFilled size={18} /> : <IconStar size={18} />}
                </ActionIcon>
              </Table.Td>
              <Table.Td>
                <Group gap="xs">
                  <ActionIcon component={Link} href={`/admin/edit-blog/${blog.id}`} variant="subtle" color="blue">
                    <IconEdit size={18} />
                  </ActionIcon>
                  <ActionIcon variant="subtle" color="red" onClick={() => { if (confirm('Delete this blog?')) deleteMut.mutate(blog.id); }}>
                    <IconTrash size={18} />
                  </ActionIcon>
                </Group>
              </Table.Td>
            </Table.Tr>
          ))}
        </Table.Tbody>
      </Table>

      {!isLoading && blogs.length === 0 && (
        <Text c="dimmed" ta="center" py="xl">No blogs found.</Text>
      )}
    </Container>
  );
}
