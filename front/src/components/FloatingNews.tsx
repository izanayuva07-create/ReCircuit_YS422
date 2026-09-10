import React, { useState } from 'react';
import { ArrowRight, Newspaper, X } from 'lucide-react';
import { Link } from 'react-router-dom';
import Modal from './Modal';
import NewsCard from './NewsCard';
import { newsArticles, newsDemoNotice } from '../data/news';

const FloatingNews: React.FC = () => {
  const [desktopOpen, setDesktopOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <>
      <aside className="group fixed left-0 top-1/2 z-40 hidden -translate-y-1/2 lg:block" aria-label="E-waste demo news">
        <button
          type="button"
          onClick={() => setDesktopOpen((open) => !open)}
          className="relative z-10 flex min-h-36 w-11 items-center justify-center rounded-r-xl border border-l-0 text-[0.62rem] font-extrabold tracking-[0.16em] text-white shadow-lg"
          style={{ backgroundColor: 'var(--primary-dark)', borderColor: 'rgba(255,255,255,0.16)', writingMode: 'vertical-rl', transform: 'rotate(180deg)' }}
          aria-expanded={desktopOpen}
          aria-controls="floating-news-panel"
        >
          E-WASTE NEWS
        </button>
        <div
          id="floating-news-panel"
          className={`glass-panel absolute left-11 top-1/2 w-[23rem] -translate-y-1/2 rounded-r-2xl p-4 transition-all duration-300 group-hover:pointer-events-auto group-hover:translate-x-0 group-hover:opacity-100 group-focus-within:pointer-events-auto group-focus-within:translate-x-0 group-focus-within:opacity-100 ${desktopOpen ? 'pointer-events-auto translate-x-0 opacity-100' : 'pointer-events-none -translate-x-4 opacity-0'}`}
        >
          <div className="mb-2 flex items-start justify-between gap-4 px-2 pt-1">
            <div><span className="eyebrow">Demo newsroom</span><h2 className="mt-1 text-lg font-bold tracking-[-0.03em]">What’s moving the circuit</h2></div>
            <button type="button" onClick={() => setDesktopOpen(false)} className="grid h-9 w-9 place-items-center rounded-lg hover:bg-white" aria-label="Close news panel"><X size={17} /></button>
          </div>
          <p className="mb-2 px-2 text-[0.65rem] leading-4" style={{ color: 'var(--text-tertiary)' }}>{newsDemoNotice}</p>
          <div className="space-y-1">{newsArticles.slice(0, 3).map((article) => <NewsCard key={article.id} article={article} variant="compact" />)}</div>
          <Link to="/news" className="mt-3 flex min-h-11 items-center justify-center gap-2 rounded-xl text-sm font-bold text-white" style={{ backgroundColor: 'var(--primary)' }}>View All News <ArrowRight size={15} /></Link>
        </div>
      </aside>

      <button
        type="button"
        onClick={() => setMobileOpen(true)}
        className="premium-button fixed bottom-[max(1rem,env(safe-area-inset-bottom))] right-4 z-40 inline-flex min-h-12 items-center gap-2 rounded-full px-4 text-sm font-bold text-white lg:hidden"
        style={{ backgroundColor: 'var(--primary-dark)' }}
        aria-label="Open e-waste news"
      >
        <Newspaper size={18} /> News
      </button>

      <Modal isOpen={mobileOpen} onClose={() => setMobileOpen(false)} title="E-waste news" size="lg">
        <p className="mb-4 text-xs leading-5" style={{ color: 'var(--text-tertiary)' }}>{newsDemoNotice}</p>
        <div className="space-y-2">{newsArticles.slice(0, 4).map((article) => <NewsCard key={article.id} article={article} variant="compact" />)}</div>
        <Link to="/news" onClick={() => setMobileOpen(false)} className="mt-5 flex min-h-11 items-center justify-center gap-2 rounded-xl text-sm font-bold text-white" style={{ backgroundColor: 'var(--primary)' }}>View All News <ArrowRight size={15} /></Link>
      </Modal>
    </>
  );
};

export default FloatingNews;
