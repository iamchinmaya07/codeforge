import { useState, useEffect, useRef } from 'react';
import Editor from '@monaco-editor/react';
import { useParams, NavLink } from 'react-router';
import { useSelector } from 'react-redux';
import axiosClient from '../utils/axiosClient';
import SubmissionHistory from '../components/SubmissionHistory';
import ChatAi from '../components/ChatAi';
import Editorial from '../components/Editorial';

// const LANG_MAP = { cpp: 'C++', java: 'Java', javascript: 'JavaScript' };
const LANG_MAP = {
  cpp: 'cpp',         // DB uses lowercase
  java: 'java',
  javascript: 'javascript'
};
const LANGUAGES = ['javascript', 'java', 'cpp'];

const diffStyle = {
  easy:   'bg-emerald-50 text-emerald-700',
  medium: 'bg-amber-50 text-amber-700',
  hard:   'bg-red-50 text-red-600',
};

const ProblemPage = () => {
  const { problemId } = useParams();
  const { user } = useSelector((state) => state.auth);
  const editorRef = useRef(null);

  const [problem, setProblem]           = useState(null);
  const [selectedLang, setSelectedLang] = useState('javascript');
  const [code, setCode]                 = useState('');
  const [loading, setLoading]           = useState(false);
  const [runResult, setRunResult]       = useState(null);
  const [submitResult, setSubmitResult] = useState(null);
  const [leftTab, setLeftTab]           = useState('description');
  const [rightTab, setRightTab]         = useState('code');

useEffect(() => {
    const fetchProblem = async () => {
      setLoading(true);
      try {
        const { data } = await axiosClient.get(`/problem/problemById/${problemId}`);
        setProblem(data);
        
        // 👇 Add this log here
        console.log('startCode from API:', data.startCode);
        console.log('looking for language:', langMap[selectedLanguage]);
        
        const starter = data.startCode.find(
          (sc) => sc.language === langMap[selectedLanguage]
        );
        
        // 👇 Add this log too
        console.log('found starter:', starter);
        
        setCode(starter?.initialCode || '// Start coding here');
      } catch (err) {
        console.error('Error fetching problem:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchProblem();
  }, [problemId]);

  useEffect(() => {
    if (!problem) return;
    const starter = problem.startCode.find(
      (sc) => sc.language === LANG_MAP[selectedLang]
    )?.initialCode || '';
    setCode(starter);
  }, [selectedLang, problem]);

  const handleRun = async () => {
    setLoading(true);
    setRunResult(null);
    try {
      const { data } = await axiosClient.post(`/submission/run/${problemId}`, {
        code, language: selectedLang,
      });
      setRunResult(data);
      setRightTab('testcase');
    } catch {
      setRunResult({ success: false, error: 'Internal server error', testCases: [] });
      setRightTab('testcase');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    setLoading(true);
    setSubmitResult(null);
    try {
      const { data } = await axiosClient.post(`/submission/submit/${problemId}`, {
        code, language: selectedLang,
      });
      setSubmitResult(data);
      setRightTab('result');
    } catch {
      setSubmitResult(null);
      setRightTab('result');
    } finally {
      setLoading(false);
    }
  };

  if (loading && !problem) {
    return (
      <div className="flex items-center justify-center h-screen">
        <span className="loading loading-spinner loading-lg text-amber-400" />
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col overflow-hidden bg-base-100">

      {/* ── Navbar ── */}
      <nav className="h-12 flex items-center justify-between px-5 border-b border-base-300 bg-base-100 flex-shrink-0">
        <NavLink to="/" className="flex items-center gap-2 font-medium text-base">
          <div className="w-6 h-6 bg-amber-400 rounded-md flex items-center justify-center">
            <svg width="13" height="13" fill="none" viewBox="0 0 24 24">
              <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"
                stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          CodeForge
        </NavLink>

        {/* Problem title + difficulty in center */}
        {problem && (
          <div className="flex items-center gap-2 text-sm font-medium">
            <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${diffStyle[problem.difficulty]}`}>
              {problem.difficulty}
            </span>
            <span className="text-base-content/80 max-w-xs truncate">{problem.title}</span>
          </div>
        )}

        <div className="flex items-center gap-2">
          <button
            onClick={handleRun}
            disabled={loading}
            className="px-4 py-1.5 text-sm rounded-lg border border-base-300 bg-base-100 hover:bg-base-200 disabled:opacity-50 transition-colors font-medium"
          >
            {loading ? <span className="loading loading-spinner loading-xs" /> : 'Run'}
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="px-4 py-1.5 text-sm rounded-lg text-white font-medium disabled:opacity-50 transition-opacity hover:opacity-90"
            style={{ background: '#f5a623' }}
          >
            {loading ? <span className="loading loading-spinner loading-xs" /> : 'Submit'}
          </button>
          <div className="w-7 h-7 rounded-full bg-amber-100 text-amber-800 text-xs font-medium flex items-center justify-center">
            {user?.firstName?.[0]?.toUpperCase()}
          </div>
        </div>
      </nav>

      {/* ── Main layout ── */}
      <div className="flex flex-1 overflow-hidden">

        {/* ── Left panel ── */}
        <div className="w-[48%] flex flex-col border-r border-base-300 overflow-hidden">

          {/* Left tab bar */}
          <div className="flex border-b border-base-300 bg-base-200 px-3 gap-1 flex-shrink-0 overflow-x-auto">
            {[
              { id: 'description', label: 'Description' },
              { id: 'editorial',   label: 'Editorial' },
              { id: 'solutions',   label: 'Solutions' },
              { id: 'submissions', label: 'Submissions' },
              { id: 'chatai',      label: 'AI tutor' },
            ].map(({ id, label }) => (
              <button key={id}
                onClick={() => setLeftTab(id)}
                className={`py-2.5 px-3 text-sm whitespace-nowrap border-b-2 transition-colors
                  ${leftTab === id
                    ? 'border-amber-400 text-base-content font-medium'
                    : 'border-transparent text-base-content/50 hover:text-base-content'}`}>
                {label}
              </button>
            ))}
          </div>

          {/* Left content */}
          <div className="flex-1 overflow-y-auto p-5">
            {problem && (
              <>
                {/* Description */}
                {leftTab === 'description' && (
                  <div>
                    <div className="flex items-center gap-2 mb-4">
                      <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${diffStyle[problem.difficulty]}`}>
                        {problem.difficulty}
                      </span>
                      <span className="text-xs px-2.5 py-1 rounded-full bg-base-200 text-base-content/60">
                        {problem.tags}
                      </span>
                    </div>

                    <h1 className="text-lg font-medium mb-4">{problem.title}</h1>

                    <p className="text-sm leading-relaxed text-base-content/80 whitespace-pre-wrap">
                      {problem.description}
                    </p>

                    <div className="mt-6 space-y-3">
                      <h3 className="text-sm font-medium">Examples</h3>
                      {problem.visibleTestCases.map((tc, i) => (
                        <div key={i} className="bg-base-200 rounded-lg p-4 space-y-1.5">
                          <p className="text-xs font-medium mb-2">Example {i + 1}</p>
                          <div className="font-mono text-xs text-base-content/70 space-y-1">
                            <p><span className="text-base-content font-medium">Input:</span> {tc.input}</p>
                            <p><span className="text-base-content font-medium">Output:</span> {tc.output}</p>
                            {tc.explanation && (
                              <p><span className="text-base-content font-medium">Explanation:</span> {tc.explanation}</p>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Editorial */}
                {leftTab === 'editorial' && (
                  <div>
                    <h2 className="text-base font-medium mb-4">Editorial</h2>
                    <Editorial
                      secureUrl={problem.secureUrl}
                      thumbnailUrl={problem.thumbnailUrl}
                      duration={problem.duration}
                    />
                  </div>
                )}

                {/* Solutions */}
                {leftTab === 'solutions' && (
                  <div>
                    <h2 className="text-base font-medium mb-4">Reference solutions</h2>
                    {problem.referenceSolution?.length ? (
                      <div className="space-y-4">
                        {problem.referenceSolution.map((sol, i) => (
                          <div key={i} className="border border-base-300 rounded-xl overflow-hidden">
                            <div className="bg-base-200 px-4 py-2.5 text-sm font-medium">
                              {problem.title} — {sol.language}
                            </div>
                            <pre className="p-4 text-xs font-mono overflow-x-auto bg-[#1e1e1e] text-[#d4d4d4]">
                              <code>{sol.completeCode}</code>
                            </pre>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-base-content/40">
                        Solutions will be available after you solve the problem.
                      </p>
                    )}
                  </div>
                )}

                {/* Submissions */}
                {leftTab === 'submissions' && (
                  <div>
                    <h2 className="text-base font-medium mb-4">My submissions</h2>
                    <SubmissionHistory problemId={problemId} />
                  </div>
                )}

                {/* AI Chat */}
                {leftTab === 'chatai' && (
                  <div>
                    <h2 className="text-base font-medium mb-4">AI tutor</h2>
                    <ChatAi problem={problem} />
                  </div>
                )}
              </>
            )}
          </div>
        </div>

        {/* ── Right panel ── */}
        <div className="flex-1 flex flex-col overflow-hidden">

          {/* Right tab bar */}
          <div className="flex border-b border-base-300 bg-base-200 px-3 gap-1 flex-shrink-0">
            {[
              { id: 'code',      label: 'Code' },
              { id: 'testcase',  label: 'Test results' },
              { id: 'result',    label: 'Submission' },
            ].map(({ id, label }) => (
              <button key={id}
                onClick={() => setRightTab(id)}
                className={`py-2.5 px-3 text-sm whitespace-nowrap border-b-2 transition-colors
                  ${rightTab === id
                    ? 'border-amber-400 text-base-content font-medium'
                    : 'border-transparent text-base-content/50 hover:text-base-content'}`}>
                {label}
              </button>
            ))}
          </div>

          {/* Code tab */}
          {rightTab === 'code' && (
            <div className="flex flex-col flex-1 overflow-hidden">
              <div className="flex items-center justify-between px-3 py-2 border-b border-base-300 bg-base-200 flex-shrink-0">
                <div className="flex gap-1.5">
                  {LANGUAGES.map((lang) => (
                    <button key={lang}
                      onClick={() => setSelectedLang(lang)}
                      className={`px-3 py-1 text-xs rounded-md border transition-all
                        ${selectedLang === lang
                          ? 'bg-amber-400 border-amber-400 text-white'
                          : 'border-base-300 bg-base-100 text-base-content/60 hover:bg-base-200'}`}>
                      {lang === 'cpp' ? 'C++' : lang === 'javascript' ? 'JavaScript' : 'Java'}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex-1 overflow-hidden">
                <Editor
                  height="100%"
                  language={selectedLang}
                  value={code}
                  onChange={(val) => setCode(val || '')}
                  onMount={(editor) => { editorRef.current = editor; }}
                  theme="vs-dark"
                  options={{
                    fontSize: 14,
                    minimap: { enabled: false },
                    scrollBeyondLastLine: false,
                    automaticLayout: true,
                    tabSize: 2,
                    wordWrap: 'on',
                    lineNumbers: 'on',
                    glyphMargin: false,
                    folding: true,
                    lineDecorationsWidth: 10,
                    lineNumbersMinChars: 3,
                    renderLineHighlight: 'line',
                    mouseWheelZoom: true,
                    padding: { top: 12 },
                  }}
                />
              </div>

              <div className="flex items-center justify-between px-3 py-2 border-t border-base-300 bg-base-200 flex-shrink-0">
                <button
                  onClick={() => setRightTab('testcase')}
                  className="px-3 py-1 text-xs rounded-md border border-base-300 bg-base-100 hover:bg-base-200 text-base-content/60">
                  Console
                </button>
                <div className="flex gap-2">
                  <button
                    onClick={handleRun}
                    disabled={loading}
                    className="px-4 py-1.5 text-xs rounded-lg border border-base-300 bg-base-100 hover:bg-base-200 disabled:opacity-50 font-medium">
                    Run
                  </button>
                  <button
                    onClick={handleSubmit}
                    disabled={loading}
                    className="px-4 py-1.5 text-xs rounded-lg text-white font-medium hover:opacity-90 disabled:opacity-50"
                    style={{ background: '#f5a623' }}>
                    Submit
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Test results tab */}
          {rightTab === 'testcase' && (
            <div className="flex-1 overflow-y-auto p-5">
              <h3 className="text-sm font-medium mb-4">Test results</h3>
              {runResult ? (
                <div>
                  <div className={`rounded-xl p-4 mb-4 border ${
                    runResult.success
                      ? 'bg-emerald-50 border-emerald-200'
                      : 'bg-red-50 border-red-200'}`}>
                    <p className={`text-sm font-medium mb-1 ${
                      runResult.success ? 'text-emerald-700' : 'text-red-600'}`}>
                      {runResult.success ? 'All test cases passed' : 'Some test cases failed'}
                    </p>
                    {runResult.runtime && (
                      <div className="flex gap-4 text-xs text-base-content/50 mt-2">
                        <span>Runtime: {runResult.runtime}s</span>
                        <span>Memory: {runResult.memory} KB</span>
                      </div>
                    )}
                  </div>

                  <div className="space-y-3">
                    {runResult.testCases?.map((tc, i) => {
                      const passed = tc.status_id === 3;
                      return (
                        <div key={i} className="bg-base-200 rounded-xl p-4 border border-base-300">
                          <div className="flex items-center justify-between mb-3">
                            <span className="text-xs font-medium">Case {i + 1}</span>
                            <span className={`text-xs font-medium ${passed ? 'text-emerald-600' : 'text-red-500'}`}>
                              {passed ? 'Passed' : 'Failed'}
                            </span>
                          </div>
                          <div className="space-y-2 font-mono text-xs text-base-content/70">
                            <div><span className="text-base-content font-medium">Input:</span> {tc.stdin}</div>
                            <div><span className="text-base-content font-medium">Expected:</span> {tc.expected_output}</div>
                            <div><span className="text-base-content font-medium">Output:</span> {tc.stdout}</div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ) : (
                <p className="text-sm text-base-content/40 text-center py-12">
                  Click Run to test your code against the example cases.
                </p>
              )}
            </div>
          )}

          {/* Submission result tab */}
          {rightTab === 'result' && (
            <div className="flex-1 overflow-y-auto p-5">
              <h3 className="text-sm font-medium mb-4">Submission result</h3>
              {submitResult ? (
                <div>
                  <div className={`rounded-xl p-4 mb-4 border ${
                    submitResult.accepted
                      ? 'bg-emerald-50 border-emerald-200'
                      : 'bg-red-50 border-red-200'}`}>
                    <p className={`text-base font-medium mb-2 ${
                      submitResult.accepted ? 'text-emerald-700' : 'text-red-600'}`}>
                      {submitResult.accepted ? 'Accepted' : submitResult.error}
                    </p>
                    <div className="flex gap-4 text-xs text-base-content/50 mt-2">
                      <span>Tests: {submitResult.passedTestCases} / {submitResult.totalTestCases}</span>
                      {submitResult.runtime && <span>Runtime: {submitResult.runtime}s</span>}
                      {submitResult.memory && <span>Memory: {submitResult.memory} KB</span>}
                    </div>
                  </div>
                  {submitResult.accepted && (
                    <div className="bg-base-200 rounded-xl p-4 text-sm text-base-content/60">
                      All test cases passed. Your solution has been recorded.
                    </div>
                  )}
                </div>
              ) : (
                <p className="text-sm text-base-content/40 text-center py-12">
                  Click Submit to evaluate your solution against all test cases.
                </p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProblemPage;