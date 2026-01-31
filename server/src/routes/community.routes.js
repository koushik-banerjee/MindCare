import { Router } from "express";
import { supabase } from "../supabaseClient.js";
import { authMiddleware } from "../middleware/roleAuth.js";

const router = Router();
const PAGE_SIZE = 10;

router.use(authMiddleware);

router.get("/posts", async (req, res) => {
  try {
    const page = Math.max(1, Number(req.query.page) || 1);
    const from = (page - 1) * PAGE_SIZE;
    const to = from + PAGE_SIZE - 1;

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
    res.json({ posts: data || [], page, pageSize: PAGE_SIZE });
  } catch (err) {
    res.status(500).json({ message: err.message || "Failed to fetch posts" });
  }
});

router.get("/posts/:postId/replies", async (req, res) => {
  try {
    const { postId } = req.params;
    const { data, error } = await supabase
      .from("community_posts")
      .select(`
        *,
        author:profiles!community_posts_author_id_fkey(full_name, email)
      `)
      .eq("parent_id", postId)
      .order("created_at", { ascending: true });

    if (error) throw error;
    res.json(data || []);
  } catch (err) {
    res.status(500).json({ message: err.message || "Failed to fetch replies" });
  }
});

router.post("/posts", async (req, res) => {
  try {
    const { content, parentId } = req.body;
    if (!content?.trim()) {
      return res.status(400).json({ message: "content required" });
    }

    const { data, error } = await supabase
      .from("community_posts")
      .insert({
        author_id: req.user.id,
        content: content.trim(),
        parent_id: parentId || null,
      })
      .select()
      .single();

    if (error) throw error;
    res.json(data);
  } catch (err) {
    res.status(500).json({ message: err.message || "Failed to create post" });
  }
});

router.delete("/posts/:postId", async (req, res) => {
  try {
    const { postId } = req.params;
    const { data: post } = await supabase
      .from("community_posts")
      .select("author_id")
      .eq("id", postId)
      .single();

    if (!post) return res.status(404).json({ message: "Post not found" });

    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", req.user.id)
      .single();
    const role = profile?.role ?? "student";

    const canDelete = post.author_id === req.user.id || role === "admin";
    if (!canDelete) {
      return res.status(403).json({ message: "Forbidden" });
    }

    await supabase.from("community_posts").delete().eq("parent_id", postId);
    const { error } = await supabase.from("community_posts").delete().eq("id", postId);
    if (error) throw error;
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ message: err.message || "Failed to delete post" });
  }
});

export { router as communityRoutes };
