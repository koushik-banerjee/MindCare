import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { adminApi, resourceApi } from '@/services/api'
import { Users, Calendar, BookOpen, Trash2 } from 'lucide-react'
import { VideoUploadOverlay } from '@/components/VideoUploadOverlay'


export default function AdminDashboard() {
  const queryClient = useQueryClient()

  const { data: allBookings, isLoading: bookingsLoading } = useQuery({
    queryKey: ['adminBookings'],
    queryFn: adminApi.getAllBookings,
  })

  const { data: allUsers, isLoading: usersLoading } = useQuery({
    queryKey: ['adminUsers'],
    queryFn: adminApi.getAllUsers,
  })

  const { data: resources, isLoading: resourcesLoading } = useQuery({
    queryKey: ['adminResources'],
    queryFn: () => resourceApi.getResources({}),
  })

  const updateUserRole = useMutation({
    mutationFn: ({ userId, role }: { userId: string; role: string }) =>
      adminApi.updateUserRole(userId, role),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['adminUsers'] }),
  })

  const deleteResource = useMutation({
    mutationFn: resourceApi.deleteResource,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['adminResources'] }),
  })

  const consultantCount = allUsers?.filter((item: any) => item.role === 'consultant').length || 0
  const activeBookings = allBookings?.filter((item: any) => ['pending', 'approved'].includes(item.status)).length || 0

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      pending: 'bg-amber-100 text-amber-800',
      approved: 'bg-emerald-100 text-emerald-800',
      rejected: 'bg-rose-100 text-rose-800',
      completed: 'bg-cyan-100 text-cyan-800',
    }

    return (
      <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${styles[status] || 'bg-slate-100 text-slate-800'}`}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    )
  }


  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="rounded-2xl border bg-white p-6">
        <p className="text-xs font-medium uppercase tracking-[0.2em] text-muted-foreground">Administration</p>
        <h1 className="mt-2 text-3xl font-semibold">Admin Dashboard</h1>
        <p className="mt-2 text-muted-foreground">
          Monitor platform performance, manage users, and keep resources up to date.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-semibold">{allUsers?.length || 0}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Bookings</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-semibold">{activeBookings}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Consultants</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-semibold">{consultantCount}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Resources</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-semibold">{resources?.length || 0}</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.2fr_1fr]">
        <Card>
          <CardHeader>
            <CardTitle>Booking Oversight</CardTitle>
            <CardDescription>Track student-consultant appointment status.</CardDescription>
          </CardHeader>
          <CardContent>
            {bookingsLoading ? (
              <div className="py-8 text-center">Loading bookings...</div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Student</TableHead>
                    <TableHead>Consultant</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {allBookings?.map((booking: any) => (
                    <TableRow key={booking.id}>
                      <TableCell>{booking.student_name || 'Unknown'}</TableCell>
                      <TableCell>{booking.consultant_name || 'Unknown'}</TableCell>
                      <TableCell>{new Date(booking.appointment_date).toLocaleDateString()}</TableCell>
                      <TableCell>{getStatusBadge(booking.status)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>User Management</CardTitle>
            <CardDescription>Update user roles and permissions.</CardDescription>
          </CardHeader>
          <CardContent>
            {usersLoading ? (
              <div className="py-8 text-center">Loading users...</div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>User</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Update</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {allUsers?.slice(0, 12).map((user: any) => (
                    <TableRow key={user.id}>
                      <TableCell>
                        <p className="font-medium">{user.full_name || 'N/A'}</p>
                        <p className="text-xs text-muted-foreground">{user.email}</p>
                      </TableCell>
                      <TableCell>
                        <span className="rounded-full bg-primary/10 px-2 py-1 text-xs font-medium text-primary">
                          {user.role}
                        </span>
                      </TableCell>
                      <TableCell>
                        <select
                          className="h-9 rounded-md border border-input bg-background px-2 text-sm"
                          value={user.role}
                          onChange={(e) =>
                            updateUserRole.mutate({ userId: user.id, role: e.target.value })
                          }
                        >
                          <option value="student">Student</option>
                          <option value="consultant">Consultant</option>
                          <option value="admin">Admin</option>
                        </select>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0">
          <div>
            <CardTitle>Resource Library</CardTitle>
            <CardDescription>Moderate uploaded learning resources.</CardDescription>
          </div>
          <VideoUploadOverlay />
        </CardHeader>

        <CardContent>
          {resourcesLoading ? (
            <div className="py-8 text-center">Loading resources...</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Language</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead className="text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {resources?.map((resource: any) => (
                  <TableRow key={resource.id}>
                    <TableCell className="max-w-xs truncate">{resource.title}</TableCell>
                    <TableCell>{resource.media_type}</TableCell>
                    <TableCell>{resource.language}</TableCell>
                    <TableCell>{new Date(resource.created_at).toLocaleDateString()}</TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => deleteResource.mutate(resource.id)}
                        className="text-destructive hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
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
