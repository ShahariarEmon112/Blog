'use client';

import { Container, Title, Table, Badge, Button, Group, Text, Paper } from '@mantine/core';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { getPendingUsers, approveUser, deleteUser } from '@/api/admin.mjs';

export default function PendingUsers() {
  const qc = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['admin', 'pendingUsers'],
    queryFn: getPendingUsers,
  });

  const approveMut = useMutation({
    mutationFn: approveUser,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin', 'pendingUsers'] });
      qc.invalidateQueries({ queryKey: ['admin', 'pendingCount'] });
      toast.success('User approved');
    },
    onError: () => toast.error('Failed to approve user'),
  });

  const deleteMut = useMutation({
    mutationFn: deleteUser,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin', 'pendingUsers'] });
      qc.invalidateQueries({ queryKey: ['admin', 'pendingCount'] });
      toast.success('User deleted');
    },
    onError: () => toast.error('Failed to delete user'),
  });

  const users = data?.data || data || [];

  return (
    <Container size="lg" py="xl">
      <Title order={2} mb="lg">Pending Users</Title>

      {!isLoading && users.length === 0 ? (
        <Paper withBorder p="xl" ta="center">
          <Text c="dimmed">No pending users.</Text>
        </Paper>
      ) : (
        <Table striped highlightOnHover>
          <Table.Thead>
            <Table.Tr>
              <Table.Th>Name</Table.Th>
              <Table.Th>Email</Table.Th>
              <Table.Th>Registered</Table.Th>
              <Table.Th>Actions</Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {users.map((u) => (
              <Table.Tr key={u.id}>
                <Table.Td>{u.name}</Table.Td>
                <Table.Td>{u.email}</Table.Td>
                <Table.Td>{u.created_at ? new Date(u.created_at).toLocaleDateString() : '—'}</Table.Td>
                <Table.Td>
                  <Group gap="xs">
                    <Button size="xs" color="green" onClick={() => approveMut.mutate(u.id)} loading={approveMut.isPending}>
                      Approve
                    </Button>
                    <Button size="xs" color="red" onClick={() => { if (confirm('Delete this user?')) deleteMut.mutate(u.id); }}>
                      Delete
                    </Button>
                  </Group>
                </Table.Td>
              </Table.Tr>
            ))}
          </Table.Tbody>
        </Table>
      )}
    </Container>
  );
}
