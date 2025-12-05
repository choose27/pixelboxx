/**
 * API client for PixelBoxx backend
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

/**
 * Get auth token from storage
 */
function getAuthToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('token');
}

/**
 * AI Design API
 */
export const aiDesignApi = {
  /**
   * Generate CSS from inspiration image
   */
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

  /**
   * Generate CSS from text description
   */
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

/**
 * PixelPages API
 */
export const pixelPagesApi = {
  /**
   * Update CSS for current user's profile
   */
  async updateCSS(css: string): Promise<void> {
    const token = getAuthToken();
    const response = await fetch(`${API_BASE_URL}/pixelpages/me/css`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify({ customCss: css }),
    });

    if (!response.ok) {
      throw new Error('Failed to update CSS');
    }
  },
};
