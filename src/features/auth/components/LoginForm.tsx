import React, { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { Mail, Lock, User as UserIcon, Facebook } from 'lucide-react';
import { Link } from 'react-router-dom';
import UserNavbar from '@components/user/UserNavbar';

export const LoginForm: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { login, loading, error } = useAuth();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    login({ email, password });
  };

  return (
    <>
      <UserNavbar />
      <div className="flex items-center justify-center min-h-[calc(100vh-100px)] px-4">
        <div className="flex flex-col md:flex-row w-full max-w-4xl bg-white rounded-[2rem] shadow-2xl overflow-hidden min-h-[500px]">

          {/* Left Side - Decorative & Navigation */}
          <div className="md:w-1/3 bg-primary p-8 flex flex-col justify-center items-center text-white relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-primary to-secondary opacity-90"></div>
            {/* Abstract Shapes */}
            <div className="absolute top-0 left-0 w-full h-full opacity-20 pointer-events-none">
              <div className="absolute top-[-10%] left-[-20%] w-[150%] h-[150%] rotate-[25deg] bg-white rounded-[3rem]"></div>
              <div className="absolute top-[20%] left-[-10%] w-[120%] h-[120%] rotate-[-15deg] bg-white rounded-[3rem]"></div>
            </div>

            <div className="relative z-10 flex flex-col space-y-6 w-full max-w-[150px]">
              <div className="bg-white text-primary rounded-full px-6 py-2 text-center font-bold shadow-lg cursor-default">
                LOGIN
              </div>
              <Link
                to="/register"
                className="text-white/80 hover:text-white px-6 py-2 text-center font-semibold transition-colors"
              >
                SIGN IN
              </Link>
            </div>
          </div>

          {/* Right Side - Form */}
          <div className="md:w-2/3 p-8 md:p-12 bg-white flex flex-col">
            <div className="flex flex-col items-center mb-8">
              <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mb-2 shadow-inner">
                <UserIcon size={40} className="text-primary/60" />
              </div>
              <h2 className="text-3xl font-bold text-primary tracking-wider">LOGIN</h2>
            </div>

            <form onSubmit={handleSubmit} className="flex-grow space-y-8">
              <div className="relative border-b-2 border-slate-200 focus-within:border-primary transition-colors group">
                <div className="absolute left-0 bottom-3 flex items-center pointer-events-none">
                  <UserIcon size={20} className="text-slate-400 group-focus-within:text-primary transition-colors" />
                  <span className="ml-2 text-slate-400 font-medium group-focus-within:text-primary transition-colors">Email</span>
                </div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-24 pr-4 py-2 bg-transparent focus:outline-none text-app-text font-medium"
                  required
                />
              </div>

              <div className="relative border-b-2 border-slate-200 focus-within:border-primary transition-colors group">
                <div className="absolute left-0 bottom-3 flex items-center pointer-events-none">
                  <Lock size={20} className="text-slate-400 group-focus-within:text-primary transition-colors" />
                  <span className="ml-2 text-slate-400 font-medium group-focus-within:text-primary transition-colors">Password</span>
                </div>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-32 pr-4 py-2 bg-transparent focus:outline-none text-app-text font-medium"
                  required
                />
              </div>

              <div className="flex items-center justify-between">
                <button type="button" className="text-xs text-slate-400 hover:text-primary transition-colors font-medium">
                  Forgot Password?
                </button>

                <button
                  type="submit"
                  disabled={loading}
                  className="bg-secondary hover:bg-primary text-white px-10 py-2.5 rounded-full font-bold shadow-lg transform hover:scale-105 transition-all disabled:bg-slate-300 disabled:transform-none"
                >
                  {loading ? '...' : 'LOGIN'}
                </button>
              </div>

              {error && <p className="text-red-500 text-sm text-center font-medium animate-pulse">{error}</p>}
            </form>

            {/* Social Logins */}
            <div className="mt-12 pt-6 border-t border-slate-100 flex items-center justify-between text-slate-500">
              <span className="text-xs font-bold uppercase tracking-widest">Or Login With</span>
              <div className="flex space-x-6">
                <button
                  type="button"
                  onClick={() => window.location.href = 'http://localhost:8083/oauth2/authorization/google'}
                  className="flex items-center space-x-2 hover:text-primary transition-colors"
                >
                  <svg className="w-5 h-5" viewBox="0 0 24 24">
                    <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                    <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                    <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" />
                    <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                  </svg>
                  <span className="text-sm font-bold">Google</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};
