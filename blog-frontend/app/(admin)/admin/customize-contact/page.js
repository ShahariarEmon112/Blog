'use client';

import { useState, useEffect } from 'react';
import { Container, Title, TextInput, Textarea, Button, Paper, Stack } from '@mantine/core';
import { useQuery, useMutation } from '@tanstack/react-query';
import { toast } from 'sonner';
import { getSiteSettings, updateSiteSettings } from '@/api/siteSettings.mjs';

export default function CustomizeContact() {
  const { data: settings } = useQuery({ queryKey: ['siteSettings'], queryFn: getSiteSettings });
  const [contact, setContact] = useState({
    heading: '', description: '',
    phone1: '', phone2: '',
    email1: '', email2: '',
    address1: '', address2: '',
    map_embed_url: '',
    form_heading: '', form_description: '',
  });

  useEffect(() => {
    if (settings?.contact_page) {
      setContact(prev => ({ ...prev, ...settings.contact_page }));
    }
  }, [settings]);

  const mut = useMutation({
    mutationFn: () => updateSiteSettings({ contact_page: contact }),
    onSuccess: () => toast.success('Contact page updated'),
    onError: () => toast.error('Failed to update'),
  });

  return (
    <Container size="sm" py="xl">
      <Title order={2} mb="lg">Customize Contact</Title>
      <Paper withBorder p="lg" radius="md">
        <Stack gap="sm">
          <TextInput label="Heading" value={contact.heading} onChange={(e) => setContact({ ...contact, heading: e.target.value })} />
          <Textarea label="Description" value={contact.description} onChange={(e) => setContact({ ...contact, description: e.target.value })} minRows={3} />
          <TextInput label="Phone 1" value={contact.phone1} onChange={(e) => setContact({ ...contact, phone1: e.target.value })} />
          <TextInput label="Phone 2" value={contact.phone2} onChange={(e) => setContact({ ...contact, phone2: e.target.value })} />
          <TextInput label="Email 1" value={contact.email1} onChange={(e) => setContact({ ...contact, email1: e.target.value })} />
          <TextInput label="Email 2" value={contact.email2} onChange={(e) => setContact({ ...contact, email2: e.target.value })} />
          <Textarea label="Address 1" value={contact.address1} onChange={(e) => setContact({ ...contact, address1: e.target.value })} />
          <Textarea label="Address 2" value={contact.address2} onChange={(e) => setContact({ ...contact, address2: e.target.value })} />
          <TextInput label="Map Embed URL" value={contact.map_embed_url} onChange={(e) => setContact({ ...contact, map_embed_url: e.target.value })} />
          <TextInput label="Form Heading" value={contact.form_heading} onChange={(e) => setContact({ ...contact, form_heading: e.target.value })} />
          <Textarea label="Form Description" value={contact.form_description} onChange={(e) => setContact({ ...contact, form_description: e.target.value })} minRows={2} />
          <Button onClick={() => mut.mutate()} loading={mut.isPending}>Save</Button>
        </Stack>
      </Paper>
    </Container>
  );
}
