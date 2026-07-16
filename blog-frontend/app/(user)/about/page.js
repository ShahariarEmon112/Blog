'use client';

import { Container, Title, Text, Stack, Group, Anchor, Paper, ThemeIcon } from '@mantine/core';
import { IconCheck, IconEdit, IconEye, IconUserCheck, IconUsers, IconMessage, IconHeart, IconBookmark } from '@tabler/icons-react';
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
          I built ClassRoom Writes because most blogging platforms either feel too formal or too chaotic.
          There wasn&apos;t a middle ground — a place where students could write freely without worrying
          about algorithms or ads, but still have their work seen by actual readers.
        </Text>
        <Text mb="md">
          This is that middle ground. You can write about anything — your semester project, a book that
          changed how you think, a rough poem you scribbled at 2 AM, or just an opinion you need to get
          off your chest. The idea is simple: if you have something to say, there&apos;s room for it here.
        </Text>
        <Text>
          Everything on the platform is reviewed before it goes live. Not to filter out voices — but to
          make sure the people reading actually get something worthwhile. No bots, no spam, no copy-paste
          articles. Just real people writing real things.
        </Text>
      </Paper>

      <Title order={2} mb="md">How It Works</Title>

      <Stack gap="md" mb="xl">
        <Paper withBorder p="md" radius="md">
          <Group gap="sm" mb="xs">
            <ThemeIcon color="cyan" size="lg" radius="xl">
              <IconUserCheck size={18} />
            </ThemeIcon>
            <Text fw={600} size="lg">1. Get Added</Text>
          </Group>
          <Text c="dimmed" ml={50}>
            You sign up, and an admin approves your account. This is just to keep things clean —
            no random bots posting garbage. Once you&apos;re in, you&apos;re in.
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
            You can publish directly or send a draft for review if you want a second pair of eyes
            before it goes live. Either way, your name goes on it.
          </Text>
        </Paper>

        <Paper withBorder p="md" radius="md">
          <Group gap="sm" mb="xs">
            <ThemeIcon color="cyan" size="lg" radius="xl">
              <IconEye size={18} />
            </ThemeIcon>
            <Text fw={600} size="lg">3. Read, React, Connect</Text>
          </Group>
          <Text c="dimmed" ml={50}>
            Drop a like, leave a comment (or stay anonymous if you&apos;d rather not attach your name),
            save posts to your favorites — whatever feels natural. You can also add other writers as
            friends and see when they publish something new.
          </Text>
        </Paper>
      </Stack>

      <Title order={2} mb="md">What You Can Do Here</Title>

      <Stack gap="md" mb="xl">
        <Paper withBorder p="md" radius="md">
          <Group gap="sm" mb="xs">
            <ThemeIcon color="cyan" size="lg" radius="xl">
              <IconUsers size={18} />
            </ThemeIcon>
            <Text fw={600} size="lg">Make Friends</Text>
          </Group>
          <Text c="dimmed" ml={50}>
            Add people whose writing you like. When they post something new, you&apos;ll get a
            notification. It turns a solo writing activity into something a bit more social.
          </Text>
        </Paper>

        <Paper withBorder p="md" radius="md">
          <Group gap="sm" mb="xs">
            <ThemeIcon color="cyan" size="lg" radius="xl">
              <IconMessage size={18} />
            </ThemeIcon>
            <Text fw={600} size="lg">Comment Anonymously</Text>
          </Group>
          <Text c="dimmed" ml={50}>
            Sometimes you want to say something without putting your name on it. Tick the anonymous
            box and your comment shows up without a name. No judgment, no traceback.
          </Text>
        </Paper>

        <Paper withBorder p="md" radius="md">
          <Group gap="sm" mb="xs">
            <ThemeIcon color="cyan" size="lg" radius="xl">
              <IconHeart size={18} />
            </ThemeIcon>
            <Text fw={600} size="lg">Like &amp; Favorite</Text>
          </Group>
          <Text c="dimmed" ml={50}>
            Found something good? Hit like. Want to come back to it later? Add it to your favorites.
            Simple stuff, but it helps the good writing float to the top.
          </Text>
        </Paper>

        <Paper withBorder p="md" radius="md">
          <Group gap="sm" mb="xs">
            <ThemeIcon color="cyan" size="lg" radius="xl">
              <IconBookmark size={18} />
            </ThemeIcon>
            <Text fw={600} size="lg">Build a Profile</Text>
          </Group>
          <Text c="dimmed" ml={50}>
            Add your name, what you&apos;re studying, your age — whatever you&apos;re comfortable
            sharing. It&apos;s not a resume, just a way for people to know who&apos;s behind the words.
          </Text>
        </Paper>
      </Stack>

      <Paper
        p="xl"
        radius="md"
        mb="lg"
        style={{ background: '#1a237e', color: '#fff' }}
      >
        <Group justify="space-between" align="center" mb="md">
          <Title order={2} style={{ color: '#fff', margin: 0 }}>MD. Shahariar Emon Saikat</Title>
          <Text size="sm" style={{ color: '#90caf9', fontStyle: 'italic' }}>Founder of ClassRoom Writes</Text>
        </Group>
        <Text mb="sm" style={{ color: '#e8eaf6', lineHeight: 1.8 }}>
          I am passionate about creating a platform where young writers can express themselves freely
          and build their writing skills. This idea came from my own wish to connect people, share
          our thoughts together, and learn from each other to grow together.
        </Text>
      </Paper>

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
