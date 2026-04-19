import { useEffect, useState } from 'react';
import { NavLink, useNavigate } from 'react-router';
import { useDispatch, useSelector } from 'react-redux';
import axiosClient from '../utils/axiosClient';
import { logoutUser } from '../authSlice';

function Homepage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);
  const [problems, setProblems] = useState([]);
  const [solvedProblems, setSolvedProblems] = useState([]);
  const [filters, setFilters] = useState({ difficulty: 'all', status: 'all' });
  const [search, setSearch] = useState('');
  const [dropdownOpen, setDropdownOpen] = useState(false);

  useEffect(() => {
    const fetchProblems = async () => {
      try {
        const { data } = await axiosClient.get('/problem/getAllProblem');
        setProblems(data);
      } catch (err) {
        console.error('Error fetching problems:', err);
      }
    };
    const fetchSolved = async () => {
      try {
        const { data } = await axiosClient.get('/problem/problemSolvedByUser');
        setSolvedProblems(data);
      } catch (err) {
        console.error('Error fetching solved:', err);
      }
    };
    fetchProblems();
    if (user) fetchSolved();
  }, [user]);

  const isSolved = (id) => solvedProblems.some((sp) => sp._id === id);

  const filtered = problems.filter((p) => {
    const diffOk = filters.difficulty === 'all' || p.difficulty === filters.difficulty;
    const statusOk =
      filters.status === 'all' ||
      (filters.status === 'solved' && isSolved(p._id)) ||
      (filters.status === 'unsolved' && !isSolved(p._id));
    const searchOk = p.title.toLowerCase().includes(search.toLowerCase());
    return diffOk && statusOk && searchOk;
  });

  const handleLogout = () => {
    dispatch(logoutUser());
    setSolvedProblems([]);
    navigate('/login');
  };

  const diffButtons = ['all', 'easy', 'medium', 'hard'];

  const statsConfig = [
    { label: 'Easy solved', diff: 'easy', color: 'text-emerald-600' },
    { label: 'Medium solved', diff: 'medium', color: 'text-amber-600' },
    { label: 'Hard solved', diff: 'hard', color: 'text-red-500' },
  ];

  return (
    <div className="min-h-screen bg-base-200">

      {/* Navbar */}
      <nav className="bg-base-100 border-b border-base-300 px-6 h-14 flex items-center justify-between">
        <NavLink to="/" className="flex items-center gap-2 font-medium text-lg">
          <div className="w-7 h-7 bg-amber-400 rounded-lg flex items-center justify-center">
            <svg width="15" height="15" fill="none" viewBox="0 0 24 24">
              <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"
                stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          CodeForge
        </NavLink>

        <div className="relative">
          <button
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="w-8 h-8 rounded-full bg-amber-100 text-amber-800 text-sm font-medium flex items-center justify-center"
          >
            {user?.firstName?.[0]?.toUpperCase()}
          </button>

          {dropdownOpen && (
            <div className="absolute right-0 top-10 bg-base-100 border border-base-300 rounded-xl w-44 overflow-hidden z-50 shadow-sm"
              onMouseLeave={() => setDropdownOpen(false)}>
              <div className="px-4 py-2.5 text-sm font-medium border-b border-base-300">
                {user?.firstName}
              </div>
              {user?.role === 'admin' && (
                <NavLink to="/admin"
                  className="block px-4 py-2.5 text-sm hover:bg-base-200"
                  onClick={() => setDropdownOpen(false)}>
                  Admin panel
                </NavLink>
              )}
              <button
                onClick={handleLogout}
                className="w-full text-left px-4 py-2.5 text-sm text-error hover:bg-base-200 border-t border-base-300">
                Logout
              </button>
            </div>
          )}
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-4 py-6">

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          {statsConfig.map(({ label, diff, color }) => {
            const total = problems.filter((p) => p.difficulty === diff).length;
            const solved = problems.filter((p) => p.difficulty === diff && isSolved(p._id)).length;
            return (
              <div key={diff} className="bg-base-100 border border-base-300 rounded-xl px-4 py-3">
                <p className="text-xs text-base-content/50 mb-1">{label}</p>
                <p className={`text-xl font-medium ${color}`}>{solved} / {total}</p>
              </div>
            );
          })}
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-2 mb-4 items-center">
          {/* Search */}
          <div className="relative flex-1 min-w-44">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-base-content/30"
              fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <circle cx="11" cy="11" r="8" strokeWidth="2"/>
              <path d="M21 21l-4.35-4.35" strokeWidth="2" strokeLinecap="round"/>
            </svg>
            <input
              type="text"
              placeholder="Search problems..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="input input-bordered w-full h-9 pl-8 text-sm rounded-full"
            />
          </div>

          {/* Difficulty filters */}
          {diffButtons.map((d) => (
            <button key={d}
              onClick={() => setFilters({ ...filters, difficulty: d })}
              className={`px-4 py-1.5 rounded-full text-sm border transition-all
                ${filters.difficulty === d
                  ? 'bg-amber-400 border-amber-400 text-white'
                  : 'bg-base-100 border-base-300 text-base-content/60 hover:bg-base-200'}`}>
              {d.charAt(0).toUpperCase() + d.slice(1)}
            </button>
          ))}

          {/* Status filters */}
          {['solved', 'unsolved'].map((s) => (
            <button key={s}
              onClick={() => setFilters({ ...filters, status: filters.status === s ? 'all' : s })}
              className={`px-4 py-1.5 rounded-full text-sm border transition-all
                ${filters.status === s
                  ? 'bg-amber-400 border-amber-400 text-white'
                  : 'bg-base-100 border-base-300 text-base-content/60 hover:bg-base-200'}`}>
              {s.charAt(0).toUpperCase() + s.slice(1)}
            </button>
          ))}
        </div>

        {/* Problem count */}
        <p className="text-sm text-base-content/50 mb-3">
          {filtered.length} problem{filtered.length !== 1 ? 's' : ''}
        </p>

        {/* Problem list */}
        <div className="flex flex-col gap-2">
          {filtered.length === 0 ? (
            <div className="text-center py-16 text-base-content/40 text-sm">
              No problems match your filters
            </div>
          ) : (
            filtered.map((problem, idx) => (
              <div key={problem._id}
                className="bg-base-100 border border-base-300 rounded-xl px-4 py-3 flex items-center gap-3 hover:border-base-content/30 transition-colors">

                {/* Number */}
                <span className="text-sm text-base-content/30 w-7">{idx + 1}</span>

                {/* Solved indicator */}
                {isSolved(problem._id) ? (
                  <div className="w-5 h-5 rounded-full bg-emerald-100 flex items-center justify-center flex-shrink-0">
                    <svg className="w-3 h-3" fill="none" viewBox="0 0 10 10">
                      <path d="M1.5 5l2.5 2.5 4.5-4.5" stroke="#1D9E75" strokeWidth="1.5"
                        strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </div>
                ) : (
                  <div className="w-5 h-5 rounded-full border-2 border-base-300 flex-shrink-0"/>
                )}

                {/* Title */}
                <NavLink to={`/problem/${problem._id}`}
                  className="flex-1 text-sm font-medium hover:text-amber-500 transition-colors">
                  {problem.title}
                </NavLink>

                {/* Tag */}
                <span className="text-xs px-2 py-1 rounded bg-base-200 text-base-content/50">
                  {problem.tags}
                </span>

                {/* Difficulty */}
                <span className={`text-xs px-2 py-1 rounded font-medium
                  ${problem.difficulty === 'easy' ? 'bg-emerald-50 text-emerald-700' :
                    problem.difficulty === 'medium' ? 'bg-amber-50 text-amber-700' :
                    'bg-red-50 text-red-600'}`}>
                  {problem.difficulty}
                </span>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

export default Homepage;