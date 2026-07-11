'use client';

import { useState } from 'react';
import { Container, Title, Table, TextInput, FileInput, Button, Group, Text, Paper, Stack, Modal } from '@mantine/core';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { axiosPrivate } from '@/utilities/axios';
import { IconEdit, IconTrash } from '@tabler/icons-react';

function CategoriesAdmin() {
  const qc = useQueryClient();
  const [name, setName] = useState('');
  const [image, setImage] = useState(null);
  const [editId, setEditId] = useState(null);
  const [editName, setEditName] = useState('');
  const [editImage, setEditImage] = useState(null);
  const [editModal, setEditModal] = useState(false);

  const { data: categories, isLoading } = useQuery({
    queryKey: ['admin', 'categories'],
    queryFn: () => axiosPrivate.get('/admin/categories').then(r => r.data),
  });

  const createMut = useMutation({
    mutationFn: async () => {
      const fd = new FormData();
      fd.append('name', name);
      if (image) fd.append('image', image);
      return axiosPrivate.post('/admin/categories', fd).then(r => r.data);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin', 'categories'] });
      qc.invalidateQueries({ queryKey: ['categories'] });
      setName('');
      setImage(null);
      toast.success('Category created');
    },
    onError: (err) => toast.error(err?.response?.data?.message || 'Failed to create'),
  });

  const updateMut = useMutation({
    mutationFn: async () => {
      const fd = new FormData();
      fd.append('_method', 'PUT');
      fd.append('name', editName);
      if (editImage) fd.append('image', editImage);
      return axiosPrivate.post(`/admin/categories/${editId}`, fd).then(r => r.data);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin', 'categories'] });
      qc.invalidateQueries({ queryKey: ['categories'] });
      setEditModal(false);
      toast.success('Category updated');
    },
    onError: (err) => toast.error(err?.response?.data?.message || 'Failed to update'),
  });

  const deleteMut = useMutation({
    mutationFn: (id) => axiosPrivate.delete(`/admin/categories/${id}`).then(r => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin', 'categories'] });
      qc.invalidateQueries({ queryKey: ['categories'] });
      toast.success('Category deleted');
    },
    onError: (err) => toast.error(err?.response?.data?.message || 'Cannot delete'),
  });

  const catList = categories?.data || categories || [];

  return (
    <Container size="lg" py="xl">
      <Title order={2} mb="lg">Manage Categories</Title>

      <Paper withBorder p="md" mb="xl">
        <Title order={4} mb="sm">Add Category</Title>
        <Stack gap="sm">
          <TextInput label="Name" value={name} onChange={(e) => setName(e.target.value)} required />
          <FileInput label="Image" accept="image/*" value={image} onChange={setImage} />
          <Button onClick={() => createMut.mutate()} loading={createMut.isPending}>Add</Button>
        </Stack>
      </Paper>

      <Table striped highlightOnHover>
        <Table.Thead>
          <Table.Tr>
            <Table.Th>Name</Table.Th>
            <Table.Th>Slug</Table.Th>
            <Table.Th>Blogs</Table.Th>
            <Table.Th>Actions</Table.Th>
          </Table.Tr>
        </Table.Thead>
        <Table.Tbody>
          {catList.map((cat) => (
            <Table.Tr key={cat.id}>
              <Table.Td>{cat.name}</Table.Td>
              <Table.Td>{cat.slug}</Table.Td>
              <Table.Td>{cat.blogs_count ?? 0}</Table.Td>
              <Table.Td>
                <Group gap="xs">
                  <Button size="xs" variant="light"
                    onClick={() => { setEditId(cat.id); setEditName(cat.name); setEditModal(true); }}>
                    <IconEdit size={14} />
                  </Button>
                  <Button size="xs" color="red" variant="light"
                    onClick={() => { if (confirm(`Delete "${cat.name}"?`)) deleteMut.mutate(cat.id); }}>
                    <IconTrash size={14} />
                  </Button>
                </Group>
              </Table.Td>
            </Table.Tr>
          ))}
        </Table.Tbody>
      </Table>

      <Modal opened={editModal} onClose={() => setEditModal(false)} title="Edit Category">
        <Stack gap="sm">
          <TextInput label="Name" value={editName} onChange={(e) => setEditName(e.target.value)} />
          <FileInput label="Image" accept="image/*" value={editImage} onChange={setEditImage} />
          <Group>
            <Button onClick={() => updateMut.mutate()} loading={updateMut.isPending}>Save</Button>
            <Button variant="subtle" onClick={() => setEditModal(false)}>Cancel</Button>
          </Group>
        </Stack>
      </Modal>
    </Container>
  );
}

export default function ManageCategoriesPage() {
  return <CategoriesAdmin />;
}
