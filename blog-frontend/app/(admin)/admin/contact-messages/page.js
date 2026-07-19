'use client';

import { useState } from 'react';
import { Container, Title, Table, Badge, Button, Group, Text, Pagination, Modal, Stack, Textarea, Divider } from '@mantine/core';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { IconSend } from '@tabler/icons-react';
import { toast } from 'sonner';
import { axiosPrivate } from '@/utilities/axios';
import { useMantineColorScheme } from '@mantine/core';
import { replyContact } from '@/api/messages.mjs';

export default function ContactMessages() {
  const { colorScheme } = useMantineColorScheme();
  const qc = useQueryClient();
  const [selected, setSelected] = useState(null);
  const [replyText, setReplyText] = useState('');

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

  const replyMut = useMutation({
    mutationFn: () => replyContact(selected.id, replyText),
    onSuccess: () => {
      toast.success('Reply sent');
      setReplyText('');
      qc.invalidateQueries({ queryKey: ['admin', 'contact'] });
    },
    onError: () => toast.error('Failed to send reply'),
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
            <Table.Tr key={msg.id} bg={!msg.is_read ? (colorScheme === 'dark' ? 'blue.9' : 'blue.0') : undefined}>
              <Table.Td><Text fw={!msg.is_read ? 600 : 400}>{msg.name}</Text></Table.Td>
              <Table.Td>{msg.email}</Table.Td>
              <Table.Td><Text lineClamp={1} maw={150}>{msg.subject}</Text></Table.Td>
              <Table.Td>
                <Text lineClamp={2} maw={250} style={{ cursor: 'pointer' }} onClick={() => { setSelected(msg); setReplyText(''); }}>
                  {msg.message}
                </Text>
              </Table.Td>
              <Table.Td>
                <Group gap="xs">
                  <Badge color={msg.is_read ? 'gray' : 'blue'}>{msg.is_read ? 'Read' : 'Unread'}</Badge>
                  {msg.replied && <Badge color="teal" variant="light">Replied</Badge>}
                </Group>
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

      <Modal opened={!!selected} onClose={() => setSelected(null)} title="Message Details" size="lg">
        {selected && (
          <Stack gap="sm">
            <Group gap="xs">
              <Badge color={selected.is_read ? 'gray' : 'blue'}>{selected.is_read ? 'Read' : 'Unread'}</Badge>
              {selected.replied && <Badge color="teal">Replied</Badge>}
              {selected.user && <Badge color="cyan" variant="light">Registered: {selected.user.name}</Badge>}
            </Group>
            <Text><strong>Name:</strong> {selected.name}</Text>
            <Text><strong>Email:</strong> {selected.email}</Text>
            <Text><strong>Subject:</strong> {selected.subject}</Text>
            <Text><strong>Message:</strong></Text>
            <Text style={{ whiteSpace: 'pre-wrap', lineHeight: 1.7 }}>{selected.message}</Text>

            {!selected.replied && selected.user_id && (
              <>
                <Divider label="Send Reply" labelPosition="center" />
                <Textarea
                  placeholder="Write your reply..."
                  minRows={4}
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                />
                <Button
                  leftSection={<IconSend size={16} />}
                  onClick={() => replyMut.mutate()}
                  loading={replyMut.isPending}
                  disabled={!replyText.trim()}
                >
                  Send Reply
                </Button>
              </>
            )}

            {selected.replied && (
              <Text size="sm" c="dimmed" mt="sm">A reply has already been sent for this message.</Text>
            )}

            {!selected.user_id && (
              <Text size="sm" c="dimmed" mt="sm">
                This contact was submitted by a guest (no account). Replies can only be sent to registered users.
              </Text>
            )}
          </Stack>
        )}
      </Modal>

      {totalPages > 1 && (
        <Group justify="center" mt="xl">
          <Pagination total={totalPages} value={1} />
        </Group>
      )}
    </Container>
  );
}
