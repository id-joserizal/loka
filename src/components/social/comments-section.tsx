'use client'

import { useState, useTransition } from 'react'
import { addComment, deleteComment } from '@/app/article/[slug]/actions'
import { MessageCircle, CornerDownRight, Trash2, Send, Loader2 } from 'lucide-react'

export interface CommentItem {
  id: string
  content: string
  created_at: string
  parent_comment_id?: string | null
  user_id: string
  profiles?: {
    username?: string | null
    full_name?: string | null
    avatar_url?: string | null
  } | null
}

interface CommentsSectionProps {
  articleId: string
  currentUserId?: string
  initialComments: CommentItem[]
}

export function CommentsSection({ articleId, currentUserId, initialComments }: CommentsSectionProps) {
  const [comments, setComments] = useState<CommentItem[]>(initialComments)
  const [newCommentText, setNewCommentText] = useState('')
  const [replyingToId, setReplyingToId] = useState<string | null>(null)
  const [replyText, setReplyText] = useState('')
  const [isPending, startTransition] = useTransition()

  const handlePostComment = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newCommentText.trim()) return

    startTransition(async () => {
      const res = await addComment(articleId, newCommentText)
      if (res.error) {
        alert(res.error)
      } else if (res.comment) {
        // Supabase returns profiles as array from join, normalize it
        const comment = res.comment as any
        const normalized: CommentItem = {
          ...comment,
          profiles: Array.isArray(comment.profiles) ? comment.profiles[0] : comment.profiles,
        }
        setComments([normalized, ...comments])
        setNewCommentText('')
      }
    })
  }

  const handlePostReply = (parentCommentId: string) => {
    if (!replyText.trim()) return

    startTransition(async () => {
      const res = await addComment(articleId, replyText, parentCommentId)
      if (res.error) {
        alert(res.error)
      } else if (res.comment) {
        // Supabase returns profiles as array from join, normalize it
        const comment = res.comment as any
        const normalized: CommentItem = {
          ...comment,
          profiles: Array.isArray(comment.profiles) ? comment.profiles[0] : comment.profiles,
        }
        setComments([...comments, normalized])
        setReplyText('')
        setReplyingToId(null)
      }
    })
  }

  const handleDeleteComment = (commentId: string) => {
    if (!confirm('Hapus komentar ini?')) return

    startTransition(async () => {
      const res = await deleteComment(commentId)
      if (res.error) {
        alert(res.error)
      } else {
        setComments(comments.filter((c) => c.id !== commentId && c.parent_comment_id !== commentId))
      }
    })
  }

  // Top level comments vs child replies
  const rootComments = comments.filter((c) => !c.parent_comment_id)
  const getReplies = (parentId: string) => comments.filter((c) => c.parent_comment_id === parentId)

  return (
    <section className="mt-12 pt-8 border-t border-zinc-200 space-y-8">
      <div className="flex items-center gap-2">
        <MessageCircle className="w-5 h-5 text-zinc-900" />
        <h3 className="text-xl font-serif font-bold text-zinc-900">
          Komentar ({comments.length})
        </h3>
      </div>

      {/* Main Comment Input */}
      {currentUserId ? (
        <form onSubmit={handlePostComment} className="space-y-3">
          <textarea
            rows={3}
            placeholder="Tulis tanggapan atau komentar kamu..."
            value={newCommentText}
            onChange={(e) => setNewCommentText(e.target.value)}
            className="w-full px-4 py-3 rounded-2xl bg-zinc-50 border border-zinc-200 text-sm text-zinc-900 placeholder-zinc-400 focus:outline-none focus:bg-white focus:border-zinc-900 transition resize-none"
          />
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={isPending || !newCommentText.trim()}
              className="flex items-center gap-2 px-5 py-2 rounded-full bg-zinc-900 hover:bg-black text-xs font-semibold text-white shadow-sm transition disabled:opacity-50"
            >
              {isPending ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
              <span>Kirim Komentar</span>
            </button>
          </div>
        </form>
      ) : (
        <div className="p-4 rounded-2xl bg-zinc-50 border border-zinc-200 text-center text-xs text-zinc-600">
          Silakan <a href="/login" className="font-bold underline text-zinc-900">Masuk</a> untuk berdiskusi di kolom komentar.
        </div>
      )}

      {/* Comments List */}
      <div className="space-y-6">
        {rootComments.length > 0 ? (
          rootComments.map((comment) => {
            const author = comment.profiles
            const authorName = author?.full_name || author?.username || 'Pengguna'
            const authorAvatar = author?.avatar_url
            const replies = getReplies(comment.id)

            return (
              <div key={comment.id} className="space-y-4">
                {/* Parent Comment Card */}
                <div className="p-4 rounded-2xl bg-white border border-zinc-200/80 space-y-3 shadow-xs">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      {authorAvatar ? (
                        <img src={authorAvatar} alt={authorName} className="w-7 h-7 rounded-full object-cover border border-zinc-200" />
                      ) : (
                        <div className="w-7 h-7 rounded-full bg-zinc-900 text-white flex items-center justify-center font-bold text-[10px]">
                          {authorName.charAt(0).toUpperCase()}
                        </div>
                      )}
                      <div>
                        <span className="text-xs font-bold text-zinc-900">{authorName}</span>
                        <span className="text-[10px] text-zinc-400 block">
                          {new Date(comment.created_at).toLocaleDateString('id-ID', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric',
                          })}
                        </span>
                      </div>
                    </div>

                    {currentUserId === comment.user_id && (
                      <button
                        onClick={() => handleDeleteComment(comment.id)}
                        className="text-zinc-400 hover:text-red-600 p-1 transition"
                        title="Hapus Komentar"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>

                  <p className="text-sm text-zinc-700 font-serif leading-relaxed">
                    {comment.content}
                  </p>

                  {/* Reply Action button */}
                  {currentUserId && (
                    <button
                      onClick={() => setReplyingToId(replyingToId === comment.id ? null : comment.id)}
                      className="inline-flex items-center gap-1 text-[11px] font-semibold text-zinc-500 hover:text-zinc-900 transition"
                    >
                      <CornerDownRight className="w-3 h-3" />
                      <span>Balas</span>
                    </button>
                  )}

                  {/* Reply Input Box */}
                  {replyingToId === comment.id && (
                    <div className="mt-3 pt-3 border-t border-zinc-100 flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                      <input
                        type="text"
                        placeholder={`Balas ${authorName}...`}
                        value={replyText}
                        onChange={(e) => setReplyText(e.target.value)}
                        className="flex-1 px-3 py-2 rounded-xl bg-zinc-50 border border-zinc-200 text-xs text-zinc-900 focus:outline-none focus:bg-white focus:border-zinc-900"
                      />
                      <button
                        type="button"
                        onClick={() => handlePostReply(comment.id)}
                        disabled={isPending || !replyText.trim()}
                        className="px-4 py-2 rounded-xl bg-zinc-900 text-white text-xs font-medium disabled:opacity-50 shrink-0"
                      >
                        Kirim
                      </button>
                    </div>
                  )}
                </div>

                {/* Child Replies */}
                {replies.length > 0 && (
                  <div className="pl-6 sm:pl-8 border-l-2 border-zinc-100 space-y-3">
                    {replies.map((reply) => {
                      const replyAuthor = reply.profiles
                      const replyAuthorName = replyAuthor?.full_name || replyAuthor?.username || 'Pengguna'
                      const replyAvatar = replyAuthor?.avatar_url

                      return (
                        <div key={reply.id} className="p-3.5 rounded-xl bg-zinc-50 border border-zinc-200/60 space-y-2">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              {replyAvatar ? (
                                <img src={replyAvatar} alt={replyAuthorName} className="w-6 h-6 rounded-full object-cover" />
                              ) : (
                                <div className="w-6 h-6 rounded-full bg-zinc-800 text-white flex items-center justify-center font-bold text-[9px]">
                                  {replyAuthorName.charAt(0).toUpperCase()}
                                </div>
                              )}
                              <span className="text-xs font-semibold text-zinc-900">{replyAuthorName}</span>
                            </div>

                            {currentUserId === reply.user_id && (
                              <button
                                onClick={() => handleDeleteComment(reply.id)}
                                className="text-zinc-400 hover:text-red-600 p-1 transition"
                              >
                                <Trash2 className="w-3 h-3" />
                              </button>
                            )}
                          </div>
                          <p className="text-xs text-zinc-700 font-serif leading-relaxed">
                            {reply.content}
                          </p>
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>
            )
          })
        ) : (
          <p className="text-center py-6 text-xs text-zinc-400 font-serif">
            Belum ada komentar. Jadilah yang pertama memberikan tanggapan!
          </p>
        )}
      </div>
    </section>
  )
}
