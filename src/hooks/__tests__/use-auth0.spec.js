/**
 * @jest-environment jsdom
 */

import {renderHook, act} from '@testing-library/react-hooks';
import useAuth0 from '../use-auth0';

describe('The useAuth0 hook', () => {
  it('returns isLoading', () => {
    const {result} = renderHook(() => useAuth0());
    expect(result.current.isLoading).toEqual(true);
  });

  it('defines error', () => {
    const {result} = renderHook(() => useAuth0());
    expect(result.current.error).toBeNull();
  });

  it('defines user', () => {
    const {result} = renderHook(() => useAuth0());
    expect(result.current.user).toBeNull();
  });

  it('defines authorize', () => {
    const {result} = renderHook(() => useAuth0());
    expect(result.current.authorize).toBeDefined();
  });

  it('defines logout', () => {
    const {result} = renderHook(() => useAuth0());
    expect(result.current.logout).toBeDefined();
  });
});
