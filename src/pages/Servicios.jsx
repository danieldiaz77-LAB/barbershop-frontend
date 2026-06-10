import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import heroDesktop from '../assets/hero-desktop.png';
import { servicesApi } from '../services/endpoints';

const neon = '#b7ff00';

const serviciosFallback = [
  {
    id: 'fallback-corte',
    name: 'Corte de cabello',
    description: 'Fade, clasico o moderno con terminacion limpia y peinado.',
    durationMinutes: 45,
    price: 15000,
  },
  {
    id: 'fallback-barba',
    name: 'Perfilado de barba',
    description: 'Barba definida, contornos precisos y acabado profesional.',
    durationMinutes: 30,
    price: 12000,
  },
  {
    id: 'fallback-combo',
    name: 'Corte + barba',
    description: 'Servicio completo para renovar corte, barba y flow.',
    durationMinutes: 75,
    price: 22000,
  },
  {
    id: 'fallback-diseno',
    name: 'Disenos freestyle',
    description: 'Lineas, detalles y freestyle adaptado a tu estilo.',
    durationMinutes: 20,
    price: 8000,
  },
];

function formatPrice(value) {
  return `$${Number(value || 0).toLocaleString('es-CL')}`;
}

function ServiceIcon({ index }) {
  const paths = [
    <path key="s" d="M6 6l12 12M18 6 6 18M5 5a2 2 0 1 0 0 4 2 2 0 0 0 0-4Zm0 10a2 2 0 1 0 0 4 2 2 0 0 0 0-4Z" />,
    <path key="b" d="M13 2 4 14h7l-1 8 10-13h-7z" />,
    <path key="f" d="M8 10V8a4 4 0 0 1 8 0v2M6 11c0 6 3 10 6 10s6-4 6-10M9 15c2 1 4 1 6 0" />,
    <path key="d" d="M4 7h16M7 4h10M6 7l2 13h8l2-13M10 11v5M14 11v5" />,
  ];

  return (
    <svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
      {paths[index % paths.length]}
    </svg>
  );
}

function ServicesMenu({ servicios }) {
  const destacados = [
    ['Agenda online', 'Elige servicio, dia y hora en minutos.'],
    ['Sello futurama', 'Terminaciones limpias y estilo urbano.'],
    ['Lunes a sabado', 'Horarios segun disponibilidad del barbero.'],
  ];

  return (
    <>
      <section className="service-strip fadeup">
        {destacados.map(([title, text]) => (
          <div key={title} className="service-strip-item">
            <div className="flow-kicker">{title}</div>
            <p style={{ color: '#cdd4c4', fontSize: 14, lineHeight: 1.55, marginTop: 8 }}>
              {text}
            </p>
          </div>
        ))}
      </section>

      <section id="lista-servicios" className="services-menu">
        {servicios.map((s, i) => (
          <article key={s.id} className="service-menu-row fadeup" data-index={String(i + 1).padStart(2, '0')}>
            <div className="service-icon-mark">
              <ServiceIcon index={i} />
            </div>

            <div>
              <div className="service-meta">
                {i === 0 ? 'Servicio destacado' : 'Flow menu'}
                <span style={{ color: '#596051' }}>/</span>
                {s.durationMinutes} min
              </div>

              <h2 className="flow-title service-name" style={{ marginTop: 9 }}>
                {s.name}
              </h2>

              <p className="service-desc">
                {s.description || 'Servicio profesional con terminacion limpia y sello Flow Futurama.'}
              </p>
            </div>

            <div className="service-price">
              {formatPrice(s.price)}
            </div>

            <div className="service-action">
              <Link to="/reservar" className={i === 0 ? 'btn-neon' : 'btn-ghost'} style={{
                minHeight: i === 0 ? 48 : 42,
                padding: i === 0 ? '11px 22px' : '9px 17px',
                fontSize: i === 0 ? 21 : 18,
                width: '100%',
              }}>
                Reservar
              </Link>
            </div>
          </article>
        ))}
      </section>

      <section className="services-bottom-cta">
        <div>
          <div className="flow-kicker">Listo para el cambio?</div>
          <h2 className="flow-title" style={{ color: '#fff', fontSize: 'clamp(38px, 5vw, 68px)', marginTop: 6 }}>
            RESERVA TU PROXIMO CORTE
          </h2>
        </div>

        <Link to="/reservar" className="btn-neon" style={{ minWidth: 250 }}>
          Tomar hora
        </Link>
      </section>
    </>
  );
}

export default function Servicios() {
  const [servicios, setServicios] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    servicesApi.list()
      .then(setServicios)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const serviciosVisibles = servicios.length ? servicios : serviciosFallback;

  return (
    <main className="services-page">
      <style>{`
        .services-page {
          min-height: 100vh;
          padding: 128px 0 82px;
          background: #030403;
          position: relative;
          overflow: hidden;
        }

        .services-page::before {
          content: "";
          position: absolute;
          inset: 0 0 auto 0;
          height: 640px;
          background:
            linear-gradient(90deg, rgba(3,4,3,.97) 0%, rgba(3,4,3,.72) 34%, rgba(3,4,3,.22) 62%, rgba(3,4,3,.82) 100%),
            linear-gradient(0deg, #030403 0%, rgba(3,4,3,.16) 48%, rgba(3,4,3,.22) 100%),
            url(${heroDesktop}) 18% 30% / cover no-repeat;
          opacity: .96;
          pointer-events: none;
        }

        .services-page::after {
          content: "FLOW FUTURAMA";
          position: absolute;
          top: 116px;
          right: -44px;
          font-family: "Bebas Neue", Impact, sans-serif;
          font-size: clamp(84px, 13vw, 210px);
          color: rgba(183,255,0,.045);
          line-height: .85;
          pointer-events: none;
        }

        .services-hero {
          position: relative;
          z-index: 1;
          min-height: 370px;
          display: flex;
          align-items: flex-end;
          padding-bottom: 44px;
        }

        .services-title {
          font-size: clamp(70px, 11vw, 150px);
          max-width: 840px;
        }

        .services-hero-actions {
          display: flex;
          align-items: center;
          gap: 14px;
          flex-wrap: wrap;
          margin-top: 26px;
        }

        .service-strip {
          position: relative;
          z-index: 1;
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          border-top: 1px solid rgba(183,255,0,.24);
          border-bottom: 1px solid rgba(183,255,0,.14);
          margin-bottom: 26px;
        }

        .service-strip-item {
          min-height: 92px;
          padding: 20px 22px;
          border-right: 1px solid rgba(183,255,0,.12);
        }

        .service-strip-item:last-child {
          border-right: 0;
        }

        .services-menu {
          position: relative;
          z-index: 1;
          display: grid;
          gap: 10px;
        }

        .service-menu-row {
          position: relative;
          display: grid;
          grid-template-columns: 74px minmax(0, 1fr) 160px 146px;
          gap: 22px;
          align-items: center;
          min-height: 142px;
          padding: 22px 0;
          border-top: 1px solid rgba(183,255,0,.16);
          overflow: hidden;
        }

        .service-menu-row:first-child {
          min-height: 188px;
          border-top-color: rgba(183,255,0,.42);
        }

        .service-menu-row::before {
          content: attr(data-index);
          position: absolute;
          right: 10px;
          top: 8px;
          font-family: "Bebas Neue", Impact, sans-serif;
          font-size: 104px;
          color: rgba(183,255,0,.045);
          line-height: 1;
          z-index: -1;
        }

        .service-icon-mark {
          width: 56px;
          height: 56px;
          display: grid;
          place-items: center;
          color: var(--neon);
          border-left: 2px solid var(--neon);
        }

        .service-name {
          color: #fff;
          font-size: clamp(38px, 5.6vw, 78px);
          line-height: .9;
        }

        .service-menu-row:not(:first-child) .service-name {
          font-size: clamp(32px, 4vw, 56px);
        }

        .service-desc {
          max-width: 640px;
          color: #aeb5a8;
          font-size: 15px;
          line-height: 1.65;
          margin-top: 12px;
        }

        .service-price {
          color: var(--neon);
          font-family: "Bebas Neue", Impact, sans-serif;
          font-size: clamp(48px, 5.6vw, 82px);
          line-height: .9;
          text-align: right;
          white-space: nowrap;
        }

        .service-meta {
          display: inline-flex;
          gap: 10px;
          align-items: center;
          color: var(--neon);
          font-size: 11px;
          font-weight: 900;
          letter-spacing: .12em;
          text-transform: uppercase;
        }

        .services-bottom-cta {
          position: relative;
          z-index: 1;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 22px;
          margin-top: 38px;
          padding: 28px 0 0;
          border-top: 1px solid rgba(183,255,0,.2);
        }

        @media (max-width: 920px) {
          .service-strip {
            grid-template-columns: 1fr;
          }

          .service-strip-item {
            border-right: 0;
            border-bottom: 1px solid rgba(183,255,0,.1);
          }

          .service-menu-row {
            grid-template-columns: 58px minmax(0, 1fr);
            gap: 16px;
          }

          .service-price,
          .service-action {
            grid-column: 2;
            text-align: left;
          }

          .service-action .btn-ghost,
          .service-action .btn-neon {
            width: auto;
          }

          .services-bottom-cta {
            align-items: flex-start;
            flex-direction: column;
          }
        }

        @media (max-width: 680px) {
          .services-page {
            padding-top: 122px;
          }

          .services-page::before {
            background:
              linear-gradient(180deg, rgba(3,4,3,.88) 0%, rgba(3,4,3,.55) 45%, #030403 100%),
              url(${heroDesktop}) 80% top / cover no-repeat;
            height: 480px;
          }

          .services-page::after {
            display: none;
          }

          .services-hero {
            min-height: 340px;
            padding-bottom: 34px;
          }

          .services-title {
            font-size: clamp(58px, 18vw, 88px);
          }

          .service-menu-row {
            grid-template-columns: 1fr;
            gap: 14px;
            padding: 24px 0;
          }

          .service-icon-mark,
          .service-price,
          .service-action {
            grid-column: 1;
          }

          .service-icon-mark {
            width: 44px;
            height: 44px;
          }

          .service-menu-row::before {
            font-size: 76px;
          }

          .services-hero-actions .btn-neon,
          .services-hero-actions .btn-ghost {
            width: 100%;
          }
        }
      `}</style>

      <div className="flow-shell">
        <section className="services-hero fadeup">
          <div>
            <div className="flow-kicker">Servicios oficiales</div>
            <h1 className="flow-title services-title" style={{ marginTop: 10 }}>
              CARTA
              <br />
              <span style={{ color: neon }}>DE FLOW.</span>
            </h1>

            <p style={{ maxWidth: 650, color: '#d8ded0', fontSize: 17, lineHeight: 1.7, marginTop: 18 }}>
              Cortes, barba y detalles con el sello de Felipe. Elige tu servicio y agenda
              tu bloque sin vueltas.
            </p>

            <div className="services-hero-actions">
              <Link to="/reservar" className="btn-neon" style={{ minWidth: 238 }}>
                Reserva tu hora
              </Link>
              <a href="#lista-servicios" className="btn-ghost" style={{ minWidth: 190 }}>
                Ver precios
              </a>
            </div>
          </div>
        </section>

        {loading ? (
          <div className="card" style={{ padding: 42, textAlign: 'center', color: 'var(--muted)', position: 'relative', zIndex: 1 }}>
            Cargando servicios...
          </div>
        ) : (
          <ServicesMenu servicios={serviciosVisibles} />
        )}
      </div>
    </main>
  );
}
