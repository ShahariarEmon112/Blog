'use client';

import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Image from '@tiptap/extension-image';
import Link from '@tiptap/extension-link';
import Underline from '@tiptap/extension-underline';
import Placeholder from '@tiptap/extension-placeholder';
import { Group, Button, ActionIcon, Tooltip } from '@mantine/core';

const toolbar = [
  { label: 'Bold', action: 'toggleBold', icon: 'B' },
  { label: 'Italic', action: 'toggleItalic', icon: 'I' },
  { label: 'Underline', action: 'toggleUnderline', icon: 'U' },
  { label: 'Strike', action: 'toggleStrike', icon: 'S' },
  { type: 'divider' },
  { label: 'H1', action: 'toggleHeading', attr: { level: 1 }, icon: 'H1' },
  { label: 'H2', action: 'toggleHeading', attr: { level: 2 }, icon: 'H2' },
  { label: 'H3', action: 'toggleHeading', attr: { level: 3 }, icon: 'H3' },
  { type: 'divider' },
  { label: 'Bullet List', action: 'toggleBulletList', icon: 'UL' },
  { label: 'Ordered List', action: 'toggleOrderedList', icon: 'OL' },
  { label: 'Blockquote', action: 'toggleBlockquote', icon: 'BQ' },
  { label: 'Code', action: 'toggleCodeBlock', icon: '<>' },
  { type: 'divider' },
  { label: 'Link', action: 'setLink', icon: '🔗' },
  { label: 'Image', action: 'setImage', icon: '🖼' },
  { type: 'divider' },
  { label: 'Undo', action: 'undo', icon: '↩' },
  { label: 'Redo', action: 'redo', icon: '↪' },
];

export default function RichTextEditor({ content = '', onChange, placeholder = 'Start writing...' }) {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Image.configure({ inline: false, allowBase64: true }),
      Link.configure({ openOnClick: false }),
      Underline,
      Placeholder.configure({ placeholder }),
    ],
    content,
    onUpdate: ({ editor }) => onChange?.(editor.getHTML()),
  });

  if (!editor) return null;

  const handleAction = (item) => {
    if (item.action === 'setLink') {
      const url = window.prompt('Link URL:');
      if (url) {
        editor.chain().focus().setLink({ href: url }).run();
      }
    } else if (item.action === 'setImage') {
      const url = window.prompt('Image URL:');
      if (url) {
        editor.chain().focus().setImage({ src: url }).run();
      }
    } else if (item.attr) {
      editor.chain().focus()[item.action](item.attr).run();
    } else {
      editor.chain().focus()[item.action]().run();
    }
  };

  return (
    <div className="tiptap-wrapper" style={{ border: '1px solid var(--mantine-color-gray-4)', borderRadius: 8 }}>
      <Group p="xs" gap={4} style={{ borderBottom: '1px solid var(--mantine-color-gray-3)', flexWrap: 'wrap' }}>
        {toolbar.map((item, i) =>
          item.type === 'divider' ? (
            <div key={i} style={{ width: 1, height: 24, background: 'var(--mantine-color-gray-3)', margin: '0 4px' }} />
          ) : (
            <Tooltip key={item.label} label={item.label}>
              <ActionIcon
                variant={editor.isActive(item.action, item.attr) ? 'filled' : 'subtle'}
                size="sm"
                onClick={() => handleAction(item)}
              >
                {item.icon}
              </ActionIcon>
            </Tooltip>
          )
        )}
      </Group>
      <EditorContent editor={editor} style={{ padding: 16, minHeight: 200, outline: 'none' }} />
      <style jsx global>{`
        .tiptap-wrapper .ProseMirror { outline: none; min-height: 200px; }
        .tiptap-wrapper .ProseMirror p { margin: 0 0 8px; }
        .tiptap-wrapper .ProseMirror h1 { font-size: 1.75rem; font-weight: 700; margin: 16px 0 8px; }
        .tiptap-wrapper .ProseMirror h2 { font-size: 1.4rem; font-weight: 600; margin: 14px 0 6px; }
        .tiptap-wrapper .ProseMirror h3 { font-size: 1.15rem; font-weight: 600; margin: 12px 0 4px; }
        .tiptap-wrapper .ProseMirror ul, .tiptap-wrapper .ProseMirror ol { padding-left: 24px; margin: 8px 0; }
        .tiptap-wrapper .ProseMirror blockquote {
          border-left: 3px solid var(--mantine-color-gray-4);
          padding-left: 12px;
          margin: 8px 0;
          color: var(--mantine-color-dimmed);
        }
        .tiptap-wrapper .ProseMirror pre {
          background: var(--mantine-color-gray-1);
          padding: 12px;
          border-radius: 4px;
          overflow-x: auto;
        }
        .tiptap-wrapper .ProseMirror img { max-width: 100%; height: auto; border-radius: 4px; }
        .tiptap-wrapper .ProseMirror p.is-editor-empty:first-child::before {
          color: var(--mantine-color-gray-5);
          content: attr(data-placeholder);
          float: left;
          height: 0;
          pointer-events: none;
        }
      `}</style>
    </div>
  );
}
