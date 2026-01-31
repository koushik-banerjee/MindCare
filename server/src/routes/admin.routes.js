import { Router } from "express";
import { supabase } from "../supabaseClient.js";
import { authMiddleware, requireRole } from "../middleware/roleAuth.js";

const router = Router();

router.use(authMiddleware);
router.use(requireRole("admin"));

router.get("/bookings", async (req, res) => {
  try {
    const { data, error } = await supabase
      .from("bookings")
      .select(`
        *,
        consultant:profiles!bookings_consultant_id_fkey(full_name, email),
        student:profiles!bookings_student_id_fkey(full_name, email)
      `)
      .order("slot_date", { ascending: false });
    if (error) throw error;
    res.json(data || []);
  } catch (err) {
    res.status(500).json({ message: err.message || "Failed to fetch bookings" });
  }
});

router.patch("/bookings/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const { error } = await supabase
      .from("bookings")
      .update({ status, updated_at: new Date().toISOString() })
      .eq("id", id);
    if (error) throw error;
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ message: err.message || "Update failed" });
  }
});

router.delete("/bookings/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { error } = await supabase.from("bookings").delete().eq("id", id);
    if (error) throw error;
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ message: err.message || "Delete failed" });
  }
});

router.get("/consultants", async (req, res) => {
  try {
    const { data, error } = await supabase
      .from("profiles")
      .select("id, full_name, email, role, created_at")
      .eq("role", "consultant");
    if (error) throw error;
    res.json(data || []);
  } catch (err) {
    res.status(500).json({ message: err.message || "Failed to fetch consultants" });
  }
});

router.get("/community-posts", async (req, res) => {
  try {
    const page = Math.max(1, Number(req.query.page) || 1);
    const from = (page - 1) * 20;
    const to = from + 19;
    const { data, error } = await supabase
      .from("community_posts")
      .select(`
        *,
        author:profiles!community_posts_author_id_fkey(full_name, email)
      `)
      .is("parent_id", null)
      .order("created_at", { ascending: false })
      .range(from, to);
    if (error) throw error;
    res.json({ posts: data || [], page });
  } catch (err) {
    res.status(500).json({ message: err.message || "Failed to fetch posts" });
  }
});

router.delete("/community-posts/:id", async (req, res) => {
  try {
    const { id } = req.params;
    await supabase.from("community_posts").delete().eq("parent_id", id);
    const { error } = await supabase.from("community_posts").delete().eq("id", id);
    if (error) throw error;
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ message: err.message || "Delete failed" });
  }
});

router.get("/youtube-metadata", async (req, res) => {
  try {
    const { data, error } = await supabase
      .from("youtube_video_metadata")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) throw error;
    res.json(data || []);
  } catch (err) {
    res.status(500).json({ message: err.message || "Failed to fetch metadata" });
  }
});

router.patch("/youtube-metadata/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { enabled } = req.body;
    const { error } = await supabase
      .from("youtube_video_metadata")
      .update({ enabled: !!enabled, updated_at: new Date().toISOString() })
      .eq("id", id);
    if (error) throw error;
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ message: err.message || "Update failed" });
  }
});

router.post("/youtube-metadata/sync", async (req, res) => {
  try {
    const YOUTUBE_API_KEY = process.env.YOUTUBE_API_KEY;
    if (!YOUTUBE_API_KEY) {
      return res.status(503).json({ message: "YouTube API not configured" });
    }

    const keywords = [
      "mental health wellness",
      "meditation for beginners",
      "stress relief",
      "anxiety coping",
      "mindfulness",
    ];

    const videos = [];
    for (const q of keywords) {
      const url = new URL("https://www.googleapis.com/youtube/v3/search");
      url.searchParams.set("part", "snippet");
      url.searchParams.set("q", q);
      url.searchParams.set("type", "video");
      url.searchParams.set("maxResults", "5");
      url.searchParams.set("key", YOUTUBE_API_KEY);

      const resp = await fetch(url.toString());
      const json = await resp.json();
      if (json.items) {
        for (const item of json.items) {
          videos.push({
            video_id: item.id.videoId,
            title: item.snippet.title,
            description: item.snippet.description || "",
            language: "en",
            category: q,
            enabled: true,
          });
        }
      }
    }

    for (const v of videos) {
      await supabase.from("youtube_video_metadata").upsert(v, {
        onConflict: "video_id",
      });
    }

    res.json({ success: true, synced: videos.length });
  } catch (err) {
    res.status(500).json({ message: err.message || "Sync failed" });
  }
});

export { router as adminRoutes };
