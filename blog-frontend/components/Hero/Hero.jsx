'use client';

import { useState } from 'react';
import { Container, Title, Text, TextInput, Button, Group, Paper, Loader, Center } from '@mantine/core';
import { useQuery } from '@tanstack/react-query';
import { IconArrowRight, IconQuote } from '@tabler/icons-react';
import { toast } from 'sonner';
import { getSiteSettings } from '@/api/siteSettings.mjs';
import { publicAxios } from '@/utilities/axios';

export default function Hero() {
  const { data: settings } = useQuery({
    queryKey: ['siteSettings'],
    queryFn: getSiteSettings,
    staleTime: 10 * 60 * 1000,
  });

  const { data: quote, isLoading: quoteLoading } = useQuery({
    queryKey: ['quote'],
    queryFn: () => publicAxios.get('/quote').then(r => r.data),
    staleTime: 60 * 60 * 1000,
  });

  const [email, setEmail] = useState('');
  const [subLoading, setSubLoading] = useState(false);

  const handleSubscribe = async (e) => {
    e.preventDefault();
    if (!email) return;
    setSubLoading(true);
    try {
      await publicAxios.post('/newsletter', { name: 'Subscriber', email });
      toast.success('Subscribed!');
      setEmail('');
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Subscription failed');
    } finally {
      setSubLoading(false);
    }
  };

  return (
    <div style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: '#fff', padding: '60px 0' }}>
      <Container size="lg">
        <Title order={1} size={48} mb="sm">{settings?.hero_title || 'Thoughts Meet Words'}</Title>
        <Text size="lg" mb="xl" opacity={0.9}>{settings?.hero_subtitle || 'A space for student writers to share stories.'}</Text>

        {quoteLoading ? (
          <Center mb="lg"><Loader color="white" size="sm" /></Center>
        ) : quote ? (
          <Paper p="md" mb="xl" style={{ background: 'rgba(255,255,255,0.12)', backdropFilter: 'blur(4px)', borderRadius: 8 }}>
            <Group gap="xs" mb={4}>
              <IconQuote size={18} opacity={0.7} />
              <Text size="sm" opacity={0.7}>Quote of the Day</Text>
            </Group>
            <Text size="lg" fs="italic">&ldquo;{quote.quote}&rdquo;</Text>
            <Text size="sm" opacity={0.8} mt={4}>&mdash; {quote.author}</Text>
          </Paper>
        ) : null}

        <form onSubmit={handleSubscribe}>
          <Group>
            <TextInput
              placeholder="Your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              size="md"
              style={{ flex: 1, maxWidth: 400 }}
              radius="md"
            />
            <Button type="submit" size="md" radius="md" loading={subLoading} rightSection={<IconArrowRight size={16} />}>
              Subscribe
            </Button>
          </Group>
        </form>
      </Container>
    </div>
  );
}
