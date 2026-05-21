import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { GoogleOAuthProvider } from '@react-oauth/google';
import HomePage from './Homepage/HomePage';
import SignupForm from './authentication/SignupForm';
import Login from './authentication/Login';
import ForgotPassword from './authentication/ForgotPassword';
import ResetPassword from './authentication/ResetPassword';
import VerifyOTP from './authentication/VerifyOTP';
import ProfessionalRegistration from './serviceprovider/ProfessionalRegistration';
import Dashboard from './Dashboardsection/Dashboard';
import ServicesHistory from './Dashboardsection/ServicesHistory';
import UserProfile from './user-profile';
import ProfessionalProfile from './ProfessionalProfile';
import PrivateRoute from './PrivateRoute';
import ExploreJobs from './Homepage/ExploreJobs';
import Mybookings from './Dashboardsection/Mybookings';
import MessagePage from './Dashboardsection/message';
import PaymentPage from './Dashboardsection/PaymentPage';
import KhaltiVerify from './Dashboardsection/KhaltiVerify';
import Admindashboard from './Adminside/Admindashboard';
import AdminPrivateRoute from './Adminside/AdminPrivateRoute';
import ProfessionalDashboard from './serviceprovider/ProfessionalDashboard';
import CompaniesPage from './Homepage/CompaniesPage';
import PeoplePage from './Homepage/PeoplePage';
import ServicesPage from './Homepage/ServicesPage';
import HelpCentre from './HelpCentre/HelpCentre';
import PrivacyPolicy from './pages/PrivacyPolicy';
import TermsOfService from './pages/TermsOfService';
import TrustAndSafety from './pages/TrustAndSafety';

import toast, { Toaster, resolveValue } from 'react-hot-toast';

import './index.css';
import './Homepage/global.css';

// Monkeypatch react-hot-toast to support toast.info and toast.warning globally
if (!toast.info) {
  toast.info = (message, options) => {
    return toast(message, { ...options, customType: 'info' });
  };
}
if (!toast.warning) {
  toast.warning = (message, options) => {
    return toast(message, { ...options, customType: 'warning' });
  };
}

// Custom Toast Layout Resolver
const resolveToastData = (t) => {
  const customType = t.customType || (t.type === 'blank' ? 'info' : t.type);
  
  switch (customType) {
    case 'success':
      return {
        title: 'Success',
        accentColor: '#47D764',
        icon: (
          <div className="flex-shrink-0 w-7 h-7 rounded-full bg-[#47D764] flex items-center justify-center text-white shadow-sm shadow-[#47D764]/30 select-none">
            <svg className="w-4 h-4 stroke-[3]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </div>
        )
      };
    case 'error':
      return {
        title: 'Error',
        accentColor: '#FF355B',
        icon: (
          <div className="flex-shrink-0 w-7 h-7 rounded-full bg-[#FF355B] flex items-center justify-center text-white shadow-sm shadow-[#FF355B]/30 select-none">
            <svg className="w-3.5 h-3.5 stroke-[3]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
        )
      };
    case 'warning':
      return {
        title: 'Warning',
        accentColor: '#FFAE00',
        icon: (
          <div className="flex-shrink-0 w-7 h-7 rounded-full bg-[#FFAE00] flex items-center justify-center text-white shadow-sm shadow-[#FFAE00]/30 select-none flex items-center justify-center">
            <span className="font-sans font-black text-base text-white leading-none select-none">!</span>
          </div>
        )
      };
    case 'loading':
      return {
        title: 'Loading',
        accentColor: '#8D9096',
        icon: (
          <div className="flex-shrink-0 w-7 h-7 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-500 select-none">
            <svg className="animate-spin h-3.5 w-3.5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          </div>
        )
      };
    case 'info':
    default:
      return {
        title: 'Info',
        accentColor: '#2F86EB',
        icon: (
          <div className="flex-shrink-0 w-7 h-7 rounded-full bg-[#2F86EB] flex items-center justify-center text-white shadow-sm shadow-[#2F86EB]/30 select-none flex items-center justify-center">
            <span className="font-serif font-black text-base text-white leading-none select-none lowercase italic -mt-0.5">i</span>
          </div>
        )
      };
  }
};

const RedirectIfAdmin = ({ children }) => {
  try {
    const adminToken = localStorage.getItem('adminToken');
    const token = localStorage.getItem('token');
    const adminUser = JSON.parse(localStorage.getItem('adminUser') || 'null');
    const userRole = localStorage.getItem('userRole');
    
    // Only redirect if they actually have a token (prevent loop with stale role)
    const isAdmin = !!adminToken || (!!token && (adminUser?.role === 'admin' || adminUser?.role === 'super_admin' || userRole === 'admin'));
    
    if (isAdmin) {
      return <Navigate to="/admin/dashboard" replace />;
    }
  } catch (e) {
    console.error("Auth check error:", e);
  }
  
  return children;
};

const App = () => {
  return (
    <GoogleOAuthProvider clientId={process.env.REACT_APP_GOOGLE_CLIENT_ID || "PASTE_YOUR_GOOGLE_CLIENT_ID_HERE"}>
      <Toaster 
        position="top-right"
        toastOptions={{
          duration: 4000,
        }}
      >
        {(t) => {
          const { title, accentColor, icon } = resolveToastData(t);
          return (
            <div
              style={{
                opacity: t.visible ? 1 : 0,
                transform: t.visible ? 'scale(1) translateY(0)' : 'scale(0.9) translateY(-10px)',
                transition: 'all 0.25s cubic-bezier(0.21, 1.02, 0.43, 1.01)',
                borderLeft: `5px solid ${accentColor}`,
              }}
              className="relative flex items-start gap-3 p-3 pr-8 bg-white rounded-xl shadow-lg border border-slate-100 pointer-events-auto min-w-[280px] max-w-[360px]"
            >
              {icon}
              <div className="flex-1 flex flex-col gap-0.5">
                <h4 className="text-[14px] font-bold text-[#2F3037] tracking-tight leading-snug">
                  {title}
                </h4>
                <p className="text-[12px] font-medium text-[#8D9096] leading-relaxed">
                  {resolveValue(t.message, t)}
                </p>
              </div>
              <button
                onClick={() => toast.dismiss(t.id)}
                className="absolute top-3 right-2.5 text-[#8D9096]/60 hover:text-[#2F3037] transition-colors p-0.5 rounded"
              >
                <svg className="w-3 h-3 stroke-[2.5]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          );
        }}
      </Toaster>
      <Router>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/signup" element={<RedirectIfAdmin><SignupForm /></RedirectIfAdmin>} />
          <Route path="/login" element={<RedirectIfAdmin><Login /></RedirectIfAdmin>} />
          <Route path="/forgot-password" element={<RedirectIfAdmin><ForgotPassword /></RedirectIfAdmin>} />
          <Route path="/reset-password" element={<RedirectIfAdmin><ResetPassword /></RedirectIfAdmin>} />
          <Route path="/verify-otp" element={<RedirectIfAdmin><VerifyOTP /></RedirectIfAdmin>} />
          <Route path="/professional-registration" element={<ProfessionalRegistration />} />
          <Route path="/professional/:id" element={<ProfessionalProfile />} />
          <Route path="/explore-jobs" element={<ExploreJobs />} />
          <Route path="/companies" element={<CompaniesPage />} />
          <Route path="/people" element={<PeoplePage />} />
          <Route path="/services" element={<ServicesPage />} />
          <Route path="/help" element={<HelpCentre />} />
          <Route path="/privacy-policy" element={<PrivacyPolicy />} />
          <Route path="/terms-of-service" element={<TermsOfService />} />
          <Route path="/trust-and-safety" element={<TrustAndSafety />} />

          {/* Admin Routes */}
          <Route path="/admin/login" element={<Navigate to="/login" replace />} />
          <Route
            path="/admin/dashboard"
            element={
              <AdminPrivateRoute>
                <Admindashboard />
              </AdminPrivateRoute>
            }
          />

          {/* Protected routes */}
          <Route
            path="/dashboard"
            element={
              <PrivateRoute>
                <Dashboard />
              </PrivateRoute>
            }
          />
          <Route
            path="/services-history"
            element={
              <PrivateRoute>
                <ServicesHistory />
              </PrivateRoute>
            }
          />
          <Route
            path="/user-profile"
            element={
              <PrivateRoute>
                <UserProfile />
              </PrivateRoute>
            }
          />
          <Route
            path="/my-bookings"
            element={
              <PrivateRoute>
                <Mybookings />
              </PrivateRoute>
            }
          />

          <Route
            path="/messages"
            element={
              <PrivateRoute>
                <MessagePage />
              </PrivateRoute>
            }
          />

          <Route
            path="/payment/verify"
            element={
              <PrivateRoute>
                <KhaltiVerify />
              </PrivateRoute>
            }
          />

          <Route
            path="/payment/:bookingId"
            element={
              <PrivateRoute>
                <PaymentPage />
              </PrivateRoute>
            }
          />

          <Route
            path="/professional-dashboard"
            element={
              <PrivateRoute>
                <ProfessionalDashboard />
              </PrivateRoute>
            }
          />

          {/* Fallback route */}
          <Route path="*" element={<HomePage />} />
        </Routes>
      </Router>
    </GoogleOAuthProvider>
  );
};

export default App;

