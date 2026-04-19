import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import axiosClient from '../utils/axiosClient';
import { NavLink, useNavigate } from 'react-router';

const LANGUAGES = ['C++', 'Java', 'JavaScript'];

const problemSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().min(1, 'Description is required'),
  difficulty: z.enum(['easy', 'medium', 'hard']),
  tags: z.enum(['array', 'linkedList', 'graph', 'dp']),
  visibleTestCases: z.array(
    z.object({
      input: z.string().min(1, 'Input is required'),
      output: z.string().min(1, 'Output is required'),
      explanation: z.string().min(1, 'Explanation is required'),
    })
  ).min(1, 'At least one visible test case required'),
  hiddenTestCases: z.array(
    z.object({
      input: z.string().min(1, 'Input is required'),
      output: z.string().min(1, 'Output is required'),
    })
  ).min(1, 'At least one hidden test case required'),
  startCode: z.array(
    z.object({
      language: z.enum(['C++', 'Java', 'JavaScript']),
      initialCode: z.string().min(1, 'Initial code is required'),
    })
  ).length(3),
  referenceSolution: z.array(
    z.object({
      language: z.enum(['C++', 'Java', 'JavaScript']),
      completeCode: z.string().min(1, 'Complete code is required'),
    })
  ).length(3),
});

// ── Reusable field components ──────────────────────────────
const Field = ({ label, error, children }) => (
  <div className="mb-4">
    <label className="block text-xs font-medium text-base-content/60 mb-1.5">{label}</label>
    {children}
    {error && <p className="text-xs text-error mt-1">{error}</p>}
  </div>
);

const inputCls = (err) =>
  `input input-bordered w-full h-10 text-sm ${err ? 'input-error' : ''}`;

const Section = ({ num, title, children }) => (
  <div className="bg-base-100 border border-base-300 rounded-2xl p-6 mb-4">
    <div className="flex items-center gap-2.5 mb-5">
      <div className="w-6 h-6 rounded-full bg-amber-50 text-amber-700 text-xs font-medium flex items-center justify-center flex-shrink-0">
        {num}
      </div>
      <h2 className="text-sm font-medium">{title}</h2>
    </div>
    {children}
  </div>
);

// ── Main component ─────────────────────────────────────────
function AdminPanel() {
  const navigate = useNavigate();

  const {
    register,
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(problemSchema),
    defaultValues: {
      difficulty: 'easy',
      tags: 'array',
      startCode: LANGUAGES.map((l) => ({ language: l, initialCode: '' })),
      referenceSolution: LANGUAGES.map((l) => ({ language: l, completeCode: '' })),
    },
  });

  const { fields: visibleFields, append: appendVisible, remove: removeVisible } =
    useFieldArray({ control, name: 'visibleTestCases' });

  const { fields: hiddenFields, append: appendHidden, remove: removeHidden } =
    useFieldArray({ control, name: 'hiddenTestCases' });

  const onSubmit = async (data) => {
    try {
      await axiosClient.post('/problem/create', data);
      navigate('/admin');
    } catch (error) {
      alert(error.response?.data?.message || error.message);
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

      <div className="max-w-2xl mx-auto px-4 py-8">
        <h1 className="text-xl font-medium mb-1">Create problem</h1>
        <p className="text-sm text-base-content/50 mb-6">
          Fill in all sections to publish a new coding problem
        </p>

        <form onSubmit={handleSubmit(onSubmit)} noValidate>

          {/* ── Section 1: Basic info ── */}
          <Section num="1" title="Basic information">
            <Field label="Problem title" error={errors.title?.message}>
              <input
                {...register('title')}
                placeholder="e.g. Two Sum"
                className={inputCls(errors.title)}
              />
            </Field>

            <Field label="Description" error={errors.description?.message}>
              <textarea
                {...register('description')}
                placeholder="Describe the problem clearly..."
                rows={5}
                className={`textarea textarea-bordered w-full text-sm leading-relaxed ${errors.description ? 'textarea-error' : ''}`}
              />
            </Field>

            <div className="grid grid-cols-2 gap-4">
              <Field label="Difficulty" error={errors.difficulty?.message}>
                <select {...register('difficulty')}
                  className={`select select-bordered w-full text-sm h-10 min-h-0 ${errors.difficulty ? 'select-error' : ''}`}>
                  <option value="easy">Easy</option>
                  <option value="medium">Medium</option>
                  <option value="hard">Hard</option>
                </select>
              </Field>
              <Field label="Tag" error={errors.tags?.message}>
                <select {...register('tags')}
                  className={`select select-bordered w-full text-sm h-10 min-h-0 ${errors.tags ? 'select-error' : ''}`}>
                  <option value="array">Array</option>
                  <option value="linkedList">Linked List</option>
                  <option value="graph">Graph</option>
                  <option value="dp">DP</option>
                </select>
              </Field>
            </div>
          </Section>

          {/* ── Section 2: Visible test cases ── */}
          <Section num="2" title="Visible test cases">
            {errors.visibleTestCases?.root && (
              <p className="text-xs text-error mb-3">{errors.visibleTestCases.root.message}</p>
            )}

            {visibleFields.map((field, i) => (
              <div key={field.id}
                className="bg-base-200 border border-base-300 rounded-xl p-4 mb-3">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-medium text-base-content/60">Case {i + 1}</span>
                  <button type="button" onClick={() => removeVisible(i)}
                    className="text-xs px-2.5 py-1 rounded-md bg-red-50 text-red-600 hover:bg-red-100 transition-colors">
                    Remove
                  </button>
                </div>
                <Field label="Input" error={errors.visibleTestCases?.[i]?.input?.message}>
                  <input {...register(`visibleTestCases.${i}.input`)}
                    placeholder="e.g. nums = [2,7,11,15], target = 9"
                    className={inputCls(errors.visibleTestCases?.[i]?.input)}/>
                </Field>
                <Field label="Output" error={errors.visibleTestCases?.[i]?.output?.message}>
                  <input {...register(`visibleTestCases.${i}.output`)}
                    placeholder="e.g. [0,1]"
                    className={inputCls(errors.visibleTestCases?.[i]?.output)}/>
                </Field>
                <Field label="Explanation" error={errors.visibleTestCases?.[i]?.explanation?.message}>
                  <textarea {...register(`visibleTestCases.${i}.explanation`)}
                    placeholder="Why is this the correct output?"
                    rows={2}
                    className={`textarea textarea-bordered w-full text-sm ${errors.visibleTestCases?.[i]?.explanation ? 'textarea-error' : ''}`}/>
                </Field>
              </div>
            ))}

            <button type="button"
              onClick={() => appendVisible({ input: '', output: '', explanation: '' })}
              className="flex items-center gap-1.5 text-xs font-medium px-3 py-2 rounded-lg bg-blue-50 text-blue-700 hover:bg-blue-100 transition-colors">
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4"/>
              </svg>
              Add visible case
            </button>
          </Section>

          {/* ── Section 3: Hidden test cases ── */}
          <Section num="3" title="Hidden test cases">
            {errors.hiddenTestCases?.root && (
              <p className="text-xs text-error mb-3">{errors.hiddenTestCases.root.message}</p>
            )}

            {hiddenFields.map((field, i) => (
              <div key={field.id}
                className="bg-base-200 border border-base-300 rounded-xl p-4 mb-3">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-medium text-base-content/60">Case {i + 1}</span>
                  <button type="button" onClick={() => removeHidden(i)}
                    className="text-xs px-2.5 py-1 rounded-md bg-red-50 text-red-600 hover:bg-red-100 transition-colors">
                    Remove
                  </button>
                </div>
                <Field label="Input" error={errors.hiddenTestCases?.[i]?.input?.message}>
                  <input {...register(`hiddenTestCases.${i}.input`)}
                    placeholder="Input"
                    className={inputCls(errors.hiddenTestCases?.[i]?.input)}/>
                </Field>
                <Field label="Output" error={errors.hiddenTestCases?.[i]?.output?.message}>
                  <input {...register(`hiddenTestCases.${i}.output`)}
                    placeholder="Expected output"
                    className={inputCls(errors.hiddenTestCases?.[i]?.output)}/>
                </Field>
              </div>
            ))}

            <button type="button"
              onClick={() => appendHidden({ input: '', output: '' })}
              className="flex items-center gap-1.5 text-xs font-medium px-3 py-2 rounded-lg bg-blue-50 text-blue-700 hover:bg-blue-100 transition-colors">
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4"/>
              </svg>
              Add hidden case
            </button>
          </Section>

          {/* ── Section 4: Code templates ── */}
          <Section num="4" title="Starter code">
            {LANGUAGES.map((lang, i) => (
              <div key={lang} className="mb-6 last:mb-0">
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-base-200 text-base-content/60">
                    {lang}
                  </span>
                </div>
                <Field label="Initial code" error={errors.startCode?.[i]?.initialCode?.message}>
                  <textarea
                    {...register(`startCode.${i}.initialCode`)}
                    rows={6}
                    spellCheck={false}
                    className={`w-full font-mono text-xs p-4 rounded-xl bg-[#1e1e1e] text-[#d4d4d4] border resize-y outline-none focus:border-amber-400 ${errors.startCode?.[i]?.initialCode ? 'border-error' : 'border-base-300'}`}
                  />
                </Field>
                <Field label="Reference solution" error={errors.referenceSolution?.[i]?.completeCode?.message}>
                  <textarea
                    {...register(`referenceSolution.${i}.completeCode`)}
                    rows={6}
                    spellCheck={false}
                    className={`w-full font-mono text-xs p-4 rounded-xl bg-[#1e1e1e] text-[#d4d4d4] border resize-y outline-none focus:border-amber-400 ${errors.referenceSolution?.[i]?.completeCode ? 'border-error' : 'border-base-300'}`}
                  />
                </Field>
                {i < LANGUAGES.length - 1 && (
                  <div className="border-t border-base-300 mt-6" />
                )}
              </div>
            ))}
          </Section>

          {/* Submit */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full h-11 rounded-xl text-sm font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-60 flex items-center justify-center gap-2"
            style={{ background: '#f5a623' }}>
            {isSubmitting && <span className="loading loading-spinner loading-xs" />}
            {isSubmitting ? 'Creating problem...' : 'Create problem'}
          </button>
        </form>
      </div>
    </div>
  );
}

export default AdminPanel;