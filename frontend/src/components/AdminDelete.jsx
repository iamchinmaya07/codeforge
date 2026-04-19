import { useEffect, useState } from 'react';
import { NavLink } from 'react-router';
import axiosClient from '../utils/axiosClient';

const diffStyle = {
  easy:   'bg-emerald-50 text-emerald-700',
  medium: 'bg-amber-50 text-amber-700',
  hard:   'bg-red-50 text-red-600',
};

const AdminDelete = () => {
  const [problems, setProblems]   = useState([]);
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState(null);
  const [deleting, setDeleting]   = useState(null);   // id of problem being deleted
  const [confirmId, setConfirmId] = useState(null);   // id waiting for confirm

  useEffect(() => { fetchProblems(); }, []);

  const fetchProblems = async () => {
    try {
      setLoading(true);
      setError(null);
      const { data } = await axiosClient.get('/problem/getAllProblem');
      setProblems(data);
    } catch (err) {
      setError('Failed to fetch problems. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    setDeleting(id);
    setConfirmId(null);
    try {
      await axiosClient.delete(`/problem/delete/${id}`);
      setProblems((prev) => prev.filter((p) => p._id !== id));
    } catch (err) {
      setError('Failed to delete problem. Please try again.');
      console.error(err);
    } finally {
      setDeleting(null);
    }
  };

  return (
    <div className="min-h-screen bg-base-200">

      {/* Navbar */}
      <nav className="bg-base-100 border-b border-base-300 px-6 h-13 flex items-center justify-between sticky top-0 z-10">
        <NavLink to="/" className="flex items-center gap-2 font-medium text-base">
          <div className="w-7 h-7 bg-amber-400 rounded-lg flex items-center justify-center">
            <svg width="14" height="14" fill="none" viewBox="0 0 24 24">
              <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"
                stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          CodeForge
        </NavLink>
        <NavLink to="/admin"
          className="flex items-center gap-1.5 text-sm text-base-content/60 border border-base-300 px-3 py-1.5 rounded-lg hover:bg-base-200 transition-colors">
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7"/>
          </svg>
          Admin panel
        </NavLink>
      </nav>

      <div className="max-w-3xl mx-auto px-4 py-8">
        <h1 className="text-xl font-medium mb-1">Delete problems</h1>
        <p className="text-sm text-base-content/50 mb-6">
          Permanently remove a problem and all its submissions from the platform.
        </p>

        {/* Error banner */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-5 flex items-center justify-between">
            <p className="text-sm text-red-600">{error}</p>
            <button
              onClick={() => setError(null)}
              className="text-red-400 hover:text-red-600 ml-4">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12"/>
              </svg>
            </button>
          </div>
        )}

        {/* Loading */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <span className="loading loading-spinner loading-md text-amber-400" />
          </div>
        ) : problems.length === 0 ? (
          <div className="text-center py-20 text-base-content/40 text-sm">
            No problems found
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            {problems.map((problem, idx) => (
              <div key={problem._id}
                className={`bg-base-100 border rounded-xl px-4 py-3 flex items-center gap-3 transition-colors
                  ${confirmId === problem._id
                    ? 'border-red-300 bg-red-50'
                    : 'border-base-300 hover:border-base-content/20'}`}>

                {/* Index */}
                <span className="text-sm text-base-content/30 w-7 flex-shrink-0">
                  {idx + 1}
                </span>

                {/* Title */}
                <span className="flex-1 text-sm font-medium text-base-content/80">
                  {problem.title}
                </span>

                {/* Tag */}
                <span className="text-xs px-2 py-1 rounded bg-base-200 text-base-content/50 hidden sm:block">
                  {problem.tags}
                </span>

                {/* Difficulty */}
                <span className={`text-xs px-2.5 py-1 rounded-full font-medium flex-shrink-0 ${diffStyle[problem.difficulty] || 'bg-base-200 text-base-content/50'}`}>
                  {problem.difficulty}
                </span>

                {/* Actions */}
                {confirmId === problem._id ? (
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <span className="text-xs text-red-600 font-medium hidden sm:block">Sure?</span>
                    <button
                      onClick={() => handleDelete(problem._id)}
                      disabled={deleting === problem._id}
                      className="flex items-center gap-1 text-xs px-3 py-1.5 rounded-lg bg-red-500 text-white hover:bg-red-600 disabled:opacity-60 transition-colors font-medium">
                      {deleting === problem._id
                        ? <span className="loading loading-spinner loading-xs" />
                        : <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
                          </svg>}
                      Delete
                    </button>
                    <button
                      onClick={() => setConfirmId(null)}
                      className="text-xs px-3 py-1.5 rounded-lg border border-base-300 hover:bg-base-200 transition-colors">
                      Cancel
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => setConfirmId(problem._id)}
                    disabled={!!deleting}
                    className="flex-shrink-0 flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 disabled:opacity-40 transition-colors font-medium">
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
                    </svg>
                    Delete
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDelete;