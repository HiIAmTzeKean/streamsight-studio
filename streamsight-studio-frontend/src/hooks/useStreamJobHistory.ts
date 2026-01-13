import { useState, useEffect } from 'react'
import { toast } from 'react-toastify'
import { apiFetch } from '../lib/api'

export interface StreamJob {
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
    params?: any
  }>
}

export const useStreamJobHistory = () => {
  const [streamJobs, setStreamJobs] = useState<StreamJob[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

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

  const deleteStreamJob = async (jobId: number) => {
    if (!confirm('Are you sure you want to delete this stream job? This action cannot be undone.')) {
      return
    }

    try {
      const response = await apiFetch(`/api/v1/stream/${jobId}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        throw new Error('Failed to delete stream job')
      }

      toast.success('Stream job deleted successfully')
      // Refresh the list
      fetchStreamJobs()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to delete stream job')
    }
  }

  useEffect(() => {
    fetchStreamJobs()
  }, [])

  return {
    streamJobs,
    loading,
    error,
    deleteStreamJob,
  }
}