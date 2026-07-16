'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ActionIcon, Indicator, Popover, Stack, Text, Button, Group, Box, Loader, Center } from '@mantine/core';
import { IconBell, IconTrash } from '@tabler/icons-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getNotifications, getUnreadCount, markRead, markAllRead, deleteNotification } from '@/api/notifications.mjs';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';

dayjs.extend(relativeTime);

export default function NotificationBell() {
  const router = useRouter();
  const [opened, setOpened] = useState(false);
  const qc = useQueryClient();

  const { data: unread } = useQuery({
    queryKey: ['notifications', 'unread-count'],
    queryFn: getUnreadCount,
    refetchInterval: 30_000,
  });

  const { data: notifications, isLoading } = useQuery({
    queryKey: ['notifications'],
    queryFn: getNotifications,
    enabled: opened,
  });

  const markReadMut = useMutation({
    mutationFn: markRead,
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['notifications'] }); },
  });

  const markAllMut = useMutation({
    mutationFn: markAllRead,
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['notifications'] }); },
  });

  const deleteMut = useMutation({
    mutationFn: deleteNotification,
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['notifications'] }); },
  });

  const handleClick = (n) => {
    if (!n.read) markReadMut.mutate(n.id);
    if (n.type === 'friend_request' || n.type === 'friend_accepted') {
      router.push('/friends');
    } else if (n.blog?.id) {
      router.push(`/blogs/${n.blog.id}`);
    }
  };

  const notifList = Array.isArray(notifications) ? notifications : [];

  return (
    <Popover opened={opened} onChange={setOpened} width={360} position="bottom-end">
      <Popover.Target>
        <Indicator inline label={unread?.unread_count || 0} size={16} disabled={!unread?.unread_count}>
          <ActionIcon variant="subtle" size="lg" onClick={() => setOpened((o) => !o)}>
            <IconBell size={20} />
          </ActionIcon>
        </Indicator>
      </Popover.Target>
      <Popover.Dropdown>
        <Group justify="space-between" mb="sm">
          <Text fw={600}>Notifications</Text>
          <Button size="compact-xs" variant="subtle" onClick={() => markAllMut.mutate()}>
            Mark all read
          </Button>
        </Group>
        {isLoading ? (
          <Center h={60}><Loader size="sm" /></Center>
        ) : notifList.length === 0 ? (
          <Text size="sm" c="dimmed">No notifications</Text>
        ) : (
          <Stack gap={4}>
            {notifList.map((n) => (
              <Box
                key={n.id}
                p="xs"
                style={(theme) => ({
                  borderRadius: 4,
                  cursor: 'pointer',
                  background: n.read ? 'transparent' : theme.colors.blue[0],
                  ':hover': { background: theme.colors.gray[0] },
                })}
                onClick={() => handleClick(n)}
              >
                <Group justify="space-between" wrap="nowrap">
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <Text size="sm" lineClamp={2}>{n.message}</Text>
                    <Text size="xs" c="dimmed">{dayjs(n.created_at).fromNow()}</Text>
                  </div>
                  <ActionIcon variant="subtle" size="sm" color="red" onClick={(e) => { e.stopPropagation(); deleteMut.mutate(n.id); }}>
                    <IconTrash size={12} />
                  </ActionIcon>
                </Group>
              </Box>
            ))}
          </Stack>
        )}
      </Popover.Dropdown>
    </Popover>
  );
}
