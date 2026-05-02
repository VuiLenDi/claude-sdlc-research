import { describe, it, expect, beforeEach } from 'vitest';
import { useAuthStore } from './authStore';
import type { User } from '../types';

const mockUser: User = {
  id: 'user-1',
  email: 'test@example.com',
  name: 'Test User',
  createdAt: '2026-01-01T00:00:00Z',
};

beforeEach(() => {
  useAuthStore.setState({ user: null, accessToken: null, isAuthenticated: false });
});

describe('authStore', () => {
  describe('setAuth', () => {
    it('sets user, token, and isAuthenticated=true', () => {
      useAuthStore.getState().setAuth(mockUser, 'token-abc');
      const state = useAuthStore.getState();
      expect(state.user).toEqual(mockUser);
      expect(state.accessToken).toBe('token-abc');
      expect(state.isAuthenticated).toBe(true);
    });
  });

  describe('clearAuth', () => {
    it('resets all auth state to null/false', () => {
      useAuthStore.getState().setAuth(mockUser, 'token-abc');
      useAuthStore.getState().clearAuth();
      const state = useAuthStore.getState();
      expect(state.user).toBeNull();
      expect(state.accessToken).toBeNull();
      expect(state.isAuthenticated).toBe(false);
    });
  });

  describe('updateUser', () => {
    it('merges partial user data into existing user', () => {
      useAuthStore.getState().setAuth(mockUser, 'token-abc');
      useAuthStore.getState().updateUser({ name: 'New Name' });
      expect(useAuthStore.getState().user?.name).toBe('New Name');
      expect(useAuthStore.getState().user?.email).toBe(mockUser.email);
    });

    it('does nothing when user is null', () => {
      useAuthStore.getState().updateUser({ name: 'Ghost' });
      expect(useAuthStore.getState().user).toBeNull();
    });

    it('can update avatarUrl', () => {
      useAuthStore.getState().setAuth(mockUser, 'token-abc');
      useAuthStore.getState().updateUser({ avatarUrl: 'https://example.com/avatar.png' });
      expect(useAuthStore.getState().user?.avatarUrl).toBe('https://example.com/avatar.png');
    });
  });

  describe('initial state', () => {
    it('starts unauthenticated with no user or token', () => {
      const state = useAuthStore.getState();
      expect(state.isAuthenticated).toBe(false);
      expect(state.user).toBeNull();
      expect(state.accessToken).toBeNull();
    });
  });
});
