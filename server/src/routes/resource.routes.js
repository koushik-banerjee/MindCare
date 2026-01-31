import { Router } from "express";
import { supabase } from "../supabaseClient.js";
import { authMiddleware } from "../middleware/roleAuth.js";

const router = Router();
const YOUTUBE_API_KEY = process.env.YOUTUBE_API_KEY;

router.use(authMiddleware);

router.get("/videos", async (req, res) => {
  try {
    const { language, category, page = 1, limit = 12 } = req.query;

    let query = supabase
      .from("youtube_video_metadata")
      .select("*")
      .eq("enabled", true);

    if (language) query = query.eq("language", language);
    if (category) query = query.eq("category", category);

    const from = (Number(page) - 1) * Number(limit);
    const to = from + Number(limit) - 1;
    const { data, error } = await query.range(from, to).order("created_at", { ascending: false });

    if (error) throw error;
    res.json(data || []);
  } catch (err) {
    res.status(500).json({ message: err.message || "Failed to fetch videos" });
  }
});

router.get("/search", async (req, res) => {
  try {
    const { q, language = "en", maxResults = 12 } = req.query;
    if (!YOUTUBE_API_KEY) {
      return res.status(503).json({
        message: "YouTube API not configured. Add YOUTUBE_API_KEY to server env.",
      });
    }
    if (!q) {
      return res.status(400).json({ message: "Query q required" });
    }

    const searchQuery = `${q} mental health wellness meditation stress relief`;
    const url = new URL("https://www.googleapis.com/youtube/v3/search");
    url.searchParams.set("part", "snippet");
    url.searchParams.set("q", searchQuery);
    url.searchParams.set("type", "video");
    url.searchParams.set("maxResults", String(Math.min(Number(maxResults), 25)));
    url.searchParams.set("relevanceLanguage", String(language));
    url.searchParams.set("key", YOUTUBE_API_KEY);

    const resp = await fetch(url.toString());
    const json = await resp.json();
    if (json.error) throw new Error(json.error.message || "YouTube API error");

    const videos = (json.items || []).map((item) => ({
      videoId: item.id.videoId,
      title: item.snippet.title,
      description: item.snippet.description,
      thumbnailUrl: item.snippet.thumbnails?.medium?.url,
      publishedAt: item.snippet.publishedAt,
    }));

    res.json(videos);
  } catch (err) {
    res.status(500).json({ message: err.message || "Search failed" });
  }
});

router.get("/categories", async (req, res) => {
  try {
    const { data, error } = await supabase
      .from("youtube_video_metadata")
      .select("category")
      .eq("enabled", true);
    if (error) throw error;
    const categories = [...new Set((data || []).map((r) => r.category).filter(Boolean))];
    res.json(categories.sort());
  } catch (err) {
    res.status(500).json({ message: err.message || "Failed to fetch categories" });
  }
});

router.get("/languages", async (req, res) => {
  try {
    const { data, error } = await supabase
      .from("youtube_video_metadata")
      .select("language")
      .eq("enabled", true);
    if (error) throw error;
    const languages = [...new Set((data || []).map((r) => r.language).filter(Boolean))];
    res.json(languages.sort());
  } catch (err) {
    res.status(500).json({ message: err.message || "Failed to fetch languages" });
  }
});

export { router as resourceRoutes };
