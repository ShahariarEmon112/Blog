'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  TextInput, PasswordInput, Button, Paper, Title, Text, Container, Alert, Anchor,
} from '@mantine/core';
import { useForm } from '@mantine/form';
import { IconAlertCircle } from '@tabler/icons-react';
import { useSessionStorage } from '@mantine/hooks';
import { loginUser } from '@/api/auth.mjs';

export default function LoginPage() {
  const router = useRouter();
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [, setToken] = useSessionStorage({ key: 'token', defaultValue: null });
  const [, setIsLoggedIn] = useSessionStorage({ key: 'isLoggedIn', defaultValue: false });

  const form = useForm({
    initialValues: { login: '', password: '' },
    validate: {
      login: (v) => (v.trim().length > 0 ? null : 'Email or User ID is required'),
      password: (v) => (v.length >= 1 ? null : 'Password is required'),
    },
  });

  const handleSubmit = async (values) => {
    setLoading(true);
    setError(null);
    // clear any stale cached data from the previous session
    window.dispatchEvent(new Event('clear-query-cache'));
    try {
      const res = await loginUser(values);
      setToken(res.token);
      setIsLoggedIn(true);
      router.push(res.user?.is_super_user ? '/admin' : '/');
    } catch (err) {
      const message = err?.response?.data?.message
        || (err?.request ? 'Unable to reach server' : 'Invalid email or password');
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container size={420} my={40}>
      <Title ta="center" mb="md">Welcome back</Title>
      <Text c="dimmed" size="sm" ta="center" mb="lg">
        Don&apos;t have an account?{' '}
        <Anchor component={Link} href="/register">Create account</Anchor>
      </Text>

      <Paper withBorder shadow="md" p="xl" radius="md">
        {error && (
          <Alert icon={<IconAlertCircle size={16} />} color="red" mb="md">
            {error}
          </Alert>
        )}

        <form onSubmit={form.onSubmit(handleSubmit)}>
          <TextInput
            label="Email or User ID"
            placeholder="you@example.com or 1"
            required
            {...form.getInputProps('login')}
          />
          <PasswordInput
            label="Password"
            placeholder="Your password"
            required
            mt="md"
            {...form.getInputProps('password')}
          />
          <Button type="submit" fullWidth mt="xl" loading={loading}>
            Sign in
          </Button>
        </form>
      </Paper>
    </Container>
  );
}
