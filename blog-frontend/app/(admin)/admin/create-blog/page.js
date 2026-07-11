'use client';

import { useState } from 'react';
import { Container, Title, TextInput, Select, FileInput, Switch, Button, Paper, Stack, Text } from '@mantine/core';
import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { getCategories } from '@/api/categories.mjs';
import RichTextEditor from '@/components/Editor/RichTextEditor';
import { useCreateBlog } from '@/hooks/mutations/useBlogAdminMutation';

export default function CreateBlog() {
  const router = useRouter();
  const [title, setTitle] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [authorName, setAuthorName] = useState('');
  const [authorDetails, setAuthorDetails] = useState('');
  const [timeRead, setTimeRead] = useState('');
  const [content, setContent] = useState('');
  const [blogPic, setBlogPic] = useState(null);
  const [authorAvatar, setAuthorAvatar] = useState(null);
  const [isFeatured, setIsFeatured] = useState(false);

  const { data: categories } = useQuery({ queryKey: ['categories'], queryFn: getCategories });

  const createMut = useCreateBlog();

  const handleSubmit = async () => {
    const fd = new FormData();
    fd.append('title', title);
    fd.append('category_id', categoryId);
    fd.append('author_name', authorName);
    if (authorDetails) fd.append('author_details', authorDetails);
    if (timeRead) fd.append('time_read', timeRead);
    fd.append('content', content);
    fd.append('is_featured', isFeatured ? '1' : '0');
    if (blogPic) fd.append('blog_pic', blogPic);
    if (authorAvatar) fd.append('author_avatar', authorAvatar);

    await createMut.mutateAsync(fd);
    router.push('/admin/all-blogs');
  };

  const catData = (categories || []).map((c) => ({ value: String(c.id), label: c.name }));

  return (
    <Container size="md" py="xl">
      <Title order={2} mb="lg">Create Blog</Title>
      <Paper withBorder p="lg" radius="md">
        <Stack gap="sm">
          <TextInput label="Title" value={title} onChange={(e) => setTitle(e.target.value)} required />
          <Select label="Category" data={catData} value={categoryId} onChange={setCategoryId} required />
          <TextInput label="Author Name" value={authorName} onChange={(e) => setAuthorName(e.target.value)} required />
          <TextInput label="Author Details" value={authorDetails} onChange={(e) => setAuthorDetails(e.target.value)} />
          <TextInput label="Time Read (e.g. 5 mins read)" value={timeRead} onChange={(e) => setTimeRead(e.target.value)} />
          <FileInput label="Blog Image" accept="image/*" value={blogPic} onChange={setBlogPic} />
          <FileInput label="Author Avatar" accept="image/*" value={authorAvatar} onChange={setAuthorAvatar} />
          <Switch label="Featured" checked={isFeatured} onChange={(e) => setIsFeatured(e.currentTarget.checked)} />
          <Text size="sm" fw={500}>Content</Text>
          <RichTextEditor content={content} onChange={setContent} />
          <Button onClick={handleSubmit} loading={createMut.isPending}>Create</Button>
        </Stack>
      </Paper>
    </Container>
  );
}
