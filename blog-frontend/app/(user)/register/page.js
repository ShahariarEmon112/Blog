'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  TextInput, PasswordInput, Button, Paper, Title, Text, Container, Anchor, Alert,
} from '@mantine/core';
import { useForm } from '@mantine/form';
import { IconCircleCheck, IconAlertCircle } from '@tabler/icons-react';
import { registerUser } from '@/api/auth.mjs';

export default function RegisterPage() {
  const [done, setDone] = useState(false);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const form = useForm({
    initialValues: { name: '', email: '', password: '', password_confirmation: '' },
    validate: {
      name: (v) => (v.length >= 3 ? null : 'Name must be at least 3 characters'),
      email: (v) => (/^\S+@\S+$/.test(v) ? null : 'Invalid email'),
      password: (v) => (v.length >= 8 ? null : 'Password must be at least 8 characters'),
      password_confirmation: (v, values) => (v === values.password ? null : 'Passwords do not match'),
    },
  });

  const handleSubmit = async (values) => {
    setLoading(true);
    setError(null);
    try {
      await registerUser(values);
      setDone(true);
    } catch (err) {
      const msg = err?.response?.data?.message
        || err?.response?.data?.errors?.[Object.keys(err?.response?.data?.errors || {})[0]]?.[0]
        || 'Registration failed';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  if (done) {
    return (
      <Container size={420} my={40}>
        <Paper withBorder shadow="md" p="xl" radius="md" ta="center">
          <IconCircleCheck size={48} color="green" style={{ margin: '0 auto' }} />
          <Title order={3} mt="md">Account created</Title>
          <Text c="dimmed" mt="sm">
            Your account is awaiting admin approval. You will be able to log in once an admin activates your account.
          </Text>
          <Button component={Link} href="/login" fullWidth mt="xl" variant="outline">
            Back to login
          </Button>
        </Paper>
      </Container>
    );
  }

  return (
    <Container size={420} my={40}>
      <Title ta="center" mb="md">Create your account</Title>
      <Text c="dimmed" size="sm" ta="center" mb="lg">
        Already have an account?{' '}
        <Anchor component={Link} href="/login">Sign in</Anchor>
      </Text>

      <Paper withBorder shadow="md" p="xl" radius="md">
        {error && (
          <Alert icon={<IconAlertCircle size={16} />} color="red" mb="md">
            {error}
          </Alert>
        )}

        <form onSubmit={form.onSubmit(handleSubmit)}>
          <TextInput label="Name" placeholder="Your name" required {...form.getInputProps('name')} />
          <TextInput label="Email" placeholder="you@example.com" required mt="md" {...form.getInputProps('email')} />
          <PasswordInput label="Password" placeholder="Min 8 characters" required mt="md" {...form.getInputProps('password')} />
          <PasswordInput label="Confirm password" placeholder="Repeat password" required mt="md" {...form.getInputProps('password_confirmation')} />
          <Button type="submit" fullWidth mt="xl" loading={loading}>
            Create account
          </Button>
        </form>
      </Paper>
    </Container>
  );
}
