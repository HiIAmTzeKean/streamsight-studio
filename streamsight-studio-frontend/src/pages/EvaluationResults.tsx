import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { apiFetch } from '../lib/api'

interface EvaluationResult {
  id: number
  algorithm?: string
  metric?: string
  score?: number
  num_window?: number
  num_user?: number
  user_id?: number
  timestamp?: string
}

interface EvaluationResultsData {
  macro: EvaluationResult[]
  micro: EvaluationResult[]
  window: EvaluationResult[]
  user: EvaluationResult[]
}

const EvaluationResults: React.FC = () => {
  const { streamJobId } = useParams<{ streamJobId: string }>()
  const navigate = useNavigate()
  const [results, setResults] = useState<EvaluationResultsData>({
    macro: [],
    micro: [],
    window: [],
    user: []
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    macro: true,
    micro: true,
    window: true,
    user: true,
  })

  const toggleSection = (type: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [type]: !prev[type]
    }))
  }

  useEffect(() => {
    const fetchResults = async () => {
      if (!streamJobId) return

      try {
        setLoading(true)
        const response = await apiFetch(`/api/v1/evaluator/${streamJobId}/results`)
        if (!response.ok) {
          throw new Error('Failed to fetch evaluation results')
        }
        const data: EvaluationResultsData = await response.json()
        setResults(data)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred')
      } finally {
        setLoading(false)
      }
    }

    fetchResults()
  }, [streamJobId])

  const getResultTypeColor = (type: string) => {
    switch (type) {
      case 'macro': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
      case 'micro': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
      case 'window': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
      case 'user': return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200'
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200'
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-red-500 text-center">
          <p className="text-lg font-semibold">Error loading evaluation results</p>
          <p className="text-sm">{error}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Evaluation Results
        </h1>
        <button
          onClick={() => navigate('/history')}
          className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors"
        >
          Back to History
        </button>
      </div>

      {results.macro.length === 0 && results.micro.length === 0 && results.window.length === 0 && results.user.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500 dark:text-gray-400 text-lg">
            No evaluation results found for this stream job.
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Group results by type */}
          {[
            { type: 'macro', data: results.macro },
            { type: 'micro', data: results.micro },
            { type: 'window', data: results.window },
            { type: 'user', data: results.user }
          ].map(({ type, data: typeResults }) => {
            if (typeResults.length === 0) return null

            return (
              <div key={type} className="bg-white dark:bg-slate-800 rounded-lg shadow-md border border-gray-200 dark:border-slate-700">
                <button
                  onClick={() => toggleSection(type)}
                  className="w-full flex items-center justify-between p-6 text-left hover:bg-gray-50 dark:hover:bg-slate-700 rounded-lg transition-colors duration-200"
                >
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white capitalize">
                    {type} Results ({typeResults.length})
                  </h2>
                  <svg
                    className={`w-5 h-5 text-gray-500 dark:text-gray-400 transform transition-transform duration-200 ${
                      expandedSections[type] ? 'rotate-180' : ''
                    }`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {expandedSections[type] && (
                  <div className="px-6 pb-6">
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200 dark:divide-slate-600">
                    <thead className="bg-gray-50 dark:bg-slate-700">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                          Algorithm
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                          Metric
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                          Score
                        </th>
                        {type === 'macro' && (
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                            Num Windows
                          </th>
                        )}
                        {type === 'micro' && (
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                            Num Users
                          </th>
                        )}
                        {type === 'window' && (
                          <>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                              Num Users
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                              Timestamp
                            </th>
                          </>
                        )}
                        {type === 'user' && (
                          <>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                              User ID
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                              Timestamp
                            </th>
                          </>
                        )}
                      </tr>
                    </thead>
                    <tbody className="bg-white dark:bg-slate-800 divide-y divide-gray-200 dark:divide-slate-600">
                      {typeResults.map((result) => (
                        <tr key={result.id} className="hover:bg-gray-50 dark:hover:bg-slate-700">
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                            {result.algorithm || 'N/A'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                            {result.metric || 'N/A'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                            {result.score !== undefined ? result.score.toFixed(4) : 'N/A'}
                          </td>
                          {type === 'macro' && (
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                              {result.num_window || 'N/A'}
                            </td>
                          )}
                          {type === 'micro' && (
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                              {result.num_user || 'N/A'}
                            </td>
                          )}
                          {type === 'window' && (
                            <>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                                {result.num_user || 'N/A'}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                                {result.timestamp || 'N/A'}
                              </td>
                            </>
                          )}
                          {type === 'user' && (
                            <>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                                {result.user_id || 'N/A'}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                                {result.timestamp || 'N/A'}
                              </td>
                            </>
                          )}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

export default EvaluationResults