import fetchMock from 'jest-fetch-mock';

import { renderHook, act } from '@testing-library/react-hooks';
import { mocked } from 'ts-jest/utils';
import { startAsync } from 'expo-auth-session';
import { AuthProvider, useAuth } from './auth';

jest.mock('expo-auth-session');

// Coloque no inicio do arquivo para habilitar o mock do fetch.
fetchMock.enableMocks();

describe('Auth Hook', () => {
  it('should be able to sign in with Google account existing', async () => {
    const googleMocked = mocked(startAsync as any);
    googleMocked.mockReturnValueOnce({
      type: 'success',
      params: {
        access_token: 'any_token',
      },
    });

    // Agora que temos o Token, vamos mockar a requisição ttp dos dados de profile do usuário.
    fetchMock.mockResponseOnce(
      JSON.stringify({
        id: 'any_id',
        email: 'rodrigo.goncalves@rocketseat.team',
        name: 'Rodrigo',
        photo: 'any_photo.png',
      }),
    );

    const { result } = renderHook(() => useAuth(), {
      wrapper: AuthProvider,
    });

    await act(() => result.current.signInWithGoogle());

    expect(result.current.user.email).toBe('rodrigo.goncalves@rocketseat.team');
  });

  it('user should not connect if cancel authentication with google', async () => {
    const googleMocked = mocked(startAsync as any);
    googleMocked.mockReturnValueOnce({
      type: 'cancel',
    });

    const { result } = renderHook(() => useAuth(), {
      wrapper: AuthProvider,
    });

    await act(() => result.current.signInWithGoogle());

    expect(result.current.user).not.toHaveProperty('id');
  });

  it('should be error with incorrectle google parameters ', async () => {
    const { result } = renderHook(() => useAuth(), {
      wrapper: AuthProvider,
    });
    try {
      await act(() => result.current.signInWithGoogle());
    } catch (error) {
      expect(result.current.user).toEqual({});
    }
  });
});
