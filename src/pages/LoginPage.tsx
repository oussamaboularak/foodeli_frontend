import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { authApi } from '@/api/auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Store, User, Lock, Phone, Star, UtensilsCrossed } from 'lucide-react';

const LoginPage: React.FC = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [phone, setPhone] = useState('0551234567');
  const [password, setPassword] = useState('password123');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { login, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard', { replace: true });
    }
  }, [isAuthenticated, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccessMessage('');
    setIsSubmitting(true);

    try {
      if (isLogin) {
        await login(phone, password);
      } else {
        await authApi.register({
          phone,
          password,
          firstName,
          lastName,
        });
        setSuccessMessage('Registration successful! Please sign in.');
        setIsLogin(true);
        setPassword('');
        setFirstName('');
        setLastName('');
      }
    } catch (err: any) {
      console.error('Auth error:', err);
      const errorMessage = err?.response?.data?.message || err.message || 'An error occurred';
      setError(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const toggleMode = () => {
    setIsLogin(!isLogin);
    setError('');
    setSuccessMessage('');
  };

  return (
    <div className="flex min-h-screen w-full font-sans">
      {/* Left Side - Login Form */}
      <div className="flex w-full flex-col justify-center bg-white px-6 py-12 lg:w-1/2 lg:px-24 xl:px-32">
        <div className="w-full max-w-sm mx-auto">
          {/* Logo */}
          <div className="flex items-center gap-2 mb-10">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-orange-500 text-white">
              <span className="text-xl font-bold">F</span>
            </div>
            <span className="text-2xl font-bold text-gray-900">Foodeli</span>
          </div>

          <div className="mb-10">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              {isLogin ? 'Welcome back' : 'Get started'}
            </h1>
            <p className="text-gray-500">
              {isLogin
                ? 'Sign in to your admin dashboard'
                : 'Create your partner account today'}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {!isLogin && (
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">First Name</label>
                  <Input
                    required
                    placeholder="John"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    className="h-12 bg-gray-50 border-gray-100 focus:bg-white transition-all"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Last Name</label>
                  <Input
                    required
                    placeholder="Doe"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    className="h-12 bg-gray-50 border-gray-100 focus:bg-white transition-all"
                  />
                </div>
              </div>
            )}

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">
                {isLogin ? 'Phone Number / Email' : 'Phone Number'}
              </label>
              <Input
                required
                placeholder="0551234567" // Matches image placeholder style roughly
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="h-12 bg-gray-50 border-gray-100 focus:bg-white transition-all"
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-gray-700">Password</label>
                {isLogin && (
                  <button type="button" className="text-sm text-orange-500 hover:underline">
                    Forgot password?
                  </button>
                )}
              </div>
              <Input
                required
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="h-12 bg-gray-50 border-gray-100 focus:bg-white transition-all"
              />
            </div>

            {error && (
              <div className="p-3 bg-red-50 text-red-600 text-sm rounded-lg">
                {error}
              </div>
            )}

            {successMessage && (
              <div className="p-3 bg-green-50 text-green-600 text-sm rounded-lg">
                {successMessage}
              </div>
            )}

            <Button
              type="submit"
              disabled={isSubmitting}
              className="w-full h-12 bg-orange-500 hover:bg-orange-600 text-white font-semibold text-base rounded-lg transition-all"
            >
              {isSubmitting ? 'Processing...' : (isLogin ? 'Sign In' : 'Create Account')}
            </Button>
          </form>

          <p className="mt-2 text-center text-sm text-gray-600">
            Demo account: 0551234567 / password123
          </p>
          <div className="mt-8 text-center text-sm text-gray-500">
            <p>
              {isLogin ? "Don't have an account? " : "Already have an account? "}
              <button
                type="button"
                onClick={toggleMode}
                className="font-semibold text-orange-500 hover:underline"
              >
                {isLogin ? 'Sign up' : 'Sign in'}
              </button>
            </p>
          </div>
        </div>
      </div>

      {/* Right Side - Branding */}
      <div className="hidden lg:flex w-1/2 flex-col items-center justify-center bg-orange-500 text-white relative overflow-hidden px-12">
        {/* Background decorative blob or gradient if needed, keeping clean for now */}

        <div className="z-10 flex flex-col items-center text-center max-w-lg">
          <div className="mb-8 p-6 bg-white/20 backdrop-blur-sm rounded-3xl">
            {/* Burger Icon substitute */}
            <UtensilsCrossed size={48} className="text-white" />
          </div>

          <h2 className="text-4xl font-bold mb-6">Manage Your Food Empire</h2>
          <p className="text-orange-50 text-lg mb-12 leading-relaxed opacity-90">
            Track orders, manage restaurants, and grow your food delivery business with our powerful admin dashboard.
          </p>

          <div className="flex gap-4 w-full justify-center">
            {/* Stat Card 1 */}
            <div className="flex-1 bg-white/10 backdrop-blur-md rounded-2xl p-4 text-center border border-white/10 hover:bg-white/20 transition-all cursor-default">
              <div className="text-2xl font-bold mb-1">1.2K+</div>
              <div className="text-xs text-orange-100">Orders Today</div>
            </div>

            {/* Stat Card 2 */}
            <div className="flex-1 bg-white/10 backdrop-blur-md rounded-2xl p-4 text-center border border-white/10 hover:bg-white/20 transition-all cursor-default">
              <div className="text-2xl font-bold mb-1">56</div>
              <div className="text-xs text-orange-100">Restaurants</div>
            </div>

            {/* Stat Card 3 */}
            <div className="flex-1 bg-white/10 backdrop-blur-md rounded-2xl p-4 text-center border border-white/10 hover:bg-white/20 transition-all cursor-default">
              <div className="text-2xl font-bold mb-1 flex items-center justify-center gap-1">
                4.8 <Star size={16} fill="currentColor" />
              </div>
              <div className="text-xs text-orange-100">Avg Rating</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
