export const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8080/api';

export const getAuthHeaders = (): Record<string, string> => {
  const session = localStorage.getItem('uems_session');
  if (!session) return { 'Content-Type': 'application/json' };
  
  try {
    const { token } = JSON.parse(session);
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    };
  } catch {
    return { 'Content-Type': 'application/json' };
  }
};

export const fetchClient = async (endpoint: string, options: RequestInit = {}) => {
  const headers = {
    ...getAuthHeaders(),
    ...options.headers,
  };

  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    let errorMessage = 'An error occurred';
    try {
      const errorData = await response.json();
      errorMessage = errorData.message || errorMessage;
    } catch {
      errorMessage = response.statusText;
    }
    throw new Error(errorMessage);
  }

  // Handle empty responses
  if (response.status === 204) {
    return null;
  }
  
  // Handle blob responses for QR codes and PDFs
  const contentType = response.headers.get('content-type');
  if (contentType && (contentType.includes('image/') || contentType.includes('application/pdf'))) {
      return response.blob();
  }

  // Handle JSON
  if (contentType && contentType.includes('application/json')) {
    return response.json();
  }

  return response.text();
};
