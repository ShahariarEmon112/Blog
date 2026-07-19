'use client';

import { useState } from 'react';
import { Container, Title, Table, Badge, Button, Group, Text, Modal, Textarea, Stack, Paper, useMantineColorScheme } from '@mantine/core';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { axiosPrivate } from '@/utilities/axios';

const statusColor = { pending: 'yellow', approved: 'green', rejected: 'red' };

export default function BlogRequests() {
  const { colorScheme } = useMantineColorScheme();
  const qc = useQueryClient();
  const [preview, setPreview] = useState(null);
  const [rejectId, setRejectId] = useState(null);
  const [rejectNote, setRejectNote] = useState('');

  const { data, isLoading } = useQuery({
    queryKey: ['admin', 'blog-requests'],
    queryFn: () => axiosPrivate.get('/admin/blog-requests').then(r => r.data),
  });

  const requests = data?.data || [];

  const approveMut = useMutation({
    mutationFn: (id) => axiosPrivate.post(`/admin/blog-requests/${id}/approve`).then(r => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin', 'blog-requests'] });
      toast.success('Blog request approved');
    },
    onError: () => toast.error('Failed to approve'),
  });

  const rejectMut = useMutation({
    mutationFn: ({ id, note }) => axiosPrivate.post(`/admin/blog-requests/${id}/reject`, { admin_note: note }).then(r => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin', 'blog-requests'] });
      setRejectId(null);
      setRejectNote('');
      toast.success('Blog request rejected');
    },
  });

  const deleteMut = useMutation({
    mutationFn: (id) => axiosPrivate.delete(`/admin/blog-requests/${id}`).then(r => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin', 'blog-requests'] });
      toast.success('Request deleted');
    },
  });

  return (
    <Container size="lg" py="xl">
      <Title order={2} mb="lg">Blog Requests</Title>

      <Table striped highlightOnHover>
        <Table.Thead>
          <Table.Tr>
            <Table.Th>Title</Table.Th>
            <Table.Th>Author</Table.Th>
            <Table.Th>Status</Table.Th>
            <Table.Th>Actions</Table.Th>
          </Table.Tr>
        </Table.Thead>
        <Table.Tbody>
          {requests.map((req) => (
            <Table.Tr key={req.id}>
              <Table.Td>
                <Text lineClamp={1} maw={200} style={{ cursor: 'pointer', textDecoration: 'underline', textDecorationColor: 'var(--mantine-color-dimmed)' }} onClick={() => setPreview(req)}>
                  {req.title}
                </Text>
              </Table.Td>
              <Table.Td>{req.user?.name || '—'}</Table.Td>
              <Table.Td><Badge color={statusColor[req.status]}>{req.status}</Badge></Table.Td>
              <Table.Td>
                <Group gap="xs">
                  <Button size="xs" variant="light" onClick={() => setPreview(req)}>Preview</Button>
                  {req.status === 'pending' && (
                    <>
                      <Button size="xs" color="green" onClick={() => approveMut.mutate(req.id)} loading={approveMut.isPending}>Approve</Button>
                      <Button size="xs" color="red" onClick={() => setRejectId(req.id)}>Reject</Button>
                    </>
                  )}
                  <Button size="xs" color="dark" variant="light" onClick={() => { if (confirm('Delete this request?')) deleteMut.mutate(req.id); }}>Delete</Button>
                </Group>
              </Table.Td>
            </Table.Tr>
          ))}
        </Table.Tbody>
      </Table>

      <Modal opened={!!preview} onClose={() => setPreview(null)} title={preview?.title} size="lg">
        <Stack gap="sm">
          <Paper withBorder p="sm" radius="md" bg={colorScheme === 'dark' ? 'dark.5' : 'blue.0'}>
            <Text size="sm">
              <strong>By</strong> {preview?.user?.name || '—'} &middot;{' '}
              <strong>Category:</strong> {preview?.category?.name || 'Uncategorized'} &middot;{' '}
              <Badge color={statusColor[preview?.status]} size="sm">{preview?.status}</Badge>
            </Text>
          </Paper>

          <Text fw={600} size="sm">Content</Text>
          <Paper
            withBorder
            p="lg"
            radius="md"
            bg={colorScheme === 'dark' ? 'dark.6' : 'gray.0'}
            style={{ lineHeight: 1.8 }}
          >
            <Text
              component="div"
              dangerouslySetInnerHTML={{ __html: preview?.content || '' }}
              style={{ lineHeight: 1.8 }}
            />
          </Paper>
        </Stack>
      </Modal>

      <Modal opened={!!rejectId} onClose={() => setRejectId(null)} title="Reject Request">
        <Stack gap="sm">
          <Textarea label="Note (optional)" value={rejectNote} onChange={(e) => setRejectNote(e.target.value)} minRows={3} />
          <Group>
            <Button color="red" onClick={() => rejectMut.mutate({ id: rejectId, note: rejectNote })} loading={rejectMut.isPending}>Reject</Button>
            <Button variant="subtle" onClick={() => setRejectId(null)}>Cancel</Button>
          </Group>
        </Stack>
      </Modal>
    </Container>
  );
}
