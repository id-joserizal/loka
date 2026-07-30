'use client'

import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Image from '@tiptap/extension-image'
import Link from '@tiptap/extension-link'
import Placeholder from '@tiptap/extension-placeholder'
import CodeBlock from '@tiptap/extension-code-block'
import { useRef, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import {
  Bold,
  Italic,
  Heading1,
  Heading2,
  Heading3,
  Quote,
  List,
  ListOrdered,
  Code,
  Link as LinkIcon,
  Image as ImageIcon,
  Undo,
  Redo,
  Loader2,
} from 'lucide-react'

interface TiptapEditorProps {
  content: any
  onChange: (json: any) => void
  placeholder?: string
}

export function TiptapEditor({ content, onChange, placeholder = 'Mulai menulis ceritamu di sini...' }: TiptapEditorProps) {
  const [uploadingImage, setUploadingImage] = useState(false)
  const imageInputRef = useRef<HTMLInputElement>(null)

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        codeBlock: false,
      }),
      CodeBlock.configure({
        HTMLAttributes: {
          class: 'bg-zinc-900 text-zinc-100 p-4 rounded-xl font-mono text-sm my-4 overflow-x-auto',
        },
      }),
      Image.configure({
        HTMLAttributes: {
          class: 'rounded-xl max-w-full my-6 border border-zinc-200 shadow-sm mx-auto',
        },
      }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: 'text-indigo-600 underline font-medium hover:text-indigo-800',
        },
      }),
      Placeholder.configure({
        placeholder,
      }),
    ],
    content: content || '',
    editorProps: {
      attributes: {
        class:
          'prose prose-lg max-w-none focus:outline-none min-h-[400px] text-zinc-900 font-serif leading-relaxed',
      },
    },
    onUpdate: ({ editor }) => {
      onChange(editor.getJSON())
    },
  })

  if (!editor) {
    return null
  }

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !editor) return

    if (file.size > 5 * 1024 * 1024) {
      alert('Ukuran gambar maksimal 5MB.')
      return
    }

    setUploadingImage(true)

    try {
      const supabase = createClient()
      const ext = file.name.split('.').pop()
      const fileName = `article-img-${Date.now()}.${ext}`
      const filePath = `images/${fileName}`

      const { error: uploadError } = await supabase.storage
        .from('article-covers')
        .upload(filePath, file, { upsert: true })

      if (uploadError) {
        alert('Gagal mengunggah gambar: ' + uploadError.message)
        return
      }

      const { data: { publicUrl } } = supabase.storage
        .from('article-covers')
        .getPublicUrl(filePath)

      editor.chain().focus().setImage({ src: publicUrl }).run()
    } catch {
      alert('Gagal mengunggah gambar.')
    } finally {
      setUploadingImage(false)
      // Reset file input so same file can be selected again
      if (imageInputRef.current) imageInputRef.current.value = ''
    }
  }

  const setLink = () => {
    const previousUrl = editor.getAttributes('link').href
    const url = window.prompt('Masukkan URL Link:', previousUrl)
    if (url === null) return
    if (url === '') {
      editor.chain().focus().extendMarkRange('link').unsetLink().run()
      return
    }
    editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run()
  }

  return (
    <div className="space-y-4">
      {/* Hidden file input */}
      <input
        ref={imageInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleImageUpload}
      />

      {/* Sticky Toolbar */}
      <div className="sticky top-16 z-30 flex flex-wrap items-center gap-1 p-1.5 rounded-2xl bg-[#F4EFEA]/95 backdrop-blur border border-zinc-200/80 shadow-md">
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBold().run()}
          className={`p-2 rounded-lg text-xs transition ${
            editor.isActive('bold') ? 'bg-zinc-900 text-white' : 'text-zinc-600 hover:bg-zinc-100'
          }`}
          title="Bold"
        >
          <Bold className="w-4 h-4" />
        </button>

        <button
          type="button"
          onClick={() => editor.chain().focus().toggleItalic().run()}
          className={`p-2 rounded-lg text-xs transition ${
            editor.isActive('italic') ? 'bg-zinc-900 text-white' : 'text-zinc-600 hover:bg-zinc-100'
          }`}
          title="Italic"
        >
          <Italic className="w-4 h-4" />
        </button>

        <div className="w-px h-5 bg-zinc-200 mx-1" />

        <button
          type="button"
          onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
          className={`p-2 rounded-lg text-xs transition ${
            editor.isActive('heading', { level: 1 }) ? 'bg-zinc-900 text-white' : 'text-zinc-600 hover:bg-zinc-100'
          }`}
          title="Heading 1"
        >
          <Heading1 className="w-4 h-4" />
        </button>

        <button
          type="button"
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          className={`p-2 rounded-lg text-xs transition ${
            editor.isActive('heading', { level: 2 }) ? 'bg-zinc-900 text-white' : 'text-zinc-600 hover:bg-zinc-100'
          }`}
          title="Heading 2"
        >
          <Heading2 className="w-4 h-4" />
        </button>

        <button
          type="button"
          onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
          className={`p-2 rounded-lg text-xs transition ${
            editor.isActive('heading', { level: 3 }) ? 'bg-zinc-900 text-white' : 'text-zinc-600 hover:bg-zinc-100'
          }`}
          title="Heading 3"
        >
          <Heading3 className="w-4 h-4" />
        </button>

        <div className="w-px h-5 bg-zinc-200 mx-1" />

        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          className={`p-2 rounded-lg text-xs transition ${
            editor.isActive('blockquote') ? 'bg-zinc-900 text-white' : 'text-zinc-600 hover:bg-zinc-100'
          }`}
          title="Quote"
        >
          <Quote className="w-4 h-4" />
        </button>

        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          className={`p-2 rounded-lg text-xs transition ${
            editor.isActive('bulletList') ? 'bg-zinc-900 text-white' : 'text-zinc-600 hover:bg-zinc-100'
          }`}
          title="Bullet List"
        >
          <List className="w-4 h-4" />
        </button>

        <button
          type="button"
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          className={`p-2 rounded-lg text-xs transition ${
            editor.isActive('orderedList') ? 'bg-zinc-900 text-white' : 'text-zinc-600 hover:bg-zinc-100'
          }`}
          title="Numbered List"
        >
          <ListOrdered className="w-4 h-4" />
        </button>

        <button
          type="button"
          onClick={() => editor.chain().focus().toggleCodeBlock().run()}
          className={`p-2 rounded-lg text-xs transition ${
            editor.isActive('codeBlock') ? 'bg-zinc-900 text-white' : 'text-zinc-600 hover:bg-zinc-100'
          }`}
          title="Code Block"
        >
          <Code className="w-4 h-4" />
        </button>

        <div className="w-px h-5 bg-zinc-200 mx-1" />

        <button
          type="button"
          onClick={setLink}
          className={`p-2 rounded-lg text-xs transition ${
            editor.isActive('link') ? 'bg-zinc-900 text-white' : 'text-zinc-600 hover:bg-zinc-100'
          }`}
          title="Embed Link"
        >
          <LinkIcon className="w-4 h-4" />
        </button>

        {/* Image Upload Button */}
        <button
          type="button"
          onClick={() => imageInputRef.current?.click()}
          disabled={uploadingImage}
          className="p-2 rounded-lg text-xs text-zinc-600 hover:bg-zinc-100 transition disabled:opacity-50 relative"
          title="Unggah Gambar"
        >
          {uploadingImage ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <ImageIcon className="w-4 h-4" />
          )}
        </button>

        <div className="w-px h-5 bg-zinc-200 mx-1 ml-auto" />

        <button
          type="button"
          onClick={() => editor.chain().focus().undo().run()}
          disabled={!editor.can().undo()}
          className="p-2 rounded-lg text-xs text-zinc-600 hover:bg-zinc-100 transition disabled:opacity-30"
          title="Undo"
        >
          <Undo className="w-4 h-4" />
        </button>

        <button
          type="button"
          onClick={() => editor.chain().focus().redo().run()}
          disabled={!editor.can().redo()}
          className="p-2 rounded-lg text-xs text-zinc-600 hover:bg-zinc-100 transition disabled:opacity-30"
          title="Redo"
        >
          <Redo className="w-4 h-4" />
        </button>
      </div>

      {/* Uploading feedback */}
      {uploadingImage && (
        <div className="flex items-center gap-2 text-xs text-zinc-500 bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-2">
          <Loader2 className="w-3.5 h-3.5 animate-spin" />
          <span>Mengunggah gambar ke artikel...</span>
        </div>
      )}

      {/* Editor Main Content Area */}
      <div className="bg-transparent p-2 min-h-[450px]">
        <EditorContent editor={editor} />
      </div>
    </div>
  )
}
