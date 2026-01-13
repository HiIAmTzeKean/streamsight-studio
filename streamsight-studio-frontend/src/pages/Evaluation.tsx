import React, { useState, useEffect } from 'react'
import { toast } from 'react-toastify'
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
  started_at?: string
  completed_at?: string
  algorithms: any[]
}

const Evaluation: React.FC = () => {
  const [streamJobs, setStreamJobs] = useState<StreamJob[]>([])
  const [loading, setLoading] = useState(true)
  const [running, setRunning] = useState(false)

  useEffect(() => {
    fetchStreamJobs()
  }, [])

  const fetchStreamJobs = async () => {
    try {
      const response = await apiFetch('/api/v1/stream/list_all')
      const data = await response.json()
      setStreamJobs(data)
    } catch (error) {
      console.error('Failed to fetch stream jobs:', error)
      toast.error('Failed to load stream jobs')
    } finally {
      setLoading(false)
    }
  }

  const handleRunJob = async (job: StreamJob) => {
    setRunning(true)
    try {
      const endpoint = job.completed_at ? 'rerun' : 'run'
      const response = await apiFetch(`/api/v1/evaluator/${job.id}/${endpoint}`, {
        method: 'POST'
      })
      if (response.ok) {
        toast.success(`Job ${endpoint === 'rerun' ? 'rerun' : 'started'} successfully`)
        fetchStreamJobs() // Refresh the list
      } else {
        const error = await response.json()
        toast.error(error.detail || `Failed to ${endpoint} job`)
      }
    } catch (error) {
      console.error('Failed to run job:', error)
      toast.error('Failed to start job')
    } finally {
      setRunning(false)
    }
  }

  if (loading) {
    return <div className="p-6">Loading...</div>
  }

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-4">Evaluation</h1>
      
      <div className="space-y-4">
        {streamJobs.map(job => (
          <div key={job.id} className="border rounded-lg p-4">
            <h3 className="font-semibold">{job.name}</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">{job.description}</p>
            <p className="text-sm">Status: <span className={`font-medium ${
              job.status === 'ready' ? 'text-green-600' :
              job.status === 'running' ? 'text-blue-600' :
              job.status === 'completed' ? 'text-purple-600' :
              job.status === 'failed' ? 'text-red-600' :
              'text-gray-600'
            }`}>{job.status}</span></p>
            {!job.completed_at ? (
              <div className="mt-2">
                <p className="text-sm text-green-600 font-medium">Ready to run</p>
                <button
                  onClick={() => handleRunJob(job)}
                  disabled={running}
                  className="mt-1 px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
                >
                  {running ? 'Starting...' : 'Run Job'}
                </button>
              </div>
            ) : (
              <div className="mt-2">
                <p className="text-sm text-orange-600 font-medium">Completed - can rerun</p>
                <button
                  onClick={() => handleRunJob(job)}
                  disabled={running}
                  className="mt-1 px-3 py-1 bg-orange-600 text-white rounded hover:bg-orange-700 disabled:opacity-50"
                >
                  {running ? 'Rerunning...' : 'Rerun Job'}
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

export default Evaluation