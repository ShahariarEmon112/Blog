'use client';

import { Container, Title, Table, Button, Group, Text } from '@mantine/core';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { axiosPrivate } from '@/utilities/axios';

export default function Newsletter() {
  const qc = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['admin', 'newsletter'],
    queryFn: () => axiosPrivate.get('/admin/newsletter').then(r => r.data),
  });

  const subscribers = data?.data || [];

  const deleteMut = useMutation({
    mutationFn: (id) => axiosPrivate.delete(`/admin/newsletter/${id}`).then(r => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin', 'newsletter'] });
      toast.success('Subscriber removed');
    },
  });

  return (
    <Container size="lg" py="xl">
      <Title order={2} mb="lg">Newsletter Subscribers</Title>

      <Table striped highlightOnHover>
        <Table.Thead>
          <Table.Tr>
            <Table.Th>Name</Table.Th>
            <Table.Th>Email</Table.Th>
            <Table.Th>Subscribed</Table.Th>
            <Table.Th>Actions</Table.Th>
          </Table.Tr>
        </Table.Thead>
        <Table.Tbody>
          {subscribers.map((sub) => (
            <Table.Tr key={sub.id}>
              <Table.Td>{sub.name}</Table.Td>
              <Table.Td>{sub.email}</Table.Td>
              <Table.Td>{sub.created_at ? new Date(sub.created_at).toLocaleDateString() : '—'}</Table.Td>
              <Table.Td>
                <Button size="xs" color="red" variant="light" onClick={() => { if (confirm('Remove subscriber?')) deleteMut.mutate(sub.id); }}>
                  Delete
                </Button>
              </Table.Td>
            </Table.Tr>
          ))}
        </Table.Tbody>
      </Table>
    </Container>
  );
}
