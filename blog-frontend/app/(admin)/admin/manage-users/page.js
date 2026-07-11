'use client';

import { useState } from 'react';
import { Container, Title, Table, TextInput, Select, Badge, Button, Group, Text, Pagination, Paper } from '@mantine/core';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { getAdminUsers, banUser, deleteUser } from '@/api/admin.mjs';

const statusColor = { active: 'green', pending: 'yellow', banned: 'red' };

export default function ManageUsers() {
  const qc = useQueryClient();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');

  const { data, isLoading } = useQuery({
    queryKey: ['admin', 'users', page, search, status],
    queryFn: () => getAdminUsers({ page, per_page: 20, search, status }),
  });

  const banMut = useMutation({
    mutationFn: (id) => banUser(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin', 'users'] });
      toast.success('User status updated');
    },
    onError: () => toast.error('Failed to update user'),
  });

  const deleteMut = useMutation({
    mutationFn: deleteUser,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin', 'users'] });
      toast.success('User deleted');
    },
    onError: () => toast.error('Failed to delete user'),
  });

  const users = data?.data || [];
  const totalPages = data?.last_page || 1;

  return (
    <Container size="lg" py="xl">
      <Title order={2} mb="lg">Manage Users</Title>

      <Group mb="md">
        <TextInput placeholder="Search by name or email..." value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} style={{ flex: 1 }} />
        <Select placeholder="Status" data={['', 'active', 'pending', 'banned']} value={status} onChange={(v) => { setStatus(v || ''); setPage(1); }} clearable />
      </Group>

      <Table striped highlightOnHover>
        <Table.Thead>
          <Table.Tr>
            <Table.Th>Name</Table.Th>
            <Table.Th>Email</Table.Th>
            <Table.Th>Status</Table.Th>
            <Table.Th>Admin</Table.Th>
            <Table.Th>Actions</Table.Th>
          </Table.Tr>
        </Table.Thead>
        <Table.Tbody>
          {users.map((u) => (
            <Table.Tr key={u.id}>
              <Table.Td>{u.name}</Table.Td>
              <Table.Td>{u.email}</Table.Td>
              <Table.Td><Badge color={statusColor[u.status]}>{u.status}</Badge></Table.Td>
              <Table.Td>{u.is_super_user ? 'Yes' : '—'}</Table.Td>
              <Table.Td>
                <Group gap="xs">
                  <Button size="xs" color={u.status === 'banned' ? 'green' : 'orange'} onClick={() => banMut.mutate(u.id)}>
                    {u.status === 'banned' ? 'Unban' : 'Ban'}
                  </Button>
                  <Button size="xs" color="red" onClick={() => { if (confirm('Delete this user? All their data will be lost.')) deleteMut.mutate(u.id); }}>
                    Delete
                  </Button>
                </Group>
              </Table.Td>
            </Table.Tr>
          ))}
        </Table.Tbody>
      </Table>

      {totalPages > 1 && (
        <Group justify="center" mt="lg">
          <Pagination total={totalPages} value={page} onChange={setPage} />
        </Group>
      )}
    </Container>
  );
}
