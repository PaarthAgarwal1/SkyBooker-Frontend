import React, { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { Mail, Lock, User as UserIcon, Facebook, Phone, MapPin } from 'lucide-react';
import { FcGoogle } from "react-icons/fc";
import { Link } from 'react-router-dom';
import UserNavbar from '@components/user/UserNavbar';

export const RegisterForm: React.FC = () => {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    registrationKey: '',
    role: 'PASSENGER',
  });
  const { register, loading, error } = useAuth();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    register(formData);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <>
      <UserNavbar />
      <div className="flex items-center justify-center min-h-[calc(100vh-100px)] px-4">
        <div className="flex flex-col md:flex-row w-full max-w-4xl bg-white rounded-[2rem] shadow-2xl overflow-hidden min-h-[500px]">

          {/* Left Side - Decorative & Navigation */}
          <div className="md:w-1/3 bg-primary p-8 flex flex-col justify-center items-center text-white relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-primary to-secondary opacity-90"></div>
            <div className="absolute top-0 left-0 w-full h-full opacity-20 pointer-events-none">
              <div className="absolute top-[-10%] left-[-20%] w-[150%] h-[150%] rotate-[25deg] bg-white rounded-[3rem]"></div>
              <div className="absolute top-[20%] left-[-10%] w-[120%] h-[120%] rotate-[-15deg] bg-white rounded-[3rem]"></div>
            </div>

            <div className="relative z-10 flex flex-col space-y-6 w-full max-w-[150px]">
              <Link
                to="/login"
                className="text-white/80 hover:text-white px-6 py-2 text-center font-semibold transition-colors"
              >
                LOGIN
              </Link>
              <div className="bg-white text-primary rounded-full px-6 py-2 text-center font-bold shadow-lg cursor-default">
                SIGN IN
              </div>
            </div>
          </div>

          {/* Right Side - Form */}
          <div className="md:w-2/3 p-8 md:p-12 bg-white flex flex-col">
            <div className="flex flex-col items-center mb-8">
              <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mb-2 shadow-inner">
                <UserIcon size={40} className="text-primary/60" />
              </div>
              <h2 className="text-3xl font-bold text-primary tracking-wider uppercase">Sign Up</h2>
            </div>

            <form onSubmit={handleSubmit} className="flex-grow space-y-6">
              <div className="relative border-b-2 border-slate-200 focus-within:border-primary transition-colors group">
                <div className="absolute left-0 bottom-3 flex items-center pointer-events-none">
                  <UserIcon size={20} className="text-slate-400 group-focus-within:text-primary transition-colors" />
                  <span className="ml-2 text-slate-400 font-medium group-focus-within:text-primary transition-colors">Full Name</span>
                </div>
                <input
                  name="fullName"
                  type="text"
                  value={formData.fullName}
                  onChange={handleChange}
                  className="w-full pl-32 pr-4 py-2 bg-transparent focus:outline-none text-app-text font-medium"
                  required
                />
              </div>

              <div className='flex gap-3'>

                <div className="relative border-b-2 border-slate-200 focus-within:border-primary transition-colors group">
                  <div className="absolute left-0 bottom-3 flex items-center pointer-events-none">
                    <UserIcon size={20} className="text-slate-400 group-focus-within:text-primary transition-colors" />
                    <span className="ml-2 text-slate-400 font-medium group-focus-within:text-primary transition-colors">
                      Role
                    </span>
                  </div>

                  <select
                    name="role"
                    value={formData.role}
                    onChange={(e) => {
                      const role = e.target.value;

                      setFormData((prev) => ({
                        ...prev,
                        role,
                        // auto-clear registration key if passenger
                        registrationKey: role === 'PASSENGER' ? '' : prev.registrationKey,
                      }));
                    }}
                    className="w-full pl-20 pr-4 py-2 bg-transparent focus:outline-none text-app-text font-medium"
                  >
                    <option value="PASSENGER">Passenger</option>
                    <option value="AIRLINE_STAFF">Airline Staff</option>
                    <option value="ADMIN">Admin</option>
                  </select>
                </div>

                <div className={`relative border-b-2 transition-colors group ${formData.role === 'PASSENGER'
                  ? 'border-slate-100 opacity-50'
                  : 'border-slate-200 focus-within:border-primary'
                  }`}>
                  <div className="absolute left-0 bottom-3 flex items-center pointer-events-none">
                    <Lock size={20} className="text-slate-400 group-focus-within:text-primary transition-colors" />
                    <span className="ml-2 text-slate-400 font-medium group-focus-within:text-primary transition-colors">
                      Reg. Key
                    </span>
                  </div>

                  <input
                    name="registrationKey"
                    type="text"
                    value={formData.registrationKey}
                    onChange={handleChange}
                    disabled={formData.role === 'PASSENGER'}
                    required={formData.role !== 'PASSENGER'} // required only for staff/admin
                    className="w-full pl-28 pr-4 py-2 bg-transparent focus:outline-none text-app-text font-medium disabled:cursor-not-allowed"
                  />
                </div>

              </div>


              <div className="relative border-b-2 border-slate-200 focus-within:border-primary transition-colors group">
                <div className="absolute left-0 bottom-3 flex items-center pointer-events-none">
                  <Mail size={20} className="text-slate-400 group-focus-within:text-primary transition-colors" />
                  <span className="ml-2 text-slate-400 font-medium group-focus-within:text-primary transition-colors">Email</span>
                </div>
                <input
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
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
                  name="password"
                  type="password"
                  value={formData.password}
                  onChange={handleChange}
                  className="w-full pl-32 pr-4 py-2 bg-transparent focus:outline-none text-app-text font-medium"
                  required
                />
              </div>

              <div className="flex items-center justify-end pt-4">
                <button
                  type="submit"
                  disabled={loading}
                  className="bg-secondary hover:bg-primary text-white px-10 py-2.5 rounded-full font-bold shadow-lg transform hover:scale-105 transition-all disabled:bg-slate-300 disabled:transform-none"
                >
                  {loading ? '...' : 'SIGN UP'}
                </button>
              </div>

              {error && <p className="text-red-500 text-sm text-center font-medium">{error}</p>}
            </form>

            {/* Social Logins */}
            <div className="mt-8 pt-6 border-t border-slate-100 flex items-center justify-between text-slate-500">
              <span className="text-xs font-bold uppercase tracking-widest">Or Register With</span>
              <div className="flex space-x-6">
                <button
                  type="button"
                  onClick={() => window.location.href = 'http://localhost:8083/oauth2/authorization/google'}
                  className="flex items-center space-x-2 hover:text-primary transition-colors"
                >
                  <FcGoogle size={20} />
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
