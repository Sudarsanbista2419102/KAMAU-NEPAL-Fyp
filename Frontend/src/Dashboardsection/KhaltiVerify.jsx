import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Loader2, CheckCircle, XCircle, ShieldCheck } from 'lucide-react';
import axios from 'axios';
import api from '../services/apiInstance';
import Logo from '../Logo';

const KHALTI_VERIFY_URL = `/api/payments/khalti/verify`;

/**
 * Khalti Neural Verification Protocol
 * Automatically confirms transaction status from pidx returned by gateway redirect
 */

const KhaltiVerify = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const [status, setStatus] = useState('verifying'); // verifying, success, error
    const [message, setMessage] = useState('Establishing Secure Handshake with Khalti Sandbox...');
    const [diagnosticCode, setDiagnosticCode] = useState(null);

    const pidx = searchParams.get('pidx');
    const bookingId = searchParams.get('purchase_order_id') || searchParams.get('booking_id');

    useEffect(() => {
        const verifyPayment = async () => {
            // Check for eSewa result first (Backend handles eSewa verification and redirects here with status)
            const esewaStatus = searchParams.get('status');
            if (esewaStatus) {
                if (esewaStatus === 'success') {
                    setStatus('success');
                    setMessage('Neural Update Confirmed: eSewa transaction verified via secure handshake.');
                } else {
                    setStatus('error');
                    setMessage('Neural Signal Rejected: eSewa payment failed or was cancelled by user.');
                    setDiagnosticCode('ESEWA-FAIL');
                }
                return;
            }

            // Standard Khalti Flow
            if (!pidx) {
                setStatus('error');
                setMessage('Neural Signal Failure: No valid session detected in handshake.');
                setDiagnosticCode('ERROR-404-PIDX');
                return;
            }

            try {
                // Diagnostic Delay for Neural Aesthetic
                await new Promise(r => setTimeout(r, 1500));
                
                const response = await api.post(KHALTI_VERIFY_URL, 
                    { pidx, bookingId }
                );

                if (response.data.success) {
                    console.log("✅ Transaction Pulse Verified:", pidx);
                    setStatus('success');
                    setMessage('Neural Network Update Successful: Transaction verified and recorded.');
                } else {
                    setStatus('error');
                    setMessage(response.data.message || 'Khalti Sandbox: Gateway verification rejected.');
                }
            } catch (err) {
                console.error('Handshake Error:', err);
                setStatus('error');
                const errMsg = err.response?.data?.message || err.message || 'Neural Relay Shutdown';
                setMessage(`Network Failure: ${errMsg}`);
                setDiagnosticCode(err.response?.status || 'FAIL');
            }
        };

        if (status === 'verifying') verifyPayment();
    }, [pidx, bookingId, navigate, status, searchParams]);

    return (
        <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-6 text-center text-white">
            <div className="max-w-xl w-full">
                <div className="bg-slate-900 p-16 rounded-[64px] border border-slate-800 shadow-[0_0_100px_rgba(0,0,0,0.5)] relative">
                    
                    {/* Verifying Protocol */}
                    {status === 'verifying' && (
                        <>
                            <Loader2 className="w-24 h-24 text-orange-500 animate-spin mx-auto mb-10 opacity-80" />
                            <h2 className="text-4xl font-black tracking-tighter mb-4 uppercase">Verification Pulse Active</h2>
                            <p className="text-slate-500 font-bold tracking-[0.2em] text-[10px] mb-8">{message}</p>
                            <div className="w-full bg-slate-800 h-1 rounded-full overflow-hidden">
                                <div className="h-full bg-orange-500 animate-progress origin-left"></div>
                            </div>
                        </>
                    )}

                    {/* Success Protocol */}
                    {status === 'success' && (
                        <>
                            <div className="w-24 h-24 bg-green-500/10 text-green-500 rounded-full flex items-center justify-center mx-auto mb-10 shadow-[0_0_40px_rgba(34,197,94,0.2)]">
                                <CheckCircle size={56} />
                            </div>
                            <h2 className="text-5xl font-black tracking-tighter mb-4 text-white">MISSION SUCCESS</h2>
                            <p className="text-slate-400 font-medium mb-12 text-sm">{message}</p>
                            <button 
                                onClick={() => navigate('/my-bookings')}
                                className="w-full py-6 bg-white text-slate-900 rounded-3xl font-black uppercase tracking-[0.4em] text-[10px] hover:bg-slate-200 transition-all shadow-2xl active:scale-95"
                            >
                                Return to Command Center
                            </button>
                        </>
                    )}

                    {/* Error Protocol */}
                    {status === 'error' && (
                        <>
                            <div className="w-24 h-24 bg-rose-500/10 text-rose-500 rounded-full flex items-center justify-center mx-auto mb-10 shadow-[0_0_40px_rgba(244,63,94,0.2)]">
                                <XCircle size={56} />
                            </div>
                            <h2 className="text-4xl font-black tracking-tighter mb-4 text-white uppercase leading-none">Diagnostic Failure</h2>
                            <p className="text-rose-500/70 font-bold uppercase tracking-widest text-[10px] mb-8">{diagnosticCode || 'HANDSHAKE-FAIL'}</p>
                            <p className="text-slate-400 font-medium mb-12 text-sm">{message}</p>
                            <div className="flex flex-col gap-4">
                                <button 
                                    onClick={() => navigate(-2)} 
                                    className="w-full py-6 bg-orange-600 text-white rounded-3xl font-black uppercase tracking-[0.4em] text-[10px] hover:bg-orange-700 transition-all shadow-xl active:scale-95"
                                >
                                    Re-Initiate Protocol
                                </button>
                                <button 
                                    onClick={() => navigate('/my-bookings')}
                                    className="w-full py-6 bg-slate-800 text-slate-400 rounded-3xl font-black uppercase tracking-[0.4em] text-[10px] hover:bg-slate-700 transition-all active:scale-95"
                                >
                                    Abort Operation
                                </button>
                            </div>
                        </>
                    )}

                    <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-3 px-6 py-3 bg-slate-950 border border-slate-800 rounded-full shadow-2xl">
                        <ShieldCheck size={16} className="text-teal-600" />
                        <span className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500">Secure Node Bridge Active</span>
                    </div>
                </div>
                <Logo className="mt-20 opacity-20 mx-auto" />
            </div>
        </div>
    );
};

export default KhaltiVerify;
