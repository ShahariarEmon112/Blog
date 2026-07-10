'use client';

import { useState } from 'react';
import { Container, Title, TextInput, Select, FileInput, Button, Paper, Stack, Center, Loader } from '@mantine/core';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { getCategories } from '@/api/categories.mjs';
import { createRequest } from '@/api/blogRequests.mjs';
import RequireAuth from '@/components/RequireAuth';

function RequestBlogContent() {
  const router = useRouter();
  const qc = useQueryClient();
  const [title, setTitle] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [content, setContent] = useState('');
  const [image, setImage] = useState(null);

  const { data: categories } = useQuery({
    queryKey: ['categories'],
    queryFn: getCategories,
  });

  const mut = useMutation({
    mutationFn: async () => {
      const fd = new FormData();
      fd.append('title', title);
      fd.append('category_id', categoryId);
      fd.append('content', content);
      if (image) fd.append('blog_pic', image);
      return createRequest(fd);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['blog-requests', 'mine'] });
      toast.success('Blog request submitted for review');
      router.push('/my-requests');
    },
    onError: (err) => toast.error(err?.response?.data?.message || 'Failed to submit'),
  });

  const catData = (categories || []).map((c) => ({ value: String(c.id), label: c.name }));

  return (
    <Container size="sm" py="xl">
      <Title order={2} mb="lg">Request a Blog</Title>
      <Paper withBorder p="lg" radius="md">
        <Stack gap="sm">
          <TextInput label="Title" value={title} onChange={(e) => setTitle(e.target.value)} required />
          <Select label="Category" data={catData} value={categoryId} onChange={setCategoryId} required />
          <TextInput label="Content" value={content} onChange={(e) => setContent(e.target.value)} multiline minRows={6} required />
          <FileInput label="Image" accept="image/*" value={image} onChange={setImage} />
          <Button onClick={() => mut.mutate()} loading={mut.isPending}>Submit</Button>
        </Stack>
      </Paper>
    </Container>
  );
}

export default function RequestBlogPage() {
  return (
    <RequireAuth>
      <RequestBlogContent />
    </RequireAuth>
  );
}
