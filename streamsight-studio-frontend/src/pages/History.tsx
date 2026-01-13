import { useStreamJobHistory } from '../hooks/useStreamJobHistory';
import StreamJobItem from '../components/StreamJobItem';

const History: React.FC = () => {
  const { streamJobs, loading, error, deleteStreamJob } = useStreamJobHistory();

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-red-500 text-center">
          <p className="text-lg font-semibold">Error loading stream jobs</p>
          <p className="text-sm">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">
        Stream Job History
      </h1>

      {streamJobs.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500 dark:text-gray-400 text-lg">
            No stream jobs found. Create your first stream job to get started.
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {streamJobs.map((job) => (
            <StreamJobItem
              key={job.id}
              job={job}
              onDelete={deleteStreamJob}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default History;