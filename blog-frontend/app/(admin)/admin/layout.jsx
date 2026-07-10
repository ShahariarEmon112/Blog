'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { AppShell, Group, Text, NavLink, Badge, Loader, Center } from '@mantine/core';
import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import {
  IconFileText, IconPlus, IconUsers, IconUserCheck, IconCategory,
  IconSend, IconFlag, IconMail, IconNews, IconSettings, IconHome,
  IconLogout,
} from '@tabler/icons-react';
import useAuth from '@/hooks/useAuth';
import { getPendingUsers } from '@/api/admin.mjs';

function AdminGuard({ children }) {
  const { token, isAdmin, isLoading, user, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!isLoading && (!token || !isAdmin)) {
      router.replace('/login');
    }
  }, [token, isAdmin, isLoading, router]);

  if (isLoading)
    return <Center h="100vh"><Loader size="lg" /></Center>;
  if (!token || !isAdmin) return null;

  const { data: pendingData } = useQuery({
    queryKey: ['admin', 'pendingCount'],
    queryFn: getPendingUsers,
    refetchInterval: 30_000,
  });

  const pendingCount = pendingData?.data?.length || pendingData?.length || 0;

  const links = [
    { href: '/admin', icon: IconHome, label: 'Dashboard' },
    { href: '/admin/all-blogs', icon: IconFileText, label: 'All Blogs' },
    { href: '/admin/create-blog', icon: IconPlus, label: 'Create Blog' },
    {
      href: '/admin/pending-users',
      icon: IconUserCheck,
      label: 'Pending Users',
      badge: pendingCount > 0 ? pendingCount : null,
    },
    { href: '/admin/manage-users', icon: IconUsers, label: 'Manage Users' },
    { href: '/admin/manage-categories', icon: IconCategory, label: 'Manage Categories' },
    { href: '/admin/blog-requests', icon: IconSend, label: 'Blog Requests' },
    { href: '/admin/comment-reports', icon: IconFlag, label: 'Comment Reports' },
    { href: '/admin/contact-messages', icon: IconMail, label: 'Contact Messages' },
    { href: '/admin/newsletter', icon: IconNews, label: 'Newsletter' },
    { href: '/admin/customize-hero', icon: IconSettings, label: 'Customize Hero' },
    { href: '/admin/customize-about', icon: IconSettings, label: 'Customize About' },
    { href: '/admin/customize-contact', icon: IconSettings, label: 'Customize Contact' },
    { href: '/admin/customize-footer', icon: IconSettings, label: 'Customize Footer' },
  ];

  return (
    <AppShell
      navbar={{ width: 250, breakpoint: 'sm' }}
      padding="md"
    >
      <AppShell.Navbar p="xs">
        <Group p="xs" mb="sm">
          <Text fw={700} size="lg">BlogAdmin</Text>
        </Group>
        {links.map((l) => (
          <NavLink
            key={l.href}
            component={Link}
            href={l.href}
            label={
              l.badge ? (
                <Group justify="space-between" style={{ flex: 1 }}>
                  <Text size="sm">{l.label}</Text>
                  <Badge color="red" size="sm">{l.badge}</Badge>
                </Group>
              ) : (
                <Text size="sm">{l.label}</Text>
              )
            }
            leftSection={<l.icon size={18} />}
            active={pathname === l.href}
            variant="light"
            mb={4}
            styles={{ root: { borderRadius: 6 } }}
          />
        ))}
        <NavLink
          component={Link}
          href="/"
          label={<Text size="sm">Back to Site</Text>}
          leftSection={<IconHome size={18} />}
          mb={4}
          styles={{ root: { borderRadius: 6 } }}
        />
        <NavLink
          label={<Text size="sm" c="red">Logout</Text>}
          leftSection={<IconLogout size={18} />}
          onClick={logout}
          styles={{ root: { borderRadius: 6 } }}
        />
      </AppShell.Navbar>
      <AppShell.Main>
        {children}
      </AppShell.Main>
    </AppShell>
  );
}

export default function AdminLayout({ children }) {
  return <AdminGuard>{children}</AdminGuard>;
}
