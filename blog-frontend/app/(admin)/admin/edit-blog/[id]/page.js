'use client';

import { useState, use, useEffect } from 'react';
import { Container, Title, TextInput, Select, FileInput, Switch, Button, Paper, Stack, Loader, Center, Text } from '@mantine/core';
import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { getCategories } from '@/api/categories.mjs';
import RichTextEditor from '@/components/Editor/RichTextEditor';
import { useUpdateBlog } from '@/hooks/mutations/useBlogAdminMutation';
import { publicAxios } from '@/utilities/axios';

export default function EditBlog({ params }) {
  const { id } = use(params);
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
  const [loaded, setLoaded] = useState(false);

  const { data: categories } = useQuery({ queryKey: ['categories'], queryFn: getCategories });

  const { data: blogData, isLoading, error } = useQuery({
    queryKey: ['blog', id],
    queryFn: () => publicAxios.get(`/blogs/${id}`).then(r => r.data?.data || r.data),
    enabled: !loaded,
  });

  useEffect(() => {
    if (blogData && !loaded) {
      setTitle(blogData.title);
      setCategoryId(String(blogData.category_id));
      setAuthorName(blogData.author_name);
      setAuthorDetails(blogData.author_details || '');
      setTimeRead(blogData.time_read || '');
      setContent(blogData.content || '');
      setIsFeatured(blogData.is_featured);
      setLoaded(true);
    }
  }, [blogData, loaded]);

  useEffect(() => {
    if (error) toast.error('Failed to load blog');
  }, [error]);

  const updateMut = useUpdateBlog();

  const handleSubmit = async () => {
    const fd = new FormData();
    fd.append('_method', 'PUT');
    fd.append('title', title);
    fd.append('category_id', categoryId);
    fd.append('author_name', authorName);
    if (authorDetails) fd.append('author_details', authorDetails);
    if (timeRead) fd.append('time_read', timeRead);
    fd.append('content', content);
    fd.append('is_featured', isFeatured ? '1' : '0');
    if (blogPic) fd.append('blog_pic', blogPic);
    if (authorAvatar) fd.append('author_avatar', authorAvatar);

    await updateMut.mutateAsync({ id, formData: fd });
    router.push('/admin/all-blogs');
  };

  const catData = (categories || []).map((c) => ({ value: String(c.id), label: c.name }));

  if (isLoading && !loaded) return <Center h={400}><Loader /></Center>;

  return (
    <Container size="md" py="xl">
      <Title order={2} mb="lg">Edit Blog</Title>
      <Paper withBorder p="lg" radius="md">
        <Stack gap="sm">
          <TextInput label="Title" value={title} onChange={(e) => setTitle(e.target.value)} required />
          <Select label="Category" data={catData} value={categoryId} onChange={setCategoryId} required />
          <TextInput label="Author Name" value={authorName} onChange={(e) => setAuthorName(e.target.value)} required />
          <TextInput label="Author Details" value={authorDetails} onChange={(e) => setAuthorDetails(e.target.value)} />
          <TextInput label="Time Read" value={timeRead} onChange={(e) => setTimeRead(e.target.value)} />
          <FileInput label="Blog Image" accept="image/*" value={blogPic} onChange={setBlogPic} />
          <FileInput label="Author Avatar" accept="image/*" value={authorAvatar} onChange={setAuthorAvatar} />
          <Switch label="Featured" checked={isFeatured} onChange={(e) => setIsFeatured(e.currentTarget.checked)} />
          <Text size="sm" fw={500}>Content</Text>
          <RichTextEditor content={content} onChange={setContent} />
          <Button onClick={handleSubmit} loading={updateMut.isPending}>Update</Button>
        </Stack>
      </Paper>
    </Container>
  );
}
