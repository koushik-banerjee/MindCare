import { Router } from "express";
import { supabase } from "../supabaseClient.js";
import { authMiddleware } from "../middleware/roleAuth.js";
import { requireRole } from "../middleware/roleAuth.js";

const router = Router();

router.use(authMiddleware);

router.get("/consultants", async (req, res) => {
  try {
    const { data, error } = await supabase
      .from("profiles")
      .select("id, full_name, email")
      .eq("role", "consultant");
    if (error) throw error;
    res.json(data || []);
  } catch (err) {
    res.status(500).json({ message: err.message || "Failed to fetch consultants" });
  }
});

router.get("/availability/:consultantId", async (req, res) => {
  try {
    const { consultantId } = req.params;
    const { data, error } = await supabase
      .from("availability")
      .select("*")
      .eq("consultant_id", consultantId)
      .gte("slot_date", new Date().toISOString().split("T")[0]);
    if (error) throw error;
    res.json(data || []);
  } catch (err) {
    res.status(500).json({ message: err.message || "Failed to fetch availability" });
  }
});

router.get("/my-bookings", async (req, res) => {
  try {
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", req.user.id)
      .single();
    const role = profile?.role ?? "student";

    let query = supabase.from("bookings").select(`
      *,
      consultant:profiles!bookings_consultant_id_fkey(full_name, email),
      student:profiles!bookings_student_id_fkey(full_name, email)
    `);

    if (role === "student") {
      query = query.eq("student_id", req.user.id);
    } else if (role === "consultant") {
      query = query.eq("consultant_id", req.user.id);
    }

    const { data, error } = await query.order("slot_date", { ascending: true });
    if (error) throw error;
    res.json(data || []);
  } catch (err) {
    res.status(500).json({ message: err.message || "Failed to fetch bookings" });
  }
});

router.post("/book", async (req, res) => {
  try {
    const { consultantId, slotDate, slotTime } = req.body;
    if (!consultantId || !slotDate || !slotTime) {
      return res.status(400).json({ message: "consultantId, slotDate, slotTime required" });
    }

    const { error } = await supabase.from("bookings").insert({
      student_id: req.user.id,
      consultant_id: consultantId,
      slot_date: slotDate,
      slot_time: slotTime,
      status: "pending",
    });
    if (error) throw error;
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ message: err.message || "Booking failed" });
  }
});

router.patch("/:bookingId/status", requireRole("consultant", "admin"), async (req, res) => {
  try {
    const { bookingId } = req.params;
    const { status } = req.body;
    if (!["approved", "rejected"].includes(status)) {
      return res.status(400).json({ message: "status must be approved or rejected" });
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", req.user.id)
      .single();
    const role = profile?.role ?? "student";

    let query = supabase
      .from("bookings")
      .update({ status, updated_at: new Date().toISOString() })
      .eq("id", bookingId);

    if (role === "consultant") {
      query = query.eq("consultant_id", req.user.id);
    }

    const { error } = await query;
    if (error) throw error;
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ message: err.message || "Update failed" });
  }
});

export { router as bookingRoutes };
