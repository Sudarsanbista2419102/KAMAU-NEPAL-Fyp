import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Shield, Eye, Database, Lock, UserCheck, Bell, Globe, FileText, Mail } from 'lucide-react';
import Logo from '../Logo';

const SectionCard = ({ icon: Icon, title, children, accent = 'teal' }) => (
  <div className="bg-white rounded-[32px] p-8 md:p-10 border border-slate-100 shadow-sm hover:shadow-lg transition-shadow duration-300">
    <div className="flex items-start gap-4 mb-6">
      <div className={`w-12 h-12 rounded-2xl bg-${accent}-50 border border-${accent}-100 flex items-center justify-center text-${accent}-600 shrink-0`}>
        <Icon size={22} />
      </div>
      <h2 className="text-xl font-black text-slate-900 tracking-tight pt-2">{title}</h2>
    </div>
    <div className="text-slate-600 font-medium leading-relaxed space-y-4 text-sm md:text-base">
      {children}
    </div>
  </div>
);

const PrivacyPolicy = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-2xl border-b border-slate-200/50 shadow-sm">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center gap-4 h-16">
          <button onClick={() => navigate(-1)} className="p-2 bg-slate-100 rounded-xl hover:bg-slate-200 text-slate-500 transition-all">
            <ArrowLeft size={20} />
          </button>
          <Link to="/"><Logo /></Link>
        </div>

      </nav>

      {/* Hero */}
      <header className="bg-gradient-to-br from-slate-900 via-slate-800 to-teal-900 text-white py-20 md:py-28 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, white 1px, transparent 0)', backgroundSize: '40px 40px' }} />
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-14 h-14 bg-teal-500/20 rounded-2xl flex items-center justify-center border border-teal-500/30">
              <Shield size={28} className="text-teal-400" />
            </div>
          </div>
          <h1 className="text-4xl md:text-6xl font-black tracking-tighter mb-4">Privacy Policy</h1>
          <p className="text-slate-400 font-medium max-w-2xl text-lg">Your privacy matters to us. This policy explains how Kamau Nepal collects, uses, and protects your personal information.</p>
          <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mt-8">Last Updated: May 1, 2025</p>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16 space-y-6">

        <SectionCard icon={Database} title="1. Information We Collect">
          <p>We collect information you provide directly to us when you create an account, register as a professional, make a booking, or communicate with us. This includes:</p>
          <ul className="list-disc list-inside space-y-2 ml-2">
            <li><strong>Account Information:</strong> Name, email address, phone number, username, and password.</li>
            <li><strong>Professional Profile:</strong> Service category, hourly wage, service area, bio, profile/cover images, and verification documents.</li>
            <li><strong>Booking Details:</strong> Service requests, booking dates, locations, and payment information.</li>
            <li><strong>Location Data:</strong> With your consent, we collect geolocation data to connect you with nearby professionals.</li>
            <li><strong>Communication Data:</strong> Messages exchanged between users and professionals on the platform.</li>
          </ul>
        </SectionCard>

        <SectionCard icon={Eye} title="2. How We Use Your Information">
          <p>We use the information we collect to:</p>
          <ul className="list-disc list-inside space-y-2 ml-2">
            <li>Provide, maintain, and improve our platform services.</li>
            <li>Process bookings and facilitate payments between users and professionals.</li>
            <li>Verify professional identities and maintain platform trust.</li>
            <li>Send you notifications about bookings, messages, and account updates.</li>
            <li>Analyze usage patterns to improve user experience.</li>
            <li>Detect and prevent fraud, abuse, and security threats.</li>
          </ul>
        </SectionCard>

        <SectionCard icon={UserCheck} title="3. Information Sharing">
          <p>We do not sell your personal information. We may share your data in the following circumstances:</p>
          <ul className="list-disc list-inside space-y-2 ml-2">
            <li><strong>With Professionals/Users:</strong> When you make a booking, your name, contact details, and location are shared with the service professional, and vice versa.</li>
            <li><strong>Payment Processors:</strong> We share transaction data with payment gateways (Khalti, eSewa) to process payments securely.</li>
            <li><strong>Legal Requirements:</strong> We may disclose information if required by law or to protect the rights and safety of our users.</li>
            <li><strong>With Your Consent:</strong> We may share information with third parties when you give us explicit permission.</li>
          </ul>
        </SectionCard>

        <SectionCard icon={Lock} title="4. Data Security">
          <p>We implement industry-standard security measures to protect your personal information, including:</p>
          <ul className="list-disc list-inside space-y-2 ml-2">
            <li>Encrypted data transmission using HTTPS/TLS protocols.</li>
            <li>Secure password hashing using bcrypt.</li>
            <li>JWT-based authentication tokens with expiration.</li>
            <li>Regular security audits and vulnerability assessments.</li>
            <li>Access controls limiting data access to authorized personnel only.</li>
          </ul>
          <p>While we strive to protect your data, no method of electronic transmission is 100% secure. We encourage you to use strong passwords and keep your account credentials safe.</p>
        </SectionCard>

        <SectionCard icon={Bell} title="5. Cookies & Tracking">
          <p>We use local storage and session data to maintain your login state and preferences. We do not use third-party tracking cookies for advertising purposes. Analytics data is collected in aggregate form to understand platform usage.</p>
        </SectionCard>

        <SectionCard icon={Globe} title="6. Your Rights">
          <p>You have the right to:</p>
          <ul className="list-disc list-inside space-y-2 ml-2">
            <li><strong>Access:</strong> Request a copy of the personal data we hold about you.</li>
            <li><strong>Update:</strong> Modify your profile information at any time through your account settings.</li>
            <li><strong>Delete:</strong> Request deletion of your account and associated data.</li>
            <li><strong>Withdraw Consent:</strong> Opt out of location tracking and non-essential communications.</li>
          </ul>
        </SectionCard>

        <SectionCard icon={FileText} title="7. Data Retention">
          <p>We retain your personal information for as long as your account is active or as needed to provide you services. Booking records and transaction history are retained for a minimum of 2 years for legal and financial compliance. You may request account deletion at any time by contacting our support team.</p>
        </SectionCard>

        <SectionCard icon={Mail} title="8. Contact Us" accent="orange">
          <p>If you have any questions about this Privacy Policy, please contact us at:</p>
          <div className="bg-slate-50 rounded-2xl p-6 border border-slate-100 mt-4">
            <p className="font-black text-slate-900">Kamau Nepal Support</p>
            <p>Email: <a href="mailto:privacy@kamaunepal.com" className="text-teal-600 font-bold hover:underline">privacy@kamaunepal.com</a></p>
            <p>Kathmandu, Nepal</p>
          </div>
        </SectionCard>

      </main>

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-500 py-8 text-center text-sm font-medium border-t border-slate-800">
        <p>© 2025 Kamau Nepal. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default PrivacyPolicy;
