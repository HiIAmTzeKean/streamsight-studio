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
  algorithms: Algorithm[]
}

interface Algorithm {
  id?: number
  name: string
  description: string
  params?: string
}

interface SelectedAlgorithm {
  id?: number
  name: string
  params: Record<string, any>
}

const Algo: React.FC = () => {
  const [streamJobs, setStreamJobs] = useState<StreamJob[]>([])
  const [algorithms, setAlgorithms] = useState<Algorithm[]>([])
  const [selectedStreamJob, setSelectedStreamJob] = useState<number | null>(null)
  const [selectedAlgorithms, setSelectedAlgorithms] = useState<SelectedAlgorithm[]>([])
  const [originalAlgorithms, setOriginalAlgorithms] = useState<Algorithm[]>([])
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [fetchingStreams, setFetchingStreams] = useState(true)
  const [fetchingAlgorithms, setFetchingAlgorithms] = useState(true)

  useEffect(() => {
    async function fetchStreamJobs() {
      try {
        const response = await apiFetch('/api/v1/stream/list_available')
        const data = await response.json()
        setStreamJobs(data)
      } catch (err) {
        console.error('Failed to fetch stream jobs:', err)
        setError('Failed to load stream jobs')
      } finally {
        setFetchingStreams(false)
      }
    }
    fetchStreamJobs()
  }, [])

  useEffect(() => {
    async function fetchAlgorithms() {
      try {
        const response = await apiFetch('/api/v1/algorithm/list')
        const data = await response.json()
        setAlgorithms(data)
      } catch (err) {
        console.error('Failed to fetch algorithms:', err)
        setError('Failed to load algorithms')
      } finally {
        setFetchingAlgorithms(false)
      }
    }
    fetchAlgorithms()
  }, [])

  // Pre-populate selected algorithms when stream is selected
  useEffect(() => {
    if (selectedStreamJob) {
      const stream = streamJobs.find(job => job.id === selectedStreamJob)
      if (stream) {
        setOriginalAlgorithms(stream.algorithms)
        // Parse the saved parameters for existing algorithms
        setSelectedAlgorithms(stream.algorithms.map(algo => ({ 
          id: algo.id,
          name: algo.name, 
          params: algo.params ? JSON.parse(algo.params) : {} 
        })))
      }
    } else {
      setOriginalAlgorithms([])
      setSelectedAlgorithms([])
    }
  }, [selectedStreamJob, streamJobs])

  async function handleAlgorithmToggle(algorithmId: string) {
    const isSelected = selectedAlgorithms.some(algo => algo.name === algorithmId)
    if (isSelected) {
      // Remove
      setSelectedAlgorithms(prev => prev.filter(algo => algo.name !== algorithmId))
    } else {
      // Add, fetch params
      try {
        const response = await apiFetch(`/api/v1/algorithm/get_params/${algorithmId}`)
        const params = await response.json()
        setSelectedAlgorithms(prev => [...prev, { name: algorithmId, params, id: undefined }])
      } catch (err) {
        console.error('Failed to fetch params:', err)
        setError('Failed to load algorithm parameters')
        // Still add with empty params
        setSelectedAlgorithms(prev => [...prev, { name: algorithmId, params: {}, id: undefined }])
      }
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)

    if (!selectedStreamJob || selectedAlgorithms.length === 0) {
      setError('Please select a stream job and at least one algorithm')
      return
    }

    setLoading(true)
    try {
      // Determine algorithms to delete: those in original but not in selected
      const algorithmsToDelete = originalAlgorithms.filter(o => 
        !selectedAlgorithms.some(s => s.name === o.name)
      )

      // Delete removed algorithms
      for (const algo of algorithmsToDelete) {
        if (algo.id) {
          await apiFetch(`/api/v1/stream/${selectedStreamJob}/remove_algorithm/${algo.id}`, {
            method: 'DELETE'
          })
        }
      }

      // Add/update all selected algorithms (this will handle new ones and updates)
      const response = await apiFetch(`/api/v1/stream/${selectedStreamJob}/add_algorithms`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          algorithms: selectedAlgorithms
        })
      })

      if (!response.ok) {
        throw new Error('Failed to update algorithms')
      }

      const result = await response.json()
      console.log('Algorithms updated:', result)
      toast.success('Algorithms updated successfully!')

      // Reset form and refresh data
      setSelectedStreamJob(null)
      setSelectedAlgorithms([])
      setOriginalAlgorithms([])
      // Refresh stream jobs list
      const response2 = await apiFetch('/api/v1/stream/list_available')
      const data = await response2.json()
      setStreamJobs(data)
    } catch (err: any) {
      setError(err?.message ?? String(err))
    } finally {
      setLoading(false)
    }
  }

  const selectedStream = streamJobs.find(job => job.id === selectedStreamJob)

  return (
    <div className="max-w-4xl mx-auto mt-12">
      <h1 className="text-3xl font-bold mb-4">Configure Algorithms for Stream</h1>
      <div className="grid md:grid-cols-2 gap-8">
        {/* Stream Selection */}
        <div className="p-6 bg-slate-50 dark:bg-slate-900 rounded-md shadow">
          <h2 className="text-xl font-semibold mb-4">Select Stream Job</h2>
          {fetchingStreams ? (
            <p>Loading stream jobs...</p>
          ) : streamJobs.length === 0 ? (
            <p>No stream jobs available. Create a stream first.</p>
          ) : (
            <div className="space-y-2">
              {streamJobs.map(job => (
                <div
                  key={job.id}
                  className={`p-3 border rounded cursor-pointer ${
                    selectedStreamJob === job.id
                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                      : 'border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                  onClick={() => setSelectedStreamJob(job.id)}
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h3 className="font-medium">{job.name}</h3>
                      <p className="text-sm text-slate-600 dark:text-slate-400">{job.description}</p>
                      <p className="text-xs text-slate-500">Dataset: {job.dataset}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className={`px-2 py-1 text-xs rounded ${
                          job.status === 'created' 
                            ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                            : 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                        }`}>
                          {job.status}
                        </span>
                        <span className="text-xs text-slate-500">
                          {job.algorithms.length} algorithm{job.algorithms.length !== 1 ? 's' : ''} added
                        </span>
                      </div>
                    </div>
                  </div>
                  {job.algorithms.length > 0 && (
                    <div className="mt-2">
                      <p className="text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">Added Algorithms:</p>
                      <div className="flex flex-wrap gap-1">
                        {job.algorithms.map(algo => (
                          <span key={algo.name} className="px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 text-xs rounded">
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

        {/* Algorithm Selection */}
        <div className="p-6 bg-slate-50 dark:bg-slate-900 rounded-md shadow">
          <h2 className="text-xl font-semibold mb-4">Configure Algorithms</h2>
          {fetchingAlgorithms ? (
            <p>Loading algorithms...</p>
          ) : (
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {algorithms.map(algo => (
                <div
                  key={algo.name}
                  className={`p-2 rounded cursor-pointer ${
                    selectedAlgorithms.some(selected => selected.name === algo.name)
                      ? 'bg-blue-100 dark:bg-blue-900 border border-blue-300 dark:border-blue-600'
                      : 'hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                  onClick={() => handleAlgorithmToggle(algo.name)}
                >
                  <div>
                    <h3 className="font-medium">{algo.name}</h3>
                    <p className="text-sm text-slate-600 dark:text-slate-400">{algo.description}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Algorithm Parameters */}
      {selectedAlgorithms.length > 0 && (
        <div className="mt-8 p-6 bg-green-50 dark:bg-green-900/20 rounded-md shadow">
          <h2 className="text-xl font-semibold mb-4">Configure Algorithm Parameters</h2>
          <div className="space-y-4">
            {selectedAlgorithms.map((selectedAlgo, index) => (
              <div key={selectedAlgo.name} className="p-4 bg-white dark:bg-slate-800 rounded border">
                <h3 className="font-medium mb-2">{selectedAlgo.name}</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {Object.entries(selectedAlgo.params).map(([key, value]) => (
                    <div key={key}>
                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                        {key}
                      </label>
                      <input
                        type={typeof value === 'number' ? 'number' : 'text'}
                        value={value}
                        onChange={(e) => {
                          const newValue = typeof value === 'number' ? parseFloat(e.target.value) : e.target.value
                          setSelectedAlgorithms(prev => prev.map((algo, i) =>
                            i === index ? { ...algo, params: { ...algo.params, [key]: newValue } } : algo
                          ))
                        }}
                        className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100"
                      />
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      {selectedStream && (
        <div className="mt-8 p-6 bg-blue-50 dark:bg-blue-900/20 rounded-md shadow">
          <h2 className="text-xl font-semibold mb-4">Selected Stream Details</h2>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <h3 className="font-medium">Stream: {selectedStream.name}</h3>
              <p className="text-sm text-slate-600 dark:text-slate-400">{selectedStream.description}</p>
              <p className="text-sm">Dataset: {selectedStream.dataset}</p>
              <p className="text-sm">Top K: {selectedStream.top_k}</p>
              <p className="text-sm">Window Size: {selectedStream.window_size}</p>
            </div>
            <div>
              <p className="text-sm font-medium">Metrics:</p>
              <div className="flex flex-wrap gap-1 mt-1">
                {selectedStream.metrics.map(metric => (
                  <span key={metric} className="px-2 py-1 bg-slate-200 dark:bg-slate-700 text-xs rounded">
                    {metric}
                  </span>
                ))}
              </div>
              <p className="text-sm font-medium mt-3">Selected Algorithms ({selectedAlgorithms.length}):</p>
              <div className="flex flex-wrap gap-1 mt-1">
                {selectedAlgorithms.length > 0 ? (
                  selectedAlgorithms.map(algo => (
                    <span key={algo.name} className="px-2 py-1 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 text-xs rounded">
                      {algo.name}
                    </span>
                  ))
                ) : (
                  <span className="text-xs text-slate-500">No algorithms selected</span>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Submit Form */}
      <div className="mt-8">
        {error && <div className="text-red-600 bg-red-50 p-2 rounded mb-4">{error}</div>}
        <button
          onClick={handleSubmit}
          disabled={loading || !selectedStreamJob || selectedAlgorithms.length === 0}
          className="w-full inline-flex justify-center items-center rounded-md bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 font-medium disabled:opacity-60"
        >
          {loading ? 'Updating Algorithms...' : 'Update Algorithms'}
        </button>
      </div>
    </div>
  )
}

export default Algo