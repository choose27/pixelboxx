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

export function useFriends() {
  const [friends, setFriends] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadFriends = async () => {
    try {
      setLoading(true);
      const data = await apiRequest('/friends');
      setFriends(data.friends || []);
      setError(null);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadFriends();
  }, []);

  const sendRequest = async (userId: string) => {
    await apiRequest(`/friends/request/${userId}`, { method: 'POST' });
    return true;
  };

  const acceptRequest = async (requestId: string) => {
    await apiRequest(`/friends/accept/${requestId}`, { method: 'POST' });
    await loadFriends();
  };

  const rejectRequest = async (requestId: string) => {
    await apiRequest(`/friends/reject/${requestId}`, { method: 'POST' });
  };

  const removeFriend = async (userId: string) => {
    await apiRequest(`/friends/${userId}`, { method: 'DELETE' });
    await loadFriends();
  };

  return {
    friends,
    loading,
    error,
    sendRequest,
    acceptRequest,
    rejectRequest,
    removeFriend,
    reload: loadFriends,
  };
}

export function useFriendRequests() {
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const loadRequests = async () => {
    try {
      setLoading(true);
      const data = await apiRequest('/friends/requests');
      setRequests(data.requests || []);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRequests();
  }, []);

  return { requests, loading, reload: loadRequests };
}

export function useFriendshipStatus(userId: string | null) {
  const [status, setStatus] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!userId) return;

    const loadStatus = async () => {
      try {
        setLoading(true);
        const data = await apiRequest(`/friends/status/${userId}`);
        setStatus(data);
      } finally {
        setLoading(false);
      }
    };

    loadStatus();
  }, [userId]);

  return { status, loading };
}
