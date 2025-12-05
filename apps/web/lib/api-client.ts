/**
 * API Client for PixelBoxx
 */

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export interface DesignPreferences {
  dark_mode?: boolean;
  animation_level?: 'none' | 'low' | 'medium' | 'high';
  high_contrast?: boolean;
  pixel_density?: 'minimal' | 'normal' | 'heavy';
  neon_intensity?: 'low' | 'medium' | 'high';
}

export interface DesignResult {
  css: string;
  explanation: string;
  colors: string[];
}

interface ApiOptions extends RequestInit {
  token?: string;
}

function getAuthToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('token');
}

export class ApiError extends Error {
  constructor(
    public status: number,
    public data: any,
  ) {
    super(`API Error: ${status}`);
  }
}

async function apiRequest<T>(
  endpoint: string,
  options: ApiOptions = {},
): Promise<T> {
  const { token, ...fetchOptions } = options;

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(fetchOptions.headers as Record<string, string>),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...fetchOptions,
    headers,
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new ApiError(response.status, errorData);
  }

  return response.json();
}

// PixelPages API
export const pixelPagesApi = {
  getByUsername: (username: string) =>
    apiRequest(`/pixelpages/${username}`),

  getOwnPage: (token: string) =>
    apiRequest('/pixelpages/me', { token }),

  updatePage: (token: string, data: any) =>
    apiRequest('/pixelpages/me', {
      method: 'PUT',
      token,
      body: JSON.stringify(data),
    }),

  updateCss: (token: string, customCss: string) =>
    apiRequest('/pixelpages/me/css', {
      method: 'PUT',
      token,
      body: JSON.stringify({ customCss }),
    }),

  createSection: (token: string, data: any) =>
    apiRequest('/pixelpages/me/sections', {
      method: 'POST',
      token,
      body: JSON.stringify(data),
    }),

  updateSection: (token: string, sectionId: string, data: any) =>
    apiRequest(`/pixelpages/me/sections/${sectionId}`, {
      method: 'PUT',
      token,
      body: JSON.stringify(data),
    }),

  deleteSection: (token: string, sectionId: string) =>
    apiRequest(`/pixelpages/me/sections/${sectionId}`, {
      method: 'DELETE',
      token,
    }),
};

// Themes API
export const themesApi = {
  getAll: (page = 1, limit = 20, search?: string) => {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
      ...(search && { search }),
    });
    return apiRequest(`/themes?${params}`);
  },

  getById: (id: string) =>
    apiRequest(`/themes/${id}`),

  create: (token: string, data: any) =>
    apiRequest('/themes', {
      method: 'POST',
      token,
      body: JSON.stringify(data),
    }),

  update: (token: string, id: string, data: any) =>
    apiRequest(`/themes/${id}`, {
      method: 'PUT',
      token,
      body: JSON.stringify(data),
    }),

  delete: (token: string, id: string) =>
    apiRequest(`/themes/${id}`, {
      method: 'DELETE',
      token,
    }),

  useTheme: (token: string, id: string) =>
    apiRequest(`/themes/${id}/use`, {
      method: 'POST',
      token,
    }),
};

// Guestbook API
export const guestbookApi = {
  getEntries: (username: string, page = 1, limit = 20) => {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
    });
    return apiRequest(`/guestbook/${username}?${params}`);
  },

  createEntry: (token: string, username: string, content: string) =>
    apiRequest(`/guestbook/${username}`, {
      method: 'POST',
      token,
      body: JSON.stringify({ content }),
    }),

  deleteEntry: (token: string, id: string) =>
    apiRequest(`/guestbook/${id}`, {
      method: 'DELETE',
      token,
    }),

  toggleHidden: (token: string, id: string) =>
    apiRequest(`/guestbook/${id}/hide`, {
      method: 'PUT',
      token,
    }),
};

// AI Design API
export const aiDesignApi = {
  async generateFromImage(
    imageFile: File,
    preferences?: DesignPreferences,
  ): Promise<DesignResult> {
    const formData = new FormData();
    formData.append('image', imageFile);

    if (preferences) {
      formData.append('preferences', JSON.stringify(preferences));
    }

    const token = getAuthToken();
    const response = await fetch(
      `${API_BASE_URL}/pixelpages/me/design/from-image`,
      {
        method: 'POST',
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: formData,
      },
    );

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Failed to generate design' }));
      throw new Error(error.message || 'Failed to generate design from image');
    }

    return response.json();
  },

  async generateFromDescription(
    description: string,
    preferences?: DesignPreferences,
  ): Promise<DesignResult> {
    const token = getAuthToken();
    const response = await fetch(
      `${API_BASE_URL}/pixelpages/me/design/from-description`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          description,
          preferences,
        }),
      },
    );

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Failed to generate design' }));
      throw new Error(error.message || 'Failed to generate design from description');
    }

    return response.json();
  },
};
