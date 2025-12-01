import React, { useState } from 'react'

const CreateStream: React.FC = () => {
  const [dataset, setDataset] = useState('')
  const [topK, setTopK] = useState('')
  const [metrics, setMetrics] = useState('')
  const [timestampSplitStart, setTimestampSplitStart] = useState('')
  const [windowSize, setWindowSize] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    // Basic validation
    if (!dataset || !topK || !metrics || !timestampSplitStart || !windowSize) {
      setError('Please fill in all fields')
      return
    }
    setLoading(true)
    try {
      // Mock submission - replace with actual API call
      console.log('Creating stream with:', {
        dataset,
        topK: parseInt(topK),
        metrics,
        timestampSplitStart,
        windowSize: parseInt(windowSize)
      })
      alert('Stream created successfully!')
    } catch (err: any) {
      setError(err?.message ?? String(err))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-lg mx-auto mt-12">
      <h1 className="text-3xl font-bold mb-4">Create Stream</h1>
      <div className="p-6 bg-slate-50 dark:bg-slate-900 rounded-md shadow">
        <form onSubmit={handleSubmit}>
          <div className="space-y-4">
            {error && <div className="text-red-600 bg-red-50 p-2 rounded">{error}</div>}

            <label className="block">
              <span className="text-sm font-medium">Dataset</span>
              <select
                value={dataset}
                onChange={(e) => setDataset(e.target.value)}
                className="mt-1 block w-full rounded-md border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-50 shadow-sm focus:ring-2 focus:ring-blue-400 p-2"
              >
                <option value="">Select a dataset</option>
                <option value="dataset-a">Dataset A</option>
                <option value="dataset-b">Dataset B</option>
                <option value="dataset-c">Dataset C</option>
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
                value={metrics}
                onChange={(e) => setMetrics(e.target.value)}
                className="mt-1 block w-full rounded-md border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-50 shadow-sm focus:ring-2 focus:ring-blue-400 p-2"
              >
                <option value="">Select metrics</option>
                <option value="accuracy">Accuracy</option>
                <option value="precision">Precision</option>
                <option value="recall">Recall</option>
                <option value="f1-score">F1-Score</option>
              </select>
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
      </div>
    </div>
  )
}

export default CreateStream