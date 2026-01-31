import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/services/api";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import type { YouTubeVideo } from "@/services/youtube";

export default function ResourceHubPage() {
  const [language, setLanguage] = useState<string>("all");
  const [category, setCategory] = useState<string>("all");

  const { data: videos = [], isLoading } = useQuery({
    queryKey: ["resource-videos", language, category],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (language !== "all") params.set("language", language);
      if (category !== "all") params.set("category", category);
      const qs = params.toString();
      return api.get<YouTubeVideo[]>(`/resources/videos${qs ? `?${qs}` : ""}`);
    },
  });

  const { data: categories = [] } = useQuery({
    queryKey: ["resource-categories"],
    queryFn: () => api.get<string[]>("/resources/categories"),
  });

  const { data: languages = [] } = useQuery({
    queryKey: ["resource-languages"],
    queryFn: () => api.get<string[]>("/resources/languages"),
  });

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Resource Hub</h1>
        <p className="text-muted-foreground">
          Wellness videos to support your mental health journey
        </p>
      </div>

      <div className="flex flex-wrap gap-4">
        <Select value={language} onValueChange={setLanguage}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Language" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Languages</SelectItem>
            {languages.map((l) => (
              <SelectItem key={l} value={l}>
                {l === "en" ? "English" : l === "hi" ? "Hindi" : l}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={category} onValueChange={setCategory}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {categories.map((c) => (
              <SelectItem key={c} value={c}>
                {c}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {isLoading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-64" />
          ))}
        </div>
      ) : videos.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12 text-center">
            <p className="text-muted-foreground">
              No videos found. Admin can sync videos from YouTube.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {videos.map((v) => {
            const vid = v.videoId ?? v.video_id ?? "";
            return (
            <Card key={vid} className="overflow-hidden">
              <div className="aspect-video w-full">
                <iframe
                  src={`https://www.youtube.com/embed/${vid}`}
                  title={v.title}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  className="h-full w-full"
                />
              </div>
              <CardHeader className="p-4">
                <div className="flex flex-wrap gap-1">
                  <Badge variant="secondary">{v.language}</Badge>
                  <Badge variant="outline">{v.category}</Badge>
                </div>
                <h3 className="mt-2 line-clamp-2 font-medium">{v.title}</h3>
                <p className="line-clamp-2 text-sm text-muted-foreground">
                  {v.description}
                </p>
              </CardHeader>
            </Card>
          );
          })}
        </div>
      )}
    </div>
  );
}
