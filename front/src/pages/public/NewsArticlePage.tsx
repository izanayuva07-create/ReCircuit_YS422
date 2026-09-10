import React from 'react';
import { ArrowLeft, Clock3, Newspaper } from 'lucide-react';
import { Link, useParams } from 'react-router-dom';
import NewsCard from '../../components/NewsCard';
import { findNewsArticle, newsArticles, newsDemoNotice } from '../../data/news';

const formatDate = (date: string) => new Intl.DateTimeFormat('en-IN', { dateStyle: 'long' }).format(new Date(date));

const NewsArticlePage: React.FC = () => {
  const { id = '' } = useParams();
  const article = findNewsArticle(id);

  if (!article) {
    return <main className="max-container flex min-h-[60vh] flex-col items-center justify-center py-20 text-center"><span className="grid h-14 w-14 place-items-center rounded-2xl" style={{ backgroundColor: 'var(--primary-subtle)', color: 'var(--primary)' }}><Newspaper /></span><h1 className="mt-5 text-3xl font-bold">Story not found</h1><p className="mt-2 text-sm" style={{ color: 'var(--text-secondary)' }}>This local demo article may have moved.</p><Link to="/news" className="mt-6 inline-flex min-h-11 items-center gap-2 rounded-xl px-4 text-sm font-bold text-white" style={{ backgroundColor: 'var(--primary)' }}><ArrowLeft size={16} />Back to news</Link></main>;
  }

  const related = newsArticles.filter((item) => item.id !== article.id).slice(0, 3);

  return (
    <article className="page-enter pb-20">
      <header className="max-container pb-10 pt-12 sm:pt-16">
        <Link to="/news" className="inline-flex min-h-11 items-center gap-2 text-sm font-bold" style={{ color: 'var(--primary)' }}><ArrowLeft size={16} />All demo news</Link>
        <div className="mx-auto mt-8 max-w-4xl text-center"><span className="eyebrow mx-auto">{article.category}</span><h1 className="mt-5 text-4xl font-extrabold leading-[1.04] tracking-[-0.055em] sm:text-6xl">{article.title}</h1><p className="mx-auto mt-6 max-w-2xl text-base leading-7 sm:text-lg" style={{ color: 'var(--text-secondary)' }}>{article.summary}</p><div className="mt-6 flex flex-wrap items-center justify-center gap-3 text-xs font-semibold" style={{ color: 'var(--text-tertiary)' }}><span>{formatDate(article.date)}</span><span className="h-1 w-1 rounded-full bg-current" /><span className="inline-flex items-center gap-1.5"><Clock3 size={14} />{article.readingTime}</span></div></div>
      </header>

      <div className="max-container"><img src={article.image} alt={article.imageAlt} className="max-h-[42rem] w-full rounded-[1.7rem] object-cover shadow-[var(--shadow-md)]" /></div>

      <div className="max-container mt-10 grid items-start gap-10 lg:grid-cols-[minmax(0,1fr)_18rem]">
        <div className="mx-auto max-w-3xl"><p className="mb-7 rounded-xl border px-4 py-3 text-xs leading-5" style={{ borderColor: 'var(--border)', backgroundColor: 'var(--primary-subtle)', color: 'var(--text-secondary)' }}>{newsDemoNotice}</p><div className="space-y-6">{article.content.map((paragraph) => <p key={paragraph.slice(0, 42)} className="text-base leading-8 sm:text-lg sm:leading-9" style={{ color: 'var(--text-secondary)' }}>{paragraph}</p>)}</div><div className="mt-10 rounded-2xl p-6" style={{ backgroundColor: 'var(--primary-dark)', color: '#fff' }}><h2 className="text-xl font-bold">Ready to choose a responsible route?</h2><p className="mt-2 text-sm leading-6 text-white/70">Create a Re-Circuit demo account as a Source, Collector or Recycler and explore the complete hand-off journey.</p><Link to="/select-role" className="mt-5 inline-flex min-h-11 items-center rounded-xl bg-white px-4 text-sm font-bold" style={{ color: 'var(--primary-dark)' }}>Explore the ecosystem</Link></div></div>
        <aside className="card p-5 lg:sticky lg:top-32"><span className="eyebrow">Keep learning</span><h2 className="mt-3 text-lg font-bold">Practical awareness</h2><p className="mt-2 text-sm leading-6" style={{ color: 'var(--text-secondary)' }}>Explore safety guidance and responsible disposal basics before your next hand-off.</p><div className="mt-4 flex flex-col gap-2"><Link to="/safety" className="rounded-xl border px-3 py-2.5 text-sm font-bold" style={{ borderColor: 'var(--border)' }}>Safety centre</Link><Link to="/awareness" className="rounded-xl border px-3 py-2.5 text-sm font-bold" style={{ borderColor: 'var(--border)' }}>Awareness centre</Link></div></aside>
      </div>

      <section className="max-container mt-20"><span className="eyebrow">More from the demo desk</span><div className="mt-5 grid gap-5 md:grid-cols-3">{related.map((item) => <NewsCard key={item.id} article={item} />)}</div></section>
    </article>
  );
};

export default NewsArticlePage;
