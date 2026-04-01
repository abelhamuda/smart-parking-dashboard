import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../services/api';
import { Lock, User, AlertCircle, ArrowRight } from 'lucide-react';

export default function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const response = await authService.login({ username, password });
      if (response.status === 'success') {
        localStorage.setItem('token', response.token);
        localStorage.setItem('user', JSON.stringify(response.user));
        // Small delay for smooth transition
        setTimeout(() => navigate('/'), 500);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Unauthorized: Invalid credentials');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center bg-cover bg-center relative transition-opacity duration-1000"
      style={{ backgroundImage: 'url("/assets/login-bg.png")' }}
    >
      {/* Dark Overlay with Blur */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm shadow-[inset_0_0_100px_rgba(0,0,0,0.8)]" />

      {/* Login Card */}
      <div className="relative z-10 w-full max-w-md p-8 animate-slide-up">
        <div className="bg-white/10 backdrop-blur-xl rounded-2xl border border-white/20 shadow-2xl p-8">
          <div className="flex flex-col items-center mb-8">
            <div className="h-16 w-16 bg-white/20 rounded-2xl flex items-center justify-center mb-4 border border-white/30 backdrop-blur-md">
              <Lock className="h-8 w-8 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-white tracking-tight">Smart Parking</h1>
            <p className="text-white/60 text-sm mt-1">Control Panel Login</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-2">
              <label className="text-[10px] uppercase tracking-widest font-bold text-white/50 ml-1">Username</label>
              <div className="relative group">
                <User className="absolute left-3 top-3 h-5 w-5 text-white/40 group-focus-within:text-white transition-colors" />
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-10 pr-4 text-white placeholder:text-white/20 focus:outline-none focus:ring-2 focus:ring-white/20 focus:bg-white/10 transition-all"
                  placeholder="admin"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] uppercase tracking-widest font-bold text-white/50 ml-1">Password</label>
              <div className="relative group">
                <Lock className="absolute left-3 top-3 h-5 w-5 text-white/40 group-focus-within:text-white transition-colors" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-10 pr-4 text-white placeholder:text-white/20 focus:outline-none focus:ring-2 focus:ring-white/20 focus:bg-white/10 transition-all"
                  placeholder="••••••••"
                  required
                />
              </div>
            </div>

            {error && (
              <div className="flex items-center gap-2 text-red-400 bg-red-400/10 p-3 rounded-lg border border-red-400/20 animate-shake">
                <AlertCircle className="h-4 w-4" />
                <span className="text-xs font-medium">{error}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-white text-black font-bold py-3 rounded-xl flex items-center justify-center gap-2 hover:bg-gray-200 active:scale-[0.98] transition-all disabled:opacity-50 group"
            >
              {isLoading ? (
                <div className="h-5 w-5 border-2 border-black/30 border-t-black rounded-full animate-spin" />
              ) : (
                <>
                  Access System
                  <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </form>

          <p className="mt-8 text-center text-white/30 text-[10px] font-medium tracking-widest uppercase">
            SECURE ACCESS CONTROL
          </p>
        </div>
      </div>
    </div>
  );
}
