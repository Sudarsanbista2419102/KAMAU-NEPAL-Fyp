import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
    Wallet, 
    ChevronLeft, 
    ShieldCheck, 
    Calendar, 
    Clock, 
    Tag,
    CheckCircle,
    ArrowRight,
    Loader2,
    XCircle,
    FileText as FileIcon
} from 'lucide-react';
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import { getBookingById, updatePaymentStatus } from '../bookingService';
import Logo from '../Logo';
import api from '../services/apiInstance';
import toast from 'react-hot-toast';


const KHALTI_INIT_URL = `/api/payments/khalti/initiate`;
const ESEWA_INIT_URL = `/api/payments/esewa/initiate`;
const ESEWA_FORM_URL = "https://rc-epay.esewa.com.np/api/epay/main/v2/form";

/**
 * Payment Hub: Secure Khalti Sandbox Integration
 * Handling the entire KPG-2 Flow from Initiation to Verification
 */

const PaymentPage = () => {
    const { bookingId } = useParams();
    const navigate = useNavigate();
    
    // Mission States
    const [booking, setBooking] = useState(null);
    const [loading, setLoading] = useState(true);
    const [processing, setProcessing] = useState(false);
    const [paymentMethod, setPaymentMethod] = useState('');
    const [paymentSuccess, setPaymentSuccess] = useState(false);
    const [error, setError] = useState(null);

    // Load Mission Details
    useEffect(() => {
        const fetchBooking = async () => {
            try {
                setLoading(true);
                const response = await getBookingById(bookingId);
                // Standardizing response check
                const data = response.success ? response.data : (response || null);
                if (data) setBooking(data);
                else throw new Error('Mission details could not be retrieved.');
            } catch (err) {
                console.error('Fetch error:', err);
                setError('Failed to sync with mission database.');
            } finally {
                setLoading(false);
            }
        };
        if (bookingId) fetchBooking();
    }, [bookingId]);

    /**
     * Khalti ePayment Flow (Redirect Style)
     * Handles Server-to-Server initiation as per official KPG-2 Sandbox specs
     */
    const handleKhaltiPayment = async () => {
        setProcessing(true);
        setError(null);
        try {
            console.log("📱 Initiating Khalti payment...");
            console.log("📍 Calling endpoint:", KHALTI_INIT_URL);
            
            const response = await api.post(KHALTI_INIT_URL, {
                bookingId,
                returnUrl: `${window.location.origin}/payment/verify`
            });

            console.log("✅ Khalti initiation response:", response.data);
            
            if (response.data.success && response.data.payment_url) {
                // Success: Redirect user to Khalti Sandbox Secure Gateway
                console.log("🚀 Establishing Secure Bridge to Khalti Sandbox...");
                window.location.href = response.data.payment_url;
            } else {
                throw new Error(response.data.message || "Khalti Gateway refused connection");
            }
        } catch (err) {
            console.error('❌ Khalti relay error:', err);
            console.error('Error response:', err.response?.data);
            console.error('Error status:', err.response?.status);
            
            let errorMsg = `Khalti Payment Error`;
            if (err.response?.status === 404) {
                errorMsg = `404 Not Found: Backend route /api/payments/khalti/initiate not found.`;
            } else if (err.response?.status === 401) {
                errorMsg = `401 Unauthorized: Please log in again.`;
            } else if (err.message === 'Network Error') {
                errorMsg = `Network Error: Cannot connect to backend on port 5001.`;
            } else {
                errorMsg = err.response?.data?.message || err.message || 'Unknown error occurred';
            }
            
            setError(errorMsg);
            toast.error(errorMsg);
            setProcessing(false);
        }
    };

    /**
     * eSewa Payment Flow (Form-Based POST)
     * KPG-2 style Sandbox Integration
     */
    const handleEsewaPayment = async () => {
        setProcessing(true);
        setError(null);
        try {
            console.log("📱 Initiating eSewa payment...");
            console.log("📍 Calling endpoint:", ESEWA_INIT_URL);
            
            const response = await api.post(ESEWA_INIT_URL, { bookingId });

            console.log("✅ eSewa initiation response:", response.data);
            
            if (response.data.success && response.data.payload) {
                console.log("🚀 Escalating Mission to eSewa Sandbox...");
                
                // eSewa REQUIRES an HTML Form POST
                const payload = response.data.payload;
                const form = document.createElement('form');
                form.method = 'POST';
                form.action = ESEWA_FORM_URL;

                // Add all signed fields from backend
                Object.entries(payload).forEach(([key, value]) => {
                    const input = document.createElement('input');
                    input.type = 'hidden';
                    input.name = key;
                    input.value = value;
                    form.appendChild(input);
                });

                document.body.appendChild(form);
                form.submit();
            } else {
                throw new Error(`eSewa API error: ${response.data.message || 'Unknown error'}`);
            }
        } catch (err) {
            console.error('❌ eSewa relay error:', err);
            console.error('Error response:', err.response?.data);
            console.error('Error status:', err.response?.status);
            
            let errorMsg = `eSewa Payment Error`;
            if (err.response?.status === 404) {
                errorMsg = `404 Not Found: Backend route /api/payments/esewa/initiate not found. Ensure backend is running on port 5001.`;
            } else if (err.response?.status === 401) {
                errorMsg = `401 Unauthorized: Please log in again.`;
            } else if (err.message === 'Network Error') {
                errorMsg = `Network Error: Cannot connect to backend. Ensure backend is running on port 5001.`;
            } else {
                errorMsg = err.response?.data?.message || err.message || 'Unknown error occurred';
            }
            
            setError(errorMsg);
            toast.error(errorMsg);
            setProcessing(false);
        }
    };

    /**
     * Cash/Manual Confirmation
     */
    const handleConfirmPayment = async () => {
        if (!paymentMethod) return toast.error('Select your preferred authorization protocol.');

        if (paymentMethod === 'Khalti') {
            await handleKhaltiPayment();
        } else if (paymentMethod === 'eSewa') {
            await handleEsewaPayment();
        } else if (paymentMethod === 'Cash') {
            // Instant verification for Cash missions
            setProcessing(true);
            try {
                await updatePaymentStatus(bookingId, 'Paid', 'Cash');
                setPaymentSuccess(true);
                setTimeout(() => navigate('/my-bookings'), 3000);
            } catch (err) {
                setError("Failed to record manual transaction.");
            } finally {
                setProcessing(false);
            }
        } else {
             // For eSewa - we can implement later if needed
             toast.info(`${paymentMethod} gateway is currently under maintenance in sandbox.`);
        }
    };

    // PDF Receipt Generator
    const handleDownloadInvoice = () => {
        if (!booking) return;
        const doc = new jsPDF();
        const tid = booking.transactionId || Math.random().toString(36).substr(2, 9).toUpperCase();
        
        doc.setFillColor(15, 118, 110); doc.rect(0, 0, 210, 50, 'F');
        doc.setTextColor(255, 255, 255); doc.setFontSize(28); doc.setFont('helvetica', 'bold');
        doc.text('KAMAU NEPAL', 20, 30);
        doc.setFontSize(10); doc.text('OFFICIAL MISSION RECEIPT', 20, 40);
        doc.text(`T-ID: #${tid}`, 150, 30);
        doc.text(`Date: ${new Date().toLocaleString()}`, 150, 40);

        autoTable(doc, {
            startY: 100,
            head: [['Description', 'Provider', 'Schedule', 'Amount']],
            body: [[booking.serviceTitle, (booking.professionalId ? `${booking.professionalId.firstName} ${booking.professionalId.lastName}` : booking.serviceProvider), `${booking.bookingDate} at ${booking.timeSchedule}`, `${booking.totalCost}`]],
            headStyles: { fillColor: [15, 118, 110] },
            theme: 'grid'
        });
        doc.save(`Invoice_KAMAU_${booking._id.slice(-6).toUpperCase()}.pdf`);
    };

    // Loading State: Holographic Spinner
    if (loading) return (
        <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4">
            <Loader2 className="w-16 h-16 text-orange-500 animate-spin mb-6" />
            <p className="text-slate-400 font-black uppercase tracking-[0.4em] text-[10px]">Syncing with Sandbox...</p>
        </div>
    );

    // Error State: Diagnostic Failure
    if (error && !booking) return (
        <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4">
            <div className="bg-slate-900 p-12 rounded-[48px] border border-slate-800 text-center max-w-sm shadow-2xl">
                <XCircle size={64} className="text-rose-500 mx-auto mb-6" />
                <h2 className="text-2xl font-black text-white mb-2">Protocol Error</h2>
                <p className="text-slate-500 text-sm mb-10 leading-relaxed">{error}</p>
                <button onClick={() => navigate('/my-bookings')} className="w-full py-5 bg-white text-black rounded-3xl font-black uppercase tracking-widest text-xs hover:bg-slate-200 transition-all">Abort Mission</button>
            </div>
        </div>
    );

    // Success Screen: Verified Complete
    if (paymentSuccess) return (
        <div className="min-h-screen bg-white flex flex-col items-center justify-center p-6 text-center animate-in fade-in duration-700">
            <div className="w-32 h-32 bg-green-50 rounded-full flex items-center justify-center text-green-500 mx-auto mb-8 border border-green-100 shadow-xl shadow-green-50/50 animate-bounce">
                <CheckCircle size={64} />
            </div>
            <h2 className="text-6xl font-black text-slate-900 mb-4 tracking-tighter">Mission Accomplished!</h2>
            <p className="text-slate-500 font-medium mb-12 max-w-sm mx-auto">Verified total of <span className="text-slate-900 font-black">{booking?.totalCost}</span> for {booking?.serviceTitle}.</p>
            <div className="flex flex-col sm:flex-row gap-4 mb-20">
                <button onClick={handleDownloadInvoice} className="px-12 py-5 bg-black text-white rounded-full font-black uppercase tracking-widest text-[11px] flex items-center gap-3 active:scale-95 shadow-2xl"><FileIcon size={18} /> Get Receipt</button>
                <button onClick={() => navigate('/my-bookings')} className="px-12 py-5 bg-white border border-slate-200 text-slate-500 rounded-full font-black uppercase tracking-widest text-[11px] active:scale-95">Back to Hub</button>
            </div>
            <p className="text-slate-400 font-bold uppercase tracking-[0.5em] text-[8px] animate-pulse">Encryption Status: SECURE-AES-256</p>
        </div>
    );

    // Active Checkout Component
    return (
        <div className="min-h-screen bg-slate-50 font-sans">
            <div className="max-w-7xl mx-auto px-6 py-12">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
                    
                    {/* Left Panel: Mission Intelligence */}
                    <div className="lg:col-span-7 space-y-8">
                        <header className="flex items-center justify-between mb-4">
                            <button onClick={() => navigate(-1)} className="p-3 bg-white rounded-2xl text-slate-400 hover:text-black transition-all shadow-sm border border-slate-200"><ChevronLeft size={20} /></button>
                            <Logo />
                        </header>
                        
                        <div className="bg-white rounded-[48px] p-12 border border-slate-200 shadow-2xl relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-slate-50 rounded-bl-[100px] -mr-4 -mt-4 border-l border-b border-slate-100 flex items-center justify-center pt-4 pl-4"><Tag className="text-slate-300" size={32} /></div>
                            <span className="px-5 py-2 bg-slate-100 text-slate-500 rounded-full text-[10px] font-black uppercase tracking-[0.2em] mb-6 inline-block">Security Reference: #{booking?._id.slice(-8).toUpperCase()}</span>
                            <h1 className="text-5xl font-black text-slate-900 tracking-tighter mb-8 leading-none">{booking?.serviceTitle}</h1>
                            
                            <div className="grid grid-cols-2 gap-10">
                                <section>
                                    <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Mission Date</h3>
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 bg-orange-50 rounded-2xl flex items-center justify-center text-orange-500 border border-orange-100"><Calendar size={20}/></div>
                                        <p className="font-black text-slate-900">{booking?.bookingDate}</p>
                                    </div>
                                </section>
                                <section>
                                    <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Time Slot</h3>
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-500 border border-blue-100"><Clock size={20}/></div>
                                        <p className="font-black text-slate-900">{booking?.timeSchedule}</p>
                                    </div>
                                </section>
                            </div>

                            <div className="mt-12 pt-12 border-t border-slate-100 flex items-center justify-between">
                                <div><p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Authorization Cost</p><p className="text-4xl font-black text-slate-900 tracking-tight">{booking?.totalCost}</p></div>
                                <div className="text-right flex flex-col items-end"><p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 flex items-center gap-2">Provider Handled <ShieldCheck size={14} className="text-teal-600" /></p><p className="font-black text-slate-900">{booking?.professionalId ? `${booking.professionalId.firstName} ${booking.professionalId.lastName}` : booking?.serviceProvider}</p></div>
                            </div>
                        </div>
                    </div>

                    {/* Right Panel: Gateway Protocol */}
                    <div className="lg:col-span-5 bg-white rounded-[56px] p-12 shadow-2xl border border-slate-200 sticky top-12">
                        <h2 className="text-3xl font-black text-slate-900 tracking-tighter mb-4">Neural Checkout</h2>
                        <p className="text-slate-400 font-medium mb-10 text-sm">Select an active neural gateway protocol.</p>
                        
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-10">
                            {[
                                { id: 'Khalti', name: 'Khalti', color: 'bg-[#5c2d91]', active: true },
                                { id: 'eSewa', name: 'eSewa', color: 'bg-[#60bb46]', active: true },
                                { id: 'Cash', name: 'Cash', color: 'bg-black', active: true }
                            ].map((method) => (
                                <button key={method.id} onClick={() => setPaymentMethod(method.id)} className={`p-6 rounded-[32px] border-2 flex flex-col items-center justify-center gap-4 transition-all relative group ${paymentMethod === method.id ? 'border-orange-500 bg-orange-50' : 'border-slate-50 bg-slate-50 hover:bg-white hover:border-slate-200'}`}>
                                    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-white shadow-xl group-hover:scale-110 transition-transform ${method.color}`}><Wallet size={24} /></div>
                                    <span className={`text-[9px] font-black uppercase tracking-widest ${paymentMethod === method.id ? 'text-orange-950' : 'text-slate-400'}`}>{method.name}</span>
                                    {paymentMethod === method.id && <div className="absolute top-3 right-3 bg-orange-500 rounded-full p-0.5 text-white shadow-md"><CheckCircle size={10} /></div>}
                                </button>
                            ))}
                        </div>

                        <div className="space-y-6">
                            {error && <div className="p-4 bg-rose-50 border border-rose-100 rounded-3xl text-[10px] font-black text-rose-600 uppercase tracking-widest text-center animate-pulse">{error}</div>}
                            
                            <button onClick={handleConfirmPayment} disabled={processing || !paymentMethod} className="w-full py-6 bg-slate-900 disabled:bg-slate-200 text-white rounded-3xl font-black uppercase tracking-[0.4em] text-[11px] shadow-2xl transition-all active:scale-[0.98] flex items-center justify-center gap-4 hover:bg-black group">
                                {processing ? <Loader2 className="animate-spin w-5 h-5" /> : <>Execute Protocol <ArrowRight size={20} className="group-hover:translate-x-2 transition-transform" /></>}
                            </button>
                            
                            <div className="flex items-center justify-between px-2">
                                <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest">Protocol Type</p>
                                <div className="flex gap-4 grayscale opacity-30">
                                    <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/5/5e/Visa_Inc._logo.svg/2560px-Visa_Inc._logo.svg.png" className="h-3" alt="Visa" />
                                    <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/2/2a/Mastercard-logo.svg/1280px-Mastercard-logo.svg.png" className="h-4" alt="Mastercard" />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PaymentPage;
