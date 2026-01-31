import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/services/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { Calendar, Users, MessageSquare, Video, Trash2 } from "lucide-react";

export default function AdminDashboardPage() {
  const [deleteTarget, setDeleteTarget] = useState<{
    type: string;
    id: string;
  } | null>(null);
  const queryClient = useQueryClient();

  interface BookingRow {
    id: string;
    student?: { full_name?: string; email?: string };
    consultant?: { full_name?: string; email?: string };
    slot_date: string;
    slot_time: string;
    status: string;
  }

  interface ConsultantRow {
    id: string;
    full_name?: string;
    email?: string;
  }

  interface PostRow {
    id: string;
    author?: { full_name?: string; email?: string };
    content: string;
    created_at: string;
  }

  interface VideoRow {
    id: string;
    title: string;
    category: string;
    language: string;
    enabled: boolean;
  }

  const { data: bookings = [], isLoading: bookingsLoading } = useQuery({
    queryKey: ["admin-bookings"],
    queryFn: () => api.get<BookingRow[]>("/admin/bookings"),
  });

  const { data: consultants = [] } = useQuery({
    queryKey: ["admin-consultants"],
    queryFn: () => api.get<ConsultantRow[]>("/admin/consultants"),
  });

  const { data: postsData } = useQuery({
    queryKey: ["admin-community-posts"],
    queryFn: () => api.get<{ posts: PostRow[] }>("/admin/community-posts"),
  });

  const { data: youtubeMetadata = [] } = useQuery({
    queryKey: ["admin-youtube-metadata"],
    queryFn: () => api.get<VideoRow[]>("/admin/youtube-metadata"),
  });

  const syncMutation = useMutation({
    mutationFn: () => api.post("/admin/youtube-metadata/sync", {}),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-youtube-metadata"] });
    },
  });

  const deleteBookingMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/admin/bookings/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-bookings"] });
      setDeleteTarget(null);
    },
  });

  const deletePostMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/admin/community-posts/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-community-posts"] });
      setDeleteTarget(null);
    },
  });

  const toggleVideoMutation = useMutation({
    mutationFn: async ({ id, enabled }: { id: string; enabled: boolean }) => {
      await api.patch(`/admin/youtube-metadata/${id}`, { enabled });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-youtube-metadata"] });
    },
  });

  const handleDelete = () => {
    if (!deleteTarget) return;
    if (deleteTarget.type === "booking") {
      deleteBookingMutation.mutate(deleteTarget.id);
    } else if (deleteTarget.type === "post") {
      deletePostMutation.mutate(deleteTarget.id);
    }
  };

  const posts = postsData?.posts ?? [];

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Admin Dashboard</h1>
        <p className="text-muted-foreground">
          Manage bookings, consultants, community, and resources
        </p>
      </div>

      <Tabs defaultValue="bookings">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="bookings" className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            Bookings
          </TabsTrigger>
          <TabsTrigger value="consultants" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Consultants
          </TabsTrigger>
          <TabsTrigger value="community" className="flex items-center gap-2">
            <MessageSquare className="h-4 w-4" />
            Community
          </TabsTrigger>
          <TabsTrigger value="resources" className="flex items-center gap-2">
            <Video className="h-4 w-4" />
            Resources
          </TabsTrigger>
        </TabsList>

        <TabsContent value="bookings" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>All Bookings</CardTitle>
            </CardHeader>
            <CardContent>
              {bookingsLoading ? (
                <Skeleton className="h-64 w-full" />
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Student</TableHead>
                      <TableHead>Consultant</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Time</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {bookings.map((b: { id: string; student?: { full_name?: string; email?: string }; consultant?: { full_name?: string; email?: string }; slot_date: string; slot_time: string; status: string }) => (
                      <TableRow key={b.id}>
                        <TableCell>
                          {b.student?.full_name || b.student?.email}
                        </TableCell>
                        <TableCell>
                          {b.consultant?.full_name || b.consultant?.email}
                        </TableCell>
                        <TableCell>
                          {new Date(b.slot_date).toLocaleDateString()}
                        </TableCell>
                        <TableCell>{b.slot_time}</TableCell>
                        <TableCell>
                          <Badge
                            variant={
                              b.status === "approved"
                                ? "success"
                                : b.status === "rejected"
                                  ? "destructive"
                                  : "secondary"
                            }
                          >
                            {b.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() =>
                              setDeleteTarget({ type: "booking", id: b.id })
                            }
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="consultants" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Consultants</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {consultants.map((c) => (
                    <TableRow key={c.id}>
                      <TableCell>{c.full_name || "-"}</TableCell>
                      <TableCell>{c.email}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="community" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Community Posts</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Author</TableHead>
                    <TableHead>Content</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {posts.map((p) => (
                    <TableRow key={p.id}>
                      <TableCell>
                        {p.author?.full_name || p.author?.email}
                      </TableCell>
                      <TableCell className="max-w-[300px] truncate">
                        {p.content}
                      </TableCell>
                      <TableCell>
                        {new Date(p.created_at).toLocaleString()}
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() =>
                            setDeleteTarget({ type: "post", id: p.id })
                          }
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="resources" className="mt-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>YouTube Video Metadata</CardTitle>
                <Button
                  onClick={() => syncMutation.mutate()}
                  disabled={syncMutation.isPending}
                >
                  {syncMutation.isPending ? "Syncing..." : "Sync from YouTube"}
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Title</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Language</TableHead>
                    <TableHead>Enabled</TableHead>
                    <TableHead></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {youtubeMetadata.map((v) => (
                    <TableRow key={v.id}>
                      <TableCell className="max-w-[200px] truncate">
                        {v.title}
                      </TableCell>
                      <TableCell>{v.category}</TableCell>
                      <TableCell>{v.language}</TableCell>
                      <TableCell>
                        <Badge variant={v.enabled ? "success" : "secondary"}>
                          {v.enabled ? "Yes" : "No"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() =>
                            toggleVideoMutation.mutate({
                              id: v.id,
                              enabled: !v.enabled,
                            })
                          }
                        >
                          {v.enabled ? "Disable" : "Enable"}
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <AlertDialog open={!!deleteTarget} onOpenChange={() => setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
