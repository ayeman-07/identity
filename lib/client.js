// Small client-side helper to make credentialed fetch calls that send the httpOnly cookie
export async function fetchWithAuth(input, init = {}) {
  const defaultHeaders = { 'Content-Type': 'application/json' };
  const merged = {
    credentials: 'include',
    headers: { ...defaultHeaders, ...(init.headers || {}) },
    ...init,
  };

  return fetch(input, merged);
}

export default fetchWithAuth;
