import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { bookingApi } from '@/services/api'
import { useAuth } from '@/hooks/useAuth'
import { Calendar, Clock, User, CheckCircle, XCircle, AlertCircle, Briefcase, ClipboardList } from 'lucide-react'

export default function BookConsultant() {
  const { user } = useAuth()
  const queryClient = useQueryClient()
  const [selectedConsultant, setSelectedConsultant] = useState<any>(null)
  const [bookingForm, setBookingForm] = useState({
    date: '',
    time: '',
    notes: '',
  })

  // Get consultants
  const { data: consultants, isLoading: consultantsLoading } = useQuery({
    queryKey: ['consultants'],
    queryFn: bookingApi.getConsultants,
  })

  // Get my bookings
  const { data: myBookings, isLoading: bookingsLoading } = useQuery({
    queryKey: ['myBookings'],
    queryFn: bookingApi.getMyBookings,
  })

  // Create booking mutation
  const createBooking = useMutation({
    mutationFn: bookingApi.createBooking,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['myBookings'] })
      setSelectedConsultant(null)
      setBookingForm({ date: '', time: '', notes: '' })
    },
  })

  // Update booking status (for consultants)
  const updateStatus = useMutation({
    mutationFn: ({ bookingId, status }: { bookingId: string; status: string }) =>
      bookingApi.updateBookingStatus(bookingId, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['myBookings'] })
    },
  })

  const handleBooking = async () => {
    if (!selectedConsultant || !bookingForm.date || !bookingForm.time) return

    await createBooking.mutateAsync({
      consultant_id: selectedConsultant.id,
      appointment_date: bookingForm.date,
      appointment_time: bookingForm.time,
      notes: bookingForm.notes,
    })
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved':
        return <CheckCircle className="h-5 w-5 text-green-500" />
      case 'rejected':
        return <XCircle className="h-5 w-5 text-red-500" />
      case 'completed':
        return <CheckCircle className="h-5 w-5 text-blue-500" />
      default:
        return <AlertCircle className="h-5 w-5 text-amber-500" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved':
        return 'bg-green-50 text-green-700 border-green-200'
      case 'rejected':
        return 'bg-red-50 text-red-700 border-red-200'
      case 'completed':
        return 'bg-blue-50 text-blue-700 border-blue-200'
      default:
        return 'bg-amber-50 text-amber-700 border-amber-200'
    }
  }

  const pendingCount = myBookings?.filter((item: any) => item.status === 'pending').length || 0
  const approvedCount = myBookings?.filter((item: any) => item.status === 'approved').length || 0
  const completedCount = myBookings?.filter((item: any) => item.status === 'completed').length || 0

  const pageTitle =
    user?.role === 'consultant'
      ? 'Consultant Booking Management'
      : user?.role === 'student'
        ? 'Student Booking'
        : 'Booking System'

  const consultantBookings = myBookings || []
  const rejectedCount = consultantBookings.filter((item: any) => item.status === 'rejected').length

  if (user?.role === 'consultant') {
    return (
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="rounded-2xl border bg-card p-6">
          <p className="text-xs font-medium uppercase tracking-[0.2em] text-muted-foreground">Booking Management</p>
          <h1 className="mt-2 text-3xl font-semibold">{pageTitle}</h1>
          <p className="mt-2 text-muted-foreground">
            Review student requests and update appointment status from one workspace.
          </p>
        </div>

        <div className="grid gap-4 grid-cols-2 md:grid-cols-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Total Requests</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-semibold">{consultantBookings.length}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Pending</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-semibold">{pendingCount}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Approved</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-semibold">{approvedCount}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Rejected</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-semibold">{rejectedCount}</p>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Appointment Requests</CardTitle>
            <CardDescription>Approve or reject pending student booking requests.</CardDescription>
          </CardHeader>
          <CardContent className="overflow-x-auto">
            {bookingsLoading ? (
              <div className="py-10 text-center text-muted-foreground">Loading requests...</div>
            ) : consultantBookings.length === 0 ? (
              <div className="py-10 text-center text-muted-foreground">No booking requests yet.</div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Student</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Time</TableHead>
                    <TableHead>Notes</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {consultantBookings.map((booking: any) => (
                    <TableRow key={booking.id}>
                      <TableCell className="font-medium">{booking.student_name || 'Student'}</TableCell>
                      <TableCell>{new Date(booking.appointment_date).toLocaleDateString()}</TableCell>
                      <TableCell>{booking.appointment_time}</TableCell>
                      <TableCell className="max-w-[280px] truncate">{booking.notes || '-'}</TableCell>
                      <TableCell>
                        <span className={`rounded-full border px-3 py-1 text-xs font-medium ${getStatusColor(booking.status)}`}>
                          {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                        </span>
                      </TableCell>
                      <TableCell>
                        <div className="flex justify-end gap-2">
                          {booking.status === 'pending' && (
                            <>
                              <Button
                                size="sm"
                                variant="outline"
                                className="border-green-200 text-green-700 hover:bg-green-50"
                                onClick={() => updateStatus.mutate({ bookingId: booking.id, status: 'approved' })}
                              >
                                Approve
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                className="border-red-200 text-red-700 hover:bg-red-50"
                                onClick={() => updateStatus.mutate({ bookingId: booking.id, status: 'rejected' })}
                              >
                                Reject
                              </Button>
                            </>
                          )}
                          {booking.status === 'approved' && (
                            <Button
                              size="sm"
                              variant="default"
                              className="bg-green-600 hover:bg-green-700 text-white"
                              onClick={() => updateStatus.mutate({ bookingId: booking.id, status: 'completed' })}
                            >
                              <CheckCircle className="mr-2 h-4 w-4" />
                              Complete Meeting
                            </Button>
                          )}
                          {['rejected', 'completed'].includes(booking.status) && (
                            <p className="text-right text-xs text-muted-foreground">No further action</p>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="rounded-2xl border bg-card p-6">
        <p className="text-xs font-medium uppercase tracking-[0.2em] text-muted-foreground">Booking System</p>
        <h1 className="mt-2 text-3xl font-semibold">{pageTitle}</h1>
        <p className="mt-2 text-muted-foreground">
          {user?.role === 'consultant'
            ? 'Review and manage incoming appointment requests efficiently.'
            : 'Find consultants, request sessions, and track your appointment status.'}
        </p>
      </div>

      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm">Pending</CardTitle>
            <AlertCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-semibold">{pendingCount}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm">Approved</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-semibold">{approvedCount}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm">Completed</CardTitle>
            <ClipboardList className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-semibold">{completedCount}</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="consultants" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="consultants">
            {user?.role === 'consultant' ? 'Available Consultants' : 'Find Consultants'}
          </TabsTrigger>
          <TabsTrigger value="bookings">
            {user?.role === 'consultant' ? 'Manage Requests' : 'My Bookings'}
          </TabsTrigger>
        </TabsList>

        {/* Consultants Tab */}
        <TabsContent value="consultants" className="mt-6">
          {consultantsLoading ? (
            <div className="text-center py-8">Loading consultants...</div>
          ) : (
            <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
              {consultants?.map((consultant: any) => (
                <Card key={consultant.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-center gap-3 mb-2">
                      <div className="h-12 w-12 rounded-full bg-gradient-to-br from-purple-500 to-indigo-500 flex items-center justify-center">
                        <User className="h-6 w-6 text-white" />
                      </div>
                      <div>
                        <CardTitle className="text-lg">{consultant.full_name}</CardTitle>
                        <p className="text-sm text-muted-foreground">
                          {consultant.specialization || 'Mental Health Consultant'}
                        </p>
                      </div>
                    </div>
                    <CardDescription>
                      {consultant.bio || 'Experienced mental health professional dedicated to helping you.'}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button className="w-full" onClick={() => setSelectedConsultant(consultant)}>
                          {user?.role === 'consultant' ? 'View Profile' : 'Book Appointment'}
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Book with {consultant.full_name}</DialogTitle>
                          <DialogDescription>
                            Schedule your consultation session
                          </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4 mt-4">
                          <div className="space-y-2">
                            <Label htmlFor="date">Preferred Date</Label>
                            <Input
                              id="date"
                              type="date"
                              value={bookingForm.date}
                              onChange={(e) =>
                                setBookingForm({ ...bookingForm, date: e.target.value })
                              }
                              min={new Date().toISOString().split('T')[0]}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="time">Preferred Time</Label>
                            <Input
                              id="time"
                              type="time"
                              value={bookingForm.time}
                              onChange={(e) =>
                                setBookingForm({ ...bookingForm, time: e.target.value })
                              }
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="notes">Notes (Optional)</Label>
                            <Textarea
                              id="notes"
                              placeholder="What would you like to discuss?"
                              value={bookingForm.notes}
                              onChange={(e) =>
                                setBookingForm({ ...bookingForm, notes: e.target.value })
                              }
                            />
                          </div>
                          <Button onClick={handleBooking} className="w-full" disabled={createBooking.isPending || !bookingForm.date || !bookingForm.time || user?.role === 'consultant'}>
                            {createBooking.isPending ? 'Booking...' : 'Confirm Booking'}
                          </Button>
                          {user?.role === 'consultant' && (
                            <p className="text-xs text-muted-foreground">
                              Consultant accounts cannot create booking requests.
                            </p>
                          )}
                        </div>
                      </DialogContent>
                    </Dialog>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        {/* My Bookings Tab */}
        <TabsContent value="bookings" className="mt-6">
          {bookingsLoading ? (
            <div className="text-center py-8">Loading your bookings...</div>
          ) : myBookings?.length === 0 ? (
            <Card className="p-8 text-center">
              <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">You don't have any bookings yet.</p>
            </Card>
          ) : (
            <div className="space-y-4">
              {myBookings?.map((booking: any) => (
                <Card key={booking.id}>
                  <CardContent className="pt-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <User className="h-5 w-5 text-muted-foreground" />
                          <span className="font-semibold">
                            {booking.consultant_name || 'Consultant'}
                          </span>
                        </div>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground mb-2">
                          <div className="flex items-center gap-1">
                            <Calendar className="h-4 w-4" />
                            {new Date(booking.appointment_date).toLocaleDateString()}
                          </div>
                          <div className="flex items-center gap-1">
                            <Clock className="h-4 w-4" />
                            {booking.appointment_time}
                          </div>
                        </div>
                        {booking.notes && (
                          <p className="text-sm text-muted-foreground mt-2">
                            <strong>Notes:</strong> {booking.notes}
                          </p>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        {getStatusIcon(booking.status)}
                        <span
                          className={`text-sm font-medium px-3 py-1 rounded-full border ${getStatusColor(
                            booking.status
                          )}`}
                        >
                          {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                        </span>
                      </div>
                    </div>

                    {/* Actions for consultants */}
                    {user?.role === 'consultant' && (
                      <div className="flex gap-2 mt-4 pt-4 border-t">
                        {booking.status === 'pending' && (
                          <>
                            <Button
                              size="sm"
                              variant="outline"
                              className="text-green-600 border-green-200 hover:bg-green-50"
                              onClick={() =>
                                updateStatus.mutate({ bookingId: booking.id, status: 'approved' })
                              }
                            >
                              Approve
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              className="text-red-600 border-red-200 hover:bg-red-50"
                              onClick={() =>
                                updateStatus.mutate({ bookingId: booking.id, status: 'rejected' })
                              }
                            >
                              Reject
                            </Button>
                          </>
                        )}
                        {booking.status === 'approved' && (
                          <Button
                            size="sm"
                            className="bg-green-600 hover:bg-green-700 text-white"
                            onClick={() =>
                              updateStatus.mutate({ bookingId: booking.id, status: 'completed' })
                            }
                          >
                            <CheckCircle className="mr-2 h-4 w-4" />
                            Mark as Completed
                          </Button>
                        )}
                      </div>
                    )}

                    {user?.role !== 'consultant' && (
                      <div className="mt-4 flex items-center gap-2 border-t pt-4 text-xs text-muted-foreground">
                        <Briefcase className="h-4 w-4" />
                        You’ll receive updates here when consultant status changes.
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
