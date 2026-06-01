"use client"

import { useState } from "react"
import { ArrowLeft, MapPin, Clock, DollarSign, Briefcase, Star, MessageSquare, CheckCircle2 } from "lucide-react"

const JobDisplay = ({ job, onBack }) => {
  const [notification, setNotification] = useState(null)

  const showNotification = (message) => {
    setNotification(message)
    setTimeout(() => {
      setNotification(null)
    }, 3000)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 to-gray-100">
      {/* Header with Back Button */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center gap-4">
          <button onClick={onBack} className="flex items-center gap-2 text-gray-700 hover:text-teal-600 transition">
            <ArrowLeft size={20} />
            <span className="text-sm font-medium">Back</span>
          </button>
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-gray-900">{job.title}</h1>
            <p className="text-sm text-gray-500">{job.company}</p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Profile Card */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
              <div className="flex items-start gap-6 mb-8">
                <div className="flex-shrink-0">
                  <div className="h-24 w-24 rounded-full bg-gradient-to-br from-teal-400 to-teal-600 flex items-center justify-center text-4xl">
                    {job.avatar}
                  </div>
                </div>
                <div className="flex-1">
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">Professional Profile</h2>
                  <p className="text-gray-600 mb-4">
                    Experienced {job.title} at {job.company}
                  </p>
                  <div className="flex items-center gap-2 mb-4">
                    <div className="flex items-center gap-1">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          size={16}
                          className={`${
                            i < Math.floor(job.rating) ? "fill-yellow-400 text-yellow-400" : "text-gray-300"
                          }`}
                        />
                      ))}
                    </div>
                    <span className="font-semibold text-gray-900">{job.rating}</span>
                    <span className="text-gray-500 text-sm">(120+ reviews)</span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6 pt-8 border-t border-gray-200">
                {/* Hourly Rate */}
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <DollarSign size={20} className="text-teal-600" />
                    <h3 className="font-semibold text-gray-900">Per Hour Rate</h3>
                  </div>
                  <p className="text-2xl font-bold text-gray-900">{job.hourlyRate}</p>
                  <p className="text-xs text-gray-500 mt-1">Flexible negotiation available</p>
                </div>

                {/* Location */}
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <MapPin size={20} className="text-teal-600" />
                    <h3 className="font-semibold text-gray-900">Location</h3>
                  </div>
                  <p className="text-lg font-semibold text-gray-900">{job.location}</p>
                  <p className="text-xs text-gray-500 mt-1">{job.type} position</p>
                </div>
              </div>
            </div>

            {/* Schedule & Experience */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Schedule Card */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-blue-100 rounded-lg">
                    <Clock size={24} className="text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900 mb-2">Schedule</h3>
                    <p className="text-xl font-bold text-gray-900 mb-1">{job.schedule}</p>
                    <div className="space-y-1 text-sm text-gray-600">
                      <p>• Available immediately</p>
                      <p>• {job.type} arrangement</p>
                      <p>• Flexible hours available</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Experience Card */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-purple-100 rounded-lg">
                    <Briefcase size={24} className="text-purple-600" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900 mb-2">Experience</h3>
                    <p className="text-xl font-bold text-gray-900 mb-1">{job.experience}</p>
                    <div className="space-y-1 text-sm text-gray-600">
                      <p>• Proven track record</p>
                      <p>• Industry expertise</p>
                      <p>• Specialized skills</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Job Description */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">About This Role</h3>
              <div className="space-y-3 text-gray-700">
                <p>
                  Join our growing team and work on exciting projects that make a real impact. We're looking for
                  talented professionals who are passionate about their craft.
                </p>
                <p>
                  This position offers competitive compensation, flexible working arrangements, and opportunities for
                  professional growth and development.
                </p>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Info Box */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 sticky top-24">
              <h3 className="font-semibold text-gray-900 mb-4">Quick Info</h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Salary Range</span>
                  <span className="font-semibold text-gray-900">{job.salary}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Work Type</span>
                  <span className="font-semibold text-gray-900">{job.type}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Rating</span>
                  <div className="flex items-center gap-1">
                    <Star size={16} className="fill-yellow-400 text-yellow-400" />
                    <span className="font-semibold text-gray-900">{job.rating}</span>
                  </div>
                </div>
                <hr className="my-4" />
                <button 
                  onClick={() => showNotification("Hire request sent successfully!")}
                  className="w-full py-3 bg-teal-600 hover:bg-teal-700 text-white font-semibold rounded-lg transition active:scale-[0.98]"
                >
                  Hire Now
                </button>
                <button 
                  onClick={() => showNotification("Messaging feature coming soon!")}
                  className="w-full py-3 border border-teal-600 text-teal-600 hover:bg-teal-50 font-semibold rounded-lg transition flex items-center justify-center gap-2 active:scale-[0.98]"
                >
                  <MessageSquare size={18} />
                  Message
                </button>
              </div>
            </div>

            {/* Stats */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="font-semibold text-gray-900 mb-4">Statistics</h3>
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Response Time</p>
                  <p className="text-lg font-bold text-gray-900">&lt; 2 hours</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">Success Rate</p>
                  <p className="text-lg font-bold text-gray-900">98%</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">Completed Jobs</p>
                  <p className="text-lg font-bold text-gray-900">{job.completedJobs || 0}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Toast Notification Popup */}
      {notification && (
        <div className="fixed bottom-6 right-6 bg-slate-900 border border-slate-700 text-white px-6 py-4 rounded-xl shadow-2xl animate-in fade-in slide-in-from-bottom-8 duration-300 z-50 flex items-center gap-3">
          <CheckCircle2 size={20} className="text-teal-400" />
          <span className="font-semibold text-sm">{notification}</span>
        </div>
      )}
    </div>
  )
}

export default JobDisplay
