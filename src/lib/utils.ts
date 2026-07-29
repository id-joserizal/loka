export function slugify(text: string): string {
  const baseSlug = text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/[\s\W-]+/g, '-') // Replace spaces and non-word chars with -
    .replace(/^-+|-+$/g, '') // Trim leading/trailing dashes

  // Append a short random 5-character string to guarantee unique slugs
  const randomStr = Math.random().toString(36).substring(2, 7)
  return baseSlug ? `${baseSlug}-${randomStr}` : `artikel-${randomStr}`
}

export function extractPlainTextFromTiptap(jsonContent: any): string {
  if (!jsonContent) return ''
  let text = ''

  function traverse(node: any) {
    if (node.text) {
      text += node.text + ' '
    }
    if (node.content && Array.isArray(node.content)) {
      node.content.forEach(traverse)
    }
  }

  traverse(jsonContent)
  return text.trim()
}

export function calculateReadingTime(jsonContent: any): number {
  const plainText = extractPlainTextFromTiptap(jsonContent)
  const words = plainText.split(/\s+/).filter((w) => w.length > 0).length
  // High reading speed ~200 words per min
  const minutes = Math.ceil(words / 200)
  return minutes > 0 ? minutes : 1
}

export function extractExcerpt(jsonContent: any, maxLength: number = 160): string {
  const plainText = extractPlainTextFromTiptap(jsonContent)
  if (plainText.length <= maxLength) return plainText
  return plainText.substring(0, maxLength).trim() + '...'
}
