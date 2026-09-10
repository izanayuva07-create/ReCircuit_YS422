import React from 'react';
import { ArrowUpRight, Clock3 } from 'lucide-react';
import { Link } from 'react-router-dom';
import type { NewsArticle } from '../data/news';

interface NewsCardProps {
  article: NewsArticle;
  variant?: 'standard' | 'compact' | 'featured';
  className?: string;
}

const formatNewsDate = (date: string) => new Intl.DateTimeFormat('en-IN', {
  day: 'numeric', month: 'short', year: 'numeric',
}).format(new Date(date));

const NewsCard: React.FC<NewsCardProps> = ({ article, variant = 'standard', className = '' }) => {
  if (variant === 'compact') {
    return (
      <Link to={`/news/${article.id}`} className={`group grid grid-cols-[5.5rem_1fr] gap-3 rounded-xl p-2 transition-colors hover:bg-white/65 ${className}`}>
        <img src={article.image} alt="" loading="lazy" className="h-[4.8rem] w-full rounded-lg object-cover" />
        <span className="min-w-0 py-0.5">
          <span className="block text-[0.65rem] font-bold uppercase tracking-[0.1em]" style={{ color: 'var(--primary)' }}>{article.category}</span>
          <span className="mt-1 line-clamp-2 block text-xs font-bold leading-[1.35]" style={{ color: 'var(--text-primary)' }}>{article.title}</span>
          <span className="mt-1 block text-[0.65rem]" style={{ color: 'var(--text-tertiary)' }}>{formatNewsDate(article.date)}</span>
        </span>
      </Link>
    );
  }

  if (variant === 'featured') {
    return (
      <article className={`group relative min-h-[28rem] overflow-hidden rounded-[1.6rem] border shadow-[var(--shadow-md)] sm:min-h-[34rem] ${className}`} style={{ borderColor: 'var(--border)' }}>
        <img src={article.image} alt={article.imageAlt} className="image-zoom absolute inset-0 h-full w-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#061d14]/95 via-[#061d14]/45 to-transparent" />
        <div className="absolute inset-x-0 bottom-0 p-6 text-white sm:p-9">
          <div className="flex flex-wrap items-center gap-3 text-[0.68rem] font-bold uppercase tracking-[0.11em] text-emerald-200"><span>{article.category}</span><span className="h-1 w-1 rounded-full bg-white/50" /><span>{formatNewsDate(article.date)}</span></div>
          <h2 className="mt-4 max-w-3xl text-2xl font-bold leading-tight tracking-[-0.035em] sm:text-4xl">{article.title}</h2>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-white/75 sm:text-base">{article.summary}</p>
          <Link to={`/news/${article.id}`} className="mt-6 inline-flex min-h-11 items-center gap-2 rounded-xl bg-white px-4 text-sm font-bold" style={{ color: 'var(--primary-dark)' }}>Read feature <ArrowUpRight size={16} /></Link>
        </div>
      </article>
    );
  }

  return (
    <article className={`card group flex h-full flex-col overflow-hidden ${className}`}>
      <Link to={`/news/${article.id}`} className="block overflow-hidden" aria-label={`Read ${article.title}`}>
        <img src={article.image} alt={article.imageAlt} loading="lazy" className="image-zoom aspect-[16/10] w-full object-cover" />
      </Link>
      <div className="flex flex-1 flex-col p-5">
        <div className="flex items-center justify-between gap-3 text-[0.67rem] font-bold uppercase tracking-[0.09em]"><span style={{ color: 'var(--primary)' }}>{article.category}</span><span className="normal-case tracking-normal" style={{ color: 'var(--text-tertiary)' }}>{formatNewsDate(article.date)}</span></div>
        <h2 className="mt-3 text-lg font-bold leading-snug tracking-[-0.025em]" style={{ color: 'var(--text-primary)' }}><Link to={`/news/${article.id}`} className="hover:text-[var(--primary)]">{article.title}</Link></h2>
        <p className="mt-3 line-clamp-3 text-sm leading-6" style={{ color: 'var(--text-secondary)' }}>{article.summary}</p>
        <div className="mt-auto flex items-center justify-between pt-5">
          <span className="inline-flex items-center gap-1.5 text-xs" style={{ color: 'var(--text-tertiary)' }}><Clock3 size={13} />{article.readingTime}</span>
          <Link to={`/news/${article.id}`} className="grid h-9 w-9 place-items-center rounded-full border transition-colors group-hover:bg-[var(--primary)] group-hover:text-white" style={{ borderColor: 'var(--border-strong)', color: 'var(--primary)' }} aria-label={`Read ${article.title}`}><ArrowUpRight size={16} /></Link>
        </div>
      </div>
    </article>
  );
};

export default NewsCard;
