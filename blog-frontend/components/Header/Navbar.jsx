'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Group, Button, Anchor, Burger, Drawer, Stack, Divider, Menu, Avatar, Text,
} from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { IconDashboard, IconUser, IconBookmark, IconFileText, IconSend, IconBell } from '@tabler/icons-react';
import useAuth from '@/hooks/useAuth';
import ThemeToggle from './ThemeToggle';
import NotificationBell from '@/components/NotificationBell/NotificationBell';

const links = [
  { href: '/', label: 'Home' },
  { href: '/blogs', label: 'Blogs' },
  { href: '/about', label: 'About' },
  { href: '/contact', label: 'Contact' },
];

const STORAGE_URL = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api').replace(/\/api$/, '/storage');

export default function Navbar() {
  const pathname = usePathname();
  const { user, isLoggedIn, isAdmin, logout } = useAuth();
  const [opened, { toggle, close }] = useDisclosure(false);

  const isActive = (href) => pathname === href;

  return (
    <>
      <Group h="100%" px="md" justify="space-between" style={{ flexWrap: 'nowrap' }}>
        <Anchor component={Link} href="/" fw={700} size="lg" c="cyan">
          ClassRoom Writes
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
              <NotificationBell />
              <Menu>
                <Menu.Target>
                  <Button variant="subtle" size="sm" leftSection={<Avatar src={user?.avatar ? `${STORAGE_URL}/${user.avatar}` : null} size={22} radius="xl" />}>
                    {user?.name || 'Account'}
                  </Button>
                </Menu.Target>
                <Menu.Dropdown>
                  <Menu.Item component={Link} href="/profile" leftSection={<IconUser size={14} />}>Profile</Menu.Item>
                  <Menu.Item component={Link} href="/my-blogs" leftSection={<IconFileText size={14} />}>My Blogs</Menu.Item>
                  <Menu.Item component={Link} href="/my-requests" leftSection={<IconSend size={14} />}>My Requests</Menu.Item>
                  <Menu.Item component={Link} href="/request-blog" leftSection={<IconFileText size={14} />}>Request Blog</Menu.Item>
                  <Menu.Item component={Link} href="/favourites" leftSection={<IconBookmark size={14} />}>Favorites</Menu.Item>
                  <Menu.Divider />
                  <Menu.Item color="red" onClick={logout}>Logout</Menu.Item>
                </Menu.Dropdown>
              </Menu>
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
              <Button component={Link} href="/profile" variant="subtle" fullWidth onClick={close}>Profile</Button>
              <Button component={Link} href="/my-blogs" variant="subtle" fullWidth onClick={close}>My Blogs</Button>
              <Button component={Link} href="/my-requests" variant="subtle" fullWidth onClick={close}>My Requests</Button>
              <Button component={Link} href="/request-blog" variant="subtle" fullWidth onClick={close}>Request Blog</Button>
              <Button component={Link} href="/favourites" variant="subtle" fullWidth onClick={close}>Favorites</Button>
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
