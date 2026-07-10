'use client';

import { useState } from 'react';
import { Container, Title, TextInput, FileInput, Button, Group, Paper, Loader, Center, Avatar } from '@mantine/core';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { updateProfile } from '@/api/users.mjs';
import useAuth from '@/hooks/useAuth';
import compressImage from '@/utils/compressImage';
import RequireAuth from '@/components/RequireAuth';

function ProfileContent() {
  const { user, refetch } = useAuth();
  const qc = useQueryClient();
  const [name, setName] = useState(user?.name || '');
  const [avatarFile, setAvatarFile] = useState(null);

  const mut = useMutation({
    mutationFn: async () => {
      const fd = new FormData();
      fd.append('name', name);
      fd.append('_method', 'PATCH');
      if (avatarFile) {
        const compressed = await compressImage(avatarFile);
        fd.append('avatar', compressed);
      }
      return updateProfile(fd);
    },
    onSuccess: () => {
      refetch();
      qc.invalidateQueries({ queryKey: ['authUser'] });
      toast.success('Profile updated');
    },
    onError: () => toast.error('Failed to update profile'),
  });

  return (
    <Container size="sm" py="xl">
      <Title order={2} mb="lg">Edit Profile</Title>
      <Paper withBorder p="lg" radius="md">
        <Group mb="md">
          <Avatar src={user?.avatar ? `http://localhost:8000/storage/${user.avatar}` : null} size={80} radius="xl" />
        </Group>
        <TextInput label="Name" value={name} onChange={(e) => setName(e.target.value)} mb="sm" />
        <FileInput label="Avatar" accept="image/*" value={avatarFile} onChange={setAvatarFile} mb="lg" />
        <Button onClick={() => mut.mutate()} loading={mut.isPending}>Save</Button>
      </Paper>
    </Container>
  );
}

export default function ProfilePage() {
  return (
    <RequireAuth>
      <ProfileContent />
    </RequireAuth>
  );
}
