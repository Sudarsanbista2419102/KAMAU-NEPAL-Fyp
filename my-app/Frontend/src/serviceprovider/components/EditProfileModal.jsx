import React, { useState, useEffect } from 'react';
import { X, Save, User, MapPin, DollarSign, Phone, Bio, Briefcase, Clock, Plus, Trash2, CheckCircle2 } from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

const EditProfileModal = ({ isOpen, onClose, professionalData, onUpdate }) => {
  const [activeTab, setActiveTab] = useState('basic'); // 'basic' or 'availability'
  const [formData, setFormData] = useState({
    firstName: professionalData?.firstName || '',
    lastName: professionalData?.lastName || '',
    bio: professionalData?.bio || '',
    hourlyWage: professionalData?.hourlyWage || '',
    serviceArea: professionalData?.serviceArea || '',
    phone: professionalData?.phone || '',
    serviceCategory: professionalData?.serviceCategory || '',
    availability: professionalData?.availability || []
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [serviceCategories, setServiceCategories] = useState([]);

  useEffect(() => {
    if (isOpen) {
      const fetchCategories = async () => {
        try {
          const res = await axios.get('/api/categories');
          if (res.data && res.data.success) {
            setServiceCategories(res.data.data.map(c => ({ value: c.value, label: c.label })));
          }
        } catch (err) {
          console.error("Failed to fetch categories", err);
        }
      };
      fetchCategories();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleAvailabilityChange = (index, field, value) => {
    const newAvailability = [...formData.availability];
    newAvailability[index][field] = value;
    setFormData(prev => ({ ...prev, availability: newAvailability }));
  };

  const addAvailability = () => {
    setFormData(prev => ({
      ...prev,
      availability: [...prev.availability, { day: 'Monday', startTime: '09:00', endTime: '18:00' }]
    }));
  };

  const removeAvailability = (index) => {
    setFormData(prev => ({
      ...prev,
      availability: prev.availability.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');
    
    // Validate hourly wage
    if (formData.hourlyWage) {
      const wage = parseFloat(formData.hourlyWage);
      if (wage < 100) {
        setError('Hourly wage must be at least रु 100');
        toast.error('Hourly wage must be at least रु 100');
        setIsSubmitting(false);
        return;
      }
    }
    
    try {
      const token = localStorage.getItem('token');
      const response = await axios.put(`/api/professionals/${professionalData._id}`, formData, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.data.success) {
        setSuccess(true);
        toast.success('Profile updated successfully!');
        setTimeout(() => {
          onUpdate(response.data.data);
          onClose();
          setSuccess(false);
        }, 1500);
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to update profile';
      setError(msg);
      toast.error(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 lg:p-8">
      <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-md" onClick={onClose}></div>
      
      <div className="relative w-full max-w-2xl bg-white rounded-[40px] shadow-2xl overflow-hidden animate-in zoom-in duration-300">
        {/* Header */}
        <div className="px-8 py-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div>
            <h2 className="text-2xl font-black text-slate-900">Edit Professional Profile</h2>
            <p className="text-xs font-bold text-teal-600 uppercase tracking-widest mt-1">Update your public information</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-xl transition-all text-slate-400 hover:text-slate-900">
            <X size={24} />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex px-8 border-b border-slate-100">
          <button 
            onClick={() => setActiveTab('basic')}
            className={`px-6 py-4 text-xs font-black uppercase tracking-widest transition-all border-b-2 ${activeTab === 'basic' ? 'border-teal-500 text-teal-600' : 'border-transparent text-slate-400 hover:text-slate-600'}`}
          >
            Basic Info
          </button>
          <button 
            onClick={() => setActiveTab('availability')}
            className={`px-6 py-4 text-xs font-black uppercase tracking-widest transition-all border-b-2 ${activeTab === 'availability' ? 'border-teal-500 text-teal-600' : 'border-transparent text-slate-400 hover:text-slate-600'}`}
          >
            Availability
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="p-8 max-h-[60vh] overflow-y-auto custom-scrollbar">
            {success ? (
              <div className="py-12 text-center animate-in fade-in zoom-in">
                <div className="w-20 h-20 bg-teal-100 rounded-full flex items-center justify-center text-teal-600 mx-auto mb-6">
                  <CheckCircle2 size={40} />
                </div>
                <h3 className="text-xl font-black text-slate-900 mb-2">Profile Updated!</h3>
                <p className="text-slate-500 font-medium">Your changes have been synchronized successfully.</p>
              </div>
            ) : (
              <>
                {activeTab === 'basic' ? (
                  <div className="space-y-6">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">First Name</label>
                        <div className="relative">
                          <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                          <input 
                            type="text" 
                            name="firstName"
                            value={formData.firstName}
                            disabled
                            className="w-full bg-slate-100 border border-slate-200 rounded-2xl pl-12 pr-4 py-3.5 text-sm font-bold focus:ring-2 focus:ring-teal-500/10 focus:border-teal-500/40 outline-none transition-all cursor-not-allowed opacity-60"
                          />
                        </div>
                        <p className="text-[9px] text-slate-400 font-semibold ml-1">✓ Fixed by admin</p>
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Last Name</label>
                        <div className="relative">
                          <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                          <input 
                            type="text" 
                            name="lastName"
                            value={formData.lastName}
                            disabled
                            className="w-full bg-slate-100 border border-slate-200 rounded-2xl pl-12 pr-4 py-3.5 text-sm font-bold focus:ring-2 focus:ring-teal-500/10 focus:border-teal-500/40 outline-none transition-all cursor-not-allowed opacity-60"
                          />
                        </div>
                        <p className="text-[9px] text-slate-400 font-semibold ml-1">✓ Fixed by admin</p>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Professional Bio</label>
                      <textarea 
                        name="bio"
                        value={formData.bio}
                        onChange={handleInputChange}
                        rows={3}
                        placeholder="Tell clients about your experience and expertise..."
                        className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3.5 text-sm font-bold focus:ring-2 focus:ring-teal-500/10 focus:border-teal-500/40 outline-none transition-all resize-none"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Service Category</label>
                        <div className="relative">
                          <Briefcase className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                          <select 
                            name="serviceCategory"
                            value={formData.serviceCategory}
                            disabled
                            className="w-full bg-slate-100 border border-slate-200 rounded-2xl pl-12 pr-4 py-3.5 text-sm font-bold focus:ring-2 focus:ring-teal-500/10 focus:border-teal-500/40 outline-none transition-all appearance-none cursor-not-allowed opacity-60"
                          >
                            {serviceCategories.map(cat => <option key={cat.value} value={cat.value}>{cat.label}</option>)}
                          </select>
                        </div>
                        <p className="text-[9px] text-slate-400 font-semibold ml-1">✓ Fixed by admin</p>
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Hourly Wage (NPR)</label>
                        <div className="relative">
                          <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                          <input 
                            type="number" 
                            name="hourlyWage"
                            value={formData.hourlyWage}
                            onChange={handleInputChange}
                            className="w-full bg-slate-50 border border-slate-200 rounded-2xl pl-12 pr-4 py-3.5 text-sm font-bold focus:ring-2 focus:ring-teal-500/10 focus:border-teal-500/40 outline-none transition-all"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Service Area</label>
                        <div className="relative">
                          <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                          <input 
                            type="text" 
                            name="serviceArea"
                            value={formData.serviceArea}
                            onChange={handleInputChange}
                            className="w-full bg-slate-50 border border-slate-200 rounded-2xl pl-12 pr-4 py-3.5 text-sm font-bold focus:ring-2 focus:ring-teal-500/10 focus:border-teal-500/40 outline-none transition-all"
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Phone Number</label>
                        <div className="relative">
                          <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                          <input 
                            type="text" 
                            name="phone"
                            value={formData.phone}
                            onChange={handleInputChange}
                            className="w-full bg-slate-50 border border-slate-200 rounded-2xl pl-12 pr-4 py-3.5 text-sm font-bold focus:ring-2 focus:ring-teal-500/10 focus:border-teal-500/40 outline-none transition-all"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Weekly Schedule</p>
                      <button 
                        type="button"
                        onClick={addAvailability}
                        className="flex items-center gap-1.5 text-[10px] font-black text-teal-600 uppercase tracking-widest hover:text-teal-700 transition-colors"
                      >
                        <Plus size={14} /> Add Slot
                      </button>
                    </div>
                    
                    {formData.availability.length === 0 ? (
                      <div className="text-center py-8 bg-slate-50 rounded-3xl border border-dashed border-slate-200">
                        <Clock className="mx-auto text-slate-300 mb-2" size={32} />
                        <p className="text-xs font-bold text-slate-400">No availability set</p>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {formData.availability.map((slot, index) => (
                          <div key={index} className="flex items-center gap-3 p-4 bg-slate-50 rounded-2xl border border-slate-100 group">
                            <select 
                              value={slot.day}
                              onChange={(e) => handleAvailabilityChange(index, 'day', e.target.value)}
                              className="flex-1 bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold focus:ring-2 focus:ring-teal-500/10 focus:border-teal-500/40 outline-none"
                            >
                              {DAYS.map(day => <option key={day} value={day}>{day}</option>)}
                            </select>
                            <div className="flex items-center gap-2">
                              <input 
                                type="time"
                                value={slot.startTime}
                                onChange={(e) => handleAvailabilityChange(index, 'startTime', e.target.value)}
                                className="bg-white border border-slate-200 rounded-xl px-2 py-2 text-xs font-bold focus:ring-2 focus:ring-teal-500/10 focus:border-teal-500/40 outline-none"
                              />
                              <span className="text-slate-400 font-bold">to</span>
                              <input 
                                type="time"
                                value={slot.endTime}
                                onChange={(e) => handleAvailabilityChange(index, 'endTime', e.target.value)}
                                className="bg-white border border-slate-200 rounded-xl px-2 py-2 text-xs font-bold focus:ring-2 focus:ring-teal-500/10 focus:border-teal-500/40 outline-none"
                              />
                            </div>
                            <button 
                              type="button"
                              onClick={() => removeAvailability(index)}
                              className="p-2 text-slate-400 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </>
            )}
          </div>

          {!success && (
            <div className="p-8 border-t border-slate-100 bg-slate-50/50 flex flex-col gap-4">
              {error && <p className="text-xs font-bold text-red-500 text-center">{error}</p>}
              <button 
                type="submit"
                disabled={isSubmitting}
                className="w-full py-4 bg-slate-900 text-white rounded-2xl font-black uppercase tracking-[0.2em] text-xs hover:bg-teal-600 shadow-xl transition-all active:scale-[0.98] flex items-center justify-center gap-3 disabled:opacity-50"
              >
                {isSubmitting ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <>
                    <Save size={18} /> Update Profile Records
                  </>
                )}
              </button>
            </div>
          )}
        </form>
      </div>
    </div>
  );
};

export default EditProfileModal;
