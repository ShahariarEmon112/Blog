'use client';

import { Container, Title, Card, Text, Badge, Group, Stack, Center, Loader } from '@mantine/core';
import { useQuery } from '@tanstack/react-query';
import { getMyRequests } from '@/api/blogRequests.mjs';
import RequireAuth from '@/components/RequireAuth';

const statusColor = { pending: 'yellow', approved: 'green', rejected: 'red' };

function MyRequestsContent() {
  const { data, isLoading } = useQuery({
    queryKey: ['blog-requests', 'mine'],
    queryFn: getMyRequests,
  });

  const requests = data?.data || [];

  if (isLoading) return <Center h={400}><Loader /></Center>;

  return (
    <Container size="md" py="xl">
      <Title order={2} mb="lg">My Blog Requests</Title>
      {requests.length === 0 ? (
        <Text c="dimmed">No requests yet.</Text>
      ) : (
        <Stack gap="sm">
          {requests.map((req) => (
            <Card key={req.id} withBorder padding="md" radius="md">
              <Group justify="space-between">
                <div>
                  <Text fw={500}>{req.title}</Text>
                  <Text size="sm" c="dimmed">{req.category?.name || 'Uncategorized'}</Text>
                </div>
                <Badge color={statusColor[req.status]}>{req.status}</Badge>
              </Group>
              {req.rejection_note && (
                <Text size="sm" c="red" mt="xs">Reason: {req.rejection_note}</Text>
              )}
            </Card>
          ))}
        </Stack>
      )}
    </Container>
  );
}

export default function MyRequestsPage() {
  return (
    <RequireAuth>
      <MyRequestsContent />
    </RequireAuth>
  );
}
