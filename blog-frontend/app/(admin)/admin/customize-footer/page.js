'use client';

import { useState, useEffect } from 'react';
import { Container, Title, TextInput, Textarea, Button, Paper, Stack } from '@mantine/core';
import { useQuery, useMutation } from '@tanstack/react-query';
import { toast } from 'sonner';
import { getSiteSettings, updateSiteSettings } from '@/api/siteSettings.mjs';

export default function CustomizeFooter() {
  const { data: settings } = useQuery({ queryKey: ['siteSettings'], queryFn: getSiteSettings });
  const [footerText, setFooterText] = useState('');
  const [social, setSocial] = useState({ twitter: '', linkedin: '', instagram: '' });

  useEffect(() => {
    if (settings) {
      setFooterText(settings.footer_text || '');
      setSocial(settings.social_links || { twitter: '', linkedin: '', instagram: '' });
    }
  }, [settings]);

  const mut = useMutation({
    mutationFn: () => updateSiteSettings({ footer_text: footerText, social_links: social }),
    onSuccess: () => toast.success('Footer updated'),
    onError: () => toast.error('Failed to update'),
  });

  return (
    <Container size="sm" py="xl">
      <Title order={2} mb="lg">Customize Footer</Title>
      <Paper withBorder p="lg" radius="md">
        <Stack gap="sm">
          <Textarea label="Footer Text" value={footerText} onChange={(e) => setFooterText(e.target.value)} minRows={3} />
          <TextInput label="Twitter URL" value={social.twitter} onChange={(e) => setSocial({ ...social, twitter: e.target.value })} />
          <TextInput label="LinkedIn URL" value={social.linkedin} onChange={(e) => setSocial({ ...social, linkedin: e.target.value })} />
          <TextInput label="Instagram URL" value={social.instagram} onChange={(e) => setSocial({ ...social, instagram: e.target.value })} />
          <Button onClick={() => mut.mutate()} loading={mut.isPending}>Save</Button>
        </Stack>
      </Paper>
    </Container>
  );
}
