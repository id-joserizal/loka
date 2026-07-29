import { generateHTML } from '@tiptap/html'
import StarterKit from '@tiptap/starter-kit'
import Image from '@tiptap/extension-image'
import Link from '@tiptap/extension-link'
import CodeBlock from '@tiptap/extension-code-block'

interface TiptapRendererProps {
  content: any
}

export function TiptapRenderer({ content }: TiptapRendererProps) {
  if (!content) return null

  let htmlContent = ''
  try {
    if (typeof content === 'string') {
      htmlContent = content
    } else {
      htmlContent = generateHTML(content, [
        StarterKit,
        Image.configure({
          HTMLAttributes: {
            class: 'rounded-2xl max-w-full my-8 border border-zinc-200 shadow-sm mx-auto',
          },
        }),
        Link.configure({
          HTMLAttributes: {
            class: 'text-indigo-600 underline font-medium hover:text-indigo-800',
          },
        }),
        CodeBlock.configure({
          HTMLAttributes: {
            class: 'bg-zinc-900 text-zinc-100 p-5 rounded-2xl font-mono text-sm my-6 overflow-x-auto',
          },
        }),
      ])
    }
  } catch {
    htmlContent = '<p>Gagal memuat konten artikel.</p>'
  }

  return (
    <div
      className="prose prose-lg max-w-none font-serif text-zinc-800 leading-relaxed space-y-6 [&>p]:mb-6 [&>h1]:text-3xl [&>h1]:font-serif [&>h1]:font-bold [&>h1]:mt-10 [&>h1]:mb-4 [&>h2]:text-2xl [&>h2]:font-serif [&>h2]:font-bold [&>h2]:mt-8 [&>h2]:mb-3 [&>h3]:text-xl [&>h3]:font-serif [&>h3]:font-bold [&>h3]:mt-6 [&>h3]:mb-2 [&>blockquote]:border-l-4 [&>blockquote]:border-zinc-900 [&>blockquote]:pl-6 [&>blockquote]:italic [&>blockquote]:text-zinc-700 [&>blockquote]:my-8 [&>ul]:list-disc [&>ul]:pl-6 [&>ol]:list-decimal [&>ol]:pl-6"
      dangerouslySetInnerHTML={{ __html: htmlContent }}
    />
  )
}
