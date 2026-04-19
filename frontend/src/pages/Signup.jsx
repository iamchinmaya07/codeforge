import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, NavLink } from 'react-router';
import { registerUser } from '../authSlice';
import { clearError } from '../authSlice';



function Signup() {
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [formData, setFormData] = useState({ firstName: '', emailId: '', password: '' });
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { isAuthenticated, loading, error } = useSelector((state) => state.auth);

  useEffect(() => {
    if (isAuthenticated) navigate('/');
  }, [isAuthenticated, navigate]);

  const validate = () => {
    const newErrors = {};
    if (formData.firstName.trim().length < 3)
      newErrors.firstName = 'Minimum 3 characters required';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.emailId))
      newErrors.emailId = 'Enter a valid email address';
    if (formData.password.length < 8)
      newErrors.password = 'Password must be at least 8 characters';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const getStrength = (pw) => {
    let score = 0;
    if (pw.length >= 8) score++;
    if (/[A-Z]/.test(pw)) score++;
    if (/[0-9]/.test(pw)) score++;
    if (/[^A-Za-z0-9]/.test(pw)) score++;
    return score;
  };

  const strengthColors = ['#e24b4a', '#ef9f27', '#f5a623', '#1d9e75'];
  const strength = getStrength(formData.password);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (errors[e.target.name]) setErrors({ ...errors, [e.target.name]: '' });
  };

  const onSubmit = (e) => {
    e.preventDefault();
    if (validate()) dispatch(registerUser(formData));
  };

  useEffect(() => {
  dispatch(clearError());  // 👈 clear error when page loads
}, []);

useEffect(() => {
  if (isAuthenticated) navigate('/');
}, [isAuthenticated, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-base-200">
      <div className="w-full max-w-md bg-base-100 border border-base-300 rounded-2xl p-8 shadow-sm">

        {/* Logo */}
        <div className="flex items-center gap-2 mb-7 justify-center">
          <span className="text-xl font-medium"><h2 className="card-title justify-center text-3xl mb-6">CodeForge</h2></span>
        </div>
        <h1 className="text-2xl font-medium mb-1">Create your account</h1>
        <p className="text-sm text-base-content/60 mb-6">Start solving problems today</p>

        {/* Server error */}
        {error && (
          <div className="mb-4 p-3 rounded-lg bg-error/10 border border-error/30 text-error text-sm">
            {error}
          </div>
        )}

        <form onSubmit={onSubmit} noValidate>
          {/* First Name */}
          <div className="mb-5">
            <label className="block text-sm font-medium text-base-content/70 mb-1.5">
              First name
            </label>
            <input
              name="firstName"
              type="text"
              placeholder="John"
              value={formData.firstName}
              onChange={handleChange}
              className={`input input-bordered w-full h-10 text-sm ${errors.firstName ? 'input-error' : ''}`}
            />
            {errors.firstName && <p className="text-error text-xs mt-1">{errors.firstName}</p>}
          </div>

          {/* Email */}
          <div className="mb-5">
            <label className="block text-sm font-medium text-base-content/70 mb-1.5">
              Email address
            </label>
            <input
              name="emailId"
              type="email"
              placeholder="john@example.com"
              value={formData.emailId}
              onChange={handleChange}
              className={`input input-bordered w-full h-10 text-sm ${errors.emailId ? 'input-error' : ''}`}
            />
            {errors.emailId && <p className="text-error text-xs mt-1">{errors.emailId}</p>}
          </div>

          {/* Password */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-base-content/70 mb-1.5">
              Password
            </label>
            <div className="relative">
              <input
                name="password"
                type={showPassword ? 'text' : 'password'}
                placeholder="Min. 8 characters"
                value={formData.password}
                onChange={handleChange}
                className={`input input-bordered w-full h-10 text-sm pr-10 ${errors.password ? 'input-error' : ''}`}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-base-content/40 hover:text-base-content/70"
              >
                {showPassword ? (
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                  </svg>
                ) : (
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                )}
              </button>
            </div>

            {/* Password strength bars */}
            {formData.password && (
              <div className="flex gap-1 mt-2">
                {[0,1,2,3].map(i => (
                  <div key={i} className="h-1 flex-1 rounded-full transition-all duration-200"
                    style={{ background: i < strength ? strengthColors[strength - 1] : 'var(--fallback-bc,oklch(var(--bc)/0.1))' }}
                  />
                ))}
              </div>
            )}
            {errors.password && <p className="text-error text-xs mt-1">{errors.password}</p>}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full h-11 rounded-lg text-sm font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-60"
            style={{ background: '#f5a623' }}
          >
            {loading ? 'Creating account...' : 'Create account'}
          </button>
        </form>

        <p className="text-center text-sm text-base-content/60 mt-5">
          Already have an account?{' '}
          <NavLink to="/login" className="font-medium" style={{ color: '#f5a623' }}>
            Sign in
          </NavLink>
        </p>
      </div>
    </div>
  );
}

export default Signup;