import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, ShieldCheck, UserCheck, AlertTriangle, Flag, Search, Lock, Heart, MessageSquare, Phone, Mail } from 'lucide-react';
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

const TrustCard = ({ icon: Icon, title, description }) => (
  <div className="bg-white rounded-3xl p-6 md:p-8 border border-slate-100 shadow-sm text-center hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group">
    <div className="w-16 h-16 rounded-2xl bg-teal-50 border border-teal-100 flex items-center justify-center text-teal-600 mx-auto mb-5 group-hover:scale-110 transition-transform">
      <Icon size={28} />
    </div>
    <h3 className="text-lg font-black text-slate-900 mb-2">{title}</h3>
    <p className="text-slate-500 text-sm font-medium leading-relaxed">{description}</p>
  </div>
);

const TrustAndSafety = () => {
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
      <header className="bg-gradient-to-br from-teal-900 via-slate-900 to-slate-800 text-white py-20 md:py-28 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, white 1px, transparent 0)', backgroundSize: '40px 40px' }} />
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-14 h-14 bg-teal-500/20 rounded-2xl flex items-center justify-center border border-teal-500/30">
              <ShieldCheck size={28} className="text-teal-400" />
            </div>
          </div>
          <h1 className="text-4xl md:text-6xl font-black tracking-tighter mb-4">Trust & Safety</h1>
          <p className="text-slate-400 font-medium max-w-2xl text-lg">Building a safe, reliable, and trustworthy marketplace for Nepal's workforce — one verified connection at a time.</p>
        </div>
      </header>

      {/* Trust Pillars */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 -mt-12 relative z-10 mb-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <TrustCard icon={UserCheck} title="Verified Professionals" description="Every professional undergoes identity verification and document review before being approved." />
          <TrustCard icon={ShieldCheck} title="Secure Payments" description="All transactions are encrypted and processed through trusted gateways like Khalti and eSewa." />
          <TrustCard icon={Flag} title="Report System" description="Our reporting system lets you flag inappropriate behavior. Reports are reviewed within 24 hours." />
          <TrustCard icon={Lock} title="Data Protection" description="Your personal information is encrypted and stored securely following industry best practices." />
        </div>
      </section>

      {/* Content */}
      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-4 md:py-8 space-y-6">

        <SectionCard icon={UserCheck} title="Professional Verification">
          <p>We take verification seriously to ensure every professional on our platform is legitimate and qualified. Our verification process includes:</p>
          <ul className="list-disc list-inside space-y-2 ml-2">
            <li><strong>Identity Verification:</strong> Professionals must submit government-issued identification documents (Citizenship, Passport, or Driver's License).</li>
            <li><strong>Document Review:</strong> All submitted documents are manually reviewed by our admin team for authenticity.</li>
            <li><strong>Profile Accuracy:</strong> Professional profiles are checked for accurate service descriptions, pricing, and contact information.</li>
            <li><strong>Ongoing Monitoring:</strong> Verified professionals are subject to ongoing monitoring based on user feedback and reviews.</li>
          </ul>
          <div className="bg-teal-50 rounded-2xl p-5 border border-teal-100 mt-4 flex items-start gap-3">
            <ShieldCheck size={20} className="text-teal-600 shrink-0 mt-0.5" />
            <p className="text-teal-800 text-sm font-bold">Look for the green verification badge on professional profiles — it means they have been thoroughly vetted by our team.</p>
          </div>
        </SectionCard>

        <SectionCard icon={Flag} title="Reporting & Safety" accent="orange">
          <p>If you encounter any safety concerns or inappropriate behavior, we encourage you to report it immediately. You can report:</p>
          <ul className="list-disc list-inside space-y-2 ml-2">
            <li><strong>Fraud or Scams:</strong> Professionals misrepresenting their services, qualifications, or pricing.</li>
            <li><strong>Harassment:</strong> Any form of verbal, physical, or sexual harassment during or after service.</li>
            <li><strong>Unsafe Behavior:</strong> Actions that endanger the safety of customers or their property.</li>
            <li><strong>Policy Violations:</strong> Any behavior that violates our Terms of Service or community guidelines.</li>
          </ul>
          <p><strong>How to report:</strong> Navigate to the professional's profile and click the "Report" button. You can only report a professional after a completed service to prevent misuse of the reporting system.</p>
          <div className="bg-orange-50 rounded-2xl p-5 border border-orange-100 mt-4 flex items-start gap-3">
            <AlertTriangle size={20} className="text-orange-600 shrink-0 mt-0.5" />
            <p className="text-orange-800 text-sm font-bold">All reports are confidential. The reported professional will not know who filed the report. Our team reviews every report within 24 hours.</p>
          </div>
        </SectionCard>

        <SectionCard icon={Search} title="Review & Rating System">
          <p>Our review system helps maintain quality and accountability across the platform:</p>
          <ul className="list-disc list-inside space-y-2 ml-2">
            <li><strong>Verified Reviews:</strong> Only customers who have completed a booking can leave a review, ensuring authenticity.</li>
            <li><strong>Star Ratings:</strong> Rate professionals on a 1-5 star scale based on your experience.</li>
            <li><strong>Written Feedback:</strong> Share detailed feedback to help other customers make informed decisions.</li>
            <li><strong>Review Monitoring:</strong> We actively monitor reviews for fake or malicious content and remove violations.</li>
          </ul>
          <p>Professionals with consistently low ratings or negative feedback may face review by our team and potential account action.</p>
        </SectionCard>

        <SectionCard icon={Heart} title="Community Guidelines">
          <p>To maintain a safe and respectful community, all users are expected to:</p>
          <ul className="list-disc list-inside space-y-2 ml-2">
            <li><strong>Be Respectful:</strong> Treat all users, professionals, and staff with dignity and respect.</li>
            <li><strong>Be Honest:</strong> Provide accurate information in profiles, reviews, and communications.</li>
            <li><strong>Be Professional:</strong> Maintain professional conduct during all service interactions.</li>
            <li><strong>Be Safe:</strong> Report any safety concerns immediately and do not engage in risky behavior.</li>
            <li><strong>Be Fair:</strong> Pay promptly for completed services and honor booking commitments.</li>
          </ul>
        </SectionCard>

        <SectionCard icon={MessageSquare} title="Dispute Resolution">
          <p>If a dispute arises between a customer and a professional, we recommend the following steps:</p>
          <div className="space-y-3 mt-2">
            {[
              { step: '1', title: 'Direct Communication', desc: 'First, try to resolve the issue directly through the platform messaging system.' },
              { step: '2', title: 'File a Report', desc: 'If direct communication fails, file a formal report through the professional\'s profile page.' },
              { step: '3', title: 'Admin Review', desc: 'Our admin team will review the case, contact both parties, and work towards a fair resolution.' },
              { step: '4', title: 'Final Decision', desc: 'We will issue a decision which may include refunds, warnings, or account suspension as appropriate.' }
            ].map(item => (
              <div key={item.step} className="flex items-start gap-4 bg-slate-50 rounded-2xl p-5 border border-slate-100">
                <div className="w-10 h-10 rounded-xl bg-teal-600 text-white flex items-center justify-center font-black text-sm shrink-0">{item.step}</div>
                <div>
                  <p className="font-black text-slate-900 text-sm">{item.title}</p>
                  <p className="text-slate-500 text-sm">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </SectionCard>

        <SectionCard icon={Phone} title="Emergency & Safety Tips" accent="orange">
          <p>Your safety is our top priority. Here are some important safety tips:</p>
          <ul className="list-disc list-inside space-y-2 ml-2">
            <li>Always verify the professional's identity before allowing access to your property.</li>
            <li>Share your booking details with a trusted friend or family member.</li>
            <li>Meet professionals in well-lit, accessible locations when possible.</li>
            <li>Keep all communications within the platform for your protection.</li>
            <li>Trust your instincts — if something feels wrong, cancel the booking and report it.</li>
          </ul>
          <div className="bg-red-50 rounded-2xl p-5 border border-red-100 mt-4 flex items-start gap-3">
            <AlertTriangle size={20} className="text-red-600 shrink-0 mt-0.5" />
            <p className="text-red-800 text-sm font-bold">In case of an emergency, always call Nepal Police at 100 or the nearest emergency services first before contacting us.</p>
          </div>
        </SectionCard>

        <SectionCard icon={Mail} title="Contact Trust & Safety Team">
          <p>Our dedicated Trust & Safety team is available to help with safety concerns:</p>
          <div className="bg-slate-50 rounded-2xl p-6 border border-slate-100 mt-4">
            <p className="font-black text-slate-900">Kamau Nepal Trust & Safety</p>
            <p>Email: <a href="mailto:safety@kamaunepal.com" className="text-teal-600 font-bold hover:underline">safety@kamaunepal.com</a></p>
            <p>Emergency Hotline: <span className="font-bold text-slate-900">+977-1-XXXXXXX</span></p>
            <p className="text-xs text-slate-400 mt-2">Response Time: Within 24 hours for standard reports, 2 hours for urgent safety concerns.</p>
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

export default TrustAndSafety;
