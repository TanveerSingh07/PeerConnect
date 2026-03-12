import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authAPI } from '../services/api';
import { setToken, setCurrentUser } from '../services/auth';
import { toast } from 'react-toastify';

export default function Login() {
  const [isRegister, setIsRegister] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: '',
    collegeId: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (error) setError('');
  };

  const handleLogin = async () => {
    if (!formData.email?.trim() || !formData.password) {
      setError('Email and password are required');
      toast.error('Email and password are required');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const { data } = await authAPI.login({
        email: formData.email.trim(),
        password: formData.password
      });
      
      setToken(data.token);
      setCurrentUser(data);
      toast.success(`Welcome back, ${data.name}!`);
      setTimeout(() => navigate('/dashboard'), 300);
    } catch (error) {
      console.error('Login error:', error);
      
      const errorMsg = error.response?.data?.message || 'Authentication failed';
      
      if (errorMsg.toLowerCase().includes('invalid')) {
        setError('Invalid email or password');
        toast.error('Invalid email or password');
      } else {
        setError(`${errorMsg}`);
        toast.error(errorMsg);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async () => {
    if (!formData.name?.trim() || !formData.collegeId?.trim() || !formData.email?.trim() || !formData.password) {
      setError('All fields are required');
      toast.error('All fields are required');
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters');
      toast.error('Password must be at least 6 characters');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const { data } = await authAPI.register(formData);
      setToken(data.token);
      setCurrentUser(data);
      toast.success('Registration successful!');
      setTimeout(() => navigate('/dashboard'), 300);
    } catch (error) {
      console.error('Register error:', error);
      
      const errorMsg = error.response?.data?.message || 'Registration failed';
      
      if (errorMsg.toLowerCase().includes('already')) {
        setError('Email or College ID already registered');
        toast.error('Email or College ID already registered');
      } else {
        setError(`${errorMsg}`);
        toast.error(errorMsg);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 px-4 py-8">
      <div className="max-w-md w-full bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8 space-y-6">
        <div className="text-center">
          <h1 className="text-3xl font-extrabold text-blue-600 dark:text-blue-400 mb-2">
            PeerConnect
          </h1>
          <p className="text-gray-600 dark:text-gray-400 text-sm">
            {isRegister ? 'Create your account' : 'Sign in to your account'}
          </p>
        </div>

        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 border-l-4 border-red-500 p-4 rounded">
            <div className="flex items-start">
              <svg className="w-5 h-5 text-red-500 mr-2 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
              <p className="text-sm text-red-700 dark:text-red-400">{error}</p>
            </div>
          </div>
        )}

        <div className="space-y-4">
          {isRegister && (
            <>
              <div>
                <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
                  Full Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="name"
                  className="input"
                  placeholder="John Doe"
                  value={formData.name}
                  onChange={handleChange}
                  autoComplete="name"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      e.stopPropagation();
                      handleRegister();
                    }
                  }}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
                  College ID <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="collegeId"
                  className="input"
                  placeholder="COL12345"
                  value={formData.collegeId}
                  onChange={handleChange}
                  autoComplete="off"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      e.stopPropagation();
                      handleRegister();
                    }
                  }}
                />
              </div>
            </>
          )}

          <div>
            <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
              Email <span className="text-red-500">*</span>
            </label>
            <input
              type="email"
              name="email"
              className="input"
              placeholder="you@college.edu"
              value={formData.email}
              onChange={handleChange}
              autoComplete="email"
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  e.stopPropagation();
                  isRegister ? handleRegister() : handleLogin();
                }
              }}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
              Password <span className="text-red-500">*</span>
            </label>
            <input
              type="password"
              name="password"
              className="input"
              placeholder="••••••••"
              value={formData.password}
              onChange={handleChange}
              autoComplete={isRegister ? 'new-password' : 'current-password'}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  e.stopPropagation();
                  isRegister ? handleRegister() : handleLogin();
                }
              }}
            />
            {isRegister && (
              <p className="text-xs text-gray-500 mt-1">Minimum 6 characters</p>
            )}
          </div>

          <button
            type="button"
            onClick={isRegister ? handleRegister : handleLogin}
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white py-3 rounded-lg font-semibold transition-all duration-200 disabled:cursor-not-allowed flex items-center justify-center"
          >
            {loading ? (
              <>
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Processing...
              </>
            ) : (
              isRegister ? '✨ Create Account' : '🚀 Sign In'
            )}
          </button>
        </div>

        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-300 dark:border-gray-600"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-white dark:bg-gray-800 text-gray-500">OR</span>
          </div>
        </div>

        <div className="text-center">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {isRegister ? 'Already have an account?' : "Don't have an account?"}
            <button
              type="button"
              onClick={() => {
                setIsRegister(!isRegister);
                setError('');
                setFormData({ email: '', password: '', name: '', collegeId: '' });
              }}
              className="ml-2 text-blue-600 dark:text-blue-400 font-semibold hover:underline focus:outline-none"
            >
              {isRegister ? 'Sign In' : 'Create Account'}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}