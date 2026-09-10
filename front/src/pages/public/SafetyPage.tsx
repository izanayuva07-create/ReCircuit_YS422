import React, { useMemo, useState } from 'react';
import { CheckCircle2, Search, ShieldCheck, Volume2, VolumeX } from 'lucide-react';
import Button from '../../components/Button';
import EmptyState from '../../components/EmptyState';
import FilterBar from '../../components/FilterBar';
import SearchBar from '../../components/SearchBar';
import { safetyCards } from '../../data/safety';
import { appIconMap } from '../../utils/icons';
import batteryImage from '../../assets/battery-safety.jpg';

const filters = [
  { label: 'All', value: 'all' },
  ...safetyCards.map((card) => ({ label: card.category, value: card.id })),
];

const SafetyPage: React.FC = () => {
  const [activeFilter, setActiveFilter] = useState('all');
  const [query, setQuery] = useState('');
  const [speakingId, setSpeakingId] = useState<string | null>(null);

  const visibleCards = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    return safetyCards.filter((card) => {
      const matchesFilter = activeFilter === 'all' || card.id === activeFilter;
      const matchesQuery = !normalizedQuery
        || `${card.title} ${card.body} ${card.category} ${card.tips.join(' ')}`.toLowerCase().includes(normalizedQuery);
      return matchesFilter && matchesQuery;
    });
  }, [activeFilter, query]);

  const toggleSpeech = (id: string, text: string) => {
    if (!('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();
    if (speakingId === id) {
      setSpeakingId(null);
      return;
    }
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'en-IN';
    utterance.rate = 0.92;
    utterance.onend = () => setSpeakingId(null);
    utterance.onerror = () => setSpeakingId(null);
    setSpeakingId(id);
    window.speechSynthesis.speak(utterance);
  };

  return (
    <div className="page-enter">
      <section className="border-b" style={{ backgroundColor: 'var(--primary-subtle)', borderColor: 'var(--border)' }}>
        <div className="max-container py-12 md:py-16 flex flex-col md:flex-row md:items-center gap-8">
          <div className="flex-1">
            <span className="eyebrow">
              <ShieldCheck size={16} /> Safety guide
            </span>
            <h1 className="mt-4 text-4xl font-extrabold tracking-[-0.05em] md:text-6xl" style={{ color: 'var(--text-primary)' }}>Handle e-waste safely.</h1>
            <p className="text-sm md:text-base leading-relaxed mt-3 max-w-2xl" style={{ color: 'var(--text-secondary)' }}>
              Practical guidance for storing, moving, and handing over electronics. If an item is hot, smoking, leaking, or swollen, move away and contact local emergency services.
            </p>
          </div>
          <div className="group relative aspect-[4/3] w-full overflow-hidden rounded-[1.7rem] shadow-[var(--shadow-md)] md:w-[24rem]">
            <img src={batteryImage} alt="A trained worker handling batteries in a clean safety station" className="image-zoom h-full w-full object-cover" />
            <span className="absolute bottom-4 left-4 grid h-11 w-11 place-items-center rounded-xl bg-white/85 backdrop-blur-md" style={{ color: 'var(--primary)' }}><ShieldCheck size={22} /></span>
          </div>
        </div>
      </section>

      <section className="max-container py-10 md:py-14">
        <div className="flex flex-col gap-4 mb-8">
          <SearchBar value={query} onChange={setQuery} placeholder="Search safety guidance" />
          <FilterBar filters={filters} active={activeFilter} onChange={setActiveFilter} />
        </div>

        {visibleCards.length === 0 ? (
          <EmptyState icon={Search} title="No guidance found" description="Try clearing the search or choosing another category." actionLabel="Clear search" onAction={() => { setQuery(''); setActiveFilter('all'); }} />
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            {visibleCards.map((card) => {
              const Icon = appIconMap[card.icon] ?? ShieldCheck;
              const speechText = `${card.title}. ${card.body}. ${card.tips.join('. ')}`;
              return (
                <article key={card.id} className="card p-5 md:p-6">
                  <div className="flex items-start gap-4">
                    <div className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0" style={{ backgroundColor: 'var(--primary-subtle)', color: 'var(--primary)' }}>
                      <Icon size={22} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <span className="text-xs font-medium" style={{ color: 'var(--primary)' }}>{card.category}</span>
                      <h2 className="text-base font-bold mt-0.5" style={{ color: 'var(--text-primary)' }}>{card.title}</h2>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      leftIcon={speakingId === card.id ? <VolumeX size={16} /> : <Volume2 size={16} />}
                      onClick={() => toggleSpeech(card.id, speechText)}
                      aria-label={speakingId === card.id ? `Stop reading ${card.title}` : `Read ${card.title} aloud`}
                    >
                      <span className="hidden sm:inline">{speakingId === card.id ? 'Stop' : 'Listen'}</span>
                    </Button>
                  </div>
                  <p className="text-sm leading-relaxed mt-4" style={{ color: 'var(--text-secondary)' }}>{card.body}</p>
                  <ul className="mt-4 flex flex-col gap-2.5">
                    {card.tips.map((tip) => (
                      <li key={tip} className="flex items-start gap-2 text-sm" style={{ color: 'var(--text-primary)' }}>
                        <CheckCircle2 size={16} className="mt-0.5 flex-shrink-0" style={{ color: 'var(--primary)' }} />
                        <span>{tip}</span>
                      </li>
                    ))}
                  </ul>
                </article>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
};

export default SafetyPage;
