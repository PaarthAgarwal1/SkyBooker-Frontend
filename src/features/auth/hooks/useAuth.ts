import { authApi, LoginDTO } from '@shared/api/auth';
import { useAuthStore } from '@store/authStore';
import { useNavigate, useLocation } from 'react-router-dom';

export const useAuth = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, isAuthenticated, loading, error, login: storeLogin, logout: storeLogout, setLoading, setError } = useAuthStore();

  const getDashboardPath = (role: string) => {
    switch (role) {
      case 'ADMIN': return '/admin/dashboard';
      case 'AIRLINE_STAFF': return '/staff/dashboard';
      default: return '/';
    }
  };

  const login = async (credentials: LoginDTO) => {
    setLoading(true);
    setError(null);
    try {
      const response = await authApi.login(credentials);
      const { jwtToken } = response.data;

      localStorage.setItem('token', jwtToken);

      const profileResponse = await authApi.getProfile();
      const userData = profileResponse.data;
      
      storeLogin(userData, jwtToken);
      
      // Determine destination
      const from = (location.state as any)?.from?.pathname;
      const dashboard = getDashboardPath(userData.role);
      
      // Strict isolation check: 
      // If an Admin was redirected to login from a Passenger page, 
      // they should STILL go to Admin Dashboard, not the passenger page.
      if (userData.role !== 'PASSENGER') {
        navigate(dashboard, { replace: true });
      } else {
        navigate(from || dashboard, { replace: true });
      }
    } catch (err: any) {
      localStorage.removeItem('token');
      setError(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const register = async (userData: any) => {
    setLoading(true);
    setError(null);
    try {
      const response = await authApi.register(userData);
      const { jwtToken } = response.data;

      if (jwtToken) {
        localStorage.setItem('token', jwtToken);
        const profileResponse = await authApi.getProfile();
        const userProfile = profileResponse.data;
        
        storeLogin(userProfile, jwtToken);
        navigate(getDashboardPath(userProfile.role), { replace: true });
      } else {
        navigate('/login');
      }
    } catch (err: any) {
      localStorage.removeItem('token');
      setError(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    storeLogout();
    navigate('/login', { replace: true });
  };

  return {
    user,
    isAuthenticated,
    loading,
    error,
    login,
    register,
    logout: handleLogout,
  };
};

export const useOAuth = () => {
  const { login: storeLogin, setLoading, setError } = useAuthStore();
  const navigate = useNavigate();

  const handleOAuthSuccess = async (token: string) => {
    setLoading(true);
    try {
      localStorage.setItem('token', token);
      const profileResponse = await authApi.getProfile();
      const userData = profileResponse.data;
      
      storeLogin(userData, token);
      
      const dashboard = userData.role === 'ADMIN' ? '/admin/dashboard' : 
                        userData.role === 'AIRLINE_STAFF' ? '/staff/dashboard' : '/';
      
      navigate(dashboard, { replace: true });
    } catch (err: any) {
      localStorage.removeItem('token');
      setError('OAuth Authentication failed');
      navigate('/login');
    } finally {
      setLoading(false);
    }
  };

  return { handleOAuthSuccess };
};
