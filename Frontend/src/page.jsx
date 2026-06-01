"use client"

import { useState } from "react"
import Dashboard from "@/components/dashboard"
import JobDisplay from "@/components/job-display"

export default function Home() {
  const [selectedJob, setSelectedJob] = useState(null)

  if (selectedJob) {
    return <JobDisplay job={selectedJob} onBack={() => setSelectedJob(null)} />
  }

  return <Dashboard onJobSelect={setSelectedJob} />
}
