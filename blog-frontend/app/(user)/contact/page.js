'use client';

import { useState } from 'react';
import { Container, Title, Text, Stack, Paper, TextInput, Textarea, Button, Group, SimpleGrid } from '@mantine/core';
import { useQuery } from '@tanstack/react-query';
import { toast } from 'sonner';
import { getSiteSettings } from '@/api/siteSettings.mjs';
import { publicAxios } from '@/utilities/axios';

export default function ContactPage() {
  const { data: settings } = useQuery({ queryKey: ['siteSettings'], queryFn: getSiteSettings });
  const contact = settings?.contact_page || {};
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await publicAxios.post('/contact', { name, email, phone, subject, message });
      toast.success('Message sent!');
      setName(''); setEmail(''); setPhone(''); setSubject(''); setMessage('');
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to send message');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container size="md" py="xl">
      <Title order={1} mb="lg">{contact.heading || 'Contact Us'}</Title>
      {contact.description && <Text mb="lg">{contact.description}</Text>}

      <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="lg" mb="xl">
        <Stack gap="xs">
          {contact.phone1 && <Text size="sm"><strong>Phone:</strong> {contact.phone1}</Text>}
          {contact.phone2 && <Text size="sm"><strong>Alt:</strong> {contact.phone2}</Text>}
          {contact.email1 && <Text size="sm"><strong>Email:</strong> {contact.email1}</Text>}
          {contact.email2 && <Text size="sm"><strong>Alt:</strong> {contact.email2}</Text>}
          {contact.address1 && <Text size="sm"><strong>Address:</strong> {contact.address1}</Text>}
          {contact.address2 && <Text size="sm">{contact.address2}</Text>}
        </Stack>
        {contact.map_embed_url && (
          <div style={{ width: '100%', height: 200 }}>
            <iframe src={contact.map_embed_url} width="100%" height="100%" style={{ border: 0, borderRadius: 8 }} allowFullScreen loading="lazy" />
          </div>
        )}
      </SimpleGrid>

      <Paper withBorder p="lg" radius="md">
        <Title order={3} mb="sm">{contact.form_heading || 'Send a Message'}</Title>
        {contact.form_description && <Text size="sm" mb="md">{contact.form_description}</Text>}
        <form onSubmit={handleSubmit}>
          <Stack gap="sm">
            <TextInput label="Name" value={name} onChange={(e) => setName(e.target.value)} required />
            <TextInput label="Email" value={email} onChange={(e) => setEmail(e.target.value)} required />
            <TextInput label="Phone" value={phone} onChange={(e) => setPhone(e.target.value)} />
            <TextInput label="Subject" value={subject} onChange={(e) => setSubject(e.target.value)} required />
            <Textarea label="Message" value={message} onChange={(e) => setMessage(e.target.value)} minRows={4} required />
            <Button type="submit" loading={loading}>Send</Button>
          </Stack>
        </form>
      </Paper>
    </Container>
  );
}
