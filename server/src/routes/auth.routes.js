import { Router } from "express";
import { supabase } from "../supabaseClient.js";
import { authenticate } from "../middleware/roleAuth.js";

const router = Router();

router.get("/profile", authenticate, async (req, res) => {
  try {
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", req.user.id)
      .single();
    if (error) throw error;
    if (!data) return res.status(404).json({ message: "Profile not found" });
    res.json(data);
  } catch (err) {
    res.status(500).json({ message: err.message || "Failed to fetch profile" });
  }
});

router.post("/register-profile", async (req, res) => {
  try {
    const { userId, email, fullName, role } = req.body;
    if (!userId || !email) {
      return res.status(400).json({ message: "userId and email required" });
    }
    const { error } = await supabase.from("profiles").upsert(
      {
        id: userId,
        email,
        full_name: fullName || null,
        role: role || "student",
        updated_at: new Date().toISOString(),
      },
      { onConflict: "id" }
    );
    if (error) throw error;
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ message: err.message || "Failed to create profile" });
  }
});

export default router;
