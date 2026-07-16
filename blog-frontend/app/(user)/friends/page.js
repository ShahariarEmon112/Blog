'use client';

import { useState } from 'react';
import { Container, Title, Tabs, Card, Text, Group, Avatar, Button, Stack, Center, Loader, Badge, ActionIcon } from '@mantine/core';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { IconUserPlus, IconUserCheck, IconUserX, IconUsers, IconSend, IconX } from '@tabler/icons-react';
import { toast } from 'sonner';
import RequireAuth from '@/components/RequireAuth';
import { getFriends, getIncomingRequests, getOutgoingRequests, getAllUsers, sendFriendRequest, acceptFriendRequest, rejectFriendRequest, removeFriend } from '@/api/friends.mjs';
import useAuth from '@/hooks/useAuth';
import { getAvatarUrl } from '@/utils/avatar';

function FriendsContent() {
  const { user } = useAuth();
  const qc = useQueryClient();

  const { data: friends, isLoading: fl } = useQuery({ queryKey: ['friends'], queryFn: getFriends });
  const { data: incoming, isLoading: il } = useQuery({ queryKey: ['friend-requests', 'incoming'], queryFn: getIncomingRequests });
  const { data: outgoing, isLoading: ol } = useQuery({ queryKey: ['friend-requests', 'outgoing'], queryFn: getOutgoingRequests });
  const { data: allUsers, isLoading: al } = useQuery({ queryKey: ['users', 'all'], queryFn: getAllUsers });

  const invalidate = () => {
    qc.invalidateQueries({ queryKey: ['friends'] });
    qc.invalidateQueries({ queryKey: ['friend-requests'] });
    qc.invalidateQueries({ queryKey: ['users', 'all'] });
    qc.invalidateQueries({ queryKey: ['notifications'] });
  };

  const sendMut = useMutation({ mutationFn: sendFriendRequest, onSuccess: () => { toast.success('Friend request sent'); invalidate(); }, onError: (e) => toast.error(e.response?.data?.message || 'Failed') });
  const acceptMut = useMutation({ mutationFn: acceptFriendRequest, onSuccess: () => { toast.success('Friend request accepted'); invalidate(); }, onError: (e) => toast.error(e.response?.data?.message || 'Failed') });
  const rejectMut = useMutation({ mutationFn: rejectFriendRequest, onSuccess: () => { toast.success('Friend request rejected'); invalidate(); }, onError: (e) => toast.error(e.response?.data?.message || 'Failed') });
  const removeMut = useMutation({ mutationFn: removeFriend, onSuccess: () => { toast.success('Friend removed'); invalidate(); }, onError: (e) => toast.error(e.response?.data?.message || 'Failed') });

  const avatarSrc = (u) => getAvatarUrl(u?.avatar);

  return (
    <Container size="lg" py="xl">
      <Title order={2} mb="lg">Friends</Title>
      <Tabs defaultValue="friends">
        <Tabs.List mb="md">
          <Tabs.Tab value="friends" leftSection={<IconUsers size={16} />}>My Friends</Tabs.Tab>
          <Tabs.Tab value="incoming" leftSection={<IconUserPlus size={16} />}>
            Incoming {incoming?.length ? <Badge size="xs" variant="filled">{incoming.length}</Badge> : null}
          </Tabs.Tab>
          <Tabs.Tab value="outgoing" leftSection={<IconSend size={16} />}>Sent</Tabs.Tab>
          <Tabs.Tab value="discover" leftSection={<IconUserCheck size={16} />}>Discover</Tabs.Tab>
        </Tabs.List>

        <Tabs.Panel value="friends">
          {fl ? <Center h={200}><Loader /></Center> : !friends?.length ? <Text c="dimmed">No friends yet.</Text> : (
            <Stack gap="sm">
              {friends.map((f) => (
                <Card key={f.id} withBorder padding="sm">
                  <Group justify="space-between">
                    <Group>
                      <Avatar src={avatarSrc(f)} size={40} radius="xl" />
                      <div>
                        <Text fw={500}>{f.name}</Text>
                      </div>
                    </Group>
                    <Button size="xs" color="red" variant="subtle" leftSection={<IconUserX size={14} />} loading={removeMut.isPending} onClick={() => removeMut.mutate(f.id)}>Remove</Button>
                  </Group>
                </Card>
              ))}
            </Stack>
          )}
        </Tabs.Panel>

        <Tabs.Panel value="incoming">
          {il ? <Center h={200}><Loader /></Center> : !incoming?.length ? <Text c="dimmed">No pending requests.</Text> : (
            <Stack gap="sm">
              {incoming.map((r) => (
                <Card key={r.id} withBorder padding="sm">
                  <Group justify="space-between">
                    <Group>
                      <Avatar src={avatarSrc(r.sender)} size={40} radius="xl" />
                      <Text fw={500}>{r.sender?.name}</Text>
                    </Group>
                    <Group>
                      <Button size="xs" color="teal" leftSection={<IconUserCheck size={14} />} loading={acceptMut.isPending} onClick={() => acceptMut.mutate(r.id)}>Accept</Button>
                      <Button size="xs" color="red" variant="subtle" leftSection={<IconX size={14} />} loading={rejectMut.isPending} onClick={() => rejectMut.mutate(r.id)}>Reject</Button>
                    </Group>
                  </Group>
                </Card>
              ))}
            </Stack>
          )}
        </Tabs.Panel>

        <Tabs.Panel value="outgoing">
          {ol ? <Center h={200}><Loader /></Center> : !outgoing?.length ? <Text c="dimmed">No sent requests.</Text> : (
            <Stack gap="sm">
              {outgoing.map((r) => (
                <Card key={r.id} withBorder padding="sm">
                  <Group>
                    <Avatar src={avatarSrc(r.receiver)} size={40} radius="xl" />
                    <div>
                      <Text fw={500}>{r.receiver?.name}</Text>
                      <Badge size="sm" color="yellow">Pending</Badge>
                    </div>
                  </Group>
                </Card>
              ))}
            </Stack>
          )}
        </Tabs.Panel>

        <Tabs.Panel value="discover">
          {al ? <Center h={200}><Loader /></Center> : (
            <Stack gap="sm">
              {allUsers?.filter((u) => !u.is_friend && !u.has_pending_request).length === 0 && (
                <Text c="dimmed">No new users to discover.</Text>
              )}
              {allUsers?.filter((u) => !u.is_friend && !u.has_pending_request).map((u) => (
                <Card key={u.id} withBorder padding="sm">
                  <Group justify="space-between">
                    <Group>
                      <Avatar src={avatarSrc(u)} size={40} radius="xl" />
                      <Text fw={500}>{u.name}</Text>
                    </Group>
                    <Button size="xs" leftSection={<IconUserPlus size={14} />} loading={sendMut.isPending} onClick={() => sendMut.mutate(u.id)}>Add Friend</Button>
                  </Group>
                </Card>
              ))}
              {allUsers?.filter((u) => u.is_friend || u.has_pending_request).length > 0 && (
                <>
                  <Text fw={600} mt="md" mb="xs">Already connected</Text>
                  {allUsers.filter((u) => u.is_friend || u.has_pending_request).map((u) => (
                    <Card key={u.id} withBorder padding="sm" opacity={0.6}>
                      <Group>
                        <Avatar src={avatarSrc(u)} size={40} radius="xl" />
                        <div>
                          <Text fw={500}>{u.name}</Text>
                          <Badge size="sm" color={u.is_friend ? 'teal' : 'yellow'}>{u.is_friend ? 'Friend' : 'Pending'}</Badge>
                        </div>
                      </Group>
                    </Card>
                  ))}
                </>
              )}
            </Stack>
          )}
        </Tabs.Panel>
      </Tabs>
    </Container>
  );
}

export default function FriendsPage() {
  return <RequireAuth><FriendsContent /></RequireAuth>;
}
