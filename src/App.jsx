import { useEffect, useMemo, useRef, useState } from 'react';
import { ArrowUp, ChevronDown, Menu, Moon, Sun, X } from 'lucide-react';
import { timeline, figures } from './data/content.js';

const SECTIONS = [
  { id: 'hero', label: 'Home' },
  { id: 'sejarah', label: 'History' },
  { id: 'timeline', label: 'Timeline' },
  { id: 'tokoh', label: 'Figures' },
];

const prefersReducedMotion = () =>
  window.matchMedia('(prefers-reduced-motion: reduce)').matches;

// Fades and lifts an element in once it enters the viewport.
function Reveal({ as: Tag = 'div', className = '', children, ...rest }) {
  const ref = useRef(null);
  const [shown, setShown] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el || !('IntersectionObserver' in window)) {
      setShown(true);
      return;
    }
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setShown(true);
          io.disconnect();
        }
      },
      { threshold: 0.12 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <Tag ref={ref} className={`reveal ${shown ? 'in' : ''} ${className}`} {...rest}>
      {children}
    </Tag>
  );
}

function useTheme() {
  const [theme, setTheme] = useState(() => {
    const saved = localStorage.getItem('surabaya-theme');
    if (saved) return saved;
    return window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark';
  });

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    localStorage.setItem('surabaya-theme', theme);
  }, [theme]);

  return [theme, setTheme];
}

function useActiveSection() {
  const [active, setActive] = useState('hero');

  useEffect(() => {
    const targets = SECTIONS.map((s) => document.getElementById(s.id)).filter(Boolean);
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) setActive(entry.target.id);
        });
      },
      { rootMargin: '-45% 0px -50% 0px' }
    );
    targets.forEach((t) => io.observe(t));
    return () => io.disconnect();
  }, []);

  return active;
}

function Navbar({ active, theme, onToggleTheme }) {
  const [open, setOpen] = useState(false);

  return (
    <header className="nav-wrap">
      <nav className="glass nav" aria-label="Main">
        <a href="#hero" className="brand">Surabaya</a>
        <button
          type="button"
          className="icon-btn"
          aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} theme`}
          onClick={onToggleTheme}
        >
          {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
        </button>
        <button
          type="button"
          className="icon-btn menu-btn"
          aria-expanded={open}
          aria-controls="nav-links"
          aria-label="Toggle menu"
          onClick={() => setOpen((o) => !o)}
        >
          {open ? <X size={18} /> : <Menu size={18} />}
        </button>
        <ul id="nav-links" className={`nav-links ${open ? 'open' : ''}`}>
          {SECTIONS.map((s) => (
            <li key={s.id}>
              <a
                href={`#${s.id}`}
                className={active === s.id ? 'active' : ''}
                onClick={() => setOpen(false)}
              >
                {s.label}
              </a>
            </li>
          ))}
        </ul>
      </nav>
    </header>
  );
}

function Hero() {
  const bgRef = useRef(null);

  useEffect(() => {
    if (prefersReducedMotion()) return;
    let frame = 0;
    const onScroll = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        if (bgRef.current) {
          bgRef.current.style.transform = `translate3d(0, ${window.scrollY * 0.3}px, 0) scale(1.1)`;
        }
      });
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', onScroll);
      cancelAnimationFrame(frame);
    };
  }, []);

  return (
    <section id="hero" className="hero">
      <div className="hero-bg" ref={bgRef} aria-hidden="true" />
      <div className="hero-content">
        <h1 className="hero-title intro d1">SURABAYA</h1>
        <p className="hero-sub intro d2">A CITY FORGED THROUGH TIME.</p>
        <p className="hero-desc intro d3">
          Menelusuri perjalanan sebuah kota, dari akar sejarahnya hingga menjadi salah satu metropolitan terpenting di Indonesia.
        </p>
        <div className="cta intro d4">
          <a className="btn primary" href="#sejarah">Explore History</a>
          <a className="btn" href="#timeline">Discover the Timeline</a>
        </div>
      </div>
      <a className="scroll-cue" href="#sejarah" aria-label="Scroll to history">
        <ChevronDown size={22} />
      </a>
    </section>
  );
}

function History() {
  return (
    <section id="sejarah" className="section history">
      <Reveal as="h2" className="section-title">Built on river and sea</Reveal>
      <Reveal as="p" className="lead">
        Dari bandar muara bernama Hujung Galuh hingga pertempuran yang mengukir namanya dalam sejarah kemerdekaan, Surabaya dibentuk oleh perdagangan, perlawanan, dan keberanian warganya.
      </Reveal>
    </section>
  );
}

function Timeline() {
  const [query, setQuery] = useState('');
  const [openIds, setOpenIds] = useState(() => new Set());
  const wrapRef = useRef(null);
  const riverRef = useRef(null);

  // The "river" fills as the reader scrolls through the timeline.
  useEffect(() => {
    let frame = 0;
    const update = () => {
      const wrap = wrapRef.current;
      const fill = riverRef.current;
      if (!wrap || !fill) return;
      if (prefersReducedMotion()) {
        fill.style.transform = 'scaleY(1)';
        return;
      }
      const { top, height } = wrap.getBoundingClientRect();
      const p = Math.min(1, Math.max(0, (window.innerHeight * 0.6 - top) / height));
      fill.style.transform = `scaleY(${p})`;
    };
    const onScroll = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(update);
    };
    update();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
    };
  }, []);

  const items = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return timeline;
    return timeline.filter((t) =>
      `${t.era} ${t.title} ${t.summary} ${t.body}`.toLowerCase().includes(q)
    );
  }, [query]);

  const toggle = (id) => {
    setOpenIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  return (
    <section id="timeline" className="section">
      <div className="tl-head">
        <Reveal as="h2" className="section-title">Timeline</Reveal>
        <input
          type="search"
          className="search"
          placeholder="Search events"
          aria-label="Search timeline events"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </div>

      <div className="tl-wrap" ref={wrapRef}>
        <div className="river" aria-hidden="true">
          <div className="river-fill" ref={riverRef} />
        </div>
        <ol className="tl-list">
          {items.map((t, i) => {
            const isOpen = openIds.has(t.id);
            return (
              <li key={t.id} className={`tl-item ${i % 2 ? 'right' : 'left'}`}>
                <span className="node" aria-hidden="true" />
                <Reveal className="tl-card glass lift">
                  <p className="era">{t.era}</p>
                  <h3>{t.title}</h3>
                  <p className="summary">{t.summary}</p>
                  <button
                    type="button"
                    className="link-btn"
                    aria-expanded={isOpen}
                    aria-controls={`tl-${t.id}`}
                    onClick={() => toggle(t.id)}
                  >
                    {isOpen ? 'Show less' : 'Read more'}
                    <ChevronDown size={16} className={isOpen ? 'rot' : ''} />
                  </button>
                  <div id={`tl-${t.id}`} className={`tl-body ${isOpen ? 'open' : ''}`}>
                    <div>
                      <p>{t.body}</p>
                    </div>
                  </div>
                </Reveal>
              </li>
            );
          })}
        </ol>
        {items.length === 0 && (
          <p className="empty">No events match “{query}”. Try another word.</p>
        )}
      </div>
    </section>
  );
}

function Figures() {
  return (
    <section id="tokoh" className="section">
      <Reveal as="h2" className="section-title">Figures</Reveal>
      <div className="figures">
        {figures.map((f) => (
          <Reveal key={f.name} className="figure glass lift">
            <span className="monogram" aria-hidden="true">{f.initials}</span>
            <h3>{f.name}</h3>
            <p className="role">{f.role}</p>
            <p>{f.note}</p>
          </Reveal>
        ))}
      </div>
    </section>
  );
}

function BackToTop() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const onScroll = () => setShow(window.scrollY > 700);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <button
      type="button"
      className={`to-top ${show ? 'show' : ''}`}
      aria-label="Back to top"
      onClick={() => window.scrollTo({ top: 0, behavior: prefersReducedMotion() ? 'auto' : 'smooth' })}
    >
      <ArrowUp size={20} />
    </button>
  );
}

export default function App() {
  const [theme, setTheme] = useTheme();
  const active = useActiveSection();

  return (
    <>
      <Navbar
        active={active}
        theme={theme}
        onToggleTheme={() => setTheme((t) => (t === 'dark' ? 'light' : 'dark'))}
      />
      <main>
        <Hero />
        <History />
        <Timeline />
        <Figures />
      </main>
      <footer className="footer">
        Surabaya Historical Archive. Dibuat untuk edukasi; periksa tanggal dan rincian dengan sumber primer.
      </footer>
      <BackToTop />
    </>
  );
}
