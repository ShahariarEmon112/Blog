'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { axiosPrivate } from '@/utilities/axios';

export function useDeleteBlog() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id) => axiosPrivate.delete(`/admin/blogs/${id}`).then(r => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin', 'blogs'] });
      qc.invalidateQueries({ queryKey: ['blogs'] });
      qc.invalidateQueries({ queryKey: ['blogs', 'featured'] });
      qc.invalidateQueries({ queryKey: ['blogs', 'popular'] });
      toast.success('Blog deleted');
    },
    onError: () => toast.error('Failed to delete blog'),
  });
}

export function useToggleFeatured() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id) => axiosPrivate.patch(`/admin/blogs/${id}/featured`).then(r => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin', 'blogs'] });
      qc.invalidateQueries({ queryKey: ['blogs', 'featured'] });
      toast.success('Featured toggled');
    },
    onError: () => toast.error('Failed to toggle featured'),
  });
}

export function useCreateBlog() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (formData) => axiosPrivate.post('/admin/blogs', formData).then(r => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin', 'blogs'] });
      qc.invalidateQueries({ queryKey: ['blogs'] });
      qc.invalidateQueries({ queryKey: ['blogs', 'featured'] });
      qc.invalidateQueries({ queryKey: ['blogs', 'popular'] });
      toast.success('Blog created');
    },
    onError: (err) => toast.error(err?.response?.data?.message || 'Failed to create blog'),
  });
}

export function useUpdateBlog() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, formData }) => axiosPrivate.post(`/admin/blogs/${id}`, formData).then(r => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin', 'blogs'] });
      qc.invalidateQueries({ queryKey: ['blogs'] });
      qc.invalidateQueries({ queryKey: ['blogs', 'featured'] });
      qc.invalidateQueries({ queryKey: ['blogs', 'popular'] });
      toast.success('Blog updated');
    },
    onError: (err) => toast.error(err?.response?.data?.message || 'Failed to update blog'),
  });
}
