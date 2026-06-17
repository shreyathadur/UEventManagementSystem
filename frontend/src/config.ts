export const API_BASE = import.meta.env.VITE_API_URL || (import.meta.env.DEV ? 'http://localhost:8080/api' : '/api');

export const getAuthHeaders = (): Record<string, string> => {
  const session = localStorage.getItem('uems_session');
  if (!session) return { 'Content-Type': 'application/json' };
  
  try {
    const { token } = JSON.parse(session);
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    };
  } catch (e) {
    return { 'Content-Type': 'application/json' };
  }
};
