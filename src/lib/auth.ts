import { User } from './mockData';

// Mock JWT token structure
interface TokenPayload {
  userId: string;
  email: string;
  name: string;
  company?: string;
  role: "admin" | "user";
  exp: number; // Expiration timestamp
  iat: number; // Issued at timestamp
}

// Token storage keys
const TOKEN_KEY = 'smart_bid_token';
const USER_KEY = 'smart_bid_user';

// Mock users for authentication (in real app, this would be from API)
const mockUsers: User[] = [
  {
    id: "1",
    email: "admin@smartbid.com",
    name: "John Admin",
    company: "SmartBid Corp",
    role: "admin"
  },
  {
    id: "2",
    email: "user@company.com",
    name: "Jane User",
    company: "Tech Solutions Inc",
    role: "user"
  },
  {
    id: "3",
    email: "contractor@build.com",
    name: "Mike Builder",
    company: "BuildCorp Ltd",
    role: "user"
  }
];

// Generate a mock JWT token (in real app, this would come from server)
const generateMockToken = (user: User): string => {
  const payload: TokenPayload = {
    userId: user.id,
    email: user.email,
    name: user.name,
    company: user.company,
    role: user.role,
    exp: Math.floor(Date.now() / 1000) + (24 * 60 * 60), // 24 hours
    iat: Math.floor(Date.now() / 1000)
  };
  
  // In real app, this would be a proper JWT
  return btoa(JSON.stringify(payload));
};

// Decode mock token (in real app, this would validate JWT signature)
const decodeMockToken = (token: string): TokenPayload | null => {
  try {
    const payload = JSON.parse(atob(token)) as TokenPayload;
    
    // Check if token is expired
    if (payload.exp < Math.floor(Date.now() / 1000)) {
      return null;
    }
    
    return payload;
  } catch (error) {
    return null;
  }
};

// Authentication functions
export const authService = {
  // Login with email/password (mock implementation)
  login: async (email: string, password: string): Promise<{ user: User; token: string } | null> => {
    // Mock delay to simulate API call
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Find user by email (in real app, server would validate password)
    const user = mockUsers.find(u => u.email.toLowerCase() === email.toLowerCase());
    
    if (!user) {
      throw new Error('Invalid email or password');
    }
    
    // Generate token
    const token = generateMockToken(user);
    
    // Store in localStorage
    localStorage.setItem(TOKEN_KEY, token);
    localStorage.setItem(USER_KEY, JSON.stringify(user));
    
    return { user, token };
  },

  // Logout
  logout: () => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
  },

  // Get current token
  getToken: (): string | null => {
    return localStorage.getItem(TOKEN_KEY);
  },

  // Get current user from localStorage
  getCurrentUser: (): User | null => {
    const userStr = localStorage.getItem(USER_KEY);
    if (!userStr) return null;
    
    try {
      return JSON.parse(userStr) as User;
    } catch {
      return null;
    }
  },

  // Check if user is authenticated and token is valid
  isAuthenticated: (): boolean => {
    const token = localStorage.getItem(TOKEN_KEY);
    if (!token) return false;
    
    const payload = decodeMockToken(token);
    if (!payload) {
      // Token is invalid or expired, clean up
      authService.logout();
      return false;
    }
    
    return true;
  },

  // Validate token and get user data
  validateToken: (): User | null => {
    const token = localStorage.getItem(TOKEN_KEY);
    if (!token) return null;
    
    const payload = decodeMockToken(token);
    if (!payload) {
      // Token is invalid or expired, clean up
      authService.logout();
      return null;
    }
    
    // Return user data from token
    return {
      id: payload.userId,
      email: payload.email,
      name: payload.name,
      company: payload.company,
      role: payload.role
    };
  },

  // Refresh token (mock implementation)
  refreshToken: async (): Promise<string | null> => {
    const currentUser = authService.getCurrentUser();
    if (!currentUser) return null;
    
    // Generate new token
    const newToken = generateMockToken(currentUser);
    localStorage.setItem(TOKEN_KEY, newToken);
    
    return newToken;
  }
};

// Auto-refresh token before expiration
let refreshInterval: NodeJS.Timeout | null = null;

export const startTokenRefresh = () => {
  if (refreshInterval) return;
  
  refreshInterval = setInterval(() => {
    if (authService.isAuthenticated()) {
      authService.refreshToken();
    } else {
      stopTokenRefresh();
    }
  }, 23 * 60 * 60 * 1000); // Refresh every 23 hours
};

export const stopTokenRefresh = () => {
  if (refreshInterval) {
    clearInterval(refreshInterval);
    refreshInterval = null;
  }
};
