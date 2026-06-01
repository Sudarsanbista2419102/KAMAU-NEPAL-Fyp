import React, { useState } from 'react';
import { 
  Search, 
  HelpCircle, 
  CreditCard, 
  User, 
  ShieldCheck, 
  MessageSquare, 
  ChevronDown, 
  FileText, 
  Briefcase,
  ExternalLink,
  LifeBuoy
} from 'lucide-react';
import { Link } from 'react-router-dom';
import Logo from '../Logo';

const HelpCentre = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFaq, setActiveFaq] = useState(null);

  const categories = [
    {
      id: 'bookings',
      icon: <Briefcase className="text-teal-600" size={32} />,
      title: 'Booking Services',
      description: 'Learn how to find, book and manage professional services.',
      count: 12
    },
    {
      id: 'payments',
      icon: <CreditCard className="text-orange-600" size={32} />,
      title: 'Payments & Refunds',
      description: 'Pricing, payment methods, and refund policies explained.',
      count: 8
    },
    {
      id: 'account',
      icon: <User className="text-blue-600" size={32} />,
      title: 'Account Settings',
      description: 'Manage your profile, password, and communication preferences.',
      count: 15
    },
    {
      id: 'verification',
      icon: <ShieldCheck className="text-emerald-600" size={32} />,
      title: 'Professional Verification',
      description: 'How to get verified and start earning on Kamau Nepal.',
      count: 10
    },
    {
      id: 'safety',
      icon: <LifeBuoy className="text-red-500" size={32} />,
      title: 'Safety & Trust',
      description: 'Safety tips and how we protect our community.',
      count: 6
    },
    {
      id: 'legal',
      icon: <FileText className="text-slate-600" size={32} />,
      title: 'Terms & Policies',
      description: 'Service agreements, privacy policy and documentation.',
      count: 4
    }
  ];

  const faqs = [
    {
      question: 'How do I book a professional on Kamau Nepal?',
      answer: 'Simply search for the service you need (e.g., Plumber) on the homepage, browse through verified professional profiles, and click "Book Now". You can select your preferred time and provide job details before confirming.'
    },
    {
      question: 'Is my payment secure?',
      answer: "Yes, we use industry-standard encryption and trusted payment gateways like Khalti and eSewa. Your payment is held securely and only released when the service is confirmed or as per our milestone policy."
    },
    {
      question: 'How do I become a verified professional?',
      answer: 'Go to the "Register as Professional" page, fill in your details, upload your identity documents (Citizenship/License), and certifications. Our team will review your application within 24-48 hours.'
    },
    {
      question: 'What if a professional doesn\'t show up?',
      answer: "If a professional fails to arrive at the scheduled time, you can report it through your dashboard. We will investigate and provide a full refund or help you reschedule at no additional cost."
    },
    {
      question: 'Can I cancel a booking?',
      answer: 'Yes, you can cancel a booking from your "My Bookings" dashboard. Cancellation fees may apply depending on how close it is to the service time. Check our Refund Policy for details.'
    }
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Header/Nav */}
      <nav className="bg-white border-b border-slate-100 py-4 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <Logo />
            <div className="h-6 w-px bg-slate-200" />
            <span className="text-slate-900 font-black tracking-tight flex items-center gap-2">
              <HelpCircle size={20} className="text-orange-500" /> Help Centre
            </span>
          </div>
          <Link to="/" className="text-sm font-bold text-teal-600 hover:text-teal-700 transition-colors">
            Back to Site
          </Link>
        </div>
      </nav>

      <main className="flex-grow">
        {/* Hero Section */}
        <section className="bg-gradient-to-br from-slate-900 via-slate-800 to-teal-900 py-20 px-4 text-center">
          <div className="max-w-3xl mx-auto">
            <h1 className="text-4xl md:text-5xl font-black text-white mb-6 tracking-tight">
              How can we <span className="text-teal-400">help you?</span>
            </h1>
            <div className="relative mt-10">
              <div className="absolute inset-0 bg-teal-400/20 rounded-2xl blur-xl" />
              <div className="relative flex items-center bg-white p-2 rounded-2xl shadow-2xl">
                <Search className="ml-4 text-slate-400" size={24} />
                <input 
                  type="text" 
                  placeholder="Search for articles, guides, and more..." 
                  className="w-full py-4 px-4 text-slate-800 focus:outline-none font-medium text-lg"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                <button className="hidden md:block bg-teal-600 text-white px-8 py-4 rounded-xl font-bold hover:bg-teal-700 transition-all mr-1">
                  Search
                </button>
              </div>
            </div>
            <div className="mt-8 flex flex-wrap justify-center gap-3">
              <span className="text-slate-400 text-sm font-semibold">Popular:</span>
              {['Verification', 'Payment', 'Refunds', 'Booking'].map(tag => (
                <button key={tag} className="text-xs font-bold text-white/70 bg-white/10 hover:bg-white/20 px-3 py-1.5 rounded-full border border-white/10 transition-all">
                  {tag}
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* Categories Grid */}
        <section className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-black text-slate-900 mb-4">Browse by Category</h2>
            <p className="text-slate-500 font-medium">Select a topic to find the information you need</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {categories.map((cat) => (
              <div 
                key={cat.id} 
                className="group bg-white p-8 rounded-[32px] border border-slate-100 shadow-sm hover:shadow-xl hover:border-teal-200 transition-all duration-300 cursor-pointer"
              >
                <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                  {cat.icon}
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-3 group-hover:text-teal-600 transition-colors">{cat.title}</h3>
                <p className="text-slate-500 font-medium text-sm leading-relaxed mb-6">
                  {cat.description}
                </p>
                <span className="text-xs font-black text-teal-600 uppercase tracking-widest flex items-center gap-2">
                  View {cat.count} Articles < ChevronDown size={14} className="-rotate-90" />
                </span>
              </div>
            ))}
          </div>
        </section>

        {/* FAQ Section */}
        <section className="py-20 bg-white border-y border-slate-100">
          <div className="max-w-4xl mx-auto px-4">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-black text-slate-900 mb-4">Frequently Asked Questions</h2>
              <p className="text-slate-500 font-medium">Quick answers to questions you might have</p>
            </div>
            <div className="space-y-4">
              {faqs.map((faq, index) => (
                <div 
                  key={index} 
                  className={`border border-slate-100 rounded-2xl overflow-hidden transition-all duration-300 ${activeFaq === index ? 'shadow-lg border-teal-100' : ''}`}
                >
                  <button 
                    onClick={() => setActiveFaq(activeFaq === index ? null : index)}
                    className="w-full flex items-center justify-between p-6 text-left hover:bg-slate-50 transition-colors"
                  >
                    <span className="font-bold text-slate-800">{faq.question}</span>
                    <ChevronDown 
                      size={20} 
                      className={`text-slate-400 transition-transform duration-300 ${activeFaq === index ? 'rotate-180 text-teal-600' : ''}`} 
                    />
                  </button>
                  {activeFaq === index && (
                    <div className="px-6 pb-6 animate-in slide-in-from-top-2 duration-300">
                      <div className="h-px bg-slate-50 mb-6" />
                      <p className="text-slate-600 font-medium leading-relaxed">
                        {faq.answer}
                      </p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Contact Support */}
        <section className="py-20 max-w-7xl mx-auto px-4">
          <div className="bg-orange-500 rounded-[40px] p-8 md:p-16 relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-8 shadow-2xl">
            <div className="absolute top-0 right-0 w-64 h-64 bg-orange-400/20 rounded-full blur-3xl -mr-32 -mt-32" />
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-orange-600/20 rounded-full blur-3xl -ml-32 -mb-32" />
            
            <div className="relative z-10 text-center md:text-left">
              <h2 className="text-3xl md:text-4xl font-black text-white mb-4">Still need help?</h2>
              <p className="text-orange-100 font-medium text-lg">Our support team is available 24/7 to assist you.</p>
            </div>
            
            <div className="relative z-10 flex flex-col sm:flex-row gap-4 w-full md:w-auto">
              <button className="bg-white text-orange-600 px-10 py-4 rounded-2xl font-black shadow-lg hover:scale-105 active:scale-95 transition-all text-sm uppercase tracking-wider flex items-center justify-center gap-2">
                <MessageSquare size={18} /> Chat with us
              </button>
              <button className="bg-orange-600 text-white border border-orange-400 px-10 py-4 rounded-2xl font-black shadow-lg hover:bg-orange-700 active:scale-95 transition-all text-sm uppercase tracking-wider flex items-center justify-center gap-2">
                Email Support <ExternalLink size={18} />
              </button>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-white py-12 border-t border-slate-100">
        <div className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-3">
            <Logo className="w-8" />
            <span className="text-slate-400 text-sm font-medium">© 2025 Kamau Nepal Support Centre</span>
          </div>
          <div className="flex gap-8">
             {['Privacy Policy', 'Terms of Use', 'Security'].map(l => (
               <Link key={l} to="#" className="text-sm font-semibold text-slate-500 hover:text-teal-600 transition-colors">{l}</Link>
             ))}
          </div>
        </div>
      </footer>
    </div>
  );
};

export default HelpCentre;
