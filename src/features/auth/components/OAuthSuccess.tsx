import React, { useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useOAuth } from '../hooks/useAuth';

const OAuthSuccess: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { handleOAuthSuccess } = useOAuth();

  useEffect(() => {
    const token = searchParams.get('token');

    if (token) {
      handleOAuthSuccess(token);
    } else {
      console.error('No token found in URL');
      navigate('/login');
    }
  }, [searchParams, handleOAuthSuccess, navigate]);

  return (
    <div className="flex items-center justify-center min-h-[400px]">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
        <h2 className="text-xl font-semibold text-slate-700">Completing login...</h2>
        <p className="text-slate-500">Please wait while we authenticate you.</p>
      </div>
    </div>
  );
};

export default OAuthSuccess;
