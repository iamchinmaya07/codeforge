import { NavLink } from 'react-router';
import { Plus, Edit, Trash2, Video } from 'lucide-react';

const adminOptions = [
  {
    id: 'create',
    title: 'Create problem',
    description: 'Add a new coding problem with test cases, description, and starter code.',
    icon: Plus,
    iconColor: '#1D9E75',
    iconBg: 'bg-emerald-50',
    linkStyle: 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100',
    route: '/admin/create',
  },
  {
    id: 'update',
    title: 'Update problem',
    description: 'Edit existing problems, fix descriptions, or update test cases and solutions.',
    icon: Edit,
    iconColor: '#BA7517',
    iconBg: 'bg-amber-50',
    linkStyle: 'bg-amber-50 text-amber-700 hover:bg-amber-100',
    route: '/admin/update',
  },
  {
    id: 'delete',
    title: 'Delete problem',
    description: 'Permanently remove problems and all associated submissions from the platform.',
    icon: Trash2,
    iconColor: '#A32D2D',
    iconBg: 'bg-red-50',
    linkStyle: 'bg-red-50 text-red-700 hover:bg-red-100',
    route: '/admin/delete',
  },
  {
    id: 'video',
    title: 'Video management',
    description: 'Upload editorial videos for problems or remove outdated video content.',
    icon: Video,
    iconColor: '#185FA5',
    iconBg: 'bg-blue-50',
    linkStyle: 'bg-blue-50 text-blue-700 hover:bg-blue-100',
    route: '/admin/video',
  },
];

function Admin() {
  return (
    <div className="min-h-screen bg-base-200">

      {/* Navbar */}
      <nav className="bg-base-100 border-b border-base-300 px-6 h-13 flex items-center justify-between">
        <NavLink to="/" className="flex items-center gap-2 font-medium text-base">
          <div className="w-7 h-7 bg-amber-400 rounded-lg flex items-center justify-center">
            <svg width="14" height="14" fill="none" viewBox="0 0 24 24">
              <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"
                stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          CodeForge
        </NavLink>

        <NavLink to="/"
          className="flex items-center gap-1.5 text-sm text-base-content/60 border border-base-300 px-3 py-1.5 rounded-lg hover:bg-base-200 transition-colors">
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7"/>
          </svg>
          Back to home
        </NavLink>
      </nav>

      <div className="max-w-3xl mx-auto px-4 py-10">

        {/* Header */}
        <div className="mb-8">
          <div className="inline-flex items-center gap-1.5 bg-amber-50 text-amber-700 text-xs font-medium px-3 py-1 rounded-full mb-3">
            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/>
            </svg>
            Admin access
          </div>
          <h1 className="text-2xl font-medium mb-1">Admin panel</h1>
          <p className="text-sm text-base-content/50">Manage problems, videos, and platform content</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3 mb-8">
          {[
            { label: 'Total problems', value: '—' },
            { label: 'Total submissions', value: '—' },
            { label: 'Active users', value: '—' },
          ].map(({ label, value }) => (
            <div key={label} className="bg-base-100 border border-base-300 rounded-xl px-4 py-3">
              <p className="text-xs text-base-content/50 mb-1">{label}</p>
              <p className="text-xl font-medium">{value}</p>
            </div>
          ))}
        </div>

        {/* Option cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {adminOptions.map(({ id, title, description, icon: Icon, iconColor, iconBg, linkStyle, route }) => (
            <div key={id}
              className="bg-base-100 border border-base-300 rounded-2xl p-5 flex items-start gap-4 hover:border-base-content/20 transition-colors">

              <div className={`w-10 h-10 rounded-xl ${iconBg} flex items-center justify-center flex-shrink-0`}>
                <Icon size={18} color={iconColor} strokeWidth={2} />
              </div>

              <div className="flex-1">
                <h2 className="text-sm font-medium mb-1">{title}</h2>
                <p className="text-xs text-base-content/50 leading-relaxed mb-3">{description}</p>
                <NavLink
                  to={route}
                  className={`inline-flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg transition-colors ${linkStyle}`}>
                  Go to {title.split(' ')[0].toLowerCase()}
                  <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7"/>
                  </svg>
                </NavLink>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default Admin;