'use client';

import { useEffect, useState } from 'react';
import { ActionIcon, useMantineColorScheme } from '@mantine/core';
import { IconSun, IconMoon } from '@tabler/icons-react';

export default function ThemeToggle() {
  const { colorScheme, toggleColorScheme } = useMantineColorScheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  if (!mounted)
    return <ActionIcon variant="default" size="lg" aria-label="Toggle color scheme"><IconSun size={18} /></ActionIcon>;

  return (
    <ActionIcon variant="default" onClick={toggleColorScheme} size="lg" aria-label="Toggle color scheme">
      {colorScheme === 'dark' ? <IconSun size={18} /> : <IconMoon size={18} />}
    </ActionIcon>
  );
}
