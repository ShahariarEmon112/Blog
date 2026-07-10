'use client';

import { Container, Title, Text } from '@mantine/core';

export default function AdminDashboard() {
  return (
    <Container size="lg" py="xl">
      <Title order={2}>Admin Dashboard</Title>
      <Text c="dimmed" mt="sm">Select a section from the sidebar to manage.</Text>
    </Container>
  );
}
