export interface YouTubeVideo {
  videoId?: string;
  video_id?: string;
  title: string;
  description: string;
  thumbnailUrl?: string;
  language: string;
  category: string;
  publishedAt?: string;
  enabled?: boolean;
}

export interface YouTubeSearchParams {
  query?: string;
  language?: string;
  category?: string;
  page?: number;
  limit?: number;
}
