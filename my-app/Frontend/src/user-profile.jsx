import React, { useState, useEffect } from "react"
import { useNavigate } from 'react-router-dom'
import axios from "axios"
import toast from 'react-hot-toast'
import { Camera, Mail, Phone, MapPin, CheckCircle2, ArrowLeft, AlertCircle, Menu, X, Bell, Lock, ShieldCheck, Key, UserCircle, Moon, Sun, Globe, ChevronLeft } from "lucide-react"
import Sidebar from './components/Sidebar'
import Logo from './Logo'
import OptimizedImage from './components/OptimizedImage'
import { useTranslation } from "./utils/LanguageContext"

export default function UserProfile() {
  const { t, language: currentLanguage, changeLanguage } = useTranslation()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [profileImage, setProfileImage] = useState(null)
  const navigate = useNavigate()
  const [formData, setFormData] = useState({
    username: localStorage.getItem("username") || "",
    firstName: localStorage.getItem("firstName") || "",
    lastName: localStorage.getItem("lastName") || "",
    fullName: localStorage.getItem("userName") || "",
    email: localStorage.getItem("userEmail") || "",
    phone: localStorage.getItem("userPhone") || "",
    location: localStorage.getItem("userLocation") || "",
    totalBookings: 0
  })
  const [errors, setErrors] = useState({})
  const [successMessage, setSuccessMessage] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isLocationEnabled, setIsLocationEnabled] = useState(false)
  const [isLocationVerified, setIsLocationVerified] = useState(!!localStorage.getItem("userLocation"))
  const [coords, setCoords] = useState(null)
  const [watchId, setWatchId] = useState(null)
  const [currentAddressName, setCurrentAddressName] = useState(localStorage.getItem("userLocation") || "")
  const [isGeocoding, setIsGeocoding] = useState(false)
  const [debouncedCoords, setDebouncedCoords] = useState(null)
  const [activeTab, setActiveTab] = useState("profile")
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  })
  const [passwordErrors, setPasswordErrors] = useState({})
  const [passwordStrength, setPasswordStrength] = useState({
    length: false,
    upper: false,
    lower: false,
    number: false,
    special: false
  })
  const [strengthScore, setStrengthScore] = useState(0)
  const [isChangingPassword, setIsChangingPassword] = useState(false)
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'light')

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
    localStorage.setItem('theme', theme)
  }, [theme])



  // Reusable function to get address from OSM Nominatim
  const getAddressFromCoordinates = async (lat, lng) => {
    if (!lat || !lng || (lat === 0 && lng === 0)) {
      return "Waiting for GPS signal..."
    }

    try {
      setIsGeocoding(true)
      const response = await axios.get(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`,
        {
          headers: {
            'Accept-Language': currentLanguage === 'ne' ? 'ne,en' : 'en',
            'User-Agent': 'ServiceApp/1.0' // Required by Nominatim
          },
          timeout: 15000 // Increased timeout to 15 seconds
        }
      )

      if (response.data && response.data.display_name) {
        // Use display_name as fallback if address parsing fails
        if (response.data.address) {
          const addr = response.data.address
          const area = addr.suburb || addr.neighbourhood || addr.village || addr.city_district || addr.ward || addr.hamlet || ""
          const city = addr.city || addr.town || addr.municipality || addr.state_district || addr.county || ""
          const region = addr.state || addr.region || ""
          const country = addr.country || ""

          const formattedAddress = [area, city, region, country].filter(Boolean).join(", ")
          return formattedAddress || response.data.display_name
        }
        return response.data.display_name
      }
      return "Address not found"
    } catch (error) {
      console.error("Geocoding error:", error)
      if (error.code === 'ECONNABORTED' || error.message.includes('timeout')) {
        return "Connection timeout. Please check your internet."
      }
      if (error.response?.status === 403 || error.response?.status === 429) {
        return "Too many requests. Please wait a moment..."
      }
      if (error.response?.status === 404) {
        return "Location service unavailable"
      }
      // Return a more user-friendly error message
      return "Unable to get address. You can enter it manually."
    } finally {
      setIsGeocoding(false)
    }
  }

  useEffect(() => {
    // Load user data from database and localStorage
    const loadUserProfile = async () => {
      const userId = localStorage.getItem("userId")

      if (!userId) {
        console.log("No user ID found, loading from localStorage")
        // Fallback to localStorage if no userId
        const userName = localStorage.getItem("userName") || ""
        const userEmail = localStorage.getItem("userEmail") || ""
        const userPhone = localStorage.getItem("userPhone") || ""
        const userLocation = localStorage.getItem("userLocation") || ""
        const userImage = localStorage.getItem("userProfileImage")

        setFormData({
          username: userName,
          fullName: userName,
          email: userEmail,
          phone: userPhone,
          location: userLocation,
        })

        if (userImage) {
          setProfileImage(userImage)
        }

        if (userLocation) {
          setIsLocationVerified(true)
          setCurrentAddressName(userLocation)
        }
        return
      }

      try {
        // Try to fetch from database
        const response = await axios.get(
          `/api/users/${userId}/profile`
        )

        if (response.data.user) {
          const user = response.data.user
          setFormData({
            username: user.username || "",
            firstName: user.firstName || "",
            lastName: user.lastName || "",
            fullName: user.name || "",
            email: user.email || "",
            phone: user.phone || "",
            location: user.formattedAddress || user.address || (typeof user.location === 'string' ? user.location : ""),
          })

          if (user.formattedAddress || user.address) {
            setIsLocationVerified(true);
            setCurrentAddressName(user.formattedAddress || user.address);
          }

          if (user.profileImage) {
            setProfileImage(user.profileImage)
            // Store only the filename/path, not large base64 strings
            const imageToStore = user.profileImage.length > 500 ? '' : user.profileImage;
            if (imageToStore) {
              localStorage.setItem("userProfileImage", imageToStore)
            }
          }

          // Update localStorage with database values (only if they exist)
          if (user.name) localStorage.setItem("userName", user.name)
          if (user.firstName) localStorage.setItem("firstName", user.firstName)
          if (user.lastName) localStorage.setItem("lastName", user.lastName)
          if (user.email) localStorage.setItem("userEmail", user.email)
          if (user.phone) localStorage.setItem("userPhone", user.phone)
          if (user.username) localStorage.setItem("username", user.username)
          if (user.formattedAddress || typeof user.location === 'string') {
            const loc = user.formattedAddress || user.location;
            localStorage.setItem("userLocation", loc)
          }

          // Fetch booking stats
          try {
            const statsRes = await axios.get(`/api/bookings/stats/${userId}`);
            if (statsRes.data.success) {
              setFormData(prev => ({ ...prev, totalBookings: statsRes.data.data.total }));
            }
          } catch (statsErr) {
            console.error("Error fetching user stats:", statsErr);
          }
        }
      } catch (error) {
        console.error("Error loading profile :", error)
        // Fallback to localStorage
        const userName = localStorage.getItem("userName") || ""
        const userEmail = localStorage.getItem("userEmail") || ""
        const userPhone = localStorage.getItem("userPhone") || ""
        const userLocation = localStorage.getItem("userLocation") || ""
        const userImage = localStorage.getItem("userProfileImage")

        setFormData({
          username: localStorage.getItem("username") || "",
          firstName: localStorage.getItem("firstName") || "",
          lastName: localStorage.getItem("lastName") || "",
          fullName: userName,
          email: userEmail,
          phone: userPhone,
          location: userLocation,
        })

        if (userImage) {
          setProfileImage(userImage)
        }

        if (userLocation) {
          setIsLocationVerified(true)
          setCurrentAddressName(userLocation)
        }
      }
    }

    loadUserProfile()
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Debounce state for location updates to avoid API spam

  useEffect(() => {
    if (!coords) return

    const handler = setTimeout(() => {
      setDebouncedCoords(coords)
    }, 15000) // Increased to 15 second debounce to respect Nominatim usage policy

    return () => clearTimeout(handler)
  }, [coords])

  // Fetch address when debounced coordinates change
  useEffect(() => {
    if (!debouncedCoords) return

    const fetchAddress = async () => {
      const address = await getAddressFromCoordinates(debouncedCoords.latitude, debouncedCoords.longitude)
      setCurrentAddressName(address)
      
      // Only mark as verified if we got a valid address (not an error message)
      const isValidAddress = address && 
        !address.includes("Unable") && 
        !address.includes("Error") && 
        !address.includes("timeout") && 
        !address.includes("unavailable") &&
        !address.includes("Waiting")
      
      if (isValidAddress) {
        setIsLocationVerified(true)
        
        // Update form data so it stays "saved" even if tracking stops
        setFormData(prev => ({
          ...prev,
          location: address
        }))

        // Update backend with the new address and coordinates
        try {
          const token = localStorage.getItem("token")
          const role = localStorage.getItem("userRole") // Get role if available

          if (token) {
            await axios.put(
              "/api/users/update-location",
              {
                latitude: debouncedCoords.latitude,
                longitude: debouncedCoords.longitude,
                formattedAddress: address,
                role: role || "user"
              },
              { headers: { Authorization: `Bearer ${token}` } }
            )
            console.log("Location and Address persisted to database:", { address })
            localStorage.setItem("userLocation", address)
          }
        } catch (err) {
          console.error("Failed to persist address:", err)
          setErrors(prev => ({ 
            ...prev, 
            location: "Location saved locally but couldn't sync to server" 
          }))
        }
      } else {
        // If address fetch failed, show the error but don't stop tracking
        console.warn("Address lookup failed:", address)
      }
    }

    fetchAddress()
  }, [debouncedCoords]) // eslint-disable-line react-hooks/exhaustive-deps

  const handleImageUpload = (e) => {
    const file = e.target.files?.[0]
    if (file) {
      // Limit file size to 100MB
      if (file.size > 100 * 1024 * 1024) {
        setErrors({ ...errors, profileImage: "File size must be less than 100MB" })
        return
      }

      const reader = new FileReader()
      reader.onloadend = () => {
        setProfileImage(reader.result)
        setErrors({ ...errors, profileImage: "" })
      }
      reader.readAsDataURL(file)
    }
  }

  const validateForm = () => {
    const newErrors = {}

    if (!formData.firstName.trim()) {
      newErrors.firstName = "First name is required"
    }
    if (!formData.lastName.trim()) {
      newErrors.lastName = "Last name is required"
    }
    if (!formData.email.trim()) {
      newErrors.email = "Email is required"
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Please enter a valid email"
    }
    if (formData.phone && !/^[\d\s\-+()]+$/.test(formData.phone)) {
      newErrors.phone = "Please enter a valid phone number"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData({
      ...formData,
      [name]: value,
    })
    // Clear error for this field
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: "",
      })
    }
  }

  const handleSaveChanges = async () => {
    if (!validateForm()) {
      return
    }

    setIsLoading(true)
    try {
      const userId = localStorage.getItem("userId")

      if (!userId) {
        throw new Error("User ID not found. Please login again.")
      }

      console.log("Saving profile for userId:", userId);
      console.log("Profile image present:", !!profileImage);
      if (profileImage) {
        console.log("Profile image type:", profileImage.startsWith("data:") ? "Base64" : "Other");
        console.log("Profile image size:", profileImage.length, "characters");
      }

      // Prepare form data for multipart upload
      const formDataToSend = new FormData()
      formDataToSend.append("firstName", formData.firstName)
      formDataToSend.append("lastName", formData.lastName)
      formDataToSend.append("username", formData.username)
      formDataToSend.append("email", formData.email)
      formDataToSend.append("phone", formData.phone)
      formDataToSend.append("location", formData.location)

      // Add profile image if it's a new file (base64 string)
      if (profileImage && profileImage.startsWith("data:")) {
        console.log("Appending profile image to form data");
        formDataToSend.append("profileImage", profileImage)
      }

      // Send to backend
      console.log("Sending profile update request...");
      const apiResponse = await axios.put(
        `/api/users/${userId}/profile`,
        formDataToSend
      )

      console.log("Profile update response:", apiResponse.data)

      // Save to localStorage as backup
      localStorage.setItem("userName", `${formData.firstName} ${formData.lastName}`.trim())
      localStorage.setItem("firstName", formData.firstName)
      localStorage.setItem("lastName", formData.lastName)
      localStorage.setItem("userEmail", formData.email)
      localStorage.setItem("userPhone", formData.phone)
      localStorage.setItem("username", formData.username)
      localStorage.setItem("userLocation", formData.location)

      if (profileImage) {
        // Store only the filename/path, not large base64 strings
        const imageToStore = profileImage.length > 500 ? '' : profileImage;
        if (imageToStore) {
          localStorage.setItem("userProfileImage", imageToStore)
          console.log("Profile image saved to localStorage");
        }
      }

      setSuccessMessage("Profile updated successfully!")
      setTimeout(() => setSuccessMessage(""), 3000)
    } catch (error) {
      console.error("Error saving profile:", error)
      setErrors({
        general: error.response?.data?.message || error.message || "Failed to save profile. Please try again."
      })
    } finally {
      setIsLoading(false)
    }
  }



  useEffect(() => {
    // Cleanup watchPosition on unmount
    return () => {
      if (watchId) {
        navigator.geolocation.clearWatch(watchId)
      }
    }
  }, [watchId])

  const startTracking = () => {
    if (!navigator.geolocation) {
      setErrors({ ...errors, location: "Geolocation is not supported by your browser" })
      return
    }

    setIsLoading(true)
    setErrors({ ...errors, location: "" }) // Clear previous errors
    
    const id = navigator.geolocation.watchPosition(
      async (position) => {
        const { latitude, longitude } = position.coords
        console.log("Location updated:", { latitude, longitude, accuracy: position.coords.accuracy })
        setCoords({ latitude, longitude })
        setIsLocationEnabled(true)
        setIsLoading(false)
        setErrors({ ...errors, location: "" }) // Clear errors on success
      },
      (error) => {
        console.error("Geolocation error:", error)
        setIsLocationEnabled(false)
        setIsLoading(false)
        
        let errorMessage = "Location access denied"
        switch(error.code) {
          case error.PERMISSION_DENIED:
            errorMessage = "Location permission denied. Please enable location access in your browser settings."
            break
          case error.POSITION_UNAVAILABLE:
            errorMessage = "Location information unavailable. Please check your device settings."
            break
          case error.TIMEOUT:
            errorMessage = "Location request timed out. Please try again."
            break
          default:
            errorMessage = "Unable to get location. You can enter address manually."
        }
        
        setErrors({ ...errors, location: errorMessage })
      },
      { 
        enableHighAccuracy: true, 
        timeout: 10000, 
        maximumAge: 0 
      }
    )
    setWatchId(id)
  }

  const stopTracking = () => {
    if (watchId) {
      navigator.geolocation.clearWatch(watchId)
      setWatchId(null)
    }
    setIsLocationEnabled(false)
  }

  const checkPasswordStrength = (pass) => {
    const length = pass.length >= 8;
    const upper = /[A-Z]/.test(pass);
    const lower = /[a-z]/.test(pass);
    const number = /[0-9]/.test(pass);
    const special = /[!@#$%^&*()_+{}[\]:;<>,.?~\\/-]/.test(pass);

    setPasswordStrength({ length, upper, lower, number, special });

    let score = 0;
    if (length) score++;
    if (upper) score++;
    if (lower) score++;
    if (number) score++;
    if (special) score++;
    setStrengthScore(score);
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target
    setPasswordData({
      ...passwordData,
      [name]: value,
    })
    if (name === 'newPassword') {
      checkPasswordStrength(value);
    }
    if (passwordErrors[name]) {
      setPasswordErrors({
        ...passwordErrors,
        [name]: "",
      })
    }
  }

  const validatePasswordForm = () => {
    const newErrors = {}
    if (!passwordData.currentPassword) newErrors.currentPassword = "Current password is required"
    if (!passwordData.newPassword) {
      newErrors.newPassword = "New password is required"
    } else if (strengthScore < 5) {
      newErrors.newPassword = "Weak password. Please meet all requirements."
    }
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match"
    }
    setPasswordErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const submitPasswordChange = async () => {
    if (!validatePasswordForm()) return

    setIsChangingPassword(true)
    try {
      const userId = localStorage.getItem("userId")
      const token = localStorage.getItem("token")

      await axios.put(
        `/api/users/${userId}/change-password`,
        {
          currentPassword: passwordData.currentPassword,
          newPassword: passwordData.newPassword,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      )

      setSuccessMessage("Password successfully updated!")
      toast.success("Password changed successfully!")
      setPasswordData({ currentPassword: "", newPassword: "", confirmPassword: "" })
      setTimeout(() => setSuccessMessage(""), 3000)
    } catch (error) {
      console.error("Password update error:", error)
      setPasswordErrors({
        general: error.response?.data?.message || "Failed to update password"
      })
    } finally {
      setIsChangingPassword(false)
    }
  }

  const handleCancel = () => {
    if (watchId) {
      navigator.geolocation.clearWatch(watchId)
      setWatchId(null)
    }
    setIsLocationEnabled(false)
    const savedLocation = localStorage.getItem("userLocation") || ""
    setCurrentAddressName(savedLocation)
    setIsLocationVerified(!!savedLocation)
    // Reset form to initial values
    const userName = localStorage.getItem("userName") || ""
    const userEmail = localStorage.getItem("userEmail") || ""
    const userPhone = localStorage.getItem("userPhone") || ""
    const userLocation = localStorage.getItem("userLocation") || ""

    setFormData({
      username: userName,
      fullName: userName,
      email: userEmail,
      phone: userPhone,
      location: userLocation,
    })
    setErrors({})
    setSuccessMessage("")
  }

  const getInitials = (name) => {
    if (!name) return "UN"
    return name
      .split(" ")
      .filter(Boolean)
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2) || "UN"
  }

  const handleLogout = () => {
    localStorage.clear()
    navigate('/login')
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <nav className="sticky top-0 z-50 bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="lg:hidden p-2 hover:bg-gray-100 rounded-lg text-gray-600 transition"
              >
                {sidebarOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
              <button 
                onClick={() => navigate(-1)}
                className="p-2 bg-slate-50 text-slate-500 hover:text-teal-600 hover:bg-teal-50 rounded-lg transition-all"
                title="Go Back"
              >
                <ChevronLeft size={20} />
              </button>
              <button onClick={() => navigate('/')} className="hover:opacity-80 transition cursor-pointer">
                <Logo />
              </button>
              <h1 className="text-xl font-bold text-gray-900 ml-2">User Profile</h1>
            </div>
          <div className="flex items-center gap-4">
            <button className="relative p-2 text-gray-700 hover:bg-gray-100 rounded-lg transition">
              <Bell size={20} />
              <span className="absolute top-1.5 right-1.5 h-2 w-2 bg-red-500 rounded-full border-2 border-white"></span>
            </button>
          </div>
        </div>
      </nav>

      <div className="flex flex-1">
        <Sidebar
          sidebarOpen={sidebarOpen}
          setSidebarOpen={setSidebarOpen}
          handleLogout={handleLogout}
        />

        <main className="flex-1 p-4 lg:p-8 overflow-y-auto">
          <div className="max-w-4xl mx-auto mb-6">
            <button
              onClick={() => navigate(-1)}
              className="flex items-center gap-2 text-slate-700 hover:text-teal-600 transition-colors font-semibold"
            >
              <ArrowLeft size={20} />
              <span className="text-sm">Back</span>
            </button>
          </div>

          <div className="w-full max-w-4xl mx-auto">
            <div className="bg-white rounded-2xl shadow-md border border-slate-200 p-8">
              <h1 className="text-3xl font-bold text-slate-900 mb-8">User Profile</h1>

              {/* Success Message */}
              {successMessage && (
                <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-xl text-green-700 font-semibold flex items-center gap-2">
                  <CheckCircle2 size={20} />
                  {successMessage}
                </div>
              )}

              {/* General Error */}
              {errors.general && (
                <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 font-semibold flex items-center gap-2">
                  <AlertCircle size={20} />
                  {errors.general}
                </div>
              )}

              {/* Tab Navigation */}
              <div className="flex border-b border-slate-200 mb-8">
                <button
                  onClick={() => setActiveTab("profile")}
                  className={`px-6 py-3 font-bold text-sm transition-all border-b-2 ${activeTab === "profile"
                      ? "border-teal-600 text-teal-600"
                      : "border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300"
                    }`}
                >
                  {t('profile_details')}
                </button>
                <button
                  onClick={() => setActiveTab("security")}
                  className={`px-6 py-3 font-bold text-sm transition-all border-b-2 ${activeTab === "security"
                      ? "border-teal-600 text-teal-600"
                      : "border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300"
                    }`}
                >
                  {t('security')}
                </button>
                <button
                  onClick={() => setActiveTab("settings")}
                  className={`px-6 py-3 font-bold text-sm transition-all border-b-2 ${activeTab === "settings"
                      ? "border-teal-600 text-teal-600"
                      : "border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300"
                    }`}
                >
                  {t('appearance')}
                </button>
              </div>

              {activeTab === "profile" && (
                <div className="space-y-8 animate-in fade-in duration-500">
                  {/* Profile Picture Section */}
                  <div className="flex flex-col items-center gap-4 pb-8 border-b border-slate-200">
                    <div className="relative">
                      <div className="h-32 w-32 rounded-full bg-gradient-to-br from-teal-400 to-orange-400 flex items-center justify-center text-white text-4xl font-bold overflow-hidden">
                        {profileImage ? (
                          <OptimizedImage 
                            src={profileImage} 
                            alt="Profile" 
                            className="w-full h-full" 
                            fallbackIcon={UserCircle}
                          />
                        ) : (
                          getInitials(formData.fullName)
                        )}
                      </div>
                      <label
                        htmlFor="profile-upload"
                        className="absolute bottom-0 right-0 bg-teal-600 hover:bg-teal-700 text-white rounded-full p-3 cursor-pointer transition-colors shadow-lg"
                      >
                        <Camera className="h-5 w-5" />
                        <input
                          id="profile-upload"
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={handleImageUpload}
                        />
                      </label>
                    </div>
                    <p className="text-sm text-slate-600">Click camera icon to upload profile picture</p>
                    {errors.profileImage && (
                      <p className="text-sm text-red-600">{errors.profileImage}</p>
                    )}
                  </div>

                  {/* Personal Information */}
                  <div className="space-y-5">
                    <h2 className="text-xl font-bold text-slate-900">{t('personal_info')}</h2>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label htmlFor="firstName" className="block text-sm font-semibold text-slate-700 mb-2">
                          {t('first_name')}
                        </label>
                        <input
                          id="firstName"
                          name="firstName"
                          type="text"
                          placeholder="Your first name"
                          value={formData.firstName}
                          onChange={handleInputChange}
                          className={`w-full px-4 py-2.5 border rounded-xl font-medium focus:outline-none focus:ring-2 transition-all ${errors.firstName
                            ? "border-red-300 focus:ring-red-200"
                            : "border-slate-300 focus:ring-teal-200"
                            }`}
                        />
                        {errors.firstName && (
                          <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                            <AlertCircle size={14} /> {errors.firstName}
                          </p>
                        )}
                      </div>

                      <div>
                        <label htmlFor="lastName" className="block text-sm font-semibold text-slate-700 mb-2">
                          {t('last_name')}
                        </label>
                        <input
                          id="lastName"
                          name="lastName"
                          type="text"
                          placeholder="Your last name"
                          value={formData.lastName}
                          onChange={handleInputChange}
                          className={`w-full px-4 py-2.5 border rounded-xl font-medium focus:outline-none focus:ring-2 transition-all ${errors.lastName
                            ? "border-red-300 focus:ring-red-200"
                            : "border-slate-300 focus:ring-teal-200"
                            }`}
                        />
                        {errors.lastName && (
                          <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                            <AlertCircle size={14} /> {errors.lastName}
                          </p>
                        )}
                      </div>
                    </div>

                    <div>
                      <label htmlFor="username" className="block text-sm font-semibold text-slate-700 mb-2">
                        {t('username')}
                      </label>
                      <input
                        id="username"
                        name="username"
                        type="text"
                        placeholder="Enter your username"
                        value={formData.username}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2.5 border border-slate-300 rounded-xl font-medium focus:outline-none focus:ring-2 focus:ring-teal-200 transition-all"
                      />
                    </div>
                  </div>

                  {/* Contact Information */}
                  <div className="space-y-5">
                    <h2 className="text-xl font-bold text-slate-900">{t('contact_info')}</h2>

                    <div>
                      <label htmlFor="email" className="flex items-center gap-2 text-sm font-semibold text-slate-700 mb-2">
                        <Mail size={16} className="text-teal-600" />
                        {t('email')} <span className="text-red-500">*</span>
                      </label>
                      <input
                        id="email"
                        name="email"
                        type="email"
                        placeholder="your.email@example.com"
                        value={formData.email}
                        onChange={handleInputChange}
                        className={`w-full px-4 py-2.5 border rounded-xl font-medium focus:outline-none focus:ring-2 transition-all ${errors.email
                          ? "border-red-300 focus:ring-red-200"
                          : "border-slate-300 focus:ring-teal-200"
                          }`}
                      />
                      {errors.email && (
                        <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                          <AlertCircle size={14} /> {errors.email}
                        </p>
                      )}
                    </div>

                    <div>
                      <label htmlFor="phone" className="flex items-center gap-2 text-sm font-semibold text-slate-700 mb-2">
                        <Phone size={16} className="text-teal-600" />
                        {t('phone')}
                      </label>
                      <input
                        id="phone"
                        name="phone"
                        type="tel"
                        placeholder="+977 98XX XXX XXX"
                        value={formData.phone}
                        onChange={handleInputChange}
                        className={`w-full px-4 py-2.5 border rounded-xl font-medium focus:outline-none focus:ring-2 transition-all ${errors.phone
                          ? "border-red-300 focus:ring-red-200"
                          : "border-slate-300 focus:ring-teal-200"
                          }`}
                      />
                      {errors.phone && (
                        <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                          <AlertCircle size={14} /> {errors.phone}
                        </p>
                      )}
                    </div>

                    <div>
                      <label htmlFor="location" className="flex items-center gap-2 text-sm font-semibold text-slate-700 mb-2">
                        <MapPin size={16} className="text-teal-600" />
                        {t('location')} {isLocationEnabled ? "(Real-time)" : "(Manual Address)"}
                      </label>
                      <div className="flex flex-col gap-3">
                        <input
                          id="location"
                          name="location"
                          type="text"
                          placeholder="City, Country or Street Address"
                          value={isLocationEnabled ? (currentAddressName || (isGeocoding ? "Locating area..." : "Getting location...")) : formData.location}
                          onChange={handleInputChange}
                          disabled={isLocationEnabled}
                          className={`w-full px-4 py-2.5 border border-slate-300 rounded-xl font-medium focus:outline-none focus:ring-2 transition-all ${
                            (isLocationEnabled || isLocationVerified) ? "bg-teal-50/30 text-teal-700 font-bold" : ""
                          } ${
                            errors.location ? "border-red-300 focus:ring-red-200" : "focus:ring-teal-200"
                          }`}
                        />

                        {(isLocationEnabled || isLocationVerified) && currentAddressName && !currentAddressName.includes("Unable") && !currentAddressName.includes("Error") && (
                          <div className="p-3 bg-teal-50 border border-teal-100 rounded-xl animate-in fade-in slide-in-from-top-1 duration-300">
                            <p className="text-xs font-bold text-teal-800 uppercase tracking-wider mb-1 flex items-center gap-1">
                              {isGeocoding ? (
                                <>
                                  <span className="inline-block w-3 h-3 border-2 border-teal-600 border-t-transparent rounded-full animate-spin"></span>
                                  Updating...
                                </>
                              ) : isLocationEnabled ? (
                                <>📍 Live Tracking Active</>
                              ) : (
                                <>📍 Saved Verified Location</>
                              )}
                            </p>
                            <p className="text-sm text-teal-900 font-semibold">
                              {isGeocoding ? "Calculating address..." : currentAddressName}
                            </p>
                          </div>
                        )}

                        {currentAddressName && (currentAddressName.includes("Unable") || currentAddressName.includes("Error") || currentAddressName.includes("timeout") || currentAddressName.includes("unavailable")) && (
                          <div className="p-3 bg-orange-50 border border-orange-200 rounded-xl">
                            <p className="text-xs font-bold text-orange-800 uppercase tracking-wider mb-1 flex items-center gap-1">
                              <AlertCircle size={14} />
                              Address Lookup Issue
                            </p>
                            <p className="text-sm text-orange-900 font-medium">
                              {currentAddressName}
                            </p>
                          </div>
                        )}

                        {!isLocationEnabled ? (
                          <button
                            type="button"
                            onClick={startTracking}
                            disabled={isLoading}
                            className="flex items-center justify-center gap-2 py-2 px-4 bg-teal-50 text-teal-700 border border-teal-200 rounded-xl hover:bg-teal-100 transition-all font-semibold text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            {isLoading ? (
                              <>
                                <div className="w-4 h-4 border-2 border-teal-600 border-t-transparent rounded-full animate-spin"></div>
                                Getting Location...
                              </>
                            ) : (
                              <>
                                <MapPin size={16} />
                                {isLocationVerified ? "Update with Real-time Location" : "Enable Real-time Location"}
                              </>
                            )}
                          </button>
                        ) : (
                          <button
                            type="button"
                            onClick={stopTracking}
                            className="flex items-center justify-center gap-2 py-2 px-4 bg-red-50 text-red-700 border border-red-200 rounded-xl hover:bg-red-100 transition-all font-semibold text-sm"
                          >
                            <X size={16} />
                            Stop Live Tracking
                          </button>
                        )}

                        {errors.location && (
                          <div className="p-3 bg-red-50 border border-red-200 rounded-xl">
                            <p className="text-xs font-bold text-red-800 flex items-center gap-1">
                              <AlertCircle size={14} />
                              {errors.location}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* User Analytics */}
                  <div className="space-y-4 pb-8 border-b border-slate-200">
                    <h2 className="text-xl font-bold text-slate-900">{t('analytics')}</h2>
                    <div className="bg-slate-100 rounded-xl p-6">
                      <div className="flex items-center justify-between">
                        <span className="text-slate-600 font-semibold">{t('total_bookings')}</span>
                        <span className="text-4xl font-bold text-teal-600">{formData.totalBookings || 0}</span>
                      </div>
                    </div>
                  </div>

                  {/* Account Verification */}
                  <div className="space-y-4 pb-8">
                    <h2 className="text-xl font-bold text-slate-900">{t('verification')}</h2>
                    <div className="flex items-center gap-3 p-4 bg-green-50 border border-green-200 rounded-xl">
                      <CheckCircle2 className="h-6 w-6 text-green-600 flex-shrink-0" />
                      <span className="text-green-700 font-semibold">Email Verified</span>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-4 pt-4">
                    <button
                      onClick={handleSaveChanges}
                      disabled={isLoading}
                      className="flex-1 bg-teal-600 hover:bg-teal-700 disabled:bg-teal-400 text-white font-bold py-3 px-6 rounded-xl transition-all transform hover:-translate-y-0.5 shadow-md"
                    >
                      {isLoading ? t('loading') : t('save')}
                    </button>
                    <button
                      onClick={handleCancel}
                      className="flex-1 bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold py-3 px-6 rounded-xl transition-all transform hover:-translate-y-0.5"
                    >
                      {t('cancel')}
                    </button>
                  </div>
                </div>
              )}

              {activeTab === "security" && (
                <div className="space-y-8 animate-in slide-in-from-right-4 duration-500">
                  <div className="space-y-6">
                    <div className="flex items-center gap-4 mb-4">
                      <div className="h-12 w-12 bg-teal-50 rounded-2xl flex items-center justify-center text-teal-600">
                        <ShieldCheck size={28} />
                      </div>
                      <div>
                        <h2 className="text-xl font-bold text-slate-900">Change Password</h2>
                        <p className="text-sm text-slate-500 font-medium">Update your account password for better security</p>
                      </div>
                    </div>

                    {passwordErrors.general && (
                      <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 font-semibold flex items-center gap-2">
                        <AlertCircle size={20} />
                        {passwordErrors.general}
                      </div>
                    )}

                    <div className="space-y-5">
                      <div>
                        <label className="flex items-center gap-2 text-sm font-semibold text-slate-700 mb-2">
                          <Lock size={16} className="text-teal-600" />
                          Current Password
                        </label>
                        <input
                          type="password"
                          name="currentPassword"
                          value={passwordData.currentPassword}
                          onChange={handlePasswordChange}
                          placeholder="••••••••"
                          className="w-full px-4 py-2.5 border border-slate-300 rounded-xl font-medium focus:outline-none focus:ring-2 focus:ring-teal-200 transition-all"
                        />
                        {passwordErrors.currentPassword && (
                          <p className="mt-1 text-sm text-red-600 tracking-tight">{passwordErrors.currentPassword}</p>
                        )}
                      </div>

                      <div className="group">
                        <label className="flex items-center gap-2 text-sm font-semibold text-slate-700 mb-2">
                          <Key size={16} className="text-teal-600" />
                          New Password
                        </label>
                        <input
                          type="password"
                          name="newPassword"
                          value={passwordData.newPassword}
                          onChange={handlePasswordChange}
                          placeholder="New secure password"
                          className="w-full px-4 py-2.5 border border-slate-300 rounded-xl font-medium focus:outline-none focus:ring-2 focus:ring-teal-200 transition-all"
                        />
                        {passwordErrors.newPassword && (
                          <p className="mt-1 text-sm text-red-600 tracking-tight">{passwordErrors.newPassword}</p>
                        )}
                        {passwordData.newPassword && (
                          <div className="mt-3 text-xs">
                            <div className="flex gap-1 h-1.5 mt-1 rounded-full overflow-hidden bg-slate-200">
                              {[1, 2, 3, 4, 5].map((val) => (
                                <div
                                  key={val}
                                  className={`flex-1 ${
                                    strengthScore >= val
                                      ? strengthScore < 3
                                        ? 'bg-red-500'
                                        : strengthScore < 5
                                        ? 'bg-yellow-500'
                                        : 'bg-green-500'
                                      : 'bg-transparent'
                                  }`}
                                />
                              ))}
                            </div>
                            <p className={`mt-1 font-medium ${
                              strengthScore < 3 ? 'text-red-500' : strengthScore < 5 ? 'text-yellow-600' : 'text-green-600'
                            }`}>
                              {strengthScore < 3 && 'Weak password'}
                              {strengthScore >= 3 && strengthScore < 5 && 'Fair password'}
                              {strengthScore === 5 && 'Strong password'}
                            </p>
                            {strengthScore < 5 && (
                              <ul className="mt-2 space-y-1 text-slate-500 font-medium">
                                <li className={`flex items-center gap-1 ${passwordStrength.length ? "text-green-600" : ""}`}>
                                  {passwordStrength.length ? "✓" : "○"} At least 8 characters
                                </li>
                                <li className={`flex items-center gap-1 ${passwordStrength.upper ? "text-green-600" : ""}`}>
                                  {passwordStrength.upper ? "✓" : "○"} Uppercase letter
                                </li>
                                <li className={`flex items-center gap-1 ${passwordStrength.lower ? "text-green-600" : ""}`}>
                                  {passwordStrength.lower ? "✓" : "○"} Lowercase letter
                                </li>
                                <li className={`flex items-center gap-1 ${passwordStrength.number ? "text-green-600" : ""}`}>
                                  {passwordStrength.number ? "✓" : "○"} Number
                                </li>
                                <li className={`flex items-center gap-1 ${passwordStrength.special ? "text-green-600" : ""}`}>
                                  {passwordStrength.special ? "✓" : "○"} Special character
                                </li>
                              </ul>
                            )}
                          </div>
                        )}
                      </div>

                      <div>
                        <label className="flex items-center gap-2 text-sm font-semibold text-slate-700 mb-2">
                          <CheckCircle2 size={16} className="text-teal-600" />
                          Confirm New Password
                        </label>
                        <input
                          type="password"
                          name="confirmPassword"
                          value={passwordData.confirmPassword}
                          onChange={handlePasswordChange}
                          placeholder="Re-type new password"
                          className="w-full px-4 py-2.5 border border-slate-300 rounded-xl font-medium focus:outline-none focus:ring-2 focus:ring-teal-200 transition-all"
                        />
                        {passwordErrors.confirmPassword && (
                          <p className="mt-1 text-sm text-red-600 tracking-tight">{passwordErrors.confirmPassword}</p>
                        )}
                      </div>
                    </div>

                    <div className="pt-6 border-t border-slate-100">
                      <button
                        onClick={submitPasswordChange}
                        disabled={isChangingPassword}
                        className="w-full bg-teal-600 hover:bg-teal-700 disabled:bg-teal-400 text-white font-black py-3.5 px-6 rounded-xl transition-all shadow-lg shadow-teal-100 flex items-center justify-center gap-2 active:scale-95"
                      >
                        {isChangingPassword ? (
                          <>
                            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                            Updating Password...
                          </>
                        ) : (
                          <>
                            <ShieldCheck size={20} />
                            Update Password
                          </>
                        )}
                      </button>
                    </div>

                    {/* Security Info Card */}
                    <div className="bg-slate-50 border border-slate-100 rounded-2xl p-6 mt-8">
                      <h3 className="text-slate-900 font-bold mb-3 flex items-center gap-2">
                        <AlertCircle size={18} className="text-orange-500" />
                        Security Recommendations
                      </h3>
                      <ul className="space-y-2.5">
                        {[
                          "Use a combination of letters, numbers, and symbols",
                          "Avoid using common words or personal info",
                          "Don't reuse passwords across other sites",
                          "Keep your login credentials private and secure"
                        ].map((text, i) => (
                          <li key={i} className="flex gap-2 text-sm text-slate-600 font-medium">
                            <span className="h-5 w-5 rounded-full bg-slate-200 flex items-center justify-center text-[10px] shrink-0">{i + 1}</span>
                            {text}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === "settings" && (
                <div className="space-y-8 animate-in fade-in duration-500">
                  <div className="bg-slate-50 p-8 rounded-3xl border border-slate-100">
                    <h2 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
                       <Moon size={24} className="text-teal-600" /> Interface Appearance
                    </h2>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <button 
                        onClick={() => setTheme('light')}
                        className={`flex items-center justify-between p-6 rounded-2xl border-2 transition-all ${theme === 'light' ? 'border-teal-600 bg-white shadow-md' : 'border-slate-100 bg-white/50 hover:bg-white'}`}
                      >
                        <div className="flex items-center gap-4">
                          <div className={`p-3 rounded-xl ${theme === 'light' ? 'bg-teal-600 text-white' : 'bg-slate-100 text-slate-400'}`}>
                            <Sun size={20} />
                          </div>
                          <div className="text-left">
                            <p className="font-bold text-slate-900">Light Mode</p>
                            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Standard Bright</p>
                          </div>
                        </div>
                        {theme === 'light' && <CheckCircle2 size={20} className="text-teal-600" />}
                      </button>

                      <button 
                        onClick={() => setTheme('dark')}
                        className={`flex items-center justify-between p-6 rounded-2xl border-2 transition-all ${theme === 'dark' ? 'border-teal-600 bg-white shadow-md' : 'border-slate-100 bg-white/50 hover:bg-white'}`}
                      >
                        <div className="flex items-center gap-4">
                          <div className={`p-3 rounded-xl ${theme === 'dark' ? 'bg-teal-600 text-white' : 'bg-slate-100 text-slate-400'}`}>
                            <Moon size={20} />
                          </div>
                          <div className="text-left">
                            <p className="font-bold text-slate-900">Dark Mode</p>
                            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Low Light Focus</p>
                          </div>
                        </div>
                        {theme === 'dark' && <CheckCircle2 size={20} className="text-teal-600" />}
                      </button>
                    </div>

                    <div className="mt-8 pt-8 border-t border-slate-100">
                      <h2 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
                         <Globe size={24} className="text-teal-600" /> {t('language_title')}
                      </h2>

                      <div className="flex flex-col sm:flex-row gap-4">
                         <button 
                           onClick={() => changeLanguage('en')}
                           className={`flex-1 flex items-center justify-between p-5 rounded-2xl border-2 transition-all ${currentLanguage === 'en' ? 'border-teal-600 bg-white shadow-sm' : 'border-slate-100 bg-white/50 hover:bg-white'}`}
                         >
                            <div className="flex items-center gap-3">
                               <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-black ${currentLanguage === 'en' ? 'bg-teal-600 text-white' : 'bg-slate-100 text-slate-400'}`}>
                                  EN
                               </div>
                               <div className="text-left">
                                  <p className="font-bold text-slate-900">English</p>
                                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{t('global_standard')}</p>
                                </div>
                            </div>
                            {currentLanguage === 'en' && <CheckCircle2 size={20} className="text-teal-600" />}
                         </button>

                         <button 
                           onClick={() => changeLanguage('ne')}
                           className={`flex-1 flex items-center justify-between p-5 rounded-2xl border-2 transition-all ${currentLanguage === 'ne' ? 'border-teal-600 bg-white shadow-sm' : 'border-slate-100 bg-white/50 hover:bg-white'}`}
                         >
                            <div className="flex items-center gap-3">
                               <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-black ${currentLanguage === 'ne' ? 'bg-teal-600 text-white' : 'bg-slate-100 text-slate-400'}`}>
                                  NE
                               </div>
                               <div className="text-left">
                                  <p className="font-bold text-slate-900">नेपाली</p>
                                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{t('local_language')}</p>
                               </div>
                            </div>
                            {currentLanguage === 'ne' && <CheckCircle2 size={20} className="text-teal-600" />}
                         </button>
                      </div>
                    </div>

                    <div className="mt-8 p-6 bg-white border border-slate-100 rounded-2xl flex items-center justify-between">
                       <div className="flex items-center gap-4">
                          <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl">
                             <ShieldCheck size={20} />
                          </div>
                          <div>
                             <p className="font-bold text-slate-900">Privacy & Security</p>
                             <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Manage your neural protection</p>
                          </div>
                       </div>
                       <button 
                         onClick={() => setActiveTab('security')}
                         className="px-6 py-2.5 bg-slate-900 text-white text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-teal-600 transition-all"
                       >
                         Open Security
                       </button>
                    </div>
                  </div>
                </div>
              )}

            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
