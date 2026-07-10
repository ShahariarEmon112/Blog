'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { addComment, updateComment, deleteComment, reportComment } from '@/api/comments.mjs';

export function useAddComment(blogId) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data) => addComment(blogId, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['blog', blogId] });
      toast.success('Comment added');
    },
    onError: () => toast.error('Failed to add comment'),
  });
}

export function useUpdateComment(blogId) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, text }) => updateComment(id, { text }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['blog', blogId] });
      toast.success('Comment updated');
    },
    onError: () => toast.error('Failed to update comment'),
  });
}

export function useDeleteComment(blogId) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id) => deleteComment(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['blog', blogId] });
      toast.success('Comment deleted');
    },
    onError: () => toast.error('Failed to delete comment'),
  });
}

export function useReportComment() {
  return useMutation({
    mutationFn: (data) => reportComment(data),
    onSuccess: () => toast.success('Comment reported'),
    onError: (err) => toast.error(err?.response?.data?.message || 'Failed to report'),
  });
}
