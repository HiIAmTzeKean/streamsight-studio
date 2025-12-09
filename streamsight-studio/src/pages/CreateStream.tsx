import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'
import { apiFetch } from '../lib/api'

const CreateStream: React.FC = () => {
  const navigate = useNavigate()
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [dataset, setDataset] = useState('')
  const [topK, setTopK] = useState('')
  const [selectedMetrics, setSelectedMetrics] = useState<string[]>([])
  const [timestampSplitStart, setTimestampSplitStart] = useState('')
  const [windowSize, setWindowSize] = useState('')
  const [datasets, setDatasets] = useState<string[]>([])
  const [availableMetrics, setAvailableMetrics] = useState<string[]>([])
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [fetchingDatasets, setFetchingDatasets] = useState(true)
  const [fetchingMetrics, setFetchingMetrics] = useState(true)
  const [streamCreated, setStreamCreated] = useState(false)
  const [createdStreamId, setCreatedStreamId] = useState<number | null>(null)

  useEffect(() => {
    async function fetchDatasets() {
      try {
        const response = await apiFetch('/api/v1/dataset/get_dataset')
        const data = await response.json()
        setDatasets(data)
      } catch (err) {
        console.error('Failed to fetch datasets:', err)
        setError('Failed to load datasets')
      } finally {
        setFetchingDatasets(false)
      }
    }
    fetchDatasets()
  }, [])

  useEffect(() => {
    async function fetchMetrics() {
      try {
        const response = await apiFetch('/api/v1/metric/get_metric')
        const data = await response.json()
        setAvailableMetrics(data)
      } catch (err) {
        console.error('Failed to fetch metrics:', err)
        setError('Failed to load metrics')
      } finally {
        setFetchingMetrics(false)
      }
    }
    fetchMetrics()
  }, [])

  function handleMetricChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const value = e.target.value
    if (value && !selectedMetrics.includes(value)) {
      setSelectedMetrics([...selectedMetrics, value])
    }
  }

  function removeMetric(metric: string) {
    setSelectedMetrics(selectedMetrics.filter(m => m !== metric))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    // Basic validation
    if (!name || !dataset || !topK || selectedMetrics.length === 0 || !timestampSplitStart || !windowSize) {
      setError('Please fill in all required fields')
      return
    }
    setLoading(true)
    try {
      const response = await apiFetch('/api/v1/stream/create_stream', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          description,
          dataset,
          top_k: parseInt(topK),
          metrics: selectedMetrics,
          timestamp_split_start: timestampSplitStart,
          window_size: parseInt(windowSize)
        })
      })
      if (!response.ok) {
        throw new Error('Failed to create stream')
      }
      const result = await response.json()
      console.log('Stream created:', result)
      toast.success(`Stream created successfully! Stream ID: ${result.stream_job_id}`)
      setStreamCreated(true)
      setCreatedStreamId(result.stream_job_id)
    } catch (err: any) {
      setError(err?.message ?? String(err))
    } finally {
      setLoading(false)
    }
  }

  function handleGoToAlgo() {
    navigate('/algo')
  }

  function handleCreateAnother() {
    setStreamCreated(false)
    setCreatedStreamId(null)
    setName('')
    setDescription('')
    setDataset('')
    setTopK('')
    setSelectedMetrics([])
    setTimestampSplitStart('')
    setWindowSize('')
  }

  return (
    <div className="max-w-xl mx-auto mt-12">
      <h1 className="text-3xl font-bold mb-4">Create Stream</h1>
      <div className="p-6 bg-slate-50 dark:bg-slate-900 rounded-md shadow">
        {streamCreated ? (
          <div className="text-center space-y-6">
            <div className="text-green-600">
              <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <h2 className="text-xl font-semibold text-green-800 dark:text-green-200 mb-2">
                Stream Created Successfully!
              </h2>
              <p className="text-slate-600 dark:text-slate-400">
                Stream ID: <span className="font-mono font-semibold">{createdStreamId}</span>
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={handleGoToAlgo}
                className="inline-flex justify-center items-center rounded-md bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 font-medium transition-colors"
              >
                Go to Algo Page
              </button>
              <button
                onClick={handleCreateAnother}
                className="inline-flex justify-center items-center rounded-md bg-slate-600 hover:bg-slate-700 text-white px-6 py-2 font-medium transition-colors"
              >
                Create Another Stream
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <div className="space-y-4">
              {error && <div className="text-red-600 bg-red-50 p-2 rounded">{error}</div>}

              <label className="block">
                <span className="text-sm font-medium">Stream Name</span>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="mt-1 block w-full rounded-md border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-50 shadow-sm focus:ring-2 focus:ring-blue-400 p-2"
                  placeholder="Enter stream name"
                />
              </label>

              <label className="block">
                <span className="text-sm font-medium">Description</span>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="mt-1 block w-full rounded-md border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-50 shadow-sm focus:ring-2 focus:ring-blue-400 p-2"
                  placeholder="Enter stream description (optional)"
                  rows={3}
                />
              </label>

              <label className="block">
                <span className="text-sm font-medium">Dataset</span>
                <select
                  value={dataset}
                  onChange={(e) => setDataset(e.target.value)}
                  className="mt-1 block w-full rounded-md border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-50 shadow-sm focus:ring-2 focus:ring-blue-400 p-2"
                  disabled={fetchingDatasets}
                >
                  <option value="">
                    {fetchingDatasets ? 'Loading datasets...' : 'Select a dataset'}
                  </option>
                  {datasets.map(ds => (
                    <option key={ds} value={ds}>{ds}</option>
                  ))}
                </select>
              </label>

              <label className="block">
                <span className="text-sm font-medium">Top K</span>
                <input
                  type="number"
                  value={topK}
                  onChange={(e) => setTopK(e.target.value)}
                  className="mt-1 block w-full rounded-md border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-50 shadow-sm focus:ring-2 focus:ring-blue-400 p-2"
                  placeholder="Enter top k value"
                  min="1"
                />
              </label>

              <label className="block">
                <span className="text-sm font-medium">Metrics</span>
                <select
                  value=""
                  onChange={handleMetricChange}
                  className="mt-1 block w-full rounded-md border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-50 shadow-sm focus:ring-2 focus:ring-blue-400 p-2"
                  disabled={fetchingMetrics}
                >
                  <option value="">
                    {fetchingMetrics ? 'Loading metrics...' : 'Select metrics'}
                  </option>
                  {availableMetrics.map(metric => (
                    <option key={metric} value={metric} disabled={selectedMetrics.includes(metric)}>
                      {metric}
                    </option>
                  ))}
                </select>
                {selectedMetrics.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-2">
                    {selectedMetrics.map(metric => (
                      <span key={metric} className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200">
                        {metric}
                        <button
                          type="button"
                          onClick={() => removeMetric(metric)}
                          className="ml-1 text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-200"
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </label>

              <label className="block">
                <span className="text-sm font-medium">Timestamp Split Start</span>
                <input
                  type="date"
                  value={timestampSplitStart}
                  onChange={(e) => setTimestampSplitStart(e.target.value)}
                  className="mt-1 block w-full rounded-md border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-50 shadow-sm focus:ring-2 focus:ring-blue-400 p-2"
                />
              </label>

              <label className="block">
                <span className="text-sm font-medium">Window Size</span>
                <input
                  type="number"
                  value={windowSize}
                  onChange={(e) => setWindowSize(e.target.value)}
                  className="mt-1 block w-full rounded-md border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-50 shadow-sm focus:ring-2 focus:ring-blue-400 p-2"
                  placeholder="Enter window size"
                  min="1"
                />
              </label>

              <div>
                <button
                  type="submit"
                  className="w-full inline-flex justify-center items-center rounded-md bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 font-medium disabled:opacity-60"
                  disabled={loading}
                >
                  {loading ? 'Creating...' : 'Create Stream'}
                </button>
              </div>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}

export default CreateStream