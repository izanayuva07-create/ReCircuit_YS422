import React from 'react';
import { ArrowDown, ArrowRight, Battery, CheckCircle2, Factory, HandCoins, Leaf, Recycle, ShieldCheck, Truck, UploadCloud } from 'lucide-react';
import { Link } from 'react-router-dom';
import AnimatedNumber from '../components/AnimatedNumber';
import BrandLogo from '../components/BrandLogo';
import Carousel from '../components/Carousel';
import FeatureCard from '../components/FeatureCard';
import Reveal from '../components/Reveal';
import heroImage from '../assets/hero-circular-economy.jpg';
import batteryImage from '../assets/battery-safety.jpg';
import { awarenessDisclaimer, landingCarouselSlides, landingStats } from '../data/awareness';

const ecosystemRoles = [
  { title: 'Source', statement: 'Sell responsibly.', description: 'List unwanted electronics, compare fair offers and follow every hand-off.', icon: UploadCloud, label: '01' },
  { title: 'Collector', statement: 'Collect fairly.', description: 'Discover nearby jobs, verify pickup and build transparent digital lots.', icon: Truck, label: '02' },
  { title: 'Authorized Recycler', statement: 'Recycle formally.', description: 'Review incoming lots, confirm receipt and close the traceability loop.', icon: Factory, label: '03' },
];

const LandingPage: React.FC = () => (
  <div className="page-enter flex flex-col overflow-hidden">
    <section className="relative pb-16 pt-12 sm:pb-20 sm:pt-16 lg:min-h-[calc(100vh-6.5rem)] lg:pb-24 lg:pt-20">
      <div className="pointer-events-none absolute -left-36 top-16 h-80 w-80 rounded-full bg-emerald-300/15 blur-3xl" />
      <div className="max-container relative grid items-center gap-12 lg:grid-cols-[0.88fr_1.12fr] lg:gap-14">
        <div className="relative z-10 flex flex-col items-start">
          <span className="eyebrow"><span className="h-1.5 w-1.5 rounded-full bg-emerald-600" />India’s traceable e-waste ecosystem</span>
          <h1 className="mt-7 max-w-[12ch] text-[clamp(3.2rem,7vw,6.8rem)] font-extrabold leading-[0.91] tracking-[-0.072em]" style={{ color: 'var(--text-primary)' }}>
            Give electronics <span style={{ color: 'var(--primary)' }}>a second life.</span>
          </h1>
          <p className="mt-7 max-w-xl text-base leading-7 sm:text-lg sm:leading-8" style={{ color: 'var(--text-secondary)' }}>
            Re-Circuit connects Sources, Collectors and Authorized Recyclers through a transparent and traceable e-waste ecosystem.
          </p>
          <div className="mt-8 flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
            <Link to="/select-role" className="premium-button inline-flex min-h-12 items-center justify-center gap-2 rounded-xl px-6 text-sm font-bold text-white" style={{ backgroundColor: 'var(--primary)' }}>
              Recycle E-Waste <ArrowRight size={17} />
            </Link>
            <Link to="/#how-it-works" className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl border px-6 text-sm font-bold transition-colors hover:bg-white" style={{ borderColor: 'var(--border-strong)', color: 'var(--text-primary)' }}>
              Explore How It Works <ArrowDown size={16} />
            </Link>
          </div>
          <div className="mt-10 border-l-2 pl-4" style={{ borderColor: 'var(--primary-light)' }}>
            <BrandLogo size="sm" showTagline />
          </div>
        </div>

        <div className="relative mx-auto w-full max-w-[42rem] lg:mx-0">
          <div className="hero-float relative aspect-[0.92] overflow-hidden rounded-[2rem] border bg-emerald-950 shadow-[0_36px_90px_rgba(6,44,28,0.2)] sm:aspect-[1.08] lg:aspect-[0.98]" style={{ borderColor: 'rgba(255,255,255,0.6)' }}>
            <img src={heroImage} alt="Electronics being sorted responsibly in a modern recovery facility" fetchPriority="high" className="h-full w-full object-cover object-center" />
            <div className="absolute inset-0 bg-gradient-to-t from-[#041b12]/75 via-transparent to-white/5" />
            <div className="absolute inset-x-5 bottom-5 rounded-2xl border border-white/20 bg-black/20 p-4 text-white backdrop-blur-xl sm:inset-x-auto sm:bottom-7 sm:left-7 sm:max-w-[19rem] sm:p-5">
              <div className="flex items-center gap-2 text-xs font-semibold text-white/70"><CheckCircle2 size={15} className="text-emerald-300" /> End-to-end visibility</div>
              <p className="mt-2 text-lg font-bold tracking-[-0.02em]">From doorstep to formal recovery.</p>
            </div>
          </div>
          <div className="absolute -right-2 top-8 hidden rounded-2xl border border-white/70 bg-white/82 p-4 shadow-xl backdrop-blur-xl sm:block lg:-right-5">
            <div className="flex items-center gap-3">
              <span className="grid h-10 w-10 place-items-center rounded-xl" style={{ backgroundColor: 'var(--primary-subtle)', color: 'var(--primary)' }}><Recycle size={20} /></span>
              <span><span className="block text-xs font-semibold" style={{ color: 'var(--text-secondary)' }}>Transparent journey</span><span className="block text-sm font-bold" style={{ color: 'var(--text-primary)' }}>9 traceable stages</span></span>
            </div>
          </div>
          <div className="absolute -bottom-5 left-5 hidden rounded-2xl border border-white/70 bg-white/86 p-4 shadow-xl backdrop-blur-xl sm:block lg:-left-6">
            <div className="flex items-center gap-3">
              <span className="grid h-10 w-10 place-items-center rounded-xl bg-amber-50 text-amber-700"><HandCoins size={20} /></span>
              <span><span className="block text-xs font-semibold" style={{ color: 'var(--text-secondary)' }}>Fair local collection</span><span className="block text-sm font-bold" style={{ color: 'var(--text-primary)' }}>Compare verified offers</span></span>
            </div>
          </div>
        </div>
      </div>
    </section>

    <section className="border-y" style={{ borderColor: 'var(--border)', backgroundColor: 'rgba(255,254,250,0.65)' }} aria-labelledby="impact-title">
      <div className="max-container py-9">
        <div className="mb-6 flex flex-col justify-between gap-2 sm:flex-row sm:items-end">
          <div><span className="eyebrow">Hackathon snapshot</span><h2 id="impact-title" className="mt-2 text-xl font-bold tracking-[-0.025em]">A circular system made visible</h2></div>
          <p className="max-w-lg text-xs leading-5" style={{ color: 'var(--text-tertiary)' }}>{awarenessDisclaimer}</p>
        </div>
        <div className="grid grid-cols-2 gap-px overflow-hidden rounded-2xl border bg-[var(--border)] lg:grid-cols-4" style={{ borderColor: 'var(--border)' }}>
          {landingStats.map((stat) => (
            <div key={stat.label} className="bg-[var(--surface)] p-5 sm:p-6">
              <p className="text-2xl font-extrabold tracking-[-0.045em] sm:text-3xl" style={{ color: 'var(--primary)' }}>
                <AnimatedNumber value={stat.value} decimals={stat.value % 1 === 0 ? 0 : 1} suffix={stat.unit === '%' ? '%' : ''} />
              </p>
              <p className="mt-1 text-xs font-medium leading-5" style={{ color: 'var(--text-secondary)' }}>{stat.label}{stat.unit !== '%' ? ` · ${stat.unit}` : ''}</p>
            </div>
          ))}
        </div>
      </div>
    </section>

    <section id="awareness" className="section-space">
      <div className="max-container">
        <Reveal className="mb-9 flex flex-col justify-between gap-5 md:flex-row md:items-end">
          <div className="max-w-2xl"><span className="eyebrow">Knowledge becomes action</span><h2 className="mt-4 text-3xl font-bold leading-tight tracking-[-0.045em] sm:text-5xl">See the problem. Understand the opportunity.</h2></div>
          <p className="max-w-md text-sm leading-6" style={{ color: 'var(--text-secondary)' }}>Six short stories explain safer handling, material recovery and why every responsible hand-off matters.</p>
        </Reveal>
        <Reveal delay={100}><Carousel slides={landingCarouselSlides} autoplay autoplayInterval={6500} /></Reveal>
      </div>
    </section>

    <section id="how-it-works" className="section-space border-y" style={{ borderColor: 'var(--border)', backgroundColor: 'var(--background-deep)' }}>
      <div className="max-container">
        <Reveal className="mx-auto max-w-3xl text-center">
          <span className="eyebrow mx-auto">Three-part ecosystem</span>
          <h2 className="mt-4 text-3xl font-bold tracking-[-0.045em] sm:text-5xl">Every role matters. Every hand-off counts.</h2>
          <p className="mx-auto mt-5 max-w-2xl text-sm leading-7 sm:text-base" style={{ color: 'var(--text-secondary)' }}>One shared chain gives people a fair route out, collectors useful tools, and authorized recyclers clearer incoming material.</p>
        </Reveal>

        <div className="relative mt-12 grid gap-4 lg:grid-cols-[1fr_auto_1fr_auto_1fr_auto_0.8fr] lg:items-stretch">
          {ecosystemRoles.map(({ title, statement, description, icon: Icon, label }, index) => (
            <React.Fragment key={title}>
              <Reveal delay={index * 90} className="card relative flex min-h-64 flex-col p-6 sm:p-7">
                <span className="absolute right-5 top-5 text-xs font-bold tracking-widest" style={{ color: 'var(--text-tertiary)' }}>{label}</span>
                <span className="grid h-12 w-12 place-items-center rounded-2xl" style={{ backgroundColor: 'var(--primary-subtle)', color: 'var(--primary)' }}><Icon size={23} /></span>
                <h3 className="mt-8 text-xl font-bold tracking-[-0.025em]">{title}</h3>
                <p className="mt-1 font-semibold" style={{ color: 'var(--primary)' }}>{statement}</p>
                <p className="mt-4 text-sm leading-6" style={{ color: 'var(--text-secondary)' }}>{description}</p>
              </Reveal>
              <div className="flex items-center justify-center py-1 text-[var(--primary)] lg:px-1 lg:py-0" aria-hidden="true">
                <ArrowDown className="lg:-rotate-90" size={21} />
              </div>
            </React.Fragment>
          ))}
          <Reveal delay={280} className="flex min-h-48 flex-col items-center justify-center rounded-[1.5rem] p-6 text-center text-white" style={{ background: 'linear-gradient(150deg, var(--primary), var(--primary-dark))' }}>
            <span className="grid h-14 w-14 place-items-center rounded-full bg-white/12"><Recycle size={27} /></span>
            <h3 className="mt-5 text-lg font-bold">Circular Economy</h3>
            <p className="mt-2 text-xs leading-5 text-white/70">Materials return to productive use.</p>
          </Reveal>
        </div>
        <div className="mt-9 text-center"><Link to="/select-role" className="inline-flex min-h-11 items-center gap-2 text-sm font-bold" style={{ color: 'var(--primary)' }}>Choose your role <ArrowRight size={16} /></Link></div>
      </div>
    </section>

    <section className="section-space">
      <div className="max-container">
        <Reveal className="mb-9 max-w-2xl"><span className="eyebrow">Designed for trust</span><h2 className="mt-4 text-3xl font-bold tracking-[-0.04em] sm:text-4xl">Simple at every step. Accountable end to end.</h2></Reveal>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <FeatureCard icon={ShieldCheck} title="Verified network" description="Role-aware journeys connect sources and collectors with authorized recycler workflows." />
          <FeatureCard icon={HandCoins} title="Fairer decisions" description="Clear item details, estimates and collector offers make the hand-off easier to compare." />
          <FeatureCard icon={Recycle} title="Full traceability" description="A shared transaction timeline follows material from listing to confirmed processing." />
          <FeatureCard icon={Leaf} title="Impact made tangible" description="Simple impact summaries turn responsible actions into understandable outcomes." />
        </div>
      </div>
    </section>

    <section className="section-space border-y" style={{ borderColor: 'var(--border)', backgroundColor: 'var(--surface)' }}>
      <div className="max-container grid items-center gap-10 lg:grid-cols-2 lg:gap-16">
        <Reveal className="relative overflow-hidden rounded-[1.75rem]">
          <img src={batteryImage} alt="A technician handling lithium batteries in separated safety trays" loading="lazy" className="image-zoom aspect-[4/3] w-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
          <span className="absolute bottom-5 left-5 inline-flex items-center gap-2 rounded-full bg-black/25 px-3 py-2 text-xs font-bold text-white backdrop-blur-md"><Battery size={15} /> Handle batteries with care</span>
        </Reveal>
        <Reveal delay={100}>
          <span className="eyebrow">Safety before speed</span>
          <h2 className="mt-4 text-3xl font-bold leading-tight tracking-[-0.045em] sm:text-5xl">Know what to isolate before pickup.</h2>
          <p className="mt-5 max-w-xl text-sm leading-7 sm:text-base" style={{ color: 'var(--text-secondary)' }}>Damaged batteries and broken electronics need different handling. Re-Circuit keeps practical safety guidance close to the action.</p>
          <div className="mt-7 grid gap-3 sm:grid-cols-2">
            {['Swollen battery guidance', 'Data-removal checklist', 'Safe storage reminders', 'Transport precautions'].map((item) => (
              <div key={item} className="flex items-center gap-2 text-sm font-semibold"><CheckCircle2 size={17} style={{ color: 'var(--primary)' }} />{item}</div>
            ))}
          </div>
          <Link to="/safety" className="mt-8 inline-flex min-h-11 items-center gap-2 text-sm font-bold" style={{ color: 'var(--primary)' }}>Open the safety centre <ArrowRight size={16} /></Link>
        </Reveal>
      </div>
    </section>

    <section id="about" className="section-space">
      <Reveal className="max-container">
        <div className="relative overflow-hidden rounded-[2rem] px-6 py-14 text-center text-white sm:px-12 sm:py-20" style={{ background: 'linear-gradient(135deg, #0a6a45 0%, #06452f 65%, #062f22 100%)' }}>
          <div className="pointer-events-none absolute -right-20 -top-24 h-72 w-72 rounded-full border border-white/10" />
          <div className="pointer-events-none absolute -right-8 -top-12 h-44 w-44 rounded-full border border-white/10" />
          <span className="eyebrow mx-auto !text-emerald-200">About Re-Circuit</span>
          <h2 className="mx-auto mt-5 max-w-3xl text-3xl font-bold leading-tight tracking-[-0.045em] sm:text-5xl">A cleaner electronics journey, built around the people who make it possible.</h2>
          <p className="mx-auto mt-6 max-w-2xl text-sm leading-7 text-white/72 sm:text-base">Re-Circuit is a hackathon platform concept for transparent, traceable and fair e-waste movement across Sources, Collectors and Authorized Recyclers.</p>
          <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
            <Link to="/select-role" className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-white px-6 text-sm font-bold" style={{ color: 'var(--primary-dark)' }}>Get Started <ArrowRight size={17} /></Link>
            <Link to="/awareness" className="inline-flex min-h-12 items-center justify-center rounded-xl border border-white/25 bg-white/5 px-6 text-sm font-bold text-white">Explore Awareness</Link>
          </div>
          <div className="mt-10 flex justify-center"><BrandLogo size="md" className="rounded-2xl bg-white px-4 py-3" /></div>
        </div>
      </Reveal>
    </section>
  </div>
);

export default LandingPage;
