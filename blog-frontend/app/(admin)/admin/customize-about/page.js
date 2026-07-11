'use client';

import { useState, useEffect } from 'react';
import { Container, Title, TextInput, Textarea, FileInput, Button, Paper, Stack, Group, ActionIcon } from '@mantine/core';
import { useQuery, useMutation } from '@tanstack/react-query';
import { toast } from 'sonner';
import { IconTrash, IconPlus } from '@tabler/icons-react';
import { getSiteSettings, updateSiteSettings } from '@/api/siteSettings.mjs';

export default function CustomizeAbout() {
  const { data: settings } = useQuery({ queryKey: ['siteSettings'], queryFn: getSiteSettings });
  const [about, setAbout] = useState({ name: '', bio: '', social_links: { linkedin: '', twitter: '', facebook: '', email: '' } });
  const [roles, setRoles] = useState([]);

  useEffect(() => {
    if (settings?.about_page) {
      setAbout({
        name: settings.about_page.name || '',
        bio: settings.about_page.bio || '',
        social_links: settings.about_page.social_links || { linkedin: '', twitter: '', facebook: '', email: '' },
      });
      setRoles(settings.about_page.roles || []);
    }
  }, [settings]);

  const addRole = () => setRoles([...roles, { title: '', organization: '' }]);
  const updateRole = (i, field, value) => {
    const copy = [...roles];
    copy[i] = { ...copy[i], [field]: value };
    setRoles(copy);
  };
  const removeRole = (i) => setRoles(roles.filter((_, idx) => idx !== i));

  const mut = useMutation({
    mutationFn: () => updateSiteSettings({ about_page: { ...about, roles } }),
    onSuccess: () => toast.success('About page updated'),
    onError: () => toast.error('Failed to update'),
  });

  return (
    <Container size="sm" py="xl">
      <Title order={2} mb="lg">Customize About</Title>
      <Paper withBorder p="lg" radius="md">
        <Stack gap="sm">
          <TextInput label="Name" value={about.name} onChange={(e) => setAbout({ ...about, name: e.target.value })} />
          <Textarea label="Bio" value={about.bio} onChange={(e) => setAbout({ ...about, bio: e.target.value })} minRows={4} />
          <FileInput label="Image" accept="image/*" />
          <Title order={5}>Roles</Title>
          {roles.map((role, i) => (
            <Group key={i} gap="xs">
              <TextInput placeholder="Title" value={role.title} onChange={(e) => updateRole(i, 'title', e.target.value)} style={{ flex: 1 }} />
              <TextInput placeholder="Organization" value={role.organization} onChange={(e) => updateRole(i, 'organization', e.target.value)} style={{ flex: 1 }} />
              <ActionIcon color="red" onClick={() => removeRole(i)}><IconTrash size={14} /></ActionIcon>
            </Group>
          ))}
          <Button variant="light" leftSection={<IconPlus size={14} />} onClick={addRole}>Add Role</Button>
          <Title order={5}>Social Links</Title>
          <TextInput label="LinkedIn" value={about.social_links.linkedin} onChange={(e) => setAbout({ ...about, social_links: { ...about.social_links, linkedin: e.target.value } })} />
          <TextInput label="Twitter" value={about.social_links.twitter} onChange={(e) => setAbout({ ...about, social_links: { ...about.social_links, twitter: e.target.value } })} />
          <TextInput label="Facebook" value={about.social_links.facebook} onChange={(e) => setAbout({ ...about, social_links: { ...about.social_links, facebook: e.target.value } })} />
          <TextInput label="Email" value={about.social_links.email} onChange={(e) => setAbout({ ...about, social_links: { ...about.social_links, email: e.target.value } })} />
          <Button onClick={() => mut.mutate()} loading={mut.isPending}>Save</Button>
        </Stack>
      </Paper>
    </Container>
  );
}
