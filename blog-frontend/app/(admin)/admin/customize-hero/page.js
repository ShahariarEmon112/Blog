'use client';

import { useState, useEffect } from 'react';
import { Container, Title, TextInput, FileInput, Button, Paper, Stack } from '@mantine/core';
import { useQuery, useMutation } from '@tanstack/react-query';
import { toast } from 'sonner';
import { getSiteSettings, updateSiteSettings } from '@/api/siteSettings.mjs';

export default function CustomizeHero() {
  const { data: settings } = useQuery({ queryKey: ['siteSettings'], queryFn: getSiteSettings });
  const [siteTitle, setSiteTitle] = useState('');
  const [heroTitle, setHeroTitle] = useState('');
  const [heroSubtitle, setHeroSubtitle] = useState('');
  const [logoFile, setLogoFile] = useState(null);

  useEffect(() => {
    if (settings) {
      setSiteTitle(settings.site_title || '');
      setHeroTitle(settings.hero_title || '');
      setHeroSubtitle(settings.hero_subtitle || '');
    }
  }, [settings]);

  const mut = useMutation({
    mutationFn: () => updateSiteSettings({ site_title: siteTitle, hero_title: heroTitle, hero_subtitle: heroSubtitle }),
    onSuccess: () => toast.success('Hero settings updated'),
    onError: () => toast.error('Failed to update'),
  });

  return (
    <Container size="sm" py="xl">
      <Title order={2} mb="lg">Customize Hero</Title>
      <Paper withBorder p="lg" radius="md">
        <Stack gap="sm">
          <TextInput label="Site Title" value={siteTitle} onChange={(e) => setSiteTitle(e.target.value)} />
          <TextInput label="Hero Title" value={heroTitle} onChange={(e) => setHeroTitle(e.target.value)} />
          <TextInput label="Hero Subtitle" value={heroSubtitle} onChange={(e) => setHeroSubtitle(e.target.value)} />
          <FileInput label="Site Logo" accept="image/*" value={logoFile} onChange={setLogoFile} />
          <Button onClick={() => mut.mutate()} loading={mut.isPending}>Save</Button>
        </Stack>
      </Paper>
    </Container>
  );
}
