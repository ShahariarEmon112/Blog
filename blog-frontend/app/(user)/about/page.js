'use client';

import { Container, Title, Text, Image, Stack, Group, Anchor, Paper } from '@mantine/core';
import { useQuery } from '@tanstack/react-query';
import { getSiteSettings } from '@/api/siteSettings.mjs';

export default function AboutPage() {
  const { data: settings } = useQuery({ queryKey: ['siteSettings'], queryFn: getSiteSettings });
  const about = settings?.about_page || {};

  return (
    <Container size="md" py="xl">
      <Title order={1} mb="lg">About</Title>
      {about.name && <Title order={2} mb="sm">{about.name}</Title>}
      {about.bio && <Text mb="md">{about.bio}</Text>}

      {about.roles?.length > 0 && (
        <Stack gap="sm" mb="lg">
          <Title order={3}>Roles</Title>
          {about.roles.map((role, i) => (
            <Paper key={i} withBorder p="sm" radius="md">
              <Text fw={500}>{role.title}</Text>
              <Text size="sm" c="dimmed">{role.organization}</Text>
            </Paper>
          ))}
        </Stack>
      )}

      {about.social_links && (
        <Group gap="sm">
          {about.social_links.linkedin && <Anchor href={about.social_links.linkedin} target="_blank">LinkedIn</Anchor>}
          {about.social_links.twitter && <Anchor href={about.social_links.twitter} target="_blank">Twitter</Anchor>}
          {about.social_links.facebook && <Anchor href={about.social_links.facebook} target="_blank">Facebook</Anchor>}
          {about.social_links.email && <Anchor href={`mailto:${about.social_links.email}`}>Email</Anchor>}
        </Group>
      )}
    </Container>
  );
}
