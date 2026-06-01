import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, FileText, Users, CreditCard, AlertTriangle, Scale, Ban, RefreshCw, Gavel, Mail } from 'lucide-react';
import Logo from '../Logo';

const SectionCard = ({ icon: Icon, title, children, accent = 'orange' }) => (
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

const TermsOfService = () => {
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
      <header className="bg-gradient-to-br from-slate-900 via-slate-800 to-orange-900 text-white py-20 md:py-28 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, white 1px, transparent 0)', backgroundSize: '40px 40px' }} />
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-14 h-14 bg-orange-500/20 rounded-2xl flex items-center justify-center border border-orange-500/30">
              <FileText size={28} className="text-orange-400" />
            </div>
          </div>
          <h1 className="text-4xl md:text-6xl font-black tracking-tighter mb-4">Terms of Service</h1>
          <p className="text-slate-400 font-medium max-w-2xl text-lg">By using Kamau Nepal, you agree to the following terms and conditions that govern your use of our platform.</p>
          <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mt-8">Last Updated: May 1, 2025</p>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16 space-y-6">

        <SectionCard icon={FileText} title="1. Acceptance of Terms">
          <p>By accessing or using the Kamau Nepal platform ("Service"), you agree to be bound by these Terms of Service. If you do not agree to these terms, you may not use the Service. These terms apply to all users, including customers, service professionals, and visitors.</p>
          <p>We reserve the right to update these terms at any time. Continued use of the platform after changes constitutes acceptance of the modified terms.</p>
        </SectionCard>

        <SectionCard icon={Users} title="2. User Accounts">
          <p>To use certain features of the platform, you must create an account. You agree to:</p>
          <ul className="list-disc list-inside space-y-2 ml-2">
            <li>Provide accurate, current, and complete information during registration.</li>
            <li>Maintain the security and confidentiality of your account credentials.</li>
            <li>Accept responsibility for all activities that occur under your account.</li>
            <li>Immediately notify us of any unauthorized use of your account.</li>
            <li>Not create multiple accounts or share account access with others.</li>
          </ul>
          <p>We reserve the right to suspend or terminate accounts that violate these terms or engage in fraudulent activity.</p>
        </SectionCard>

        <SectionCard icon={Scale} title="3. Professional Services">
          <p>Kamau Nepal serves as a marketplace connecting customers with service professionals. Important points:</p>
          <ul className="list-disc list-inside space-y-2 ml-2">
            <li><strong>Independent Contractors:</strong> Service professionals are independent contractors, not employees of Kamau Nepal.</li>
            <li><strong>Service Quality:</strong> Professionals are responsible for the quality of their services. Kamau Nepal does not guarantee the outcome of any service.</li>
            <li><strong>Verification:</strong> While we verify professional identities and credentials, this does not constitute an endorsement or guarantee of skill level.</li>
            <li><strong>Disputes:</strong> Service disputes between customers and professionals should be resolved directly. We provide a reporting mechanism to help mediate serious issues.</li>
          </ul>
        </SectionCard>

        <SectionCard icon={CreditCard} title="4. Payments & Refunds">
          <p>Payment terms for services booked through the platform:</p>
          <ul className="list-disc list-inside space-y-2 ml-2">
            <li><strong>Pricing:</strong> Professionals set their own hourly rates or fixed prices. All prices are displayed in Nepali Rupees (NPR).</li>
            <li><strong>Payment Methods:</strong> We support Khalti, eSewa, and cash payments.</li>
            <li><strong>Refunds:</strong> Refund requests are handled on a case-by-case basis. Cancellations made before service commencement may be eligible for a full refund.</li>
            <li><strong>Service Fees:</strong> Kamau Nepal may charge a platform service fee on transactions. Any applicable fees will be clearly displayed before payment confirmation.</li>
          </ul>
        </SectionCard>

        <SectionCard icon={Ban} title="5. Prohibited Activities">
          <p>The following activities are strictly prohibited on the platform:</p>
          <ul className="list-disc list-inside space-y-2 ml-2">
            <li>Providing false or misleading information in your profile or listings.</li>
            <li>Harassment, discrimination, or abusive behavior toward other users.</li>
            <li>Attempting to circumvent the platform to avoid service fees.</li>
            <li>Using the platform for illegal activities or unauthorized services.</li>
            <li>Scraping, data mining, or automated access to the platform.</li>
            <li>Impersonating another person or professional.</li>
            <li>Posting fraudulent reviews or manipulating ratings.</li>
          </ul>
        </SectionCard>

        <SectionCard icon={AlertTriangle} title="6. Limitation of Liability">
          <p>Kamau Nepal provides the platform "as is" without warranties of any kind. We are not liable for:</p>
          <ul className="list-disc list-inside space-y-2 ml-2">
            <li>Any damages resulting from services performed by professionals.</li>
            <li>Loss of data or unauthorized access to your account due to your negligence.</li>
            <li>Service interruptions, downtime, or technical errors beyond our control.</li>
            <li>Any indirect, incidental, or consequential damages arising from your use of the platform.</li>
          </ul>
          <p>Our total liability to you for any claims shall not exceed the amount you paid through the platform in the preceding 12 months.</p>
        </SectionCard>

        <SectionCard icon={RefreshCw} title="7. Cancellation & Termination">
          <p>You may deactivate your account at any time by contacting our support team. We may terminate or suspend your account if you:</p>
          <ul className="list-disc list-inside space-y-2 ml-2">
            <li>Violate any provision of these Terms of Service.</li>
            <li>Engage in fraudulent or illegal activities.</li>
            <li>Receive multiple reports from other users.</li>
            <li>Fail to maintain accurate account information.</li>
          </ul>
          <p>Upon termination, your right to use the Service immediately ceases. Data may be retained as required by law or for legitimate business purposes.</p>
        </SectionCard>

        <SectionCard icon={Gavel} title="8. Governing Law">
          <p>These Terms of Service shall be governed by and construed in accordance with the laws of Nepal. Any disputes arising from these terms shall be subject to the exclusive jurisdiction of the courts in Kathmandu, Nepal.</p>
        </SectionCard>

        <SectionCard icon={Mail} title="9. Contact Us" accent="teal">
          <p>If you have questions about these Terms of Service, please contact us:</p>
          <div className="bg-slate-50 rounded-2xl p-6 border border-slate-100 mt-4">
            <p className="font-black text-slate-900">Kamau Nepal Legal</p>
            <p>Email: <a href="mailto:legal@kamaunepal.com" className="text-teal-600 font-bold hover:underline">legal@kamaunepal.com</a></p>
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

export default TermsOfService;
