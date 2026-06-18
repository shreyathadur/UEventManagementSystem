// Helper to extract clean base URL and API URL
const rawApiUrl = import.meta.env.VITE_API_URL || '';

const getBackendUrls = () => {
  let backendRoot = '';
  let apiBase = '';

  if (rawApiUrl) {
    // Normalize: remove trailing slash if any
    let normalized = rawApiUrl.trim();
    if (normalized.endsWith('/')) {
      normalized = normalized.slice(0, -1);
    }
    if (normalized.endsWith('/api')) {
      apiBase = normalized;
      backendRoot = normalized.slice(0, -4);
    } else {
      backendRoot = normalized;
      apiBase = `${normalized}/api`;
    }
  } else {
    // Fallback logic
    if (import.meta.env.DEV) {
      backendRoot = 'http://localhost:8080';
      apiBase = 'http://localhost:8080/api';
    } else {
      // In production, default to empty/relative or window.location.origin
      backendRoot = window.location.origin;
      apiBase = `${window.location.origin}/api`;
    }
  }

  return { backendRoot, apiBase };
};

export const { backendRoot: BACKEND_ROOT, apiBase: API_BASE } = getBackendUrls();

export const checkBackendHealth = async (): Promise<boolean> => {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 4000); // 4 second timeout for quick health check
    
    // Check the root endpoint (BACKEND_ROOT) which is public and returns "UP"
    const response = await fetch(`${BACKEND_ROOT}/`, {
      method: 'GET',
      signal: controller.signal,
      headers: {
        'Accept': 'application/json'
      }
    });
    
    clearTimeout(timeoutId);
    return response.ok;
  } catch (error) {
    console.warn("Backend health check failed:", error);
    return false;
  }
};

export interface HealthStatus {
  status: 'Starting' | 'Healthy' | 'Database Connected' | 'Unavailable';
  backendLive: boolean;
  databaseLive: boolean;
  message?: string;
}

export const checkBackendHealthDetails = async (): Promise<HealthStatus> => {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 4000); // 4 second timeout
    
    const response = await fetch(`${BACKEND_ROOT}/api/health`, {
      method: 'GET',
      signal: controller.signal,
      headers: {
        'Accept': 'application/json'
      }
    });
    
    clearTimeout(timeoutId);
    
    if (response.ok) {
      const data = await response.json();
      if (data.database === 'CONNECTED') {
        return {
          status: 'Database Connected',
          backendLive: true,
          databaseLive: true
        };
      } else {
        return {
          status: 'Healthy',
          backendLive: true,
          databaseLive: false,
          message: 'Backend API online, but database is disconnected.'
        };
      }
    } else {
      try {
        const data = await response.json();
        if (data.database === 'DISCONNECTED') {
          return {
            status: 'Healthy',
            backendLive: true,
            databaseLive: false,
            message: 'Database connection offline.'
          };
        }
      } catch {
        // Ignore JSON parsing failure
      }
      return {
        status: 'Unavailable',
        backendLive: false,
        databaseLive: false,
        message: `Service error: HTTP ${response.status}`
      };
    }
  } catch (error: any) {
    console.warn("Detailed health check failed:", error);
    if (error.name === 'AbortError') {
      return {
        status: 'Unavailable',
        backendLive: false,
        databaseLive: false,
        message: 'Connection timed out.'
      };
    }
    return {
      status: 'Starting',
      backendLive: false,
      databaseLive: false,
      message: 'Backend is starting (Render cold start)...'
    };
  }
};

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

  try {
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
  } catch (error: any) {
    // If it's a client/server validation error thrown by response.ok check above, rethrow it.
    if (error.message && error.message !== 'Failed to fetch' && !error.message.includes('network') && !error.message.includes('fetch')) {
      throw error;
    }

    // If it's a network exception (unreachable server), verify if the backend is down
    const isLive = await checkBackendHealth();
    if (!isLive) {
      throw new Error('Backend is starting, please try again in a moment.');
    }
    
    throw new Error('Network error. Please check your connection and try again.');
  }
};
