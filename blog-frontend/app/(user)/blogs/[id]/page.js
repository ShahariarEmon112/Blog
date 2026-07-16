'use client';

import { useState, use } from 'react';
import { Container, Title, Text, Image, Badge, Group, Stack, Paper, Textarea, Button, ActionIcon, Menu, Loader, Center, Divider, Checkbox } from '@mantine/core';
import { useQuery } from '@tanstack/react-query';
import { IconDots, IconFlag, IconEdit, IconTrash, IconMessageCircle } from '@tabler/icons-react';
import { toast } from 'sonner';
import { getBlog } from '@/api/blogs.mjs';
import useAuth from '@/hooks/useAuth';
import LikeButton from '@/components/LikeButton';
import FavoriteButton from '@/components/FavoriteButton';
import { useAddComment, useUpdateComment, useDeleteComment, useReportComment } from '@/hooks/mutations/useCommentMutation';

function CommentItem({ comment, blogId, onEdit, onDelete, onReport }) {
  const { user, isLoggedIn } = useAuth();
  const isOwner = isLoggedIn && user?.id === comment.user_id;
  const [editMode, setEditMode] = useState(false);
  const [editText, setEditText] = useState(comment.text);
  const [showReply, setShowReply] = useState(false);
  const [replyText, setReplyText] = useState('');
  const addReplyMut = useAddComment(blogId);
  const updateMut = useUpdateComment(blogId);
  const deleteMut = useDeleteComment(blogId);
  const reportMut = useReportComment();

  const handleEdit = async () => {
    await updateMut.mutateAsync({ id: comment.id, text: editText });
    setEditMode(false);
  };

  const handleDelete = async () => {
    await deleteMut.mutateAsync(comment.id);
  };

  const handleReply = async () => {
    if (!replyText.trim()) return;
    await addReplyMut.mutateAsync({ text: replyText.trim(), parent_id: comment.id });
    setReplyText('');
    setShowReply(false);
  };

  const handleReport = () => {
    reportMut.mutate({ comment_id: comment.id, reason: 'Inappropriate content' });
  };

  return (
    <Paper p="sm" withBorder mb="xs">
      <Group justify="space-between" mb={2}>
        <Text size="sm" fw={500}>{comment.user_name || 'Anonymous'}</Text>
        {isLoggedIn && (
          <Menu>
            <Menu.Target>
              <ActionIcon variant="subtle" size="sm"><IconDots size={14} /></ActionIcon>
            </Menu.Target>
            <Menu.Dropdown>
              {isOwner && (
                <>
                  <Menu.Item leftSection={<IconEdit size={14} />} onClick={() => setEditMode(true)}>Edit</Menu.Item>
                  <Menu.Item leftSection={<IconTrash size={14} />} color="red" onClick={handleDelete}>Delete</Menu.Item>
                </>
              )}
              <Menu.Item leftSection={<IconFlag size={14} />} onClick={handleReport}>Report</Menu.Item>
            </Menu.Dropdown>
          </Menu>
        )}
      </Group>

      {editMode ? (
        <Stack gap="xs">
          <Textarea value={editText} onChange={(e) => setEditText(e.target.value)} minRows={2} />
          <Group>
            <Button size="xs" onClick={handleEdit} loading={updateMut.isPending}>Save</Button>
            <Button size="xs" variant="subtle" onClick={() => setEditMode(false)}>Cancel</Button>
          </Group>
        </Stack>
      ) : (
        <Text size="sm">{comment.text}</Text>
      )}

      {comment.replies?.map((reply) => (
        <Paper key={reply.id} p="xs" ml="lg" mt="xs" withBorder>
          <Text size="xs" fw={500}>{reply.user_name || 'Anonymous'}</Text>
          <Text size="sm">{reply.text}</Text>
        </Paper>
      ))}

      {isLoggedIn && !editMode && (
        <Button size="compact-xs" variant="subtle" mt={4} onClick={() => setShowReply(!showReply)}>
          Reply
        </Button>
      )}

      {showReply && (
        <Stack gap="xs" ml="lg" mt="xs">
          <Textarea placeholder="Write a reply..." value={replyText} onChange={(e) => setReplyText(e.target.value)} minRows={2} />
          <Group>
            <Button size="xs" onClick={handleReply} loading={addReplyMut.isPending}>Reply</Button>
            <Button size="xs" variant="subtle" onClick={() => setShowReply(false)}>Cancel</Button>
          </Group>
        </Stack>
      )}
    </Paper>
  );
}

export default function BlogDetailPage({ params }) {
  const { id } = use(params);
  const { isLoggedIn, user } = useAuth();
  const [commentText, setCommentText] = useState('');
  const [anonymous, setAnonymous] = useState(false);
  const addCommentMut = useAddComment(id);

  const { data, isLoading } = useQuery({
    queryKey: ['blog', id],
    queryFn: () => getBlog(id),
  });

  const blog = data?.data;

  if (isLoading) return <Center h={400}><Loader /></Center>;
  if (!blog) return <Center h={400}><Text>Blog not found</Text></Center>;

  const handleComment = async () => {
    if (!commentText.trim()) return;
    await addCommentMut.mutateAsync({ text: commentText.trim(), is_anonymous: anonymous });
    setCommentText('');
    setAnonymous(false);
  };

  return (
    <Container size="md" py="xl">
      {blog.blog_pic_url && (
        <Image src={blog.blog_pic_url} alt={blog.title} radius="md" mb="md" />
      )}

      <Title order={1} mb="xs">{blog.title}</Title>

      <Group mb="lg">
        <Text size="sm" c="dimmed">By {blog.author_name}</Text>
        {blog.category && <Badge variant="light">{blog.category.name}</Badge>}
        <Badge variant="outline">{blog.time_read || '3 mins read'}</Badge>
        <Text size="sm" c="dimmed">{blog.likes_count} likes</Text>
        <Text size="sm" c="dimmed">{blog.comments_count || 0} comments</Text>
      </Group>

      <Group mb="lg">
        <LikeButton blogId={id} likesCount={blog.likes_count} />
        <FavoriteButton blogId={id} />
      </Group>

      <Divider mb="lg" />

      <Text component="div" dangerouslySetInnerHTML={{ __html: blog.body || blog.content }} mb="xl" />

      <Divider mb="lg" />

      <Title order={3} mb="md">
        <Group gap="xs">
          <IconMessageCircle size={20} />
          Comments ({blog.comments_count || 0})
        </Group>
      </Title>

      {isLoggedIn && (
        <Stack gap="xs" mb="lg">
          <Textarea
            placeholder="Write a comment..."
            value={commentText}
            onChange={(e) => setCommentText(e.target.value)}
            minRows={3}
          />
          <Group justify="space-between">
            <Checkbox
              label="Post as Anonymous"
              checked={anonymous}
              onChange={(e) => setAnonymous(e.currentTarget.checked)}
              size="sm"
            />
            <Button onClick={handleComment} loading={addCommentMut.isPending}>Post Comment</Button>
          </Group>
        </Stack>
      )}

      {(blog.comments || []).map((comment) => (
        <CommentItem key={comment.id} comment={comment} blogId={id} />
      ))}
    </Container>
  );
}
