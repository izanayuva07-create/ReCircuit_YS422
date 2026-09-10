import React, { useMemo, useState } from 'react';
import { ArrowRight, BookOpen, Recycle } from 'lucide-react';
import { Link } from 'react-router-dom';
import AwarenessCard from '../../components/AwarenessCard';
import FilterBar from '../../components/FilterBar';
import SearchBar from '../../components/SearchBar';
import EmptyState from '../../components/EmptyState';
import AnimatedNumber from '../../components/AnimatedNumber';
import Reveal from '../../components/Reveal';
import recoveryImage from '../../assets/material-recovery.jpg';
import { awarenessCards, awarenessDisclaimer, landingStats } from '../../data/awareness';

const categories = [
  { label: 'All topics', value: 'all' },
  ...Array.from(new Set(awarenessCards.map((card) => card.category))).map((category) => ({
    label: category,
    value: category,
  })),
];

const AwarenessPage: React.FC = () => {
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('all');

  const visibleCards = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    return awarenessCards.filter((card) => {
      const matchesCategory = category === 'all' || card.category === category;
      const matchesQuery = !normalizedQuery
        || `${card.title} ${card.body} ${card.category}`.toLowerCase().includes(normalizedQuery);
      return matchesCategory && matchesQuery;
    });
  }, [category, query]);

  return (
    <div className="page-enter">
      <section className="border-b" style={{ borderColor: 'var(--border)' }}>
        <div className="max-container grid items-center gap-10 py-14 md:py-20 lg:grid-cols-[0.9fr_1.1fr]">
          <div className="max-w-2xl">
            <span className="eyebrow"><BookOpen size={15} /> Knowledge centre</span>
            <h1 className="mt-5 text-4xl font-extrabold leading-[1.02] tracking-[-0.055em] md:text-6xl">Understand what is inside the circuit.</h1>
            <p className="mt-5 text-sm leading-7 md:text-base" style={{ color: 'var(--text-secondary)' }}>Learn what electronic waste contains, why safe handling matters, and how responsible recovery protects people, materials and the planet.</p>
            <p className="mt-5 max-w-xl rounded-xl border px-3 py-2 text-xs leading-5" style={{ borderColor: 'var(--border)', backgroundColor: 'var(--primary-subtle)', color: 'var(--text-secondary)' }}>{awarenessDisclaimer}</p>
          </div>
          <div className="group overflow-hidden rounded-[1.7rem] shadow-[var(--shadow-md)]"><img src={recoveryImage} alt="Recovered circuit boards and copper materials in a clean recycling lab" className="image-zoom aspect-[4/3] w-full object-cover" /></div>
        </div>
      </section>

      <section className="max-container -mt-1 pt-8" aria-label="Illustrative awareness metrics"><div className="grid grid-cols-2 gap-px overflow-hidden rounded-2xl border bg-[var(--border)] lg:grid-cols-4" style={{ borderColor: 'var(--border)' }}>{landingStats.map((stat) => <div key={stat.label} className="bg-[var(--surface)] p-5"><p className="text-2xl font-extrabold tracking-[-0.04em]" style={{ color: 'var(--primary)' }}><AnimatedNumber value={stat.value} decimals={stat.value % 1 === 0 ? 0 : 1} suffix={stat.unit === '%' ? '%' : ''} /></p><p className="mt-1 text-xs leading-5" style={{ color: 'var(--text-secondary)' }}>{stat.label}</p></div>)}</div></section>

      <section className="max-container py-10 md:py-14">
        <div className="flex flex-col gap-4 mb-8">
          <SearchBar value={query} onChange={setQuery} placeholder="Search awareness topics" />
          <FilterBar filters={categories} active={category} onChange={setCategory} />
        </div>

        {visibleCards.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {visibleCards.map((card, index) => <Reveal key={card.id} delay={(index % 3) * 50}><AwarenessCard card={card} /></Reveal>)}
          </div>
        ) : (
          <EmptyState
            icon={BookOpen}
            title="No topics found"
            description="Try a different search term or category."
            actionLabel="Clear filters"
            onAction={() => { setQuery(''); setCategory('all'); }}
          />
        )}
      </section>

      <section className="max-container pb-14">
        <div className="rounded-2xl p-6 md:p-8 flex flex-col md:flex-row md:items-center justify-between gap-5" style={{ backgroundColor: 'var(--primary)', color: '#fff' }}>
          <div>
            <div className="flex items-center gap-2 font-semibold"><Recycle size={20} /> Ready to recycle?</div>
            <p className="text-sm text-white/80 mt-1">Turn what you learned into measurable impact.</p>
          </div>
          <Link to="/select-role" className="inline-flex items-center justify-center gap-2 rounded-xl bg-white px-5 py-3 text-sm font-semibold" style={{ color: 'var(--primary)' }}>
            Get started <ArrowRight size={16} />
          </Link>
        </div>
      </section>
    </div>
  );
};

export default AwarenessPage;
