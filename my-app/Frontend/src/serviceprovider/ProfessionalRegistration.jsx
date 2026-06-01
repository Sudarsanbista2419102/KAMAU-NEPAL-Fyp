"use client"

import { useState, useRef, useEffect } from "react"
import axios from "axios"
import { useNavigate } from "react-router-dom"
import toast from 'react-hot-toast'
import {
  CheckCircle2,
  User,
  Mail,
  Phone,
  MapPin,
  Briefcase,
  Info,
  Star,
  ShieldCheck,
  Camera,
  Upload,
  FileText,
  Trash2,
  Clock,
  Plus,
  X,
} from "lucide-react"
import Logo from "../Logo"
import BackButton from "../components/BackButton"


const ProfessionalRegistration = () => {
  const navigate = useNavigate()
  const fileInputRef = useRef(null)
  const docInputRef = useRef(null)

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    username: "",
    email: "",
    phone: "",
    gender: "",
    serviceCategory: "",
    serviceArea: "",
    hourlyWage: "",
    bio: "",
    latitude: "",
    longitude: "",
    formattedAddress: "",
    jobType: "full-time",
    tools: [],
    availability: [
      { day: "Monday", startTime: "06:00", endTime: "18:00" },
      { day: "Tuesday", startTime: "06:00", endTime: "18:00" },
      { day: "Wednesday", startTime: "06:00", endTime: "18:00" },
      { day: "Thursday", startTime: "06:00", endTime: "18:00" },
      { day: "Friday", startTime: "06:00", endTime: "18:00" },
      { day: "Saturday", startTime: "06:00", endTime: "18:00" },
      { day: "Sunday", startTime: "06:00", endTime: "18:00" },
    ]
  })

  const [locationSearch, setLocationSearch] = useState("")
  const [locationResults, setLocationResults] = useState([])
  const [isSearchingLocation, setIsSearchingLocation] = useState(false)
  const [showLocationDropdown, setShowLocationDropdown] = useState(false)

  const [profileImage, setProfileImage] = useState(null)
  const [profileImageFile, setProfileImageFile] = useState(null)
  const [coverImage, setCoverImage] = useState(null)
  const [coverImageFile, setCoverImageFile] = useState(null)
  const [documents, setDocuments] = useState([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [errors, setErrors] = useState({})
  const [isLoggedIn] = useState(() => !!localStorage.getItem('token'))
  const [professionalId, setProfessionalId] = useState(null)
  const [existingStatus, setExistingStatus] = useState(null)
  const [isLoadingStatus, setIsLoadingStatus] = useState(true)

  useEffect(() => {
    const fetchStatus = async () => {
      if (!isLoggedIn) {
        setIsLoadingStatus(false)
        return
      }

      try {
        const response = await fetch('/api/professionals/me', {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        })
        const data = await response.json()
        if (response.ok && data.success) {
          setExistingStatus(data.data.verificationStatus)
        }
      } catch (error) {
        console.error('Error fetching professional status:', error)
      } finally {
        setIsLoadingStatus(false)
      }
    }

    fetchStatus()
  }, [isLoggedIn])

  useEffect(() => {
    // Attempt to pre-populate form with existing user data
    const userId = localStorage.getItem('userId');
    const token = localStorage.getItem('token');
    
    if (userId && token) {
      const fetchUserData = async () => {
        try {
          const res = await axios.get(`/api/users/${userId}/profile`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          if (res.data && res.data.user) {
            const user = res.data.user;
            const firstName = (user.firstName || (user.name || '').split(' ')[0] || '').toUpperCase();
            const lastName = (user.lastName || (user.name || '').split(' ').slice(1).join(' ') || '').toUpperCase();
            const email = user.email || '';
            const phone = user.phone || '';
            const username = user.username || '';
            const location = user.formattedAddress || (typeof user.location === 'string' ? user.location : "");

            setFormData(prev => ({
              ...prev,
              firstName,
              lastName,
              email,
              phone,
              username,
              serviceArea: location
            }));

            if (location) {
              setLocationSearch(location);
            }
          }
        } catch (err) {
          console.error("Failed to pre-populate registration form from API:", err);
          const name = localStorage.getItem('userName') || '';
          const firstName = (localStorage.getItem('firstName') || (name.split(' ')[0] || '')).toUpperCase();
          const lastName = (localStorage.getItem('lastName') || (name.split(' ').slice(1).join(' ') || '')).toUpperCase();
          const email = localStorage.getItem('userEmail') || '';
          const phone = localStorage.getItem('userPhone') || '';
          const username = localStorage.getItem('username') || '';
          const location = localStorage.getItem('userLocation') || '';

          setFormData(prev => ({
            ...prev,
            firstName,
            lastName,
            email,
            phone,
            username,
            serviceArea: location
          }));

          if (location) {
            setLocationSearch(location);
          }
        }
      };
      fetchUserData();
    }
  }, []);

  const validateForm = () => {
    const newErrors = {}

    if (!formData.firstName.trim()) newErrors.firstName = "First name is required"
    if (!formData.lastName.trim()) newErrors.lastName = "Last name is required"
    if (!formData.username.trim()) newErrors.username = "Username is required"

    if (!formData.email.trim()) {
      newErrors.email = "Email is required"
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Please enter a valid email"
    }

    if (!formData.phone.trim()) {
      newErrors.phone = "Phone number is required"
    } else if (!/^[0-9]{10}$/.test(formData.phone.replace(/\D/g, ''))) {
      newErrors.phone = "Please enter a valid 10-digit phone number"
    }
    
    if (!formData.gender) newErrors.gender = "Gender selection is required"

    if (!formData.serviceCategory) newErrors.serviceCategory = "Service category is required"
    
    const isFreelancerType = ['freelancer', 'graphic_designer', 'logo_designer', 'developer'].includes(formData.serviceCategory);
    if (!isFreelancerType && !formData.serviceArea) {
      newErrors.serviceArea = "Service area is required"
    }

    if (formData.hourlyWage) {
      const wage = parseFloat(formData.hourlyWage);
      if (wage < 100) {
        newErrors.hourlyWage = "Hourly wage must be at least रु 100"
      }
    }

    // Availability validation
    formData.availability.forEach((slot, index) => {
      if (slot.startTime >= slot.endTime) {
        newErrors[`availability_${index}`] = "End time must be after start time";
      }
    });

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target

    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: undefined }))
    }

    if (name === "phone") {
      const cleaned = value.replace(/\D/g, '')
      const formatted = cleaned.slice(0, 10)
      setFormData(prev => ({ ...prev, [name]: formatted }))
    } else if (name === "firstName" || name === "lastName") {
      setFormData(prev => ({ ...prev, [name]: value.toUpperCase() }))
    } else {
      setFormData(prev => ({ ...prev, [name]: value }))
    }
  }

  const handleJobTypeChange = (type) => {
    let newAvailability = [...formData.availability];
    if (type === 'full-time') {
      newAvailability = [
        { day: "Monday", startTime: "06:00", endTime: "18:00" },
        { day: "Tuesday", startTime: "06:00", endTime: "18:00" },
        { day: "Wednesday", startTime: "06:00", endTime: "18:00" },
        { day: "Thursday", startTime: "06:00", endTime: "18:00" },
        { day: "Friday", startTime: "06:00", endTime: "18:00" },
        { day: "Saturday", startTime: "06:00", endTime: "18:00" },
        { day: "Sunday", startTime: "06:00", endTime: "18:00" },
      ];
    } else if (type === 'part-time' && formData.jobType === 'full-time') {
      // If switching back to part-time, reset to one default slot
      newAvailability = [{ day: "Monday", startTime: "09:00", endTime: "18:00" }];
    }
    setFormData(prev => ({ ...prev, jobType: type, availability: newAvailability }));
  }

  const addAvailability = () => {
    setFormData(prev => ({
      ...prev,
      availability: [...prev.availability, { day: "Monday", startTime: "09:00", endTime: "18:00" }]
    }))
  }

  const removeAvailability = (index) => {
    if (formData.availability.length <= 1) return
    setFormData(prev => ({
      ...prev,
      availability: prev.availability.filter((_, i) => i !== index)
    }))
  }

  const handleAvailabilityChange = (index, field, value) => {
    const newAvailability = [...formData.availability]
    newAvailability[index][field] = value
    setFormData(prev => ({ ...prev, availability: newAvailability }))
  }

  // Debounce location search
  useEffect(() => {
    if (locationSearch.length < 3) {
      setLocationResults([]);
      setShowLocationDropdown(false);
      return;
    }

    const timer = setTimeout(() => {
      performLocationSearch(locationSearch);
    }, 800);

    return () => clearTimeout(timer);
  }, [locationSearch]);

  const performLocationSearch = async (query) => {
    setIsSearchingLocation(true);
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&addressdetails=1&limit=5&countrycodes=np`,
        {
          headers: {
            'User-Agent': 'KamauNepalApp/1.0'
          }
        }
      );
      const data = await response.json();
      setLocationResults(data);
      setShowLocationDropdown(true);
    } catch (error) {
      console.error("Location search error:", error);
    } finally {
      setIsSearchingLocation(false);
    }
  };

  const handleLocationSearch = (query) => {
    setLocationSearch(query);
    if (errors.serviceArea) {
      setErrors(prev => ({ ...prev, serviceArea: undefined }));
    }
  };

  const selectLocation = (location) => {
    setFormData(prev => ({
      ...prev,
      serviceArea: location.display_name,
      formattedAddress: location.display_name,
      latitude: location.lat,
      longitude: location.lon
    }))
    setLocationSearch(location.display_name)
    setShowLocationDropdown(false)
    setLocationResults([])
  }

  const handleImageChange = (e) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (file.size > 30 * 1024 * 1024) {
      toast.error("Image size should be less than 30MB")
      return
    }

    if (!file.type.startsWith('image/')) {
      toast.error("Please upload an image file")
      return
    }

    // Store the actual file for upload
    setProfileImageFile(file)

    // Create preview for display
    const reader = new FileReader()
    reader.onloadend = () => {
      setProfileImage(reader.result)
    }
    reader.onerror = () => {
      toast.error("Failed to read image file")
    }
    reader.readAsDataURL(file)
  }

  const handleCoverChange = (e) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (file.size > 30 * 1024 * 1024) {
      toast.error("Image size should be less than 30MB")
      return
    }

    if (!file.type.startsWith('image/')) {
      toast.error("Please upload an image file")
      return
    }

    setCoverImageFile(file)
    const reader = new FileReader()
    reader.onloadend = () => {
      setCoverImage(reader.result)
    }
    reader.readAsDataURL(file)
  }

  const handleDocChange = (e) => {
    const files = e.target.files
    if (!files) return

    const newDocs = []

    Array.from(files).forEach((file) => {
      if (file.size > 30 * 1024 * 1024) {
        toast.error(`File ${file.name} is too large. Max size is 30MB`)
        return
      }

      const validTypes = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png']
      if (!validTypes.includes(file.type)) {
        toast.error(`File ${file.name} must be PDF, JPG, or PNG`)
        return
      }

      newDocs.push({
        id: Math.random().toString(36).substr(2, 9),
        name: file.name,
        size: `${(file.size / 1024).toFixed(1)} KB`,
        file: file
      })
    })

    setDocuments((prev) => [...prev, ...newDocs])

    if (docInputRef.current) {
      docInputRef.current.value = ''
    }
  }

  const removeDoc = (id) => {
    setDocuments((prev) => prev.filter((doc) => doc.id !== id))
  }

  const triggerImageUpload = () => fileInputRef.current?.click()
  const triggerDocUpload = () => docInputRef.current?.click()

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!validateForm()) {
      const firstError = Object.keys(errors)[0]
      const element = document.querySelector(`[name="${firstError}"]`)
      element?.scrollIntoView({ behavior: 'smooth', block: 'center' })
      return
    }

    if (documents.length === 0) {
      toast.error("Please upload at least one verification document")
      return
    }

    setIsSubmitting(true)

    const submitData = new FormData()

    Object.entries(formData).forEach(([key, value]) => {
      if (key === 'availability' || key === 'tools') {
        submitData.append(key, JSON.stringify(value))
      } else {
        submitData.append(key, value)
      }
    })

    // Append images
    if (profileImageFile) {
      submitData.append('profileImage', profileImageFile)
    }
    if (coverImageFile) {
      submitData.append('coverImage', coverImageFile)
    }

    documents.forEach((doc, index) => {
      submitData.append('documents', doc.file)
    })

    try {
      console.log('Submitting form with data:', formData);
      console.log('Number of documents:', documents.length);
      console.log('Has profile image:', !!profileImage);

      const response = await fetch('/api/professionals/register', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: submitData
      })

      const data = await response.json()
      console.log('Response status:', response.status);
      console.log('Response data:', data);

      if (!response.ok) {
        toast.error(data.message || 'Registration failed. Please try again.')
        setIsSubmitting(false)
        return
      }

      setIsSubmitting(false)
      setProfessionalId(data.data?.id)

      // Update local storage to sync the profile image immediately across the app
      if (profileImage) {
        // Store only the filename/path, not the entire base64 string if it's too large
        const imageToStore = profileImage.length > 500 ? '' : profileImage;
        if (imageToStore) {
          localStorage.setItem('userProfileImage', imageToStore);
        }
      }

      setSubmitted(true)
      window.scrollTo({ top: 0, behavior: "smooth" })
    } catch (error) {
      console.error('Registration error:', error)
      toast.error("Registration failed. Please try again. Check console for details.")
      setIsSubmitting(false)
    }
  }

  const [serviceCategories, setServiceCategories] = useState([
    { value: "", label: "Select category", disabled: true }
  ]);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await axios.get('/api/categories');
        if (res.data && res.data.success) {
          const dbCategories = res.data.data.map(cat => ({
            value: cat.value,
            label: cat.label
          }));
          
          setServiceCategories([
            { value: "", label: "Select category", disabled: true },
            ...dbCategories
          ]);
        }
      } catch (error) {
        console.error('Error fetching categories:', error);
      }
    };
    fetchCategories();
  }, []);


  if (isLoadingStatus) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="animate-spin h-12 w-12 border-4 border-orange-500 border-t-transparent rounded-full"></div>
      </div>
    )
  }

  if (existingStatus === 'pending' || existingStatus === 'verified') {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-slate-50">
        <div className="max-w-md w-full text-center p-8 sm:p-12 bg-white rounded-[40px] shadow-2xl border border-slate-100">
          <div className={`w-20 h-20 sm:w-24 sm:h-24 ${existingStatus === 'verified' ? 'bg-teal-100 text-teal-600' : 'bg-orange-100 text-orange-600'} rounded-full flex items-center justify-center mx-auto mb-6 sm:mb-8`}>
            {existingStatus === 'verified' ? <CheckCircle2 className="w-12 h-12 sm:w-16 sm:h-16" /> : <Clock className="w-12 h-12 sm:w-16 sm:h-16" />}
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 mb-4">
            {existingStatus === 'verified' ? 'Already Registered!' : 'Application Pending'}
          </h2>
          <p className="text-slate-500 mb-8 sm:mb-10 font-medium text-sm sm:text-base">
            {existingStatus === 'verified' 
              ? 'You are already a verified professional. You can manage your services from the dashboard.' 
              : 'Your application is currently being reviewed by our admin team. We will notify you once it is processed.'}
          </p>
          <div className="space-y-3">
            <button
              className="w-full py-3 sm:py-4 bg-orange-500 hover:bg-orange-600 text-white font-bold rounded-2xl transition-colors text-sm sm:text-base"
              onClick={() => navigate(existingStatus === 'verified' ? '/professional-dashboard' : '/dashboard')}
            >
              {existingStatus === 'verified' ? 'Go to Professional Dashboard' : 'Go to User Dashboard'}
            </button>
            <button
              className="w-full py-3 sm:py-4 bg-transparent border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold rounded-2xl transition-colors text-sm sm:text-base"
              onClick={() => navigate('/')}
            >
              Back to Home
            </button>
          </div>
        </div>
      </div>
    )
  }

  if (submitted) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center p-4">
        <div className="max-w-md w-full text-center p-8 sm:p-12 bg-white rounded-3xl sm:rounded-[40px] shadow-2xl border border-slate-100">
          <div className="w-20 h-20 sm:w-24 sm:h-24 bg-teal-100 rounded-full flex items-center justify-center mx-auto mb-6 sm:mb-8 text-teal-600 animate-bounce">
            <CheckCircle2 className="w-12 h-12 sm:w-16 sm:h-16" />
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 mb-4">Application Submitted!</h2>
          <p className="text-slate-500 mb-8 sm:mb-10 font-medium text-sm sm:text-base">
            Your registration request has been sent to our admin team for verification.
            Once approved, your professional profile will be visible on our home page.
          </p>
          <div className="space-y-3">
            <button
              className="w-full py-3 sm:py-4 bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-xl sm:rounded-2xl transition-colors text-sm sm:text-base"
              onClick={() => professionalId && navigate(`/professional/${professionalId}`)}
            >
              View Your Profile
            </button>
            <button
              className="w-full py-3 sm:py-4 bg-orange-500 hover:bg-orange-600 text-white font-bold rounded-xl sm:rounded-2xl transition-colors text-sm sm:text-base"
              onClick={() => isLoggedIn ? navigate('/dashboard') : navigate('/')}
            >
              {isLoggedIn ? 'Go to Dashboard' : 'Return to Home'}
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-slate-50 min-h-screen py-8 sm:py-12 px-4 sm:px-6 lg:px-8 flex flex-col">
      <div className="max-w-6xl mx-auto w-full">
        <div className="flex items-center gap-4 mb-6 sm:mb-8">
          <BackButton variant="simple" />
          <Logo />
        </div>


        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
          {/* Left Side: Info */}
          <div className="lg:col-span-5 space-y-6 sm:space-y-8">
            <div>
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 leading-tight mb-4 sm:mb-6">
                Turn your skills into <span className="text-orange-500 underline decoration-orange-500">Income</span>
              </h1>
              <p className="text-base sm:text-lg text-slate-600 font-medium leading-relaxed">
                Join Kamau Nepal's community of certified professionals. We help you find clients, manage your schedule,
                and grow your local reputation.
              </p>
            </div>

            {/* Cover Photo Upload Preview Card */}
            <div className="bg-white p-4 sm:p-6 rounded-2xl sm:rounded-[32px] border border-slate-100 shadow-sm overflow-hidden">
              <div 
                className="w-full h-32 sm:h-40 bg-slate-100 rounded-xl overflow-hidden relative group cursor-pointer border-2 border-dashed border-slate-200"
                onClick={() => document.getElementById('coverInput').click()}
              >
                {coverImage ? (
                  <img src={coverImage} alt="Cover Preview" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center text-slate-400 gap-2">
                    <Upload size={24} />
                    <span className="text-xs font-bold uppercase tracking-widest">Upload Cover Photo</span>
                  </div>
                )}
                <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <Camera className="text-white w-6 h-6" />
                </div>
              </div>
              <input
                id="coverInput"
                type="file"
                onChange={handleCoverChange}
                className="hidden"
                accept="image/*"
              />
              <div className="mt-3 text-center">
                <h3 className="font-bold text-slate-900 text-sm">Cover Background</h3>
                <p className="text-[10px] text-slate-500 mt-1">Wide photo (3:1 area) works best for profile backdrop</p>
              </div>
            </div>

            {/* Profile Picture Upload Preview Card */}
            <div className="bg-white p-4 sm:p-6 rounded-2xl sm:rounded-[32px] border border-slate-100 shadow-sm flex flex-col items-center">
              <div className="relative group cursor-pointer" onClick={triggerImageUpload}>
                <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-full overflow-hidden bg-slate-100 border-4 border-white shadow-lg relative">
                  {!isSubmitting && profileImage ? (
                    <img
                      src={profileImage}
                      alt="Profile Preview"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-white flex items-center justify-center">
                      <Camera className="text-slate-300 w-8 h-8" />
                    </div>
                  )}
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <Camera className="text-white w-6 h-6" />
                  </div>
                </div>
                <button
                  type="button"
                  onClick={triggerImageUpload}
                  className="absolute bottom-0 right-0 sm:bottom-1 sm:right-1 bg-orange-500 text-white p-1.5 sm:p-2 rounded-full shadow-md hover:bg-orange-600 transition-colors"
                >
                  <Camera className="w-3 h-3 sm:w-4 sm:h-4" />
                </button>
              </div>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleImageChange}
                className="hidden"
                accept="image/*"
              />
              <div className="mt-3 sm:mt-4 text-center">
                <h3 className="font-bold text-slate-900 text-sm sm:text-base">Profile Photo</h3>
                <p className="text-xs text-slate-500 mt-1">Clear photos help build trust with clients</p>
              </div>
            </div>

            <div className="space-y-4 sm:space-y-6">
              {[
                {
                  icon: <Star className="text-yellow-500 w-5 h-5 sm:w-6 sm:h-6" />,
                  title: "Build your reputation",
                  desc: "Get verified and receive ratings from real customers in Kathmandu & Bhaktapur.",
                },
                {
                  icon: <ShieldCheck className="text-green-600 w-5 h-5 sm:w-6 sm:h-6" />,
                  title: "Work with trust",
                  desc: "Our secure platform ensures you connect with legitimate clients and get paid on time.",
                },
              ].map((item, i) => (
                <div key={i} className="flex gap-3 sm:gap-4 p-4 sm:p-5 bg-white rounded-2xl sm:rounded-3xl border border-slate-100 shadow-sm">
                  <div className="flex-shrink-0 w-10 h-10 sm:w-12 sm:h-12 bg-slate-50 rounded-xl sm:rounded-2xl flex items-center justify-center">
                    {item.icon}
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 mb-1 text-sm sm:text-base">{item.title}</h3>
                    <p className="text-xs sm:text-sm text-slate-500 font-medium">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="bg-orange-50 p-4 sm:p-6 lg:p-8 rounded-2xl sm:rounded-[32px] border border-orange-100">
              <div className="flex items-start gap-3 sm:gap-4">
                <Info className="text-red-500 flex-shrink-0 w-5 h-5 sm:w-6 sm:h-6" />
                <p className="text-orange-800 text-xs sm:text-sm font-bold leading-relaxed">
                  TIP: Uploading professional certifications and IDs speeds up the verification process.
                </p>
              </div>
            </div>
          </div>

          {/* Right Side: Form */}
          <div className="lg:col-span-7">
            <div className="bg-white p-4 sm:p-6 lg:p-8 xl:p-12 rounded-3xl sm:rounded-[40px] shadow-xl sm:shadow-2xl shadow-slate-200/50 border border-slate-100">
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 mb-2 sm:mb-2">Professional Details</h2>
              {formData.firstName && (
                <div className="flex items-center gap-2 mb-6 sm:mb-8 text-teal-600 bg-teal-50/50 p-3 rounded-xl border border-teal-100/50 animate-in fade-in zoom-in duration-700">
                  <ShieldCheck size={16} />
                  <span className="text-[10px] sm:text-xs font-black uppercase tracking-[0.2em]">Verified Identity Synced</span>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                  {/* First Name */}
                  <div className="space-y-2">
                    <label className="text-xs sm:text-sm font-bold text-slate-700 ml-1">First Name *</label>
                    <div className="relative">
                      <User className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4 sm:w-5 sm:h-5" />
                      <input
                        required
                        type="text"
                        name="firstName"
                        placeholder="first Name"
                        className={`w-full bg-white border ${errors.firstName ? 'border-red-300' : 'border-slate-200'} rounded-xl sm:rounded-2xl py-3 sm:py-4 pl-9 sm:pl-12 pr-3 sm:pr-4 focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none transition-all font-medium text-sm sm:text-base`}
                        value={formData.firstName}
                        onChange={handleInputChange}
                      />
                    </div>
                    {errors.firstName && (
                      <p className="text-xs text-red-500 ml-1">{errors.firstName}</p>
                    )}
                  </div>
                  {/* Last Name */}
                  <div className="space-y-2">
                    <label className="text-xs sm:text-sm font-bold text-slate-700 ml-1">Last Name *</label>
                    <div className="relative">
                      <User className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4 sm:w-5 sm:h-5" />
                      <input
                        required
                        type="text"
                        name="lastName"
                        placeholder="Last Name"
                        className={`w-full bg-white border ${errors.lastName ? 'border-red-300' : 'border-slate-200'} rounded-xl sm:rounded-2xl py-3 sm:py-4 pl-9 sm:pl-12 pr-3 sm:pr-4 focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none transition-all font-medium text-sm sm:text-base`}
                        value={formData.lastName}
                        onChange={handleInputChange}
                      />
                    </div>
                    {errors.lastName && (
                      <p className="text-xs text-red-500 ml-1">{errors.lastName}</p>
                    )}
                  </div>
                </div>

                {/* Username */}
                <div className="space-y-2">
                  <label className="text-xs sm:text-sm font-bold text-slate-700 ml-1">Username *</label>
                  <div className="relative">
                    <span className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold">@</span>
                    <input
                      required
                      type="text"
                      name="username"
                      placeholder="ram_pro_2025"
                      className={`w-full bg-white border ${errors.username ? 'border-red-300' : 'border-slate-200'} rounded-xl sm:rounded-2xl py-3 sm:py-4 pl-7 sm:pl-10 pr-3 sm:pr-4 focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none transition-all font-medium text-sm sm:text-base`}
                      value={formData.username}
                      onChange={handleInputChange}
                    />
                  </div>
                  {errors.username && (
                    <p className="text-xs text-red-500 ml-1">{errors.username}</p>
                  )}
                  {formData.firstName && (
                    <p className="text-[10px] text-teal-600 font-black uppercase tracking-widest ml-1 mt-2">✨ Profile data synced from your user account</p>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                  {/* Email */}
                  <div className="space-y-2">
                    <label className="text-xs sm:text-sm font-bold text-slate-700 ml-1">Email Address *</label>
                    <div className="relative">
                      <Mail className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4 sm:w-5 sm:h-5" />
                      <input
                        required
                        type="email"
                        name="email"
                        placeholder="ram@example.com"
                        className={`w-full bg-white border ${errors.email ? 'border-red-300' : 'border-slate-200'} rounded-xl sm:rounded-2xl py-3 sm:py-4 pl-9 sm:pl-12 pr-3 sm:pr-4 focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none transition-all font-medium text-sm sm:text-base`}
                        value={formData.email}
                        onChange={handleInputChange}
                      />
                    </div>
                    {errors.email && (
                      <p className="text-xs text-red-500 ml-1">{errors.email}</p>
                    )}
                  </div>
                  {/* Phone */}
                  <div className="space-y-2">
                    <label className="text-xs sm:text-sm font-bold text-slate-700 ml-1">Phone Number *</label>
                    <div className="relative">
                      <Phone className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4 sm:w-5 sm:h-5" />
                      <input
                        required
                        type="tel"
                        name="phone"
                        placeholder="+977-**********"
                        className={`w-full bg-white border ${errors.phone ? 'border-red-300' : 'border-slate-200'} rounded-xl sm:rounded-2xl py-3 sm:py-4 pl-9 sm:pl-12 pr-3 sm:pr-4 focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none transition-all font-medium text-sm sm:text-base`}
                        value={formData.phone}
                        onChange={handleInputChange}
                        maxLength={10}
                      />
                    </div>
                    {errors.phone && (
                      <p className="text-xs text-red-500 ml-1">{errors.phone}</p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                  {/* Gender */}
                  <div className="space-y-2">
                    <label className="text-xs sm:text-sm font-bold text-slate-700 ml-1">Gender *</label>
                    <div className="relative">
                      <User className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4 sm:w-5 sm:h-5" />
                      <select
                        required
                        name="gender"
                        className={`w-full bg-slate-50 border ${errors.gender ? 'border-red-300' : 'border-slate-200'} rounded-xl sm:rounded-2xl py-3 sm:py-4 pl-9 sm:pl-12 pr-8 sm:pr-10 focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none transition-all font-medium text-sm sm:text-base appearance-none cursor-pointer`}
                        value={formData.gender}
                        onChange={handleInputChange}
                      >
                        <option value="" disabled>Select Gender</option>
                        <option value="Male">Male</option>
                        <option value="Female">Female</option>
                        <option value="Prefer not to say">Prefer not to say</option>
                      </select>
                    </div>
                    {errors.gender && (
                      <p className="text-xs text-red-500 ml-1">{errors.gender}</p>
                    )}
                  </div>
                  {/* Service Category */}
                  <div className="space-y-2">
                    <label className="text-xs sm:text-sm font-bold text-slate-700 ml-1">Service Category *</label>
                    <div className="relative">
                      <Briefcase className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4 sm:w-5 sm:h-5" />
                      <select
                        required
                        name="serviceCategory"
                        className={`w-full bg-slate-50 border ${errors.serviceCategory ? 'border-red-300' : 'border-slate-200'} rounded-xl sm:rounded-2xl py-3 sm:py-4 pl-9 sm:pl-12 pr-8 sm:pr-10 focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none transition-all font-medium text-sm sm:text-base appearance-none cursor-pointer`}
                        value={formData.serviceCategory}
                        onChange={handleInputChange}
                      >
                        {serviceCategories.map((category) => (
                          <option
                            key={category.value}
                            value={category.value}
                            disabled={category.disabled}
                          >
                            {category.label}
                          </option>
                        ))}
                      </select>
                      <div className="absolute right-3 sm:right-4 top-1/2 -translate-y-1/2 pointer-events-none">
                        <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </div>
                    </div>
                    {errors.serviceCategory && (
                      <p className="text-xs text-red-500 ml-1">{errors.serviceCategory}</p>
                    )}
                  </div>
                  {/* Service Area */}
                  <div className="space-y-2 relative">
                    <label className="text-xs sm:text-sm font-bold text-slate-700 ml-1 flex justify-between items-center">
                      <span>Service Area {['freelancer', 'graphic_designer', 'logo_designer', 'developer'].includes(formData.serviceCategory) ? '(Optional)' : '*'}</span>
                      {['freelancer', 'graphic_designer', 'logo_designer', 'developer'].includes(formData.serviceCategory) && (
                        <span className="text-[10px] text-teal-600 font-black uppercase tracking-widest italic animate-pulse">Remote Work Optimized</span>
                      )}
                    </label>
                    <div className="relative">
                      <MapPin className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4 sm:w-5 sm:h-5 z-10" />
                      <input
                        required={!['freelancer', 'graphic_designer', 'logo_designer', 'developer'].includes(formData.serviceCategory)}
                        type="text"
                        name="serviceArea"
                        autoComplete="off"
                        placeholder={['freelancer', 'graphic_designer', 'logo_designer', 'developer'].includes(formData.serviceCategory) ? "Hattisar, Kathmandu (Optional)" : "Enter your service location"}
                        className={`w-full bg-slate-50 border ${errors.serviceArea ? 'border-red-300' : 'border-slate-200'} rounded-xl sm:rounded-2xl py-3 sm:py-4 pl-9 sm:pl-12 pr-4 focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none transition-all font-medium text-sm sm:text-base`}
                        value={locationSearch}
                        onChange={(e) => handleLocationSearch(e.target.value)}
                        onBlur={() => setTimeout(() => setShowLocationDropdown(false), 200)}
                        onFocus={() => locationSearch.length >= 3 && setShowLocationDropdown(true)}
                      />
                      {isSearchingLocation && (
                        <div className="absolute right-3 top-1/2 -translate-y-1/2">
                          <div className="animate-spin h-4 w-4 border-2 border-orange-500 border-t-transparent rounded-full"></div>
                        </div>
                      )}
                    </div>
                    
                    {showLocationDropdown && locationResults.length > 0 && (
                      <div className="absolute z-[100] w-full mt-1 bg-white border border-slate-200 rounded-xl shadow-2xl max-h-60 overflow-y-auto">
                        {locationResults.map((result, index) => (
                          <div
                            key={index}
                            className="px-4 py-3 hover:bg-orange-50 cursor-pointer border-b border-slate-50 last:border-none transition-colors"
                            onClick={() => selectLocation(result)}
                          >
                            <p className="text-sm font-medium text-slate-800">{result.display_name}</p>
                          </div>
                        ))}
                      </div>
                    )}
                    
                    {errors.serviceArea && (
                      <p className="text-xs text-red-500 ml-1">{errors.serviceArea}</p>
                    )}
                  </div>
                </div>

                {/* Tools & Technologies - Only for Freelancer/Dev/Designer */}
                {['freelancer', 'graphic_designer', 'logo_designer', 'developer'].includes(formData.serviceCategory) && (
                  <div className="space-y-3 pt-4 border-t border-slate-50 animate-in fade-in duration-500">
                    <label className="text-xs sm:text-sm font-bold text-slate-700 ml-1">Tools & Technologies (Press Enter to add)</label>
                    <div className="flex flex-wrap gap-2 p-2 min-h-[50px] bg-slate-50 border border-slate-200 rounded-2xl">
                      {formData.tools.map((tag, idx) => (
                        <span key={idx} className="bg-teal-500 text-white px-3 py-1.5 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 group transition-all hover:pr-1">
                          {tag}
                          <button 
                            type="button" 
                            onClick={() => setFormData(p => ({ ...p, tools: p.tools.filter((_, i) => i !== idx) }))}
                            className="hover:text-red-200"
                          >
                             <Plus size={14} className="rotate-45" />
                          </button>
                        </span>
                      ))}
                      <input 
                        type="text"
                        placeholder={formData.tools.length === 0 ? "e.g. Photoshop, Figma, React, Node.js..." : "Add more..."}
                        className="bg-transparent border-none outline-none flex-grow min-w-[150px] font-medium text-slate-700 text-sm p-1.5"
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' && e.target.value.trim()) {
                            e.preventDefault();
                            if (!formData.tools.includes(e.target.value.trim().toUpperCase())) {
                               setFormData(prev => ({ 
                                 ...prev, 
                                 tools: [...prev.tools, e.target.value.trim().toUpperCase()] 
                               }));
                            }
                            e.target.value = '';
                          }
                        }}
                      />
                    </div>
                  </div>
                )}

                {/* Hourly Wage / Fixed Budget */}
                <div className="space-y-2">
                  <label className="text-xs sm:text-sm font-bold text-slate-700 ml-1">
                    {['freelancer', 'graphic_designer', 'logo_designer', 'developer'].includes(formData.serviceCategory) ? 'Fixed Budget / Project Base (रु) *' : 'Hourly Wage (रु) *'}
                  </label>
                  <div className="relative">
                    <div className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 font-bold text-slate-400">रु</div>
                    <input
                      required
                      type="number"
                      name="hourlyWage"
                      placeholder={['freelancer', 'graphic_designer', 'logo_designer', 'developer'].includes(formData.serviceCategory) ? "Enter minimum project budget" : "Enter your hourly rate"}
                      className={`w-full bg-slate-50 border ${errors.hourlyWage ? 'border-red-300' : 'border-slate-200'} rounded-xl sm:rounded-2xl py-3 sm:py-4 pl-9 sm:pl-12 pr-3 sm:pr-4 focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none transition-all font-medium text-sm sm:text-base`}
                      value={formData.hourlyWage}
                      onChange={handleInputChange}
                    />
                  </div>
                  {errors.hourlyWage && (
                    <p className="text-xs text-red-500 ml-1">{errors.hourlyWage}</p>
                  )}
                </div>

                {/* Bio */}
                <div className="space-y-2">
                  <label className="text-xs sm:text-sm font-bold text-slate-700 ml-1">About Your Service</label>
                  <textarea
                    name="bio"
                    placeholder="Tell potential clients about your experience, tools, and expertise..."
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl sm:rounded-2xl py-3 sm:py-4 px-3 sm:px-6 h-24 sm:h-32 focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none transition-all font-medium text-sm sm:text-base resize-none"
                    value={formData.bio}
                    onChange={handleInputChange}
                    maxLength={500}
                  />
                  <div className="text-xs text-slate-400 text-right">
                    {formData.bio.length}/500 characters
                  </div>
                </div>

                {/* Job Type Section */}
                <div className="space-y-3 pt-2 sm:pt-4 border-t border-slate-50">
                  <label className="text-xs sm:text-sm font-bold text-slate-700 ml-1">Preference *</label>
                  <div className="flex gap-4">
                    <button
                      type="button"
                      onClick={() => handleJobTypeChange('full-time')}
                      className={`flex-1 py-3 sm:py-4 rounded-2xl border-2 font-black text-[10px] sm:text-xs uppercase tracking-widest transition-all ${
                        formData.jobType === 'full-time' 
                          ? 'bg-orange-500 border-orange-500 text-white shadow-lg shadow-orange-100 scale-[1.02]' 
                          : 'bg-white border-slate-100 text-slate-400 hover:border-orange-200'
                      }`}
                    >
                      Full-Time
                    </button>
                    <button
                      type="button"
                      onClick={() => handleJobTypeChange('part-time')}
                      className={`flex-1 py-3 sm:py-4 rounded-2xl border-2 font-black text-[10px] sm:text-xs uppercase tracking-widest transition-all ${
                        formData.jobType === 'part-time' 
                          ? 'bg-orange-500 border-orange-500 text-white shadow-lg shadow-orange-100 scale-[1.02]' 
                          : 'bg-white border-slate-100 text-slate-400 hover:border-orange-200'
                      }`}
                    >
                      Part-Time
                    </button>
                  </div>
                </div>

                {/* Availability Section - Only show if Part-Time */}
                {formData.jobType === 'part-time' && (
                  <div className="space-y-4 pt-2 sm:pt-4 animate-in fade-in slide-in-from-top-2 duration-500">
                    <div className="flex justify-between items-center">
                      <label className="text-xs sm:text-sm font-bold text-slate-700 ml-1 flex items-center gap-2">
                        <Clock size={16} className="text-orange-500" /> Your Availability *
                      </label>
                      <button
                        type="button"
                        onClick={addAvailability}
                        className="text-xs sm:text-sm font-bold text-orange-600 hover:text-orange-700 flex items-center gap-1 transition-colors"
                      >
                        <Plus className="w-3 h-3 sm:w-4 sm:h-4" /> Add Slot
                      </button>
                    </div>

                    <div className="space-y-3">
                      {formData.availability.map((slot, index) => (
                        <div key={index} className="space-y-1">
                          <div className="flex flex-wrap sm:flex-nowrap items-end gap-3 p-4 bg-slate-50 border border-slate-200 rounded-2xl group transition-all hover:border-orange-200">
                            <div className="flex-1 min-w-[140px] space-y-1.5">
                              <label className="text-[10px] uppercase font-bold text-slate-500 ml-1">Day</label>
                              <select
                                className="w-full bg-white border border-slate-200 rounded-xl py-2 px-3 text-sm font-semibold focus:ring-2 focus:ring-orange-500 outline-none"
                                value={slot.day}
                                onChange={(e) => handleAvailabilityChange(index, 'day', e.target.value)}
                              >
                                {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday', 'Weekdays', 'Weekends', 'Daily'].map(day => (
                                  <option key={day} value={day}>{day}</option>
                                ))}
                              </select>
                            </div>

                            <div className="flex-1 min-w-[100px] space-y-1.5">
                              <label className="text-[10px] uppercase font-bold text-slate-500 ml-1">From</label>
                              <input
                                type="time"
                                className="w-full bg-white border border-slate-200 rounded-xl py-2 px-3 text-sm font-semibold focus:ring-2 focus:ring-orange-500 outline-none"
                                value={slot.startTime}
                                onChange={(e) => handleAvailabilityChange(index, 'startTime', e.target.value)}
                              />
                            </div>

                            <div className="flex-1 min-w-[100px] space-y-1.5">
                              <label className="text-[10px] uppercase font-bold text-slate-500 ml-1">To</label>
                              <input
                                type="time"
                                className="w-full bg-white border border-slate-200 rounded-xl py-2 px-3 text-sm font-semibold focus:ring-2 focus:ring-orange-500 outline-none"
                                value={slot.endTime}
                                onChange={(e) => handleAvailabilityChange(index, 'endTime', e.target.value)}
                              />
                            </div>

                            {formData.availability.length > 1 && (
                              <button
                                type="button"
                                onClick={() => removeAvailability(index)}
                                className="p-2 text-slate-400 hover:text-red-500 transition-colors mb-0.5"
                              >
                                <X size={20} />
                              </button>
                            )}
                          </div>
                          {errors[`availability_${index}`] && (
                            <p className="text-[10px] text-red-500 ml-1 -mt-1 font-bold">{errors[`availability_${index}`]}</p>
                          )}
                        </div>
                      ))}
                    </div>
                    <p className="text-[10px] text-slate-400 font-medium ml-1">
                      Set your working hours so clients know when they can book your services.
                    </p>
                  </div>
                )}

                {/* Verification Documents Section */}
                <div className="space-y-3 sm:space-y-4 pt-2 sm:pt-4">
                  <div className="flex justify-between items-center">
                    <label className="text-xs sm:text-sm font-bold text-slate-700 ml-1">
                      Verification Documents *
                    </label>
                    <button
                      type="button"
                      onClick={triggerDocUpload}
                      className="text-xs sm:text-sm font-bold text-teal-600 hover:text-teal-700 flex items-center gap-1 transition-colors"
                    >
                      <Upload className="w-3 h-3 sm:w-4 sm:h-4" /> Add Documents
                    </button>
                  </div>

                  <input
                    type="file"
                    ref={docInputRef}
                    onChange={handleDocChange}
                    className="hidden"
                    multiple
                    accept=".pdf,.jpg,.jpeg,.png"
                  />

                  {documents.length > 0 ? (
                    <div className="grid grid-cols-1 gap-2 sm:gap-3">
                      {documents.map((doc) => (
                        <div
                          key={doc.id}
                          className="flex items-center justify-between p-3 sm:p-4 bg-slate-50 border border-slate-200 rounded-xl sm:rounded-2xl group hover:border-teal-200 transition-colors"
                        >
                          <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
                            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-teal-100 rounded-lg sm:rounded-xl flex items-center justify-center text-teal-600 flex-shrink-0">
                              <FileText className="w-4 h-4 sm:w-5 sm:h-5" />
                            </div>
                            <div className="min-w-0 flex-1">
                              <p className="text-xs sm:text-sm font-bold text-slate-800 truncate">{doc.name}</p>
                              <p className="text-xs text-slate-400 font-medium">{doc.size}</p>
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={() => removeDoc(doc.id)}
                            className="p-1 sm:p-2 text-slate-400 hover:text-red-500 transition-colors flex-shrink-0"
                          >
                            <Trash2 className="w-4 h-4 sm:w-5 sm:h-5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div
                      onClick={triggerDocUpload}
                      className="border-2 border-dashed border-slate-200 rounded-2xl sm:rounded-[32px] p-4 sm:p-6 lg:p-8 text-center cursor-pointer hover:border-teal-400 hover:bg-teal-50/30 transition-all group"
                    >
                      <div className="w-12 h-12 sm:w-16 sm:h-16 bg-slate-100 rounded-xl sm:rounded-2xl flex items-center justify-center mx-auto mb-3 sm:mb-4 text-slate-400 group-hover:bg-teal-100 group-hover:text-teal-600 transition-colors">
                        <Upload className="w-5 h-5 sm:w-6 sm:h-6" />
                      </div>
                      <p className="text-xs sm:text-sm font-bold text-slate-700 mb-1">Upload verification documents</p>
                      <p className="text-xs text-slate-500">PDF, JPG, or PNG. Max 10MB per file.</p>
                    </div>
                  )}
                </div>

                {/* Submit Button */}
                <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 pt-6 sm:pt-8">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="flex-1 bg-orange-500 hover:bg-orange-600 text-white py-3 sm:py-4 font-bold rounded-xl sm:rounded-2xl transition-colors text-sm sm:text-base disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSubmitting ? (
                      <span className="flex items-center justify-center gap-2">
                        <svg className="animate-spin h-4 w-4 sm:h-5 sm:w-5 text-white" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                        </svg>
                        Submitting...
                      </span>
                    ) : "Submit Application"}
                  </button>
                  <button
                    type="button"
                    className="flex-1 py-3 sm:py-4 font-bold rounded-xl sm:rounded-2xl bg-transparent border border-slate-200 hover:bg-slate-50 text-slate-700 text-sm sm:text-base"
                    onClick={() => window.history.back()}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ProfessionalRegistration;