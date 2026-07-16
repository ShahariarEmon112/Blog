'use client';

import { useState, useEffect } from 'react';
import { Container, Title, TextInput, NumberInput, FileInput, Button, Group, Paper, Stack, Loader, Center, Avatar, Text, Divider } from '@mantine/core';
import { useMutation } from '@tanstack/react-query';
import { toast } from 'sonner';
import { updateProfile } from '@/api/users.mjs';
import useAuth from '@/hooks/useAuth';
import compressImage from '@/utils/compressImage';
import RequireAuth from '@/components/RequireAuth';
import { getAvatarUrl } from '@/utils/avatar';

function ProfileContent() {
  const { user, refetch } = useAuth();
  const [name, setName] = useState('');
  const [age, setAge] = useState(null);
  const [gmail, setGmail] = useState('');
  const [educationStatus, setEducationStatus] = useState('');
  const [avatarFile, setAvatarFile] = useState(null);

  useEffect(() => {
    if (user) {
      setName(user.name || '');
      setAge(user.age || null);
      setGmail(user.gmail || '');
      setEducationStatus(user.education_status || '');
    }
  }, [user]);

  const mut = useMutation({
    mutationFn: async () => {
      const fd = new FormData();
      fd.append('name', name);
      fd.append('age', String(age || ''));
      fd.append('gmail', gmail);
      fd.append('education_status', educationStatus);
      fd.append('_method', 'PATCH');
      if (avatarFile) {
        const compressed = await compressImage(avatarFile);
        fd.append('avatar', compressed);
      }
      return updateProfile(fd);
    },
    onSuccess: () => {
      refetch();
      toast.success('Profile updated');
    },
    onError: () => toast.error('Failed to update profile'),
  });

  if (!user) return <Center py="xl"><Loader /></Center>;

  return (
    <Container size="sm" py="xl">
      <Title order={2} mb="lg">My Profile</Title>

      <Paper withBorder p="lg" radius="md" mb="lg">
        <Group gap="xl">
          <Avatar src={getAvatarUrl(user?.avatar)} size={100} radius="xl" />
          <div>
            <Text size="xl" fw={700}>{user.name}</Text>
            <Text size="sm" c="dimmed">{user.email}</Text>
            {user.age && <Text size="sm">Age: {user.age}</Text>}
            {user.gmail && <Text size="sm">Gmail: {user.gmail}</Text>}
            {user.education_status && <Text size="sm">Education: {user.education_status}</Text>}
          </div>
        </Group>
      </Paper>

      <Title order={3} mb="md">Edit Profile</Title>
      <Paper withBorder p="lg" radius="md">
        <Stack gap="sm">
          <TextInput label="Name" value={name} onChange={(e) => setName(e.target.value)} required />
          <NumberInput label="Age" value={age} onChange={setAge} min={1} max={150} />
          <TextInput label="Gmail" value={gmail} onChange={(e) => setGmail(e.target.value)} />
          <TextInput label="Education Status" value={educationStatus} onChange={(e) => setEducationStatus(e.target.value)} placeholder="e.g. Undergraduate, Graduate, etc." />
          <FileInput label="Avatar" accept="image/*" value={avatarFile} onChange={setAvatarFile} />
          <Button onClick={() => mut.mutate()} loading={mut.isPending}>Save</Button>
        </Stack>
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
