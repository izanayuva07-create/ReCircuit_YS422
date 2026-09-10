import React, { useCallback, useEffect, useState } from 'react';
import { ArrowRight, ChevronLeft, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';

export interface CarouselSlide {
  id: string;
  title: string;
  subtitle: string;
  category: string;
  image?: string;
  imageAlt?: string;
  ctaLabel?: string;
  ctaHref?: string;
}

interface CarouselProps {
  slides: CarouselSlide[];
  autoplay?: boolean;
  autoplayInterval?: number;
  className?: string;
}

const Carousel: React.FC<CarouselProps> = ({
  slides,
  autoplay = true,
  autoplayInterval = 6000,
  className = '',
}) => {
  const [current, setCurrent] = useState(0);
  const [paused, setPaused] = useState(false);
  const [touchStart, setTouchStart] = useState<number | null>(null);

  const goTo = useCallback((index: number) => {
    if (slides.length < 1) return;
    setCurrent((index + slides.length) % slides.length);
  }, [slides.length]);
  const goNext = useCallback(() => goTo(current + 1), [current, goTo]);
  const goPrev = useCallback(() => goTo(current - 1), [current, goTo]);

  useEffect(() => {
    if (!autoplay || paused || slides.length < 2) return;
    const timer = window.setInterval(goNext, autoplayInterval);
    return () => window.clearInterval(timer);
  }, [autoplay, autoplayInterval, goNext, paused, slides.length]);

  if (slides.length === 0) return null;

  const safeCurrent = current < slides.length ? current : 0;
  const slide = slides[safeCurrent];

  return (
    <div
      className={`group relative min-h-[30rem] overflow-hidden rounded-[1.6rem] border sm:min-h-[34rem] lg:min-h-[39rem] ${className}`}
      style={{ borderColor: 'rgba(255,255,255,0.24)', backgroundColor: 'var(--primary-dark)', boxShadow: 'var(--shadow-lg)' }}
      role="region"
      aria-roledescription="carousel"
      aria-label="E-waste awareness stories"
      tabIndex={0}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocusCapture={() => setPaused(true)}
      onBlurCapture={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) setPaused(false);
      }}
      onKeyDown={(event) => {
        if (event.key === 'ArrowRight') { event.preventDefault(); goNext(); }
        if (event.key === 'ArrowLeft') { event.preventDefault(); goPrev(); }
      }}
      onTouchStart={(event) => setTouchStart(event.touches[0]?.clientX ?? null)}
      onTouchEnd={(event) => {
        if (touchStart === null) return;
        const distance = touchStart - (event.changedTouches[0]?.clientX ?? touchStart);
        if (Math.abs(distance) > 45) {
          if (distance > 0) goNext();
          else goPrev();
        }
        setTouchStart(null);
      }}
    >
      <div className="absolute inset-0">
        {slides.map((item, index) => (
          <div
            key={item.id}
            className={`absolute inset-0 transition-opacity duration-700 ${index === safeCurrent ? 'opacity-100' : 'opacity-0'}`}
            aria-hidden={index !== safeCurrent}
          >
            {item.image ? (
              <img
                src={item.image}
                alt={index === safeCurrent ? item.imageAlt ?? '' : ''}
                loading={index === 0 ? 'eager' : 'lazy'}
                fetchPriority={index === 0 ? 'high' : 'auto'}
                className={`h-full w-full object-cover transition-transform duration-[6500ms] ${index === safeCurrent && !paused ? 'scale-[1.045]' : 'scale-100'}`}
              />
            ) : (
              <div className="h-full w-full" style={{ background: 'linear-gradient(135deg, #0b6b45, #071f16)' }} />
            )}
          </div>
        ))}
      </div>

      <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(5,22,15,0.92)_0%,rgba(5,22,15,0.72)_38%,rgba(5,22,15,0.15)_72%,rgba(5,22,15,0.22)_100%)]" />
      <div className="absolute inset-x-0 bottom-0 h-48 bg-gradient-to-t from-black/60 to-transparent" />

      <div key={slide.id} className="page-enter relative z-10 flex min-h-[30rem] max-w-2xl flex-col justify-end p-6 pb-24 sm:min-h-[34rem] sm:p-10 sm:pb-24 lg:min-h-[39rem] lg:p-14 lg:pb-28">
        <span className="eyebrow mb-5 !text-emerald-200"><span className="h-1.5 w-1.5 rounded-full bg-emerald-300" />{slide.category}</span>
        <h3 className="max-w-xl text-3xl font-bold leading-[1.06] tracking-[-0.04em] text-white sm:text-5xl">{slide.title}</h3>
        <p className="mt-4 max-w-lg text-sm leading-7 text-white/76 sm:text-base">{slide.subtitle}</p>
        {slide.ctaHref && (
          <Link to={slide.ctaHref} className="mt-7 inline-flex w-fit min-h-11 items-center gap-2 rounded-xl border border-white/25 bg-white/12 px-4 py-2 text-sm font-semibold text-white backdrop-blur-md transition-colors hover:bg-white/20">
            {slide.ctaLabel ?? 'Learn more'} <ArrowRight size={16} />
          </Link>
        )}
      </div>

      <div className="absolute inset-x-5 bottom-5 z-20 flex items-center gap-3 sm:inset-x-9 sm:bottom-8">
        <button type="button" onClick={goPrev} className="touch-target grid place-items-center rounded-full border border-white/25 bg-black/20 text-white backdrop-blur-md transition-colors hover:bg-white/15" aria-label="Previous awareness story">
          <ChevronLeft size={19} />
        </button>
        <div className="flex min-w-0 flex-1 items-center gap-3" aria-hidden="true">
          <span className="w-6 text-[0.68rem] font-bold tabular-nums text-white">{String(safeCurrent + 1).padStart(2, '0')}</span>
          <span className="relative h-px min-w-0 flex-1 overflow-hidden rounded-full bg-white/25">
            <span
              key={`${slide.id}-${paused}`}
              className="absolute inset-y-0 left-0 bg-white"
              style={{ width: paused || !autoplay ? `${((safeCurrent + 1) / slides.length) * 100}%` : undefined, animation: !paused && autoplay ? `carousel-progress ${autoplayInterval}ms linear forwards` : undefined }}
            />
          </span>
          <span className="w-6 text-right text-[0.68rem] font-bold tabular-nums text-white/60">{String(slides.length).padStart(2, '0')}</span>
        </div>
        <button type="button" onClick={goNext} className="touch-target grid place-items-center rounded-full border border-white/25 bg-black/20 text-white backdrop-blur-md transition-colors hover:bg-white/15" aria-label="Next awareness story">
          <ChevronRight size={19} />
        </button>
      </div>
      <p className="sr-only" aria-live="polite">Slide {safeCurrent + 1} of {slides.length}: {slide.title}</p>
    </div>
  );
};

export default Carousel;
