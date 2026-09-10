import React from 'react';
import { ArrowLeft, RouteOff } from 'lucide-react';
import { Link } from 'react-router-dom';

const NotFoundPage: React.FC = () => (
  <div className="min-h-[65vh] max-container flex items-center justify-center py-16 text-center">
    <div className="max-w-md flex flex-col items-center">
      <div className="w-16 h-16 rounded-2xl flex items-center justify-center" style={{ backgroundColor: 'var(--primary-subtle)', color: 'var(--primary)' }}>
        <RouteOff size={30} />
      </div>
      <p className="text-xs font-semibold tracking-widest mt-6" style={{ color: 'var(--primary)' }}>404</p>
      <h1 className="text-2xl font-bold mt-2" style={{ color: 'var(--text-primary)' }}>That page is not in the circuit</h1>
      <p className="text-sm mt-2" style={{ color: 'var(--text-secondary)' }}>The link may be outdated, or the page may have moved.</p>
      <Link to="/" className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white mt-6" style={{ backgroundColor: 'var(--primary)' }}>
        <ArrowLeft size={16} /> Back home
      </Link>
    </div>
  </div>
);

export default NotFoundPage;
