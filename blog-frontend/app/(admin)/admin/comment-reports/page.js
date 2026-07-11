'use client';

import { Container, Title, Table, Badge, Button, Group, Text } from '@mantine/core';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { axiosPrivate } from '@/utilities/axios';

const statusColor = { pending: 'yellow', reviewed: 'green', dismissed: 'gray' };
const reasonColor = { spam: 'red', harassment: 'orange', inappropriate: 'yellow', misinformation: 'blue', other: 'gray' };

export default function CommentReports() {
  const qc = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['admin', 'comment-reports'],
    queryFn: () => axiosPrivate.get('/admin/comment-reports').then(r => r.data),
  });

  const reports = data?.data || [];

  const statusMut = useMutation({
    mutationFn: ({ id, status }) => axiosPrivate.patch(`/admin/comment-reports/${id}/status`, { status }).then(r => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin', 'comment-reports'] });
      toast.success('Status updated');
    },
    onError: () => toast.error('Failed to update status'),
  });

  const deleteReportMut = useMutation({
    mutationFn: (id) => axiosPrivate.delete(`/admin/comment-reports/${id}`).then(r => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin', 'comment-reports'] });
      toast.success('Report deleted');
    },
  });

  const deleteCommentMut = useMutation({
    mutationFn: (id) => axiosPrivate.delete(`/admin/comment-reports/${id}/comment`).then(r => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin', 'comment-reports'] });
      toast.success('Comment deleted');
    },
  });

  return (
    <Container size="lg" py="xl">
      <Title order={2} mb="lg">Comment Reports</Title>

      <Table striped highlightOnHover>
        <Table.Thead>
          <Table.Tr>
            <Table.Th>Reported By</Table.Th>
            <Table.Th>Reason</Table.Th>
            <Table.Th>Comment</Table.Th>
            <Table.Th>Status</Table.Th>
            <Table.Th>Actions</Table.Th>
          </Table.Tr>
        </Table.Thead>
        <Table.Tbody>
          {reports.map((r) => (
            <Table.Tr key={r.id}>
              <Table.Td>{r.reporter?.name || '—'}</Table.Td>
              <Table.Td>
                <Badge color={reasonColor[r.reason]} size="sm">{r.reason}</Badge>
              </Table.Td>
              <Table.Td><Text lineClamp={1} maw={200}>{r.comment?.text || '—'}</Text></Table.Td>
              <Table.Td><Badge color={statusColor[r.status]}>{r.status}</Badge></Table.Td>
              <Table.Td>
                <Group gap="xs">
                  {r.status === 'pending' && (
                    <>
                      <Button size="xs" color="green" onClick={() => statusMut.mutate({ id: r.id, status: 'reviewed' })}>Reviewed</Button>
                      <Button size="xs" color="gray" onClick={() => statusMut.mutate({ id: r.id, status: 'dismissed' })}>Dismiss</Button>
                    </>
                  )}
                  <Button size="xs" color="red" onClick={() => { if (confirm('Delete the offending comment?')) deleteCommentMut.mutate(r.id); }}>
                    Delete Comment
                  </Button>
                  <Button size="xs" variant="light" onClick={() => deleteReportMut.mutate(r.id)}>Delete Report</Button>
                </Group>
              </Table.Td>
            </Table.Tr>
          ))}
        </Table.Tbody>
      </Table>
    </Container>
  );
}
