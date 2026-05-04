import { supabase } from './supabase'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api'

// Generic API call helper
async function apiCall<T>(
  endpoint: string,
  options?: RequestInit
): Promise<T> {
  const { data: { session } } = await supabase.auth.getSession()

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(session?.access_token && {
      Authorization: `Bearer ${session.access_token}`,
    }),
    ...Object.fromEntries(
      Object.entries(options?.headers || {}).filter(([_, v]) => v !== undefined)
    ) as any,
  }

  // Remove Content-Type if explicitly set to undefined in options to let fetch set it (e.g. for FormData)
  if (options?.headers && (options.headers as any)['Content-Type'] === undefined) {
    delete headers['Content-Type']
  }

  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers,
  })

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: response.statusText }))
    throw new Error(error.message || 'API request failed')
  }

  return response.json()
}

// Chat API
export const chatApi = {
  sendMessage: (message: string) =>
    apiCall<{
      acknowledgment: string;
      empathyStatement: string;
      suggestions: string[];
      followUpQuestion: string;
      moodAnalysis: string;
      isCrisis: boolean;
      conversationId: string
    }>('/chat/send', {
      method: 'POST',
      body: JSON.stringify({ message }),
    }),

  getConversations: () =>
    apiCall<any[]>('/chat/conversations', {
      method: 'GET',
    }),
}

// Booking API
export const bookingApi = {
  getConsultants: () =>
    apiCall<any[]>('/booking/consultants', {
      method: 'GET',
    }),

  createBooking: (booking: any) =>
    apiCall<any>('/booking/create', {
      method: 'POST',
      body: JSON.stringify(booking),
    }),

  getMyBookings: () =>
    apiCall<any[]>('/booking/my-bookings', {
      method: 'GET',
    }),

  updateBookingStatus: (bookingId: string, status: string) =>
    apiCall<any>(`/booking/${bookingId}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    }),
}

// Resource API
export const resourceApi = {
  getResources: (filters?: { language?: string; mediaType?: string }) =>
    apiCall<any[]>(`/resources${filters ? `?${new URLSearchParams(filters as any)}` : ''}`, {
      method: 'GET',
    }),

  searchYouTube: (params?: {
    q?: string
    maxResults?: string
    safeSearch?: string
    relevanceLanguage?: string
  }) =>
    apiCall<any[]>(`/resources/youtube${params ? `?${new URLSearchParams(params as any)}` : ''}`, {
      method: 'GET',
    }),

  createResource: (resource: any) =>
    apiCall<any>('/resources/create', {
      method: 'POST',
      body: JSON.stringify(resource),
    }),

  deleteResource: (resourceId: string) =>
    apiCall<void>(`/resources/${resourceId}`, {
      method: 'DELETE',
    }),
}

// Community API
export const communityApi = {
  getPosts: () =>
    apiCall<any[]>('/community/posts', {
      method: 'GET',
    }),

  createPost: (content: string, parentId?: string) =>
    apiCall<any>('/community/posts', {
      method: 'POST',
      body: JSON.stringify({ content, parent_id: parentId }),
    }),

  deletePost: (postId: string) =>
    apiCall<void>(`/community/posts/${postId}`, {
      method: 'DELETE',
    }),
}

// Admin API
export const adminApi = {
  getAllBookings: () =>
    apiCall<any[]>('/admin/bookings', {
      method: 'GET',
    }),

  getAllUsers: () =>
    apiCall<any[]>('/admin/users', {
      method: 'GET',
    }),

  updateUserRole: (userId: string, role: string) =>
    apiCall<any>(`/admin/users/${userId}/role`, {
      method: 'PATCH',
      body: JSON.stringify({ role }),
    }),
}

// User API
export const userApi = {
  getProfile: () =>
    apiCall<any>('/user/profile', {
      method: 'GET',
    }),

  updateProfile: (updates: any) =>
    apiCall<any>('/user/profile', {
      method: 'PATCH',
      body: JSON.stringify(updates),
    }),

  uploadAvatar: (file: File) => {
    const formData = new FormData()
    formData.append('avatar', file)

    return apiCall<any>('/user/upload-avatar', {
      method: 'POST',
      body: formData,
      // Fetch will automatically set the boundary for FormData
      headers: {
        'Content-Type': undefined as any,
      },
    })
  },
}
