import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail } from 'lucide-react';
import BackButton from '../components/BackButton';


import axios from 'axios';
import toast from 'react-hot-toast';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!email) {
      toast.error('Please enter your email address');
      return;
    }

    try {
      setLoading(true);
      const response = await axios.post('/api/users/forgot-password', { email });
            // Save userId for the reset password step
        if (response.data.userId) {
          sessionStorage.setItem('resetUserId', response.data.userId);
        }
        // If email failed to send, inform user to check console for OTP
        if (response.data.emailFailed) {
          toast.error('Email delivery failed. Check console for OTP (development fallback).');
        }
        setIsSubmitted(true);
        toast.success(response.data.message || 'Reset link sent!');
        setTimeout(() => navigate('/reset-password'), 2000);
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Failed to send reset link. Please try again.';
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };
  return (
    <div className="min-h-screen bg-gradient-to-br from-cyan-50 to-blue-50 flex flex-col">

      <div className="p-6 flex items-center justify-between w-full">
        <div className="flex items-center gap-4">
          <BackButton variant="simple" />
        </div>
      </div>
      <div className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden">

        <div className="p-8">



          <div className="text-center mb-8">
            <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-cyan-100 mb-4">
              <Mail className="h-8 w-8 text-teal-600" />
            </div>
            <h1 className="text-2xl font-bold text-teal-900">Forgot Password?</h1>
            <p className="mt-2 text-gray-600">
              Enter your email and we'll send you a reset link
            </p>
          </div>

          {!isSubmitted ? (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email address
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-teal-600 to-teal-700 text-white font-medium py-3 px-4 rounded-lg hover:opacity-90 transition disabled:opacity-50"
              >
                {loading ? 'Sending...' : 'Send Reset Link'}
              </button>
            </form>
          ) : (
            <div className="text-center py-8">
              <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-green-100 mb-4">
                <svg className="h-8 w-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h2 className="text-xl font-bold text-gray-900">Check Your Email!</h2>
              <p className="mt-2 text-gray-600">
                We've sent a reset link to <span className="font-semibold">{email}</span>
              </p>
              <p className="mt-4 text-sm text-gray-500">
                Redirecting to password reset...
              </p>
            </div>
          )}

          <div className="mt-8 pt-6 border-t border-gray-200 text-center">
            <p className="text-sm text-gray-600">
              Remember your password?{' '}
              <Link to="/login" className="text-teal-600 font-medium hover:text-teal-700">
                Back to Login
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
    </div>
  );
};




export default ForgotPassword;