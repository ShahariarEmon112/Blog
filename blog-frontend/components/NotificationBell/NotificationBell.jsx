'use client';

import { useState } from 'react';
import { ActionIcon, Indicator, Popover, Stack, Text, Button, Group, Box, Loader, Center } from '@mantine/core';
import { IconBell } from '@tabler/icons-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getNotifications, getUnreadCount, markRead, markAllRead, deleteNotification } from '@/api/notifications.mjs';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';

dayjs.extend(relativeTime);

export default function NotificationBell() {
  const [opened, setOpened] = useState(false);
  const qc = useQueryClient();

  const { data: unread } = useQuery({
    queryKey: ['notifications', 'unread-count'],
    queryFn: getUnreadCount,
    refetchInterval: 30_000,
  });

  const { data: notifsData, isLoading } = useQuery({
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

  const notifications = notifsData?.data || notifsData || [];

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
        ) : notifications.length === 0 ? (
          <Text size="sm" c="dimmed">No notifications</Text>
        ) : (
          <Stack gap={4}>
            {notifications.map((n) => (
              <Box
                key={n.id}
                p="xs"
                style={(theme) => ({
                  borderRadius: 4,
                  cursor: 'pointer',
                  background: n.read ? 'transparent' : theme.colors.blue[0],
                  ':hover': { background: theme.colors.gray[0] },
                })}
                onClick={() => { if (!n.read) markReadMut.mutate(n.id); }}
              >
                <Group justify="space-between">
                  <div style={{ flex: 1 }}>
                    <Text size="sm">{n.message}</Text>
                    <Text size="xs" c="dimmed">{dayjs(n.created_at).fromNow()}</Text>
                  </div>
                  <ActionIcon variant="subtle" size="sm" color="red" onClick={(e) => { e.stopPropagation(); deleteMut.mutate(n.id); }}>
                    <IconBell size={12} />
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
