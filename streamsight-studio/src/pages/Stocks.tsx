import React, { useState } from 'react'
import AddForm from '../components/AddForm'
import { apiFetch } from '../lib/api'

type BackendResult = Record<string, { ticker: string; name: string | null; exchange: string | null } & { prices?: number[]; price_change?: (number | null)[] }>

export default function Stocks() {
  const [result, setResult] = useState<BackendResult | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleAdd(_: string) {
    setLoading(true)
    setError(null)
    try {
      const res = await apiFetch('/api/v1/stocks/sample')
      if (!res.ok) throw new Error(await res.text())
      const data = await res.json()
      setResult(data)
    } catch (e: any) {
      setError(e?.message ?? String(e))
      setResult(null)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-50 mb-2">Stock Search</h1>
        <p className="text-slate-600 dark:text-slate-400">Add stocks to your watchlist and analyze their performance</p>
      </div>

      <AddForm onAdd={handleAdd} />

      <section className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-lg">
        <h2 className="text-lg font-semibold mb-4 text-slate-900 dark:text-slate-50">Sample Results</h2>

        {loading && <p className="text-slate-500 dark:text-slate-400">Loading sample data…</p>}

        {error && <p className="text-red-500 dark:text-red-400">Error: {error}</p>}

        {!loading && !error && result == null && (
          <p className="text-slate-500 dark:text-slate-400">No data yet. Add a stock to fetch sample data.</p>
        )}

        {!loading && result && (
          <pre className="whitespace-pre-wrap overflow-x-auto text-sm mt-4 bg-slate-950 dark:bg-slate-800 p-4 rounded-md text-slate-50 font-mono">
            {JSON.stringify(result, null, 2)}
          </pre>
        )}
      </section>
    </div>
  )
}
