import React, { useEffect, useState } from 'react';
import { Bell, LayoutDashboard, LogIn, Menu, X, Globe, ChevronDown } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import BrandLogo from './BrandLogo';
import { useAuth } from '../context/AuthContext';
import { usePlatform } from '../context/PlatformContext';
import { useLanguage, LANGUAGES } from '../context/LanguageContext';

const Navbar: React.FC = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [langOpen, setLangOpen] = useState(false);
  const { isAuthenticated, user } = useAuth();
  const { unreadNotificationCount } = usePlatform();
  const { language, setLanguage, t } = useLanguage();
  const location = useLocation();

  const publicLinks = [
    { label: t('home'), href: '/' },
    { label: t('howItWorks'), href: '/#how-it-works' },
    { label: 'Payment Gateway', href: '/payments' },
    { label: t('awareness'), href: '/awareness' },
    { label: t('safety'), href: '/safety' },
    { label: t('news'), href: '/news' },
    { label: t('about'), href: '/#about' },
  ];

  useEffect(() => {
    const update = () => setScrolled(window.scrollY > 18);
    update();
    window.addEventListener('scroll', update, { passive: true });
    return () => window.removeEventListener('scroll', update);
  }, []);

  useEffect(() => {
    if (!menuOpen) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = previous; };
  }, [menuOpen]);

  const isActive = (href: string) => {
    const [pathname, hash] = href.split('#');
    if (hash) return location.pathname === pathname && location.hash === `#${hash}`;
    return pathname === '/' ? location.pathname === '/' && !location.hash : location.pathname.startsWith(pathname);
  };

  const closeMenu = () => setMenuOpen(false);

  return (
    <header className="sticky top-0 z-50 w-full px-3 pt-3 sm:px-4 sm:pt-4 pointer-events-none">
      <nav
        aria-label="Primary navigation"
        className={`pointer-events-auto mx-auto max-w-[1240px] rounded-2xl border transition-all duration-300 ${
          scrolled || menuOpen ? 'shadow-[0_14px_45px_rgba(8,42,24,0.12)]' : 'shadow-[0_8px_30px_rgba(8,42,24,0.07)]'
        }`}
        style={{
          backgroundColor: scrolled || menuOpen ? 'rgba(252, 255, 252, 0.94)' : 'rgba(252, 255, 252, 0.76)',
          borderColor: scrolled ? 'var(--border-strong)' : 'rgba(220, 230, 223, 0.82)',
          backdropFilter: 'blur(22px) saturate(1.25)',
          WebkitBackdropFilter: 'blur(22px) saturate(1.25)',
        }}
      >
        <div className="flex h-[4.25rem] items-center justify-between gap-3 px-3 sm:px-5">
          <Link to="/" onClick={closeMenu} className="flex-shrink-0 rounded-lg" aria-label="Re-Circuit home">
            <BrandLogo size="sm" showTagline />
          </Link>

          <div className="hidden items-center gap-0.5 lg:flex">
            {publicLinks.map((link) => (
              <Link
                key={link.href}
                to={link.href}
                aria-current={isActive(link.href) ? 'page' : undefined}
                className="relative rounded-lg px-3 py-2 transition-colors hover:text-[var(--primary)]"
                style={{ fontFamily: 'Inter,sans-serif', fontSize: '0.795rem', fontWeight: 600, color: isActive(link.href) ? 'var(--primary)' : 'var(--text-secondary)', letterSpacing: '-0.005em' }}
              >
                {link.label}
                {isActive(link.href) && <span className="absolute inset-x-3 -bottom-0.5 h-px rounded-full" style={{ backgroundColor: 'var(--primary)' }} />}
              </Link>
            ))}
          </div>

          <div className="hidden items-center gap-2 lg:flex">
            {/* Regional Language Switcher */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setLangOpen(!langOpen)}
                className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border text-xs font-semibold transition-colors bg-white/70 hover:bg-white shadow-sm"
                style={{ borderColor: 'var(--border)', color: 'var(--text-primary)' }}
                aria-label="Change language"
              >
                <Globe size={14} className="text-emerald-600" />
                <span>{LANGUAGES.find((l) => l.code === language)?.flag}</span>
                <span className="font-medium">{LANGUAGES.find((l) => l.code === language)?.nativeName}</span>
                <ChevronDown size={12} className="opacity-60" />
              </button>

              {langOpen && (
                <div
                  className="absolute right-0 mt-2 w-44 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl p-1.5 z-50 flex flex-col gap-0.5 animate-fade-in"
                  style={{ backdropFilter: 'blur(16px)' }}
                >
                  {LANGUAGES.map((lang) => (
                    <button
                      key={lang.code}
                      type="button"
                      onClick={() => {
                        setLanguage(lang.code);
                        setLangOpen(false);
                      }}
                      className={`flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition-all ${
                        language === lang.code
                          ? 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 font-bold'
                          : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                      }`}
                    >
                      <span className="flex items-center gap-2">
                        <span>{lang.flag}</span>
                        <span>{lang.nativeName}</span>
                      </span>
                      <span className="text-[10px] text-slate-400 font-mono">{lang.name}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {isAuthenticated ? (
              <>
                <Link
                  to="/notifications"
                  className="touch-target relative grid place-items-center rounded-xl border transition-colors hover:bg-white"
                  style={{ borderColor: 'var(--border)', color: 'var(--text-secondary)' }}
                  aria-label={`${unreadNotificationCount} unread notifications`}
                >
                  <Bell size={18} />
                  {unreadNotificationCount > 0 && (
                    <span className="absolute right-1 top-1 grid min-h-4 min-w-4 place-items-center rounded-full px-1 text-[9px] font-bold text-white" style={{ backgroundColor: 'var(--danger)' }}>
                      {Math.min(unreadNotificationCount, 9)}
                    </span>
                  )}
                </Link>
                <Link
                  to={`/${user?.role}`}
                  className="premium-button inline-flex min-h-11 items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold text-white"
                  style={{ backgroundColor: 'var(--primary)' }}
                >
                  <LayoutDashboard size={16} /> Dashboard
                </Link>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="inline-flex min-h-11 items-center gap-1.5 rounded-xl px-3 py-2 text-sm font-semibold transition-colors hover:bg-white"
                  style={{ color: 'var(--text-primary)' }}
                >
                  <LogIn size={16} /> {t('signIn')}
                </Link>
                <Link
                  to="/select-role"
                  className="premium-button inline-flex min-h-11 items-center rounded-xl px-4 py-2 text-sm font-semibold text-white"
                  style={{ backgroundColor: 'var(--primary)' }}
                >
                  {t('recycleBtn')}
                </Link>
              </>
            )}
          </div>

          <button
            type="button"
            className="touch-target relative grid flex-none place-items-center rounded-xl border lg:hidden"
            style={{ borderColor: 'var(--border)', color: 'var(--text-primary)', backgroundColor: 'rgba(255,255,255,0.68)' }}
            onClick={() => setMenuOpen((open) => !open)}
            aria-label={menuOpen ? 'Close navigation menu' : 'Open navigation menu'}
            aria-controls="mobile-navigation"
            aria-expanded={menuOpen}
          >
            <span className={`absolute transition-all duration-300 ${menuOpen ? 'rotate-90 scale-100 opacity-100' : 'scale-75 opacity-0'}`}><X size={21} /></span>
            <span className={`absolute transition-all duration-300 ${menuOpen ? '-rotate-90 scale-75 opacity-0' : 'rotate-0 scale-100 opacity-100'}`}><Menu size={21} /></span>
          </button>
        </div>

        <div
          id="mobile-navigation"
          className={`grid overflow-hidden transition-[grid-template-rows,opacity] duration-300 lg:hidden ${menuOpen ? 'grid-rows-[1fr] opacity-100' : 'pointer-events-none grid-rows-[0fr] opacity-0'}`}
        >
          <div className="min-h-0">
            <div className="mx-3 border-t px-1 pb-4 pt-3 sm:mx-5" style={{ borderColor: 'var(--border)' }}>
              <div className="grid grid-cols-2 gap-1">
                {publicLinks.map((link) => (
                  <Link
                    key={link.href}
                    to={link.href}
                    onClick={closeMenu}
                    className="rounded-xl px-3 py-3 text-sm font-semibold transition-colors hover:bg-white"
                    style={{ color: isActive(link.href) ? 'var(--primary)' : 'var(--text-primary)', backgroundColor: isActive(link.href) ? 'var(--primary-subtle)' : undefined }}
                  >
                    {link.label}
                  </Link>
                ))}
              </div>
              <div className="mt-3 flex flex-col gap-2 border-t pt-3" style={{ borderColor: 'var(--border)' }}>
                {/* Mobile Language Switcher */}
                <div className="grid grid-cols-3 gap-1 p-1 rounded-xl" style={{ background: 'rgba(0,0,0,0.03)', border: '1px solid var(--border)' }}>
                  {LANGUAGES.map((lang) => (
                    <button
                      key={lang.code}
                      type="button"
                      onClick={() => { setLanguage(lang.code); closeMenu(); }}
                      className="flex flex-col items-center py-1.5 rounded-lg transition-all"
                      style={{ fontFamily: 'Inter,sans-serif', fontSize: 11, fontWeight: 600, background: language === lang.code ? 'white' : 'transparent', color: language === lang.code ? 'var(--primary)' : 'var(--text-secondary)', boxShadow: language === lang.code ? '0 1px 4px rgba(0,0,0,0.1)' : 'none', border: 'none', cursor: 'pointer' }}
                    >
                      <span style={{ fontSize: 16 }}>{lang.flag}</span>
                      <span>{lang.nativeName}</span>
                    </button>
                  ))}
                </div>
                <div className="flex gap-2">
                  {isAuthenticated ? (
                    <>
                      <Link to="/notifications" onClick={closeMenu} className="touch-target relative grid place-items-center rounded-xl border" style={{ borderColor: 'var(--border)' }} aria-label="Notifications">
                        <Bell size={18} />
                        {unreadNotificationCount > 0 && <span className="absolute right-2 top-2 h-2 w-2 rounded-full" style={{ backgroundColor: 'var(--danger)' }} />}
                      </Link>
                      <Link to={`/${user?.role}`} onClick={closeMenu} className="flex min-h-11 flex-1 items-center justify-center gap-2 rounded-xl text-sm font-semibold text-white" style={{ backgroundColor: 'var(--primary)', fontFamily: 'Inter,sans-serif' }}>
                        <LayoutDashboard size={17} /> Go to Dashboard
                      </Link>
                    </>
                  ) : (
                    <>
                      <Link to="/login" onClick={closeMenu} className="flex min-h-11 flex-1 items-center justify-center rounded-xl border text-sm font-semibold" style={{ borderColor: 'var(--border)', color: 'var(--text-primary)', fontFamily: 'Inter,sans-serif' }}>Login</Link>
                      <Link to="/select-role" onClick={closeMenu} className="flex min-h-11 flex-1 items-center justify-center rounded-xl text-sm font-semibold text-white" style={{ backgroundColor: 'var(--primary)', fontFamily: 'Inter,sans-serif' }}>Get Started</Link>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </nav>
    </header>
  );
};

export default Navbar;
