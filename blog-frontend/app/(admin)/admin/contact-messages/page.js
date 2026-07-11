'use client';

import { Container, Title, Table, Badge, Button, Group, Text, Pagination } from '@mantine/core';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { axiosPrivate } from '@/utilities/axios';

export default function ContactMessages() {
  const qc = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['admin', 'contact'],
    queryFn: () => axiosPrivate.get('/admin/contact').then(r => r.data),
  });

  const messages = data?.data || [];
  const totalPages = data?.last_page || 1;

  const readMut = useMutation({
    mutationFn: (id) => axiosPrivate.patch(`/admin/contact/${id}/read`).then(r => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin', 'contact'] });
      toast.success('Marked as read');
    },
  });

  const deleteMut = useMutation({
    mutationFn: (id) => axiosPrivate.delete(`/admin/contact/${id}`).then(r => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin', 'contact'] });
      toast.success('Message deleted');
    },
  });

  return (
    <Container size="lg" py="xl">
      <Title order={2} mb="lg">Contact Messages</Title>

      <Table striped highlightOnHover>
        <Table.Thead>
          <Table.Tr>
            <Table.Th>Name</Table.Th>
            <Table.Th>Email</Table.Th>
            <Table.Th>Subject</Table.Th>
            <Table.Th>Message</Table.Th>
            <Table.Th>Status</Table.Th>
            <Table.Th>Actions</Table.Th>
          </Table.Tr>
        </Table.Thead>
        <Table.Tbody>
          {messages.map((msg) => (
            <Table.Tr key={msg.id} style={!msg.is_read ? { background: 'var(--mantine-color-blue-0)' } : {}}>
              <Table.Td><Text fw={!msg.is_read ? 600 : 400}>{msg.name}</Text></Table.Td>
              <Table.Td>{msg.email}</Table.Td>
              <Table.Td><Text lineClamp={1} maw={150}>{msg.subject}</Text></Table.Td>
              <Table.Td><Text lineClamp={2} maw={250}>{msg.message}</Text></Table.Td>
              <Table.Td>
                <Badge color={msg.is_read ? 'gray' : 'blue'}>{msg.is_read ? 'Read' : 'Unread'}</Badge>
              </Table.Td>
              <Table.Td>
                <Group gap="xs">
                  {!msg.is_read && (
                    <Button size="xs" variant="light" onClick={() => readMut.mutate(msg.id)}>Mark Read</Button>
                  )}
                  <Button size="xs" color="red" variant="light" onClick={() => { if (confirm('Delete?')) deleteMut.mutate(msg.id); }}>Delete</Button>
                </Group>
              </Table.Td>
            </Table.Tr>
          ))}
        </Table.Tbody>
      </Table>
    </Container>
  );
}
