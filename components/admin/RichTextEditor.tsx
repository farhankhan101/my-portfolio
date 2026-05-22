// components/admin/RichTextEditor.tsx
'use client'

import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import {
  Bold,
  Italic,
  List,
  ListOrdered,
  Heading1,
  Heading2,
  Heading3,
  Code,
  Undo,
  Redo
} from 'lucide-react'

interface RichTextEditorProps {
  value: string
  onChange: (html: string) => void
  placeholder?: string
}

export default function RichTextEditor({ value, onChange, placeholder = 'Write content here...' }: RichTextEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3],
        },
      }),
    ],
    content: value,
    editorProps: {
      attributes: {
        class: 'prose dark:prose-invert max-w-none focus:outline-none min-h-[150px] max-h-[300px] overflow-y-auto px-4 py-3 bg-card border-t border-border rounded-b-lg text-foreground text-sm leading-relaxed',
      },
    },
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML())
    },
  })

  if (!editor) {
    return null
  }

  return (
    <div className="w-full border border-border rounded-lg overflow-hidden focus-within:border-sky-500/50 transition-colors">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-1 bg-secondary p-2 border-b border-border">
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBold().run()}
          className={`p-1.5 rounded hover:bg-card text-muted-foreground/80 hover:text-foreground transition-all ${
            editor.isActive('bold') ? 'bg-card text-sky-600 dark:text-sky-400 font-bold' : ''
          }`}
          title="Bold"
        >
          <Bold size={16} />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleItalic().run()}
          className={`p-1.5 rounded hover:bg-card text-muted-foreground/80 hover:text-foreground transition-all ${
            editor.isActive('italic') ? 'bg-card text-sky-600 dark:text-sky-400' : ''
          }`}
          title="Italic"
        >
          <Italic size={16} />
        </button>
        
        <div className="w-[1px] h-5 bg-border mx-1" />

        <button
          type="button"
          onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
          className={`p-1.5 rounded hover:bg-card text-muted-foreground/80 hover:text-foreground transition-all ${
            editor.isActive('heading', { level: 1 }) ? 'bg-card text-sky-600 dark:text-sky-400' : ''
          }`}
          title="Heading 1"
        >
          <Heading1 size={16} />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          className={`p-1.5 rounded hover:bg-card text-muted-foreground/80 hover:text-foreground transition-all ${
            editor.isActive('heading', { level: 2 }) ? 'bg-card text-sky-600 dark:text-sky-400' : ''
          }`}
          title="Heading 2"
        >
          <Heading2 size={16} />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
          className={`p-1.5 rounded hover:bg-card text-muted-foreground/80 hover:text-foreground transition-all ${
            editor.isActive('heading', { level: 3 }) ? 'bg-card text-sky-600 dark:text-sky-400' : ''
          }`}
          title="Heading 3"
        >
          <Heading3 size={16} />
        </button>

        <div className="w-[1px] h-5 bg-border mx-1" />

        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          className={`p-1.5 rounded hover:bg-card text-muted-foreground/80 hover:text-foreground transition-all ${
            editor.isActive('bulletList') ? 'bg-card text-sky-600 dark:text-sky-400' : ''
          }`}
          title="Bullet List"
        >
          <List size={16} />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          className={`p-1.5 rounded hover:bg-card text-muted-foreground/80 hover:text-foreground transition-all ${
            editor.isActive('orderedList') ? 'bg-card text-sky-600 dark:text-sky-400' : ''
          }`}
          title="Ordered List"
        >
          <ListOrdered size={16} />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleCodeBlock().run()}
          className={`p-1.5 rounded hover:bg-card text-muted-foreground/80 hover:text-foreground transition-all ${
            editor.isActive('codeBlock') ? 'bg-card text-sky-600 dark:text-sky-400' : ''
          }`}
          title="Code Block"
        >
          <Code size={16} />
        </button>

        <div className="w-[1px] h-5 bg-border mx-1" />

        <button
          type="button"
          onClick={() => editor.chain().focus().undo().run()}
          disabled={!editor.can().undo()}
          className="p-1.5 rounded hover:bg-card text-muted-foreground hover:text-foreground transition-all disabled:opacity-30 disabled:pointer-events-none"
          title="Undo"
        >
          <Undo size={16} />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().redo().run()}
          disabled={!editor.can().redo()}
          className="p-1.5 rounded hover:bg-card text-muted-foreground hover:text-foreground transition-all disabled:opacity-30 disabled:pointer-events-none"
          title="Redo"
        >
          <Redo size={16} />
        </button>
      </div>

      {/* Editor Content Area */}
      <EditorContent editor={editor} />
    </div>
  )
}
