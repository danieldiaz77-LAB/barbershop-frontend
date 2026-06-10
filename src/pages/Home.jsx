import { Link } from 'react-router-dom';
import { useEffect, useMemo, useState } from 'react';
import heroDesktop from '../assets/hero-desktop.png';
import heroMobile from '../assets/hero-mobile.png';
import { barbersApi, servicesApi } from '../services/endpoints';
import t1 from '../assets/trabajo1.jpg';
import t2 from '../assets/trabajo2.jpg';
import t3 from '../assets/trabajo3.jpg';
import t4 from '../assets/trabajo4.jpg';
import t5 from '../assets/trabajo5.jpg';

const MARCA = 'ELPIPEBARBER';
const SELLO = 'FLOW FUTURAMA';
const INSTAGRAM = 'https://www.instagram.com/elpipebarber?igsh=MXN5eWF6bzZvZnoy';

const neon = '#b7ff00';

const fallbackServices = [
  {
    id: 'fallback-corte',
    name: 'Corte',
    description: 'Corte tradicional, degradado bajo, medio, alto, mohicano o estilo general.',
    price: 12000,
    durationMinutes: 30,
  },
  {
    id: 'fallback-barba',
    name: 'Barba',
    description: 'Perfilado, rebaje y terminaciones de barba.',
    price: 5000,
    durationMinutes: 20,
  },
  {
    id: 'fallback-combo',
    name: 'Corte + barba',
    description: 'El combo completo: corte y perfilado de barba.',
    price: 15000,
    durationMinutes: 60,
  },
];

const trabajos = [
  { src: t1, pos: 'center 53%' },
  { src: t2, pos: 'left 45%' },
  { src: t3, pos: 'center 28%' },
  { src: t5, pos: 'center 45%' },
  { src: t4, pos: 'center 28%' },
];
const ScissorsIcon = () => (
  <svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="6" cy="6" r="3" />
    <circle cx="6" cy="18" r="3" />
    <path d="M20 4 8.12 15.88M14.47 14.48 20 20M8.12 8.12 12 12" />
  </svg>
);

const RazorIcon = () => (
  <svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 21h18" />
    <path d="M5 17h12l4-7H10z" />
    <path d="M10 10 8 4h7l2 6" />
  </svg>
);

const BeardIcon = () => (
  <svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M8 10V8a4 4 0 0 1 8 0v2" />
    <path d="M6 11c0 6 3 10 6 10s6-4 6-10" />
    <path d="M9 14c1.8 1 4.2 1 6 0" />
    <path d="M9 18c2 1.2 4 1.2 6 0" />
  </svg>
);

const BoltIcon = () => (
  <svg width="34" height="34" viewBox="0 0 24 24" fill="currentColor">
    <path d="M13 2 4 14h7l-1 8 10-13h-7z" />
  </svg>
);

const CalendarIcon = () => (
  <svg width="23" height="23" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.3" strokeLinecap="round" strokeLinejoin="round">
    <path d="M8 2v4M16 2v4M3 10h18M5 4h14a2 2 0 0 1 2 2v13a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2Z" />
  </svg>
);

const InstagramIcon = () => (
  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="2" width="20" height="20" rx="5" />
    <circle cx="12" cy="12" r="4" />
    <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" />
  </svg>
);

function formatPrice(value) {
  const number = Number(value || 0);
  return `$${number.toLocaleString('es-CL')}`;
}

function serviceIcon(index) {
  const icons = [<ScissorsIcon />, <RazorIcon />, <BeardIcon />, <BoltIcon />];
  return icons[index % icons.length];
}

export default function Home() {
  const [barberos, setBarberos] = useState([]);
  const [servicios, setServicios] = useState([]);

  useEffect(() => {
    barbersApi.list().then(setBarberos).catch(() => {});
    servicesApi.list().then((data) => setServicios(data.slice(0, 4))).catch(() => {});
  }, []);

  const serviciosHome = useMemo(() => {
    return servicios.length ? servicios : fallbackServices;
  }, [servicios]);

  const barberoPrincipal = barberos[0];

  return (
    <div style={{ overflow: 'hidden', background: '#030403' }}>
      <style>{`
        .pipe-hero-grid {
        min-height: 100vh;
        display: grid;
        align-items: start;
        padding: 168px 0 28px;
      }

      .pipe-hero-img {
        position: absolute;
        inset: 0;
        width: 100%;
        height: 100%;
        object-fit: cover;
        object-position: center center;
        opacity: 1;
        z-index: -3;
      }

        .pipe-hero-title {
          font-size: clamp(52px, 6.8vw, 98px);
          max-width: 860px;
        }

        .pipe-feature-row {
          display: grid;
          grid-template-columns: repeat(3, auto);
          justify-content: flex-start;
          gap: 18px;
        }

        .pipe-services-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 22px;
        }

        .pipe-work-grid {
          display: grid;
          grid-template-columns: 1.15fr 1fr 1fr 1fr 1fr;
          gap: 18px;
        }

        .pipe-work-grid a:first-child {
          grid-column: span 1;
        }

        .pipe-testimonials {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 22px;
        }

        @media (max-width: 680px) {
        .pipe-hero-grid {
          min-height: 100vh;
          padding: 132px 0 34px;
        }

        .pipe-hero-img {
          object-position: center top;
        }

        .pipe-hero-title {
          font-size: clamp(50px, 17vw, 78px);
        }

        .pipe-feature-row,
        .pipe-services-grid,
        .pipe-testimonials {
          grid-template-columns: 1fr;
        }

        .pipe-work-grid {
          display: flex;
          overflow-x: auto;
          padding-bottom: 8px;
          scroll-snap-type: x mandatory;
        }

        .pipe-work-grid a {
          min-width: 72%;
          scroll-snap-align: start;
        }
      }
      `}</style>

      <section style={{ position: 'relative', isolation: 'isolate' }}>
        <picture>
        <source media="(max-width: 680px)" srcSet={heroMobile} />
        <img
          src={heroDesktop}
          alt="Elpipebarber Flow Futurama"
          className="pipe-hero-img"
        />
      </picture>

        <div style={{
          position: 'absolute',
          inset: 0,
          zIndex: -2,
          background: `
          linear-gradient(90deg, rgba(3,4,3,.90) 0%, rgba(3,4,3,.58) 34%, rgba(3,4,3,.10) 72%, rgba(3,4,3,.68) 100%),
          linear-gradient(0deg, #030403 0%, rgba(3,4,3,.06) 42%, rgba(3,4,3,.30) 100%)
        `,
        }} />

        <div className="flow-scratch" style={{ width: 220, height: 6, right: '4%', top: '28%', opacity: 0.35 }} />
        <div className="flow-scratch" style={{ width: 430, height: 10, right: '12%', bottom: '24%', opacity: 0.55 }} />
        <div className="flow-scratch" style={{ width: 220, height: 6, left: '6%', bottom: '15%', opacity: 0.45 }} />

        <div className="flow-shell pipe-hero-grid" style={{ marginLeft: 'clamp(24px, 5.5vw, 120px)', marginRight: 'auto' }}>
          <div className="hero-content fadeup">
            <div className="flow-kicker" style={{ marginBottom: 18 }}>
              Mas que un corte, una experiencia
            </div>

            <h1 className="flow-title pipe-hero-title" style={{ margin: 0, color: '#fff' }}>
              TU CORTE.
              <br />
              <span style={{ color: neon, textShadow: '0 0 28px rgba(183,255,0,.25)' }}>
                TU FLOW FUTURAMA.
              </span>
            </h1>

            <p style={{
              maxWidth: 640,
              margin: '18px 0 0',
              color: '#e4e8dc',
              fontSize: 16,
              lineHeight: 1.65,
            }}>
              Fades limpios, disenos personalizados, barba y estilo urbano de la mano de Felipe,
              barbero profesional en Stgo/Maipu.
            </p>

            <div className="pipe-feature-row hero-metricas" style={{ marginTop: 24 }}>
              {[
                ['Barbero profesional', <ScissorsIcon />],
                ['Flow Futurama', <BoltIcon />],
                ['Stgo / Maipu', <BeardIcon />],
              ].map(([label, icon]) => (
                <div key={label} style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12,
                  minHeight: 64,
                  padding: '12px 14px',
                  border: '1px solid rgba(183,255,0,.2)',
                  borderRadius: 8,
                  background: 'rgba(0,0,0,.34)',
                  color: neon,
                }}>
                  <span style={{ display: 'grid', placeItems: 'center' }}>{icon}</span>
                  <span style={{
                    maxWidth: 120,
                    color: '#f5f7ef',
                    fontSize: 12,
                    fontWeight: 900,
                    letterSpacing: '.08em',
                    lineHeight: 1.25,
                    textTransform: 'uppercase',
                  }}>
                    {label}
                  </span>
                </div>
              ))}
            </div>

            <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', marginTop: 26 }}>
              <Link to="/reservar" className="btn-neon" style={{ minWidth: 280 }}>
                <CalendarIcon />
                Reserva tu hora
                <span style={{ fontSize: 30, lineHeight: 1 }}>→</span>
              </Link>
              <a href={INSTAGRAM} target="_blank" rel="noreferrer" className="btn-ghost">
                <InstagramIcon />
                Ver trabajos
              </a>
            </div>

            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: 18,
              marginTop: 34,
              color: '#f5f7ef',
            }}>
              <div style={{ display: 'flex' }}>
                {[0, 1, 2, 3].map((n) => (
                  <div key={n} style={{
                    width: 38,
                    height: 38,
                    marginLeft: n ? -10 : 0,
                    border: '2px solid #030403',
                    borderRadius: '50%',
                    background: `linear-gradient(135deg, #1d2118, ${neon})`,
                    display: 'grid',
                    placeItems: 'center',
                    color: '#030403',
                    fontWeight: 900,
                    fontSize: 12,
                  }}>
                    EP
                  </div>
                ))}
                <div style={{
                  width: 38,
                  height: 38,
                  marginLeft: -10,
                  border: '2px solid #030403',
                  borderRadius: '50%',
                  background: '#0a0d08',
                  display: 'grid',
                  placeItems: 'center',
                  color: neon,
                  fontSize: 12,
                  fontWeight: 900,
                }}>
                  +28k
                </div>
              </div>

              <div style={{ fontSize: 12, fontWeight: 900, letterSpacing: '.08em', textTransform: 'uppercase' }}>
                <span style={{ color: '#fff' }}>28.3 mil seguidores</span>
                <br />
                <span style={{ color: neon }}>siguen el flow</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="servicios" style={{ padding: '54px 0 28px' }}>
        <div className="flow-shell">
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'end',
            gap: 18,
            marginBottom: 22,
          }}>
            <div>
              <div className="flow-kicker">Nuestros servicios</div>
              <h2 className="flow-title" style={{ marginTop: 8, fontSize: 'clamp(38px, 5vw, 68px)' }}>
                PRECIOS Y CORTES
              </h2>
            </div>

            <Link to="/servicios" style={{
              color: '#fff',
              fontSize: 13,
              fontWeight: 900,
              letterSpacing: '.08em',
              textTransform: 'uppercase',
            }}>
              Ver todos <span style={{ color: neon }}>›</span>
            </Link>
          </div>

          <div className="pipe-services-grid servicios-home-grid">
            {serviciosHome.map((servicio, index) => (
              <article key={servicio.id} className="card fadeup" style={{
                minHeight: 236,
                padding: 26,
                animationDelay: `${index * 0.05}s`,
              }}>
                <div style={{ color: neon, marginBottom: 24 }}>
                  {serviceIcon(index)}
                </div>

                <h3 style={{
                  minHeight: 48,
                  color: '#fff',
                  fontSize: 20,
                  lineHeight: 1.2,
                  fontWeight: 900,
                  textTransform: 'uppercase',
                  marginBottom: 12,
                }}>
                  {servicio.name}
                </h3>

                <p style={{
                  minHeight: 58,
                  color: 'var(--muted)',
                  fontSize: 14,
                  lineHeight: 1.65,
                  marginBottom: 18,
                }}>
                  {servicio.description || 'Servicio profesional con sello Flow Futurama.'}
                </p>

                <div style={{
                  display: 'flex',
                  alignItems: 'baseline',
                  justifyContent: 'space-between',
                  gap: 12,
                  borderTop: '1px solid rgba(183,255,0,.14)',
                  paddingTop: 16,
                }}>
                  <strong style={{ color: neon, fontSize: 22, fontWeight: 900 }}>
                    {index === 3 && !servicios.length ? 'Desde ' : ''}
                    {formatPrice(servicio.price)}
                  </strong>
                  <span style={{ color: '#777d70', fontSize: 12, fontWeight: 800 }}>
                    {servicio.durationMinutes} min
                  </span>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section id="trabajos" style={{ padding: '44px 0 34px' }}>
        <div className="flow-shell">
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: 18,
            marginBottom: 18,
          }}>
            <div>
              <div className="flow-kicker">Nuestros trabajos</div>
              <h2 className="flow-title" style={{ marginTop: 8, fontSize: 'clamp(34px, 4.8vw, 60px)' }}>
                CORTES CON SELLO
              </h2>
            </div>

            <a href={INSTAGRAM} target="_blank" rel="noreferrer" style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              color: '#fff',
              fontSize: 12,
              fontWeight: 900,
              letterSpacing: '.08em',
              textTransform: 'uppercase',
            }}>
              Siguenos <InstagramIcon />
            </a>
          </div>

          <div className="pipe-work-grid">
            {trabajos.map((t, index) => (
              <a
                key={index}
                href={INSTAGRAM}
                target="_blank"
                rel="noreferrer"
                style={{
                  position: 'relative',
                  height: 190,
                  borderRadius: 8,
                  overflow: 'hidden',
                  border: '1px solid rgba(183,255,0,.14)',
                  background: '#0a0d08',
                }}
              >
                <img
                  src={t.src}
                  alt={`Trabajo Elpipebarber ${index + 1}`}
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                    objectPosition: t.pos,
                    filter: 'saturate(.85) contrast(1.08) brightness(.78)',
                    transition: 'transform .45s ease',
                  }}
                  onMouseOver={(event) => {
                    event.currentTarget.style.transform = 'scale(1.06)';
                  }}
                  onMouseOut={(event) => {
                    event.currentTarget.style.transform = 'scale(1)';
                  }}
                />
                <div style={{
                  position: 'absolute',
                  inset: 0,
                  background: 'linear-gradient(0deg, rgba(0,0,0,.64), transparent 62%)',
                }} />
                <span style={{
                  position: 'absolute',
                  left: 14,
                  bottom: 12,
                  color: neon,
                  fontSize: 12,
                  fontWeight: 900,
                  letterSpacing: '.08em',
                  textTransform: 'uppercase',
                }}>
                  Flow #{index + 1}
                </span>
              </a>
            ))}
          </div>
        </div>
      </section>

      <section style={{ padding: '46px 0 62px' }}>
        <div className="flow-shell">
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'end',
            gap: 18,
            marginBottom: 28,
            flexWrap: 'wrap',
          }}>
            <div>
              <div className="flow-kicker">Lo que dicen</div>
              <h2 className="flow-title" style={{ marginTop: 8, fontSize: 'clamp(34px, 4.8vw, 60px)' }}>
                OPINION REAL
              </h2>
            </div>
            <a
              href={`${INSTAGRAM}#comments`}
              target="_blank"
              rel="noreferrer"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8,
                color: neon,
                fontSize: 12,
                fontWeight: 900,
                letterSpacing: '.08em',
                textTransform: 'uppercase',
                border: '1px solid rgba(183,255,0,.3)',
                padding: '8px 14px',
                textDecoration: 'none',
              }}
            >
              <InstagramIcon /> Ver comentarios
            </a>
          </div>

          <div className="pipe-testimonials">
            {[
              {
                name: 'Rodrigo V.',
                initials: 'RV',
                color: '#1a2e0a',
                text: 'Me fui con el fade más limpio que me han hecho. Felipe sabe leer lo que quieres sin que tengas que explicar mucho. Tremendo flow.',
                tag: 'Fade + barba',
              },
              {
                name: 'Camilo T.',
                initials: 'CT',
                color: '#0a1a2e',
                text: 'Puntual, prolijo y con una atención diferente. El ambiente del local y la música hacen que el corte sea una experiencia completa.',
                tag: 'Corte clásico',
              },
              {
                name: 'Síguenos',
                initials: null,
                color: '#1a1a0a',
                text: null,
                tag: null,
                cta: true,
              },
            ].map((r, i) => r.cta ? (
              <article key={i} className="card" style={{
                padding: 28,
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center',
                minHeight: 180,
                border: '1px solid rgba(183,255,0,.18)',
                background: 'rgba(183,255,0,.03)',
                textAlign: 'center',
                gap: 14,
              }}>
                <div style={{ color: neon, fontSize: 32 }}>
                  <InstagramIcon />
                </div>
                <p style={{ color: '#8d9484', fontSize: 13, lineHeight: 1.65 }}>
                  Mira los comentarios reales de nuestros clientes en Instagram.
                </p>
                <a
                  href={INSTAGRAM}
                  target="_blank"
                  rel="noreferrer"
                  style={{
                    display: 'inline-block',
                    padding: '10px 20px',
                    background: neon,
                    color: '#030403',
                    fontSize: 11,
                    fontWeight: 900,
                    letterSpacing: '.1em',
                    textTransform: 'uppercase',
                    textDecoration: 'none',
                  }}
                >
                  Ver en Instagram →
                </a>
              </article>
            ) : (
              <article key={i} className="card" style={{ padding: 28, minHeight: 180 }}>
                <div style={{
                  color: neon,
                  fontFamily: '"Bebas Neue", Impact, sans-serif',
                  fontSize: 62,
                  lineHeight: 0.65,
                  marginBottom: 14,
                  opacity: .7,
                }}>
                  "
                </div>
                <p style={{ color: '#c8d4be', lineHeight: 1.7, fontSize: 14, marginBottom: 22 }}>
                  {r.text}
                </p>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{
                    width: 38,
                    height: 38,
                    borderRadius: '50%',
                    background: r.color,
                    border: '1.5px solid rgba(183,255,0,.3)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 11,
                    fontWeight: 900,
                    color: neon,
                    letterSpacing: '.05em',
                    flexShrink: 0,
                  }}>
                    {r.initials}
                  </div>
                  <div>
                    <strong style={{ display: 'block', color: '#fff', fontSize: 13 }}>{r.name}</strong>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 3 }}>
                      <span style={{ color: neon, fontSize: 11 }}>★★★★★</span>
                      <span style={{
                        fontSize: 9,
                        color: '#3d4438',
                        fontWeight: 700,
                        letterSpacing: '.08em',
                        textTransform: 'uppercase',
                        border: '1px solid #1e2519',
                        padding: '2px 6px',
                      }}>{r.tag}</span>
                    </div>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section style={{
        borderTop: '1px solid rgba(183,255,0,.14)',
        borderBottom: '1px solid rgba(183,255,0,.14)',
        background: 'linear-gradient(90deg, rgba(183,255,0,.09), rgba(255,255,255,.02), rgba(183,255,0,.06))',
      }}>
        <div className="flow-shell" style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 24,
          padding: '28px 0',
          flexWrap: 'wrap',
        }}>
          <div>
            <div className="flow-kicker">{SELLO}</div>
            <h2 className="flow-title" style={{ marginTop: 6, fontSize: 'clamp(36px, 5vw, 66px)' }}>
              LISTO PARA TU PROXIMO CORTE?
            </h2>
            {barberoPrincipal && (
              <p style={{ marginTop: 8, color: 'var(--muted)' }}>
                Reserva con {barberoPrincipal.name}.
              </p>
            )}
          </div>

          <Link to="/reservar" className="btn-neon" style={{ minWidth: 260 }}>
            <CalendarIcon />
            Reserva tu hora
          </Link>
        </div>
      </section>
    </div>
  );
}