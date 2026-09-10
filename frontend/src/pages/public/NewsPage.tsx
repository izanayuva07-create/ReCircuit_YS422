import React, { useMemo, useState } from 'react';
import { BookOpen, Search, ShieldCheck } from 'lucide-react';
import { Link } from 'react-router-dom';
import NewsCard from '../../components/NewsCard';
import Reveal from '../../components/Reveal';
import { newsArticles, newsCategories, newsDemoNotice } from '../../data/news';

const NewsPage: React.FC = () => {
  const [category, setCategory] = useState<(typeof newsCategories)[number]>('All');
  const [query, setQuery] = useState('');

  const filtered = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    return newsArticles.filter((article) => (
      (category === 'All' || article.category === category)
      && (!normalized || `${article.title} ${article.summary} ${article.category}`.toLowerCase().includes(normalized))
    ));
  }, [category, query]);

  const featured = filtered[0];

  return (
    <div className="page-enter">
      <header className="max-container pb-10 pt-16 sm:pb-14 sm:pt-20">
        <div className="max-w-3xl"><span className="eyebrow">Re-Circuit newsroom</span><h1 className="mt-5 text-4xl font-extrabold tracking-[-0.055em] sm:text-6xl">Signals for a more circular electronics future.</h1><p className="mt-5 max-w-2xl text-base leading-7" style={{ color: 'var(--text-secondary)' }}>Local demo stories about e-waste safety, collection, material recovery and the people connecting each stage.</p></div>
        <div className="mt-7 inline-flex max-w-2xl items-start gap-2 rounded-xl border px-3 py-2 text-xs leading-5" style={{ borderColor: 'var(--border)', backgroundColor: 'var(--primary-subtle)', color: 'var(--text-secondary)' }}><BookOpen size={15} className="mt-0.5 flex-none" style={{ color: 'var(--primary)' }} />{newsDemoNotice}</div>
      </header>

      <main className="max-container pb-20">
        <div className="sticky top-[5.7rem] z-20 mb-8 rounded-2xl border bg-[rgba(243,247,243,0.88)] p-3 backdrop-blur-xl" style={{ borderColor: 'var(--border)' }}>
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
            <label className="relative block lg:w-80" htmlFor="news-search"><Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2" size={17} style={{ color: 'var(--text-tertiary)' }} /><span className="sr-only">Search demo news</span><input id="news-search" type="search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search stories" className="min-h-11 w-full rounded-xl border bg-white/90 pl-10 pr-3 text-sm outline-none transition-shadow focus:ring-2 focus:ring-emerald-600/20" style={{ borderColor: 'var(--border)' }} /></label>
            <div className="no-scrollbar flex gap-2 overflow-x-auto" aria-label="News categories">{newsCategories.map((item) => <button type="button" key={item} onClick={() => setCategory(item)} aria-pressed={category === item} className="min-h-10 flex-none rounded-xl px-3 text-xs font-bold transition-colors" style={{ color: category === item ? '#fff' : 'var(--text-secondary)', backgroundColor: category === item ? 'var(--primary)' : 'var(--surface)' }}>{item}</button>)}</div>
          </div>
        </div>

        {featured ? (
          <>
            <Reveal><NewsCard article={featured} variant="featured" /></Reveal>
            <div className="mt-10 grid items-start gap-8 lg:grid-cols-[minmax(0,1fr)_19rem]">
              <section aria-label="More demo news" className="grid gap-5 sm:grid-cols-2">{filtered.slice(1).map((article, index) => <Reveal key={article.id} delay={(index % 2) * 70} as="article"><NewsCard article={article} /></Reveal>)}</section>
              <aside className="space-y-4 lg:sticky lg:top-40">
                <div className="card p-5"><span className="grid h-10 w-10 place-items-center rounded-xl" style={{ backgroundColor: 'var(--primary-subtle)', color: 'var(--primary)' }}><ShieldCheck size={20} /></span><h2 className="mt-5 text-lg font-bold">Turn reading into action</h2><p className="mt-2 text-sm leading-6" style={{ color: 'var(--text-secondary)' }}>Learn how to isolate batteries, protect personal data and prepare electronics for collection.</p><Link to="/safety" className="mt-4 inline-flex text-sm font-bold" style={{ color: 'var(--primary)' }}>Visit the safety centre →</Link></div>
                <div className="card p-5"><span className="eyebrow">Awareness</span><h2 className="mt-3 text-lg font-bold">Why the system matters</h2><p className="mt-2 text-sm leading-6" style={{ color: 'var(--text-secondary)' }}>Explore the environmental and material story behind responsible recycling.</p><Link to="/awareness" className="mt-4 inline-flex text-sm font-bold" style={{ color: 'var(--primary)' }}>Open knowledge centre →</Link></div>
              </aside>
            </div>
          </>
        ) : (
          <div className="card py-20 text-center"><h2 className="text-xl font-bold">No stories match that search</h2><p className="mt-2 text-sm" style={{ color: 'var(--text-secondary)' }}>Try another phrase or choose All.</p><button type="button" onClick={() => { setQuery(''); setCategory('All'); }} className="mt-5 min-h-11 rounded-xl px-4 text-sm font-bold text-white" style={{ backgroundColor: 'var(--primary)' }}>Clear filters</button></div>
        )}
      </main>
    </div>
  );
};

export default NewsPage;
