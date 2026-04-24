import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../components/Toast';
import { Mail, Lock, LogIn } from 'lucide-react';

/**
 * Login Page
 * User authentication with email and password
 */

export default function LoginPage() {
  const navigate = useNavigate();
  const { login, loading } = useAuth();
  const { toasts, showToast } = useToast();

  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    // Clear error for this field
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: '',
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    const result = await login(formData.email, formData.password);

    if (result.success) {
      showToast('✅ ' + result.message, 'success');
      setTimeout(() => navigate('/dashboard'), 500);
    } else {
      showToast('❌ ' + result.message, 'error');
    }
  };

  return (
    <>
      {/* Toast Container */}
      <div className="fixed top-4 right-4 max-w-sm space-y-3 z-50">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`
              p-4 border-l-4 rounded shadow-lg animate-slideIn
              ${toast.type === 'success'
                ? 'bg-green-100 border-green-400 text-green-800'
                : 'bg-red-100 border-red-400 text-red-800'
              }
            `}
          >
            {toast.message}
          </div>
        ))}
      </div>

      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-gray-800 mb-2">🎮 Quiz Battle</h1>
            <p className="text-gray-600">Welcome back, challenger!</p>
          </div>

          {/* Form Card */}
          <div className="bg-white rounded-lg shadow-xl p-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
              <LogIn size={24} className="text-indigo-600" />
              Sign In
            </h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Email Field */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Mail size={16} className="inline mr-2" />
                  Email Address
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className={`
                    w-full px-4 py-2 border rounded-lg outline-none
                    transition-colors duration-200
                    ${
                      errors.email
                        ? 'border-red-500 bg-red-50'
                        : 'border-gray-300 focus:border-indigo-500'
                    }
                  `}
                  placeholder="you@example.com"
                  disabled={loading}
                />
                {errors.email && (
                  <p className="text-red-500 text-sm mt-1">{errors.email}</p>
                )}
              </div>

              {/* Password Field */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Lock size={16} className="inline mr-2" />
                  Password
                </label>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className={`
                    w-full px-4 py-2 border rounded-lg outline-none
                    transition-colors duration-200
                    ${
                      errors.password
                        ? 'border-red-500 bg-red-50'
                        : 'border-gray-300 focus:border-indigo-500'
                    }
                  `}
                  placeholder="••••••••"
                  disabled={loading}
                />
                {errors.password && (
                  <p className="text-red-500 text-sm mt-1">{errors.password}</p>
                )}
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className={`
                  w-full py-2 px-4 rounded-lg font-semibold text-white
                  transition-all duration-200 flex items-center justify-center gap-2
                  ${
                    loading
                      ? 'bg-gray-400 cursor-not-allowed'
                      : 'bg-indigo-600 hover:bg-indigo-700 active:scale-95'
                  }
                `}
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Signing in...
                  </>
                ) : (
                  <>
                    <LogIn size={18} />
                    Sign In
                  </>
                )}
              </button>

              {/* Divider */}
              <div className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-white text-gray-500">Don't have an account?</span>
                </div>
              </div>

              {/* Sign Up Link */}
              <button
                type="button"
                onClick={() => navigate('/signup')}
                className={`
                  w-full py-2 px-4 rounded-lg font-semibold
                  border-2 border-indigo-600 text-indigo-600
                  hover:bg-indigo-50 transition-colors duration-200
                  ${loading ? 'cursor-not-allowed opacity-75' : ''}
                `}
                disabled={loading}
              >
                Create an Account
              </button>
            </form>

            {/* Demo Note */}
            <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm text-blue-700">
                <strong>Demo Account:</strong> Use any email/password or create a new account
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
