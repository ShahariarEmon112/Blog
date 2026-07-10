'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Group, Button, Anchor, Burger, Drawer, Stack, Divider, Badge,
} from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { IconDashboard } from '@tabler/icons-react';
import useAuth from '@/hooks/useAuth';
import ThemeToggle from './ThemeToggle';

const links = [
  { href: '/', label: 'Home' },
  { href: '/blogs', label: 'Blogs' },
  { href: '/about', label: 'About' },
  { href: '/contact', label: 'Contact' },
];

export default function Navbar() {
  const pathname = usePathname();
  const { isLoggedIn, isAdmin, logout } = useAuth();
  const [opened, { toggle, close }] = useDisclosure(false);

  const isActive = (href) => pathname === href;

  return (
    <>
      <Group h="100%" px="md" justify="space-between" style={{ flexWrap: 'nowrap' }}>
        <Anchor component={Link} href="/" fw={700} size="lg" c="cyan">
          BlogPlatform
        </Anchor>

        <Group visibleFrom="sm" gap="sm">
          {links.map((l) => (
            <Button
              key={l.href}
              component={Link}
              href={l.href}
              variant={isActive(l.href) ? 'light' : 'subtle'}
              size="sm"
            >
              {l.label}
            </Button>
          ))}
        </Group>

        <Group visibleFrom="sm" gap="sm">
          <ThemeToggle />
          {isLoggedIn ? (
            <>
              {isAdmin && (
                <Button
                  component={Link}
                  href="/admin"
                  variant="light"
                  size="sm"
                  leftSection={<IconDashboard size={16} />}
                >
                  Admin
                </Button>
              )}
              <Button component={Link} href="/my-blogs" variant="subtle" size="sm">
                My Blogs
              </Button>
              <Button variant="default" size="sm" onClick={logout}>
                Logout
              </Button>
            </>
          ) : (
            <>
              <Button component={Link} href="/login" variant="default" size="sm">
                Login
              </Button>
              <Button component={Link} href="/register" size="sm">
                Register
              </Button>
            </>
          )}
        </Group>

        <Burger opened={opened} onClick={toggle} hiddenFrom="sm" />
      </Group>

      <Drawer opened={opened} onClose={close} title="Menu" padding="md" size="xs">
        <Stack>
          {links.map((l) => (
            <Button
              key={l.href}
              component={Link}
              href={l.href}
              variant={isActive(l.href) ? 'light' : 'subtle'}
              fullWidth
              onClick={close}
            >
              {l.label}
            </Button>
          ))}
          <Divider />
          {isLoggedIn ? (
            <>
              {isAdmin && (
                <Button component={Link} href="/admin" variant="light" fullWidth onClick={close}>
                  Admin
                </Button>
              )}
              <Button component={Link} href="/my-blogs" variant="subtle" fullWidth onClick={close}>
                My Blogs
              </Button>
              <Button variant="default" fullWidth onClick={() => { logout(); close(); }}>
                Logout
              </Button>
            </>
          ) : (
            <>
              <Button component={Link} href="/login" variant="default" fullWidth onClick={close}>
                Login
              </Button>
              <Button component={Link} href="/register" fullWidth onClick={close}>
                Register
              </Button>
            </>
          )}
        </Stack>
      </Drawer>
    </>
  );
}
