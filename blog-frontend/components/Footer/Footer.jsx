'use client';

import { Container, Group, Text, Anchor } from '@mantine/core';
import { useQuery } from '@tanstack/react-query';
import { getSiteSettings } from '@/api/siteSettings.mjs';

export default function Footer() {
  const { data: settings } = useQuery({
    queryKey: ['siteSettings'],
    queryFn: getSiteSettings,
    staleTime: 10 * 60 * 1000,
  });

  const social = settings?.social_links || {};

  return (
    <footer style={{ marginTop: 'auto', borderTop: '1px solid var(--mantine-color-gray-3)', padding: '20px 0' }}>
      <Container>
        <Group justify="space-between">
          <Text size="sm" c="dimmed">
            {settings?.footer_text || 'Built for young writers.'}
          </Text>
          <Group gap="xs">
            {social.twitter && <Anchor href={social.twitter} target="_blank" size="sm">Twitter</Anchor>}
            {social.linkedin && <Anchor href={social.linkedin} target="_blank" size="sm">LinkedIn</Anchor>}
            {social.instagram && <Anchor href={social.instagram} target="_blank" size="sm">Instagram</Anchor>}
            {social.github && <Anchor href={social.github} target="_blank" size="sm">GitHub</Anchor>}
          </Group>
        </Group>
      </Container>
    </footer>
  );
}
