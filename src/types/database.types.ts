export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          username: string
          full_name: string | null
          bio: string | null
          avatar_url: string | null
          created_at: string
        }
        Insert: {
          id: string
          username: string
          full_name?: string | null
          bio?: string | null
          avatar_url?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          username?: string
          full_name?: string | null
          bio?: string | null
          avatar_url?: string | null
          created_at?: string
        }
      }
      articles: {
        Row: {
          id: string
          author_id: string
          title: string
          slug: string
          content: Json
          cover_image_url: string | null
          excerpt: string | null
          status: 'draft' | 'published'
          reading_time: number | null
          published_at: string | null
          response_to_id: string | null
          response_count: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          author_id: string
          title: string
          slug: string
          content: Json
          cover_image_url?: string | null
          excerpt?: string | null
          status?: 'draft' | 'published'
          reading_time?: number | null
          published_at?: string | null
          response_to_id?: string | null
          response_count?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          author_id?: string
          title?: string
          slug?: string
          content?: Json
          cover_image_url?: string | null
          excerpt?: string | null
          status?: 'draft' | 'published'
          reading_time?: number | null
          published_at?: string | null
          response_to_id?: string | null
          response_count?: number
          created_at?: string
          updated_at?: string
        }
      }
      tags: {
        Row: {
          id: string
          name: string
          slug: string
        }
        Insert: {
          id?: string
          name: string
          slug: string
        }
        Update: {
          id?: string
          name?: string
          slug?: string
        }
      }
      article_tags: {
        Row: {
          article_id: string
          tag_id: string
        }
        Insert: {
          article_id: string
          tag_id: string
        }
        Update: {
          article_id?: string
          tag_id?: string
        }
      }
      comments: {
        Row: {
          id: string
          article_id: string
          user_id: string
          parent_comment_id: string | null
          content: string
          created_at: string
        }
        Insert: {
          id?: string
          article_id: string
          user_id: string
          parent_comment_id?: string | null
          content: string
          created_at?: string
        }
        Update: {
          id?: string
          article_id?: string
          user_id?: string
          parent_comment_id?: string | null
          content?: string
          created_at?: string
        }
      }
      claps: {
        Row: {
          id: string
          article_id: string
          user_id: string
          count: number
        }
        Insert: {
          id?: string
          article_id: string
          user_id: string
          count?: number
        }
        Update: {
          id?: string
          article_id?: string
          user_id?: string
          count?: number
        }
      }
      follows: {
        Row: {
          follower_id: string
          following_id: string
        }
        Insert: {
          follower_id: string
          following_id: string
        }
        Update: {
          follower_id?: string
          following_id?: string
        }
      }
      votes: {
        Row: {
          id: string
          article_id: string
          user_id: string
          vote_type: number
          created_at: string
        }
        Insert: {
          id?: string
          article_id: string
          user_id: string
          vote_type: number
          created_at?: string
        }
        Update: {
          id?: string
          article_id?: string
          user_id?: string
          vote_type?: number
          created_at?: string
        }
      }
      notifications: {
        Row: {
          id: string
          user_id: string
          actor_id: string
          type: 'upvote' | 'downvote' | 'comment' | 'reply' | 'follow' | 'response'
          article_id: string | null
          comment_id: string | null
          read: boolean
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          actor_id: string
          type: 'upvote' | 'downvote' | 'comment' | 'reply' | 'follow' | 'response'
          article_id?: string | null
          comment_id?: string | null
          read?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          actor_id?: string
          type?: 'upvote' | 'downvote' | 'comment' | 'reply' | 'follow' | 'response'
          article_id?: string | null
          comment_id?: string | null
          read?: boolean
          created_at?: string
        }
      }
      bookmarks: {
        Row: {
          user_id: string
          article_id: string
          created_at: string
        }
        Insert: {
          user_id: string
          article_id: string
          created_at?: string
        }
        Update: {
          user_id?: string
          article_id?: string
          created_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
}
