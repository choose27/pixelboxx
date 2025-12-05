'use client';

import { useState, useEffect } from 'react';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

function getAuthToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('token');
}

async function apiRequest(endpoint: string, options: RequestInit = {}) {
  const token = getAuthToken();
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Request failed' }));
    throw new Error(error.message || 'Request failed');
  }

  return response.json();
}

export function useTopFriends() {
  const [topFriends, setTopFriends] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadTopFriends = async () => {
    try {
      setLoading(true);
      const data = await apiRequest('/me/top-friends');
      setTopFriends(data || []);
      setError(null);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTopFriends();
  }, []);

  const updateTopFriends = async (positions: { friendId: string; position: number }[]) => {
    const result = await apiRequest('/me/top-friends', {
      method: 'PUT',
      body: JSON.stringify({ topFriends: positions }),
    });
    await loadTopFriends();
    return result;
  };

  const removeFromPosition = async (position: number) => {
    await apiRequest(`/me/top-friends/${position}`, { method: 'DELETE' });
    await loadTopFriends();
  };

  return {
    topFriends,
    loading,
    error,
    updateTopFriends,
    removeFromPosition,
    reload: loadTopFriends,
  };
}

export function useUserTopFriends(userId: string | null) {
  const [topFriends, setTopFriends] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!userId) return;

    const loadTopFriends = async () => {
      try {
        setLoading(true);
        const data = await apiRequest(`/users/${userId}/top-friends`);
        setTopFriends(data || []);
      } finally {
        setLoading(false);
      }
    };

    loadTopFriends();
  }, [userId]);

  return { topFriends, loading };
}
