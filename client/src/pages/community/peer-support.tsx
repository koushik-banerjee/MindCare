import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/services/api";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { MessageCircle, Send } from "lucide-react";

interface Post {
  id: string;
  content: string;
  created_at: string;
  author_id: string;
  parent_id: string | null;
  author?: { full_name: string | null; email: string };
}

interface Reply extends Post {
  parent_id: string;
}

export default function PeerSupportPage() {
  const [content, setContent] = useState("");
  const [expandedPost, setExpandedPost] = useState<string | null>(null);
  const [replyContent, setReplyContent] = useState<Record<string, string>>({});
  const [page, setPage] = useState(1);
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ["community-posts", page],
    queryFn: () =>
      api.get<{ posts: Post[]; page: number; pageSize: number }>(
        `/community/posts?page=${page}`
      ),
  });

  const createMutation = useMutation({
    mutationFn: async (payload: { content: string; parentId?: string }) => {
      return api.post<Post>("/community/posts", payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["community-posts"] });
      setContent("");
    },
  });

  const posts = data?.posts ?? [];

  const handleCreatePost = (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;
    createMutation.mutate({ content: content.trim() });
  };

  const handleReply = (postId: string) => {
    const reply = replyContent[postId]?.trim();
    if (!reply) return;
    createMutation.mutate({ content: reply, parentId: postId });
    setReplyContent((prev) => ({ ...prev, [postId]: "" }));
    setExpandedPost(null);
  };

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Peer Support</h1>
        <p className="text-muted-foreground">
          Share and connect with others in a supportive community
        </p>
      </div>

      <Card>
        <CardHeader>
          <h2 className="font-medium">Create a post</h2>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleCreatePost} className="space-y-3">
            <Textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="What's on your mind?"
              className="min-h-[100px]"
              disabled={createMutation.isPending}
            />
            <Button
              type="submit"
              disabled={!content.trim() || createMutation.isPending}
            >
              <Send className="mr-2 h-4 w-4" />
              Post
            </Button>
            {createMutation.isError && (
              <p className="text-sm text-destructive">
                {(createMutation.error as Error).message}
              </p>
            )}
          </form>
        </CardContent>
      </Card>

      <div>
        <h2 className="mb-4 font-medium">Feed</h2>
        {isLoading ? (
          <div className="space-y-4">
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-32 w-full" />
          </div>
        ) : posts.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12 text-center">
              <MessageCircle className="mb-2 h-12 w-12 text-muted-foreground" />
              <p className="text-muted-foreground">No posts yet. Be the first!</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {posts.map((post) => (
              <PostCard
                key={post.id}
                post={post}
                expanded={expandedPost === post.id}
                onExpand={() =>
                  setExpandedPost((p) => (p === post.id ? null : post.id))
                }
                replyContent={replyContent[post.id] ?? ""}
                onReplyContentChange={(v) =>
                  setReplyContent((prev) => ({ ...prev, [post.id]: v }))
                }
                onReply={() => handleReply(post.id)}
                isReplying={createMutation.isPending}
              />
            ))}
            <div className="flex justify-center gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={page <= 1}
                onClick={() => setPage((p) => p - 1)}
              >
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((p) => p + 1)}
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function PostCard({
  post,
  expanded,
  onExpand,
  replyContent,
  onReplyContentChange,
  onReply,
  isReplying,
}: {
  post: Post;
  expanded: boolean;
  onExpand: () => void;
  replyContent: string;
  onReplyContentChange: (v: string) => void;
  onReply: () => void;
  isReplying: boolean;
}) {
  const { data: replies = [] } = useQuery({
    queryKey: ["post-replies", post.id],
    queryFn: () => api.get<Reply[]>(`/community/posts/${post.id}/replies`),
    enabled: expanded,
  });

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <span className="font-medium text-foreground">
            {post.author?.full_name || post.author?.email || "Anonymous"}
          </span>
          <span>·</span>
          <span>{new Date(post.created_at).toLocaleString()}</span>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <p className="whitespace-pre-wrap">{post.content}</p>
        <Button variant="ghost" size="sm" onClick={onExpand}>
          {expanded ? "Hide replies" : "View replies"}
        </Button>
        {expanded && (
          <div className="space-y-3 border-t pt-3">
            <div className="flex gap-2">
              <Textarea
                value={replyContent}
                onChange={(e) => onReplyContentChange(e.target.value)}
                placeholder="Write a reply..."
                className="min-h-[60px]"
                disabled={isReplying}
              />
              <Button
                size="sm"
                onClick={onReply}
                disabled={!replyContent.trim() || isReplying}
              >
                Reply
              </Button>
            </div>
            <div className="space-y-2">
              {replies.map((r) => (
                <div
                  key={r.id}
                  className="rounded-lg border bg-muted/50 p-3 text-sm"
                >
                  <p className="font-medium">
                    {r.author?.full_name || r.author?.email || "Anonymous"}
                  </p>
                  <p className="text-muted-foreground">{r.content}</p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {new Date(r.created_at).toLocaleString()}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
