import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { api } from "@/services/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Calendar, Clock } from "lucide-react";

interface Consultant {
  id: string;
  full_name: string | null;
  email: string;
}

interface Availability {
  id: string;
  slot_date: string;
  slot_time: string;
}

interface Booking {
  id: string;
  consultant_id: string;
  slot_date: string;
  slot_time: string;
  status: string;
  consultant?: { full_name: string | null; email: string };
  student?: { full_name: string | null; email: string };
}

export default function BookConsultantPage() {
  const { user, profile } = useAuth();
  const [consultantId, setConsultantId] = useState<string>("");
  const [slotDate, setSlotDate] = useState<string>("");
  const [slotTime, setSlotTime] = useState<string>("");
  const queryClient = useQueryClient();

  const { data: consultants = [], isLoading: consultantsLoading } = useQuery({
    queryKey: ["consultants"],
    queryFn: () => api.get<Consultant[]>("/booking/consultants"),
  });

  const { data: availability = [], isLoading: availabilityLoading } = useQuery({
    queryKey: ["availability", consultantId],
    queryFn: () => api.get<Availability[]>(`/booking/availability/${consultantId}`),
    enabled: !!consultantId,
  });

  const { data: bookings = [], isLoading: bookingsLoading } = useQuery({
    queryKey: ["my-bookings"],
    queryFn: async () => {
      const data = await api.get<Booking[]>("/booking/my-bookings");
      return Array.isArray(data) ? data : [];
    },
  });

  const bookMutation = useMutation({
    mutationFn: async () => {
      await api.post("/booking/book", {
        consultantId,
        slotDate,
        slotTime,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["my-bookings"] });
      setConsultantId("");
      setSlotDate("");
      setSlotTime("");
    },
  });

  const statusMutation = useMutation({
    mutationFn: async ({
      bookingId,
      status,
    }: {
      bookingId: string;
      status: string;
    }) => {
      await api.patch(`/booking/${bookingId}/status`, { status });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["my-bookings"] });
    },
  });

  const handleBook = (e: React.FormEvent) => {
    e.preventDefault();
    if (!consultantId || !slotDate || !slotTime) return;
    bookMutation.mutate();
  };

  const dates = [...new Set(availability.map((a) => a.slot_date))].sort();
  const times = slotDate
    ? availability
        .filter((a) => a.slot_date === slotDate)
        .map((a) => a.slot_time)
        .sort()
    : [];

  return (
    <div className="mx-auto max-w-4xl space-y-8">
      <div>
        <h1 className="text-2xl font-semibold">Book a Consultant</h1>
        <p className="text-muted-foreground">
          Schedule an appointment with a mental wellness consultant
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>New Booking</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleBook} className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Consultant</label>
                <Select
                  value={consultantId}
                  onValueChange={(v) => {
                    setConsultantId(v);
                    setSlotDate("");
                    setSlotTime("");
                  }}
                  disabled={consultantsLoading}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select consultant" />
                  </SelectTrigger>
                  <SelectContent>
                    {consultants.map((c) => (
                      <SelectItem key={c.id} value={c.id}>
                        {c.full_name || c.email}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Date</label>
                <Select
                  value={slotDate}
                  onValueChange={(v) => {
                    setSlotDate(v);
                    setSlotTime("");
                  }}
                  disabled={!consultantId || availabilityLoading}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select date" />
                  </SelectTrigger>
                  <SelectContent>
                    {dates.map((d) => (
                      <SelectItem key={d} value={d}>
                        {new Date(d).toLocaleDateString()}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Time</label>
                <Select
                  value={slotTime}
                  onValueChange={setSlotTime}
                  disabled={!slotDate}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select time" />
                  </SelectTrigger>
                  <SelectContent>
                    {times.map((t) => (
                      <SelectItem key={t} value={t}>
                        {t}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <Button
                type="submit"
                className="w-full"
                disabled={
                  !consultantId || !slotDate || !slotTime || bookMutation.isPending
                }
              >
                {bookMutation.isPending ? "Booking..." : "Book Appointment"}
              </Button>
              {bookMutation.isError && (
                <p className="text-sm text-destructive">
                  {(bookMutation.error as Error).message}
                </p>
              )}
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>My Bookings</CardTitle>
          </CardHeader>
          <CardContent>
            {bookingsLoading ? (
              <Skeleton className="h-32 w-full" />
            ) : bookings.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                No bookings yet. Book an appointment above.
              </p>
            ) : (
              <div className="space-y-3">
                {bookings.map((b) => (
                  <div
                    key={b.id}
                    className="flex items-center justify-between rounded-lg border p-3"
                  >
                    <div>
                      <p className="font-medium">
                        {b.consultant?.full_name || b.consultant?.email}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        <Calendar className="mr-1 inline h-3 w-3" />
                        {new Date(b.slot_date).toLocaleDateString()}{" "}
                        <Clock className="ml-2 mr-1 inline h-3 w-3" />
                        {b.slot_time}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
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
                      {b.status === "pending" &&
                        profile?.role === "consultant" &&
                        b.consultant_id === user?.id && (
                          <div className="flex gap-1">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() =>
                                statusMutation.mutate({
                                  bookingId: b.id,
                                  status: "approved",
                                })
                              }
                            >
                              Approve
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() =>
                                statusMutation.mutate({
                                  bookingId: b.id,
                                  status: "rejected",
                                })
                              }
                            >
                              Reject
                            </Button>
                          </div>
                        )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
