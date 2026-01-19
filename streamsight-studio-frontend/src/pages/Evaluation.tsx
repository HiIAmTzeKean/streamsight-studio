import React from 'react'
import { useEvaluationJobs } from '../hooks/useEvaluationJobs'
import EvaluationJobList from '../components/EvaluationJobList'

const Evaluation: React.FC = () => {
  const { streamJobs, loading, running, runJob, deleteJob } = useEvaluationJobs()

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-4">Evaluation</h1>
      <EvaluationJobList
        streamJobs={streamJobs}
        loading={loading}
        running={running}
        onRunJob={runJob}
        onDeleteJob={deleteJob}
      />
    </div>
  )
}

export default Evaluation