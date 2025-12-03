import React, { useState, useEffect } from 'react'
import { apiFetch } from '../lib/api'

interface StreamJob {
  id: number
  name: string
  description: string
  status: string
  dataset: string
  top_k: number
  metrics: string[]
  window_size: number
  created_at: string
  started_at: string | null
  completed_at: string | null
  algorithms: Array<{
    name: string
    description: string
    category: string
  }>
}

const History: React.FC = () => {
  const [streamJobs, setStreamJobs] = useState<StreamJob[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchStreamJobs()
  }, [])

  const fetchStreamJobs = async () => {
    try {
      const response = await apiFetch('/api/v1/stream/list_all')
      
      if (!response.ok) {
        throw new Error('Failed to fetch stream jobs')
      }
      
      const data = await response.json()
      setStreamJobs(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'created': return 'bg-gray-100 text-gray-800'
      case 'ready': return 'bg-blue-100 text-blue-800'
      case 'running': return 'bg-yellow-100 text-yellow-800'
      case 'completed': return 'bg-green-100 text-green-800'
      case 'failed': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Not set'
    return new Date(dateString).toLocaleString()
  }

  if (loading) {
    return (
      <div className="p-6">
        <h1 className="text-3xl font-bold mb-4">History</h1>
        <div className="flex justify-center items-center h-64">
          <div className="text-lg">Loading stream jobs...</div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-6">
        <h1 className="text-3xl font-bold mb-4">History</h1>
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <p className="text-red-800">Error: {error}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">Stream Job History</h1>
      
      {streamJobs.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg">No stream jobs found.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {streamJobs.map((job) => (
            <div key={job.id} className="bg-white dark:bg-slate-800 rounded-lg shadow-md p-6 border border-gray-200 dark:border-slate-700">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white">{job.name}</h2>
                  <p className="text-gray-600 dark:text-gray-300 mt-1">{job.description}</p>
                </div>
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(job.status)}`}>
                  {job.status.charAt(0).toUpperCase() + job.status.slice(1)}
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
                <div>
                  <span className="font-medium text-gray-700 dark:text-gray-300">Dataset:</span>
                  <span className="ml-2 text-gray-900 dark:text-white">{job.dataset}</span>
                </div>
                <div>
                  <span className="font-medium text-gray-700 dark:text-gray-300">Top K:</span>
                  <span className="ml-2 text-gray-900 dark:text-white">{job.top_k}</span>
                </div>
                <div>
                  <span className="font-medium text-gray-700 dark:text-gray-300">Window Size:</span>
                  <span className="ml-2 text-gray-900 dark:text-white">{job.window_size}</span>
                </div>
                <div className="md:col-span-2 lg:col-span-3">
                  <span className="font-medium text-gray-700 dark:text-gray-300">Metrics:</span>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {job.metrics.map((metric) => (
                      <span key={metric} className="px-2 py-1 bg-gray-100 dark:bg-slate-700 text-gray-800 dark:text-gray-200 text-xs rounded">
                        {metric}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <div className="border-t border-gray-200 dark:border-slate-600 pt-4 mb-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                  <div>
                    <span className="font-medium text-gray-700 dark:text-gray-300">Created:</span>
                    <div className="text-gray-900 dark:text-white">{formatDate(job.created_at)}</div>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700 dark:text-gray-300">Started:</span>
                    <div className="text-gray-900 dark:text-white">{formatDate(job.started_at)}</div>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700 dark:text-gray-300">Completed:</span>
                    <div className="text-gray-900 dark:text-white">{formatDate(job.completed_at)}</div>
                  </div>
                </div>
              </div>

              {job.algorithms.length > 0 && (
                <div className="border-t border-gray-200 dark:border-slate-600 pt-4">
                  <h3 className="font-medium text-gray-700 dark:text-gray-300 mb-2">Algorithms:</h3>
                  <div className="flex flex-wrap gap-2">
                    {job.algorithms.map((algo, index) => (
                      <span key={index} className="px-3 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 text-sm rounded-md">
                        {algo.name}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default History