import { useState, type FormEvent } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { communityApi } from '@/services/api'
import { useAuth } from '@/hooks/useAuth'
import { MessageSquare, Trash2, Send, User, Heart } from 'lucide-react'

interface Post {
  id: string
  author_id: string
  author_name: string
  content: string
  parent_id?: string
  created_at: string
  replies?: Post[]
}

export default function PeerSupport() {
  const { user } = useAuth()
  const queryClient = useQueryClient()
  const [newPost, setNewPost] = useState('')
  const [replyingTo, setReplyingTo] = useState<string | null>(null)
  const [replyContent, setReplyContent] = useState('')

  // Get all posts
  const { data: posts, isLoading } = useQuery({
    queryKey: ['posts'],
    queryFn: communityApi.getPosts,
  })

  // Create post mutation
  const createPost = useMutation({
    mutationFn: ({ content, parentId }: { content: string; parentId?: string }) =>
      communityApi.createPost(content, parentId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['posts'] })
      setNewPost('')
      setReplyContent('')
      setReplyingTo(null)
    },
  })

  // Delete post mutation
  const deletePost = useMutation({
    mutationFn: communityApi.deletePost,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['posts'] })
    },
  })

  const handleSubmitPost = async (e: FormEvent) => {
    e.preventDefault()
    if (!newPost.trim()) return
    await createPost.mutateAsync({ content: newPost })
  }

  const handleReply = async (postId: string) => {
    if (!replyContent.trim()) return
    await createPost.mutateAsync({ content: replyContent, parentId: postId })
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMs / 3600000)
    const diffDays = Math.floor(diffMs / 86400000)

    if (diffMins < 1) return 'Just now'
    if (diffMins < 60) return `${diffMins}m ago`
    if (diffHours < 24) return `${diffHours}h ago`
    if (diffDays < 7) return `${diffDays}d ago`
    return date.toLocaleDateString()
  }

  // Filter top-level posts (no parent_id)
  const topLevelPosts = posts?.filter((post: Post) => !post.parent_id) || []

  // Get replies for a post
  const getReplies = (postId: string) => {
    return posts?.filter((post: Post) => post.parent_id === postId) || []
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6 px-0 md:px-0">
      <div className="rounded-2xl border bg-card p-6">
        <p className="text-xs font-medium uppercase tracking-[0.2em] text-muted-foreground">Community</p>
        <h1 className="mt-2 text-3xl font-semibold">Peer Support</h1>
        <p className="mt-2 text-muted-foreground">
          Share experiences, ask for encouragement, and support others safely.
        </p>
      </div>

      {/* Community Guidelines */}
      <Card className="border-primary/20 bg-primary/5">
        <CardContent className="pt-6">
          <h3 className="font-semibold mb-2 flex items-center gap-2">
            <Heart className="h-5 w-5 text-primary" />
            Community Guidelines
          </h3>
          <ul className="text-sm text-muted-foreground space-y-1">
            <li>• Be kind, respectful, and supportive</li>
            <li>• Share experiences, not medical advice</li>
            <li>• Respect privacy - don't share personal identifying information</li>
            <li>• Report concerning content to moderators</li>
          </ul>
        </CardContent>
      </Card>

      {/* Create Post */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-primary flex items-center justify-center">
              <User className="h-6 w-6 text-white" />
            </div>
            <span className="font-semibold">{user?.full_name || 'Anonymous'}</span>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmitPost}>
            <Textarea
              placeholder="Share your thoughts, experiences, or ask for support..."
              value={newPost}
              onChange={(e) => setNewPost(e.target.value)}
              className="min-h-[100px] mb-3"
            />
            <div className="flex justify-end">
              <Button type="submit" disabled={!newPost.trim() || createPost.isPending}>
                <Send className="h-4 w-4 mr-2" />
                {createPost.isPending ? 'Posting...' : 'Post'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Posts Feed */}
      {isLoading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading community posts...</p>
        </div>
      ) : topLevelPosts.length === 0 ? (
        <Card className="p-8 text-center">
          <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground">
            No posts yet. Be the first to share!
          </p>
        </Card>
      ) : (
        <div className="space-y-4">
          {topLevelPosts.map((post: Post) => {
            const replies = getReplies(post.id)
            const isReplying = replyingTo === post.id

            return (
              <Card key={post.id} className="overflow-hidden">
                <CardContent className="pt-6">
                  {/* Post Header */}
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-secondary flex items-center justify-center">
                        <User className="h-6 w-6 text-white" />
                      </div>
                      <div>
                        <p className="font-semibold">
                          {post.author_name || 'Anonymous User'}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {formatDate(post.created_at)}
                        </p>
                      </div>
                    </div>
                    {(user?.role === 'admin' || user?.id === post.author_id) && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => deletePost.mutate(post.id)}
                        className="text-destructive hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>

                  {/* Post Content */}
                  <p className="text-sm mb-4 whitespace-pre-wrap">{post.content}</p>

                  {/* Actions */}
                  <div className="flex items-center gap-2 pt-3 border-t">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setReplyingTo(isReplying ? null : post.id)}
                      className="text-muted-foreground"
                    >
                      <MessageSquare className="h-4 w-4 mr-2" />
                      Reply {replies.length > 0 && `(${replies.length})`}
                    </Button>
                  </div>

                  {/* Reply Form */}
                  {isReplying && (
                    <div className="mt-4 rounded-lg bg-muted/60 p-4">
                      <Textarea
                        placeholder="Write your reply..."
                        value={replyContent}
                        onChange={(e) => setReplyContent(e.target.value)}
                        className="mb-2"
                      />
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setReplyingTo(null)
                            setReplyContent('')
                          }}
                        >
                          Cancel
                        </Button>
                        <Button
                          size="sm"
                          onClick={() => handleReply(post.id)}
                          disabled={!replyContent.trim() || createPost.isPending}
                        >
                          Reply
                        </Button>
                      </div>
                    </div>
                  )}

                  {/* Replies */}
                  {replies.length > 0 && (
                    <div className="mt-4 space-y-3 border-l-2 border-border pl-6">
                      {replies.map((reply: Post) => (
                        <div key={reply.id} className="rounded-lg bg-muted/60 p-3">
                          <div className="flex items-start justify-between mb-2">
                            <div className="flex items-center gap-2">
                              <div className="h-8 w-8 rounded-full bg-primary/80 flex items-center justify-center">
                                <User className="h-4 w-4 text-white" />
                              </div>
                              <div>
                                <p className="text-sm font-semibold">
                                  {reply.author_name || 'Anonymous User'}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                  {formatDate(reply.created_at)}
                                </p>
                              </div>
                            </div>
                            {(user?.role === 'admin' || user?.id === reply.author_id) && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => deletePost.mutate(reply.id)}
                                className="text-destructive hover:text-destructive h-6 w-6 p-0"
                              >
                                <Trash2 className="h-3 w-3" />
                              </Button>
                            )}
                          </div>
                          <p className="text-sm whitespace-pre-wrap">{reply.content}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
