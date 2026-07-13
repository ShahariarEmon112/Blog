'use client';

import { Container, Title, Text, Stack, Group, Anchor, Paper, List, ThemeIcon } from '@mantine/core';
import { IconCheck, IconEdit, IconEye, IconUserCheck } from '@tabler/icons-react';
import { useQuery } from '@tanstack/react-query';
import { getSiteSettings } from '@/api/siteSettings.mjs';

export default function AboutPage() {
  const { data: settings } = useQuery({ queryKey: ['siteSettings'], queryFn: getSiteSettings });
  const about = settings?.about_page || {};

  return (
    <Container size="md" py="xl">
      <Title order={1} mb="lg">About ClassRoom Writes</Title>

      <Paper withBorder p="lg" radius="md" mb="lg">
        <Text mb="md">
          ClassRoom Writes is a blog platform designed for students, educators, and young writers to share
          their thoughts, ideas, and creative writing. Whether you are looking to express yourself, build a
          portfolio, or simply explore what others are writing about, ClassRoom Writes provides a safe and
          supportive space for your voice to be heard.
        </Text>
        <Text>
          From personal stories and academic articles to poetry and opinion pieces — every writer has a place
          here. The platform is moderated to ensure a respectful and productive community for all.
        </Text>
      </Paper>

      <Title order={2} mb="md">How It Works</Title>

      <Stack gap="md" mb="xl">
        <Paper withBorder p="md" radius="md">
          <Group gap="sm" mb="xs">
            <ThemeIcon color="cyan" size="lg" radius="xl">
              <IconUserCheck size={18} />
            </ThemeIcon>
            <Text fw={600} size="lg">1. Create an Account</Text>
          </Group>
          <Text c="dimmed" ml={50}>
            Sign up with your name and email. New accounts are reviewed by an admin to keep the
            community safe and spam-free.
          </Text>
        </Paper>

        <Paper withBorder p="md" radius="md">
          <Group gap="sm" mb="xs">
            <ThemeIcon color="cyan" size="lg" radius="xl">
              <IconEdit size={18} />
            </ThemeIcon>
            <Text fw={600} size="lg">2. Write or Request a Blog</Text>
          </Group>
          <Text c="dimmed" ml={50}>
            Once approved, you can write your own blog posts directly. If you are unsure about
            publishing, you can submit a blog request for admin review before it goes live.
          </Text>
        </Paper>

        <Paper withBorder p="md" radius="md">
          <Group gap="sm" mb="xs">
            <ThemeIcon color="cyan" size="lg" radius="xl">
              <IconEye size={18} />
            </ThemeIcon>
            <Text fw={600} size="lg">3. Engage with the Community</Text>
          </Group>
          <Text c="dimmed" ml={50}>
            Like, comment on, and favorite blogs that interest you. Your interactions help great
            content get discovered by more readers.
          </Text>
        </Paper>
      </Stack>

      <Title order={2} mb="sm">MD. Shahariar Emon Saikat</Title>
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
