import test from 'node:test'
import assert from 'node:assert/strict'
import http from 'node:http'

process.env.SUPABASE_URL = process.env.SUPABASE_URL || 'https://example.supabase.co'
process.env.SUPABASE_SERVICE_ROLE_KEY =
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJ0ZXN0In0.signature'

const buildUserQueryMock = (role) => ({
  select: () => ({
    eq: () => ({
      single: async () => ({
        data: {
          id: '550e8400-e29b-41d4-a716-446655440001',
          role,
          full_name: 'Test User',
        },
        error: null,
      }),
    }),
  }),
})

const buildUsersTableMock = ({ role = 'admin', updatedRole = 'consultant' } = {}) => ({
  select: () => ({
    eq: () => ({
      single: async () => ({
        data: {
          id: '550e8400-e29b-41d4-a716-446655440001',
          role,
          full_name: 'Test User',
        },
        error: null,
      }),
    }),
  }),
  update: () => ({
    eq: () => ({
      select: () => ({
        single: async () => ({
          data: {
            id: '550e8400-e29b-41d4-a716-446655440099',
            role: updatedRole,
          },
          error: null,
        }),
      }),
    }),
  }),
})

const buildBookingStatusFlowMock = ({
  authRole = 'consultant',
  userId = '550e8400-e29b-41d4-a716-446655440001',
  bookingStatus = 'approved',
  updatedStatus = 'completed',
} = {}) => ({
  select: () => ({
    eq: () => ({
      single: async () => ({
        data: {
          id: userId,
          role: authRole,
          full_name: 'Flow Tester',
        },
        error: null,
      }),
    }),
  }),
  update: () => ({
    eq: () => ({
      select: () => ({
        single: async () => ({
          data: {
            id: '550e8400-e29b-41d4-a716-446655440050',
            status: updatedStatus,
          },
          error: null,
        }),
      }),
    }),
  }),
})

const buildBookingsTableMock = ({
  bookingConsultantId = '550e8400-e29b-41d4-a716-446655440001',
  bookingStatus = 'approved',
  updatedStatus = 'completed',
} = {}) => ({
  select: () => ({
    eq: () => ({
      single: async () => ({
        data: {
          consultant_id: bookingConsultantId,
          status: bookingStatus,
        },
        error: null,
      }),
    }),
  }),
  update: () => ({
    eq: () => ({
      select: () => ({
        single: async () => ({
          data: {
            id: '550e8400-e29b-41d4-a716-446655440123',
            status: updatedStatus,
          },
          error: null,
        }),
      }),
    }),
  }),
})

const startTestServer = async () => {
  const { supabase } = await import('../src/supabaseClient.js')
  const originalGetUser = supabase.auth.getUser
  const originalFrom = supabase.from
  const { default: app } = await import('../src/index.js')
  const server = http.createServer(app)
  await new Promise((resolve) => server.listen(0, resolve))
  return { server, supabase, originalGetUser, originalFrom }
}

const stopTestServer = async (server) => {
  await new Promise((resolve) => server.close(resolve))
}

test('GET /api/admin/users returns 401 without auth token', async () => {
  const { server } = await startTestServer()
  try {
    const { port } = server.address()
    const response = await fetch(`http://127.0.0.1:${port}/api/admin/users`)

    assert.equal(response.status, 401)
  } finally {
    await stopTestServer(server)
  }
})

test('GET /api/admin/users returns 403 for non-admin user', async () => {
  const { server, supabase, originalGetUser, originalFrom } = await startTestServer()
  supabase.auth.getUser = async () => ({
    data: { user: { id: '550e8400-e29b-41d4-a716-446655440001' } },
    error: null,
  })
  supabase.from = () => buildUserQueryMock('student')

  try {
    const { port } = server.address()
    const response = await fetch(`http://127.0.0.1:${port}/api/admin/users`, {
      headers: { Authorization: 'Bearer valid-token' },
    })

    assert.equal(response.status, 403)
  } finally {
    supabase.auth.getUser = originalGetUser
    supabase.from = originalFrom
    await stopTestServer(server)
  }
})

test('POST /api/booking/create returns 403 for consultant role', async () => {
  const { server, supabase, originalGetUser, originalFrom } = await startTestServer()
  supabase.auth.getUser = async () => ({
    data: { user: { id: '550e8400-e29b-41d4-a716-446655440001' } },
    error: null,
  })
  supabase.from = () => buildUserQueryMock('consultant')

  try {
    const { port } = server.address()
    const response = await fetch(`http://127.0.0.1:${port}/api/booking/create`, {
      method: 'POST',
      headers: {
        Authorization: 'Bearer valid-token',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        consultant_id: '550e8400-e29b-41d4-a716-446655440000',
        appointment_date: '2026-05-01',
        appointment_time: '10:30',
      }),
    })

    assert.equal(response.status, 403)
  } finally {
    supabase.auth.getUser = originalGetUser
    supabase.from = originalFrom
    await stopTestServer(server)
  }
})

test('PATCH /api/admin/users/:userId/role returns 200 for admin with valid role', async () => {
  const { server, supabase, originalGetUser, originalFrom } = await startTestServer()
  supabase.auth.getUser = async () => ({
    data: { user: { id: '550e8400-e29b-41d4-a716-446655440001' } },
    error: null,
  })
  supabase.from = (table) => {
    if (table === 'users') {
      return buildUsersTableMock({ role: 'admin', updatedRole: 'consultant' })
    }
    return originalFrom(table)
  }

  try {
    const { port } = server.address()
    const response = await fetch(
      `http://127.0.0.1:${port}/api/admin/users/550e8400-e29b-41d4-a716-446655440099/role`,
      {
        method: 'PATCH',
        headers: {
          Authorization: 'Bearer valid-token',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ role: 'consultant' }),
      }
    )
    const body = await response.json()

    assert.equal(response.status, 200)
    assert.equal(body.role, 'consultant')
  } finally {
    supabase.auth.getUser = originalGetUser
    supabase.from = originalFrom
    await stopTestServer(server)
  }
})

test('PATCH /api/admin/users/:userId/role returns 400 for invalid role', async () => {
  const { server, supabase, originalGetUser, originalFrom } = await startTestServer()
  supabase.auth.getUser = async () => ({
    data: { user: { id: '550e8400-e29b-41d4-a716-446655440001' } },
    error: null,
  })
  supabase.from = (table) => {
    if (table === 'users') {
      return buildUsersTableMock({ role: 'admin' })
    }
    return originalFrom(table)
  }

  try {
    const { port } = server.address()
    const response = await fetch(
      `http://127.0.0.1:${port}/api/admin/users/550e8400-e29b-41d4-a716-446655440099/role`,
      {
        method: 'PATCH',
        headers: {
          Authorization: 'Bearer valid-token',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ role: 'owner' }),
      }
    )
    const body = await response.json()

    assert.equal(response.status, 400)
    assert.equal(body.error, 'Invalid role')
  } finally {
    supabase.auth.getUser = originalGetUser
    supabase.from = originalFrom
    await stopTestServer(server)
  }
})

test('PATCH /api/booking/:bookingId/status returns 400 when completed without approved state', async () => {
  const { server, supabase, originalGetUser, originalFrom } = await startTestServer()
  supabase.auth.getUser = async () => ({
    data: { user: { id: '550e8400-e29b-41d4-a716-446655440001' } },
    error: null,
  })
  supabase.from = (table) => {
    if (table === 'users') {
      return buildBookingStatusFlowMock({
        authRole: 'consultant',
        userId: '550e8400-e29b-41d4-a716-446655440001',
      })
    }
    if (table === 'bookings') {
      return buildBookingsTableMock({
        bookingConsultantId: '550e8400-e29b-41d4-a716-446655440001',
        bookingStatus: 'pending',
      })
    }
    return originalFrom(table)
  }

  try {
    const { port } = server.address()
    const response = await fetch(
      `http://127.0.0.1:${port}/api/booking/550e8400-e29b-41d4-a716-446655440123/status`,
      {
        method: 'PATCH',
        headers: {
          Authorization: 'Bearer valid-token',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: 'completed' }),
      }
    )
    const body = await response.json()

    assert.equal(response.status, 400)
    assert.equal(body.error, 'Only approved bookings can be marked as completed')
  } finally {
    supabase.auth.getUser = originalGetUser
    supabase.from = originalFrom
    await stopTestServer(server)
  }
})

test('PATCH /api/booking/:bookingId/status returns 403 for non-owner consultant', async () => {
  const { server, supabase, originalGetUser, originalFrom } = await startTestServer()
  supabase.auth.getUser = async () => ({
    data: { user: { id: '550e8400-e29b-41d4-a716-446655440001' } },
    error: null,
  })
  supabase.from = (table) => {
    if (table === 'users') {
      return buildBookingStatusFlowMock({
        authRole: 'consultant',
        userId: '550e8400-e29b-41d4-a716-446655440001',
      })
    }
    if (table === 'bookings') {
      return buildBookingsTableMock({
        bookingConsultantId: '550e8400-e29b-41d4-a716-446655440777',
        bookingStatus: 'approved',
      })
    }
    return originalFrom(table)
  }

  try {
    const { port } = server.address()
    const response = await fetch(
      `http://127.0.0.1:${port}/api/booking/550e8400-e29b-41d4-a716-446655440123/status`,
      {
        method: 'PATCH',
        headers: {
          Authorization: 'Bearer valid-token',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: 'approved' }),
      }
    )
    const body = await response.json()

    assert.equal(response.status, 403)
    assert.equal(body.error, 'Not authorized to update this booking')
  } finally {
    supabase.auth.getUser = originalGetUser
    supabase.from = originalFrom
    await stopTestServer(server)
  }
})

test('PATCH /api/booking/:bookingId/status returns 200 for owner consultant on valid transition', async () => {
  const { server, supabase, originalGetUser, originalFrom } = await startTestServer()
  supabase.auth.getUser = async () => ({
    data: { user: { id: '550e8400-e29b-41d4-a716-446655440001' } },
    error: null,
  })
  supabase.from = (table) => {
    if (table === 'users') {
      return buildBookingStatusFlowMock({
        authRole: 'consultant',
        userId: '550e8400-e29b-41d4-a716-446655440001',
      })
    }
    if (table === 'bookings') {
      return buildBookingsTableMock({
        bookingConsultantId: '550e8400-e29b-41d4-a716-446655440001',
        bookingStatus: 'approved',
        updatedStatus: 'completed',
      })
    }
    return originalFrom(table)
  }

  try {
    const { port } = server.address()
    const response = await fetch(
      `http://127.0.0.1:${port}/api/booking/550e8400-e29b-41d4-a716-446655440123/status`,
      {
        method: 'PATCH',
        headers: {
          Authorization: 'Bearer valid-token',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: 'completed' }),
      }
    )
    const body = await response.json()

    assert.equal(response.status, 200)
    assert.equal(body.status, 'completed')
  } finally {
    supabase.auth.getUser = originalGetUser
    supabase.from = originalFrom
    await stopTestServer(server)
  }
})
