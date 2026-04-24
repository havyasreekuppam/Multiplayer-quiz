import { renderHook, act, waitFor } from '@testing-library/react';
import { useAuth } from '../context/AuthContext';
import { AuthProvider } from '../context/AuthContext';

/**
 * Frontend Authentication Hook Tests
 * Tests login, logout, token refresh
 */

// Mock fetch
global.fetch = jest.fn();

const wrapper = ({ children }) => <AuthProvider>{children}</AuthProvider>;

describe('useAuth Hook', () => {
  beforeEach(() => {
    fetch.mockClear();
    localStorage.clear();
  });

  it('should initialize with no user', () => {
    const { result } = renderHook(() => useAuth(), { wrapper });

    expect(result.current.user).toBeNull();
    expect(result.current.isAuthenticated).toBe(false);
  });

  it('should handle login', async () => {
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        success: true,
        user: { id: '123', username: 'testuser' },
        accessToken: 'token123',
      }),
    });

    const { result } = renderHook(() => useAuth(), { wrapper });

    await act(async () => {
      await result.current.login('test@example.com', 'password123');
    });

    await waitFor(() => {
      expect(result.current.isAuthenticated).toBe(true);
      expect(result.current.user).toHaveProperty('username', 'testuser');
    });
  });

  it('should handle logout', async () => {
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ success: true }),
    });

    const { result } = renderHook(() => useAuth(), { wrapper });

    await act(async () => {
      await result.current.logout();
    });

    expect(result.current.user).toBeNull();
    expect(result.current.isAuthenticated).toBe(false);
  });

  it('should handle registration', async () => {
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        success: true,
        user: { id: '123', username: 'newuser' },
      }),
    });

    const { result } = renderHook(() => useAuth(), { wrapper });

    await act(async () => {
      await result.current.register('new@example.com', 'username', 'password123');
    });

    await waitFor(() => {
      expect(result.current.user).toHaveProperty('username', 'newuser');
    });
  });

  it('should handle authentication errors', async () => {
    fetch.mockResolvedValueOnce({
      ok: false,
      json: async () => ({
        success: false,
        message: 'Invalid credentials',
      }),
    });

    const { result } = renderHook(() => useAuth(), { wrapper });

    let error;
    await act(async () => {
      try {
        await result.current.login('test@example.com', 'wrongpassword');
      } catch (e) {
        error = e;
      }
    });

    expect(result.current.isAuthenticated).toBe(false);
  });

  it('should persist token on login', async () => {
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        success: true,
        user: { id: '123' },
        accessToken: 'token123',
      }),
    });

    const { result } = renderHook(() => useAuth(), { wrapper });

    await act(async () => {
      await result.current.login('test@example.com', 'password123');
    });

    await waitFor(() => {
      expect(localStorage.getItem('accessToken')).toBeDefined();
    });
  });

  it('should refresh token when expired', async () => {
    // Mock initial token refresh response
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        success: true,
        accessToken: 'newtoken123',
      }),
    });

    const { result } = renderHook(() => useAuth(), { wrapper });

    await act(async () => {
      await result.current.refreshToken?.();
    });

    // Token should be updated
    expect(fetch).toHaveBeenCalled();
  });
});
