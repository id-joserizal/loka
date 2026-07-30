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
      className="
        max-w-none font-serif text-zinc-800
        [&>p]:text-[21px] [&>p]:leading-[1.78] [&>p]:mb-8 [&>p]:tracking-[-.003em]
        [&>h1]:text-4xl [&>h1]:sm:text-5xl [&>h1]:font-serif [&>h1]:font-bold [&>h1]:text-zinc-900 [&>h1]:leading-tight [&>h1]:tracking-tight [&>h1]:mt-14 [&>h1]:mb-5
        [&>h2]:text-3xl [&>h2]:font-serif [&>h2]:font-bold [&>h2]:text-zinc-900 [&>h2]:leading-snug [&>h2]:tracking-tight [&>h2]:mt-12 [&>h2]:mb-4
        [&>h3]:text-2xl [&>h3]:font-serif [&>h3]:font-bold [&>h3]:text-zinc-900 [&>h3]:leading-snug [&>h3]:mt-10 [&>h3]:mb-3
        [&>h4]:text-xl [&>h4]:font-serif [&>h4]:font-semibold [&>h4]:text-zinc-900 [&>h4]:mt-8 [&>h4]:mb-2
        [&>blockquote]:border-l-[3px] [&>blockquote]:border-zinc-900 [&>blockquote]:pl-7 [&>blockquote]:italic [&>blockquote]:text-[20px] [&>blockquote]:leading-[1.78] [&>blockquote]:text-zinc-600 [&>blockquote]:my-10 [&>blockquote]:tracking-[-.003em]
        [&>ul]:text-[19px] [&>ul]:leading-[1.78] [&>ul]:list-disc [&>ul]:pl-8 [&>ul]:mb-8 [&>ul>li]:mb-2
        [&>ol]:text-[19px] [&>ol]:leading-[1.78] [&>ol]:list-decimal [&>ol]:pl-8 [&>ol]:mb-8 [&>ol>li]:mb-2
        [&>pre]:bg-zinc-900 [&>pre]:text-zinc-100 [&>pre]:p-6 [&>pre]:rounded-2xl [&>pre]:font-mono [&>pre]:text-[15px] [&>pre]:my-8 [&>pre]:overflow-x-auto
        [&>code]:font-mono [&>code]:text-[15px] [&>code]:bg-zinc-100 [&>code]:px-1.5 [&>code]:py-0.5 [&>code]:rounded
        [&>hr]:border-zinc-200 [&>hr]:my-12
        [&_strong]:font-bold [&_em]:italic
        [&_a]:text-inherit [&_a]:underline [&_a]:underline-offset-2
        [&>img]:rounded-2xl [&>img]:max-w-full [&>img]:my-10 [&>img]:border [&>img]:border-zinc-200 [&>img]:shadow-sm [&>img]:mx-auto
      "
      dangerouslySetInnerHTML={{ __html: htmlContent }}
    />
  )
}
