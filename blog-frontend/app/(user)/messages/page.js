'use client';

import { useState } from 'react';
import { Container, Title, Tabs, Card, Text, Group, Button, Stack, Badge, Modal, Textarea, TextInput, Select, Loader, Center, Avatar, Divider } from '@mantine/core';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useDisclosure } from '@mantine/hooks';
import { IconMail, IconSend, IconMessage, IconArrowLeft, IconArrowBackUp } from '@tabler/icons-react';
import { toast } from 'sonner';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import RequireAuth from '@/components/RequireAuth';
import { getInbox, getSent, getConversation, sendMessage, replyMessage, getMessageUsers } from '@/api/messages.mjs';
import { getAvatarUrl } from '@/utils/avatar';

dayjs.extend(relativeTime);

function MessagesContent() {
  const queryClient = useQueryClient();
  const [composeOpened, { open: openCompose, close: closeCompose }] = useDisclosure(false);
  const [threadId, setThreadId] = useState(null);
  const [replyText, setReplyText] = useState('');
  const [composeData, setComposeData] = useState({ receiver_id: '', subject: '', body: '' });

  // fetch inbox/sent side by side, thread only loads when user clicks a message
  const { data: inbox, isLoading: inboxLoading } = useQuery({ queryKey: ['messages', 'inbox'], queryFn: getInbox });
  const { data: sent, isLoading: sentLoading } = useQuery({ queryKey: ['messages', 'sent'], queryFn: getSent });
  const { data: thread, isLoading: threadLoading, isError: threadError } = useQuery({
    queryKey: ['messages', 'thread', threadId],
    queryFn: () => getConversation(threadId),
    enabled: !!threadId,
  });
  const { data: users } = useQuery({ queryKey: ['message-users'], queryFn: getMessageUsers });

  const sendMutation = useMutation({
    mutationFn: sendMessage,
    onSuccess: () => { toast.success('Message sent'); closeCompose(); setComposeData({ receiver_id: '', subject: '', body: '' }); queryClient.invalidateQueries({ queryKey: ['messages'] }); },
    onError: (e) => toast.error(e.response?.data?.message || 'Failed to send'),
  });

  const replyMutation = useMutation({
    mutationFn: (data) => replyMessage(threadId, data),
    onSuccess: () => { setReplyText(''); queryClient.invalidateQueries({ queryKey: ['messages', 'thread', threadId] }); queryClient.invalidateQueries({ queryKey: ['messages', 'inbox'] }); toast.success('Reply sent'); },
    onError: (e) => toast.error(e.response?.data?.message || 'Failed to reply'),
  });

  // split recipient list: friends first, then everyone else
  const friends = (users || []).filter((u) => u.is_friend);
  const others = (users || []).filter((u) => !u.is_friend);
  const userOpts = [];
  if (friends.length) userOpts.push({ group: 'Friends', items: friends.map((u) => ({ value: String(u.id), label: u.name })) });
  if (others.length) userOpts.push({ group: 'Other Users', items: others.map((u) => ({ value: String(u.id), label: u.name })) });

  if (threadId) {
    const first = thread?.[0];
    if (threadError) {
      return (
        <Container size="md" py="xl">
          <Button variant="subtle" leftSection={<IconArrowLeft size={16} />} mb="md" onClick={() => setThreadId(null)}>Back</Button>
          <Text c="red">You do not have access to this conversation.</Text>
        </Container>
      );
    }
    return (
      <Container size="md" py="xl">
        <Button variant="subtle" leftSection={<IconArrowLeft size={16} />} mb="md" onClick={() => setThreadId(null)}>Back</Button>
        <Title order={3} mb="sm">{first?.subject}</Title>
        {threadLoading ? <Center h={200}><Loader /></Center> : (
          <Stack gap="md">
            {thread?.map((m) => (
              <Card key={m.id} withBorder padding="md" radius="md" style={{ marginLeft: m.parent_id ? 24 : 0 }}>
                <Group mb="xs">
                  <Avatar src={getAvatarUrl(m.sender?.avatar)} size={28} radius="xl" />
                  <Text fw={500} size="sm">{m.sender?.name}</Text>
                  <Text size="xs" c="dimmed">{dayjs(m.created_at).fromNow()}</Text>
                </Group>
                <Text style={{ whiteSpace: 'pre-wrap', lineHeight: 1.7 }}>{m.body}</Text>
              </Card>
            ))}
            <Divider label="Reply" labelPosition="center" />
            <Textarea
              placeholder="Write your reply..."
              minRows={3}
              value={replyText}
              onChange={(e) => setReplyText(e.target.value)}
            />
            <Button
              leftSection={<IconArrowBackUp size={16} />}
              onClick={() => replyMutation.mutate({ body: replyText })}
              loading={replyMutation.isPending}
              disabled={!replyText.trim()}
            >
              Send Reply
            </Button>
          </Stack>
        )}
      </Container>
    );
  }

  return (
    <Container size="lg" py="xl">
      <Group justify="space-between" mb="lg">
        <Title order={2}>Messages</Title>
        <Button leftSection={<IconSend size={16} />} onClick={openCompose}>Compose</Button>
      </Group>

      <Tabs defaultValue="inbox">
        <Tabs.List mb="md">
          <Tabs.Tab value="inbox" leftSection={<IconMail size={16} />}>Inbox</Tabs.Tab>
          <Tabs.Tab value="sent" leftSection={<IconSend size={16} />}>Sent</Tabs.Tab>
        </Tabs.List>

        <Tabs.Panel value="inbox">
          {inboxLoading ? <Center h={200}><Loader /></Center> : !inbox?.length ? <Text c="dimmed">Inbox is empty.</Text> : (
            <Stack gap="sm">
              {inbox.map((m) => (
                <Card key={m.id} withBorder padding="sm" radius="md" style={{ cursor: 'pointer' }} onClick={() => setThreadId(m.id)}>
                  <Group justify="space-between">
                    <Group>
                      <Avatar src={getAvatarUrl(m.sender?.avatar)} size={36} radius="xl" />
                      <div style={{ flex: 1 }}>
                        <Group gap="xs">
                          <Text fw={500} size="sm">{m.sender?.name}</Text>
                          {!m.read && <Badge size="xs" variant="filled" color="cyan">New</Badge>}
                        </Group>
                        <Text size="sm" lineClamp={1}>{m.subject}</Text>
                      </div>
                    </Group>
                    <Text size="xs" c="dimmed" style={{ whiteSpace: 'nowrap' }}>{dayjs(m.created_at).fromNow()}</Text>
                  </Group>
                </Card>
              ))}
            </Stack>
          )}
        </Tabs.Panel>

        <Tabs.Panel value="sent">
          {sentLoading ? <Center h={200}><Loader /></Center> : !sent?.length ? <Text c="dimmed">No sent messages.</Text> : (
            <Stack gap="sm">
              {sent.map((m) => (
                <Card key={m.id} withBorder padding="sm" radius="md" style={{ cursor: 'pointer' }} onClick={() => setThreadId(m.id)}>
                  <Group justify="space-between">
                    <Group>
                      <Avatar src={getAvatarUrl(m.receiver?.avatar)} size={36} radius="xl" />
                      <div>
                        <Text fw={500} size="sm">To: {m.receiver?.name}</Text>
                        <Text size="sm" lineClamp={1}>{m.subject}</Text>
                      </div>
                    </Group>
                    <Text size="xs" c="dimmed">{dayjs(m.created_at).fromNow()}</Text>
                  </Group>
                </Card>
              ))}
            </Stack>
          )}
        </Tabs.Panel>
      </Tabs>

      <Modal opened={composeOpened} onClose={closeCompose} title="New Message" size="md">
        <Stack gap="sm">
          <Select
            label="To"
            placeholder="Select recipient"
            data={userOpts}
            value={composeData.receiver_id}
            onChange={(v) => setComposeData((p) => ({ ...p, receiver_id: v }))}
            searchable
            required
          />
          <TextInput
            label="Subject"
            placeholder="Message subject"
            value={composeData.subject}
            onChange={(e) => setComposeData((p) => ({ ...p, subject: e.target.value }))}
            required
          />
          <Textarea
            label="Message"
            placeholder="Write your message..."
            minRows={5}
            value={composeData.body}
            onChange={(e) => setComposeData((p) => ({ ...p, body: e.target.value }))}
            required
          />
          <Button
            leftSection={<IconSend size={16} />}
            onClick={() => sendMutation.mutate(composeData)}
            loading={sendMutation.isPending}
            disabled={!composeData.receiver_id || !composeData.subject.trim() || !composeData.body.trim()}
          >
            Send
          </Button>
        </Stack>
      </Modal>
    </Container>
  );
}

export default function MessagesPage() {
  return <RequireAuth><MessagesContent /></RequireAuth>;
}
