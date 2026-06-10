import { Link } from 'react-router-dom';

const MARCA = 'ELPIPEBARBER';
const NOMBRE = 'Felipe Eliecer Saavedra Ferrada';
const SELLO = 'Flow Futurama';
const INSTAGRAM = 'https://www.instagram.com/elpipebarber?igsh=MXN5eWF6bzZvZnoy';
const TELEFONO = '+56 9 9809 8449';
const WHATSAPP = 'https://wa.me/56998098449';
const DIRECCION = 'La Galaxia 2292, Maipu';

const InstagramIcon = () => (
  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="2" width="20" height="20" rx="5" />
    <circle cx="12" cy="12" r="4" />
    <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" />
  </svg>
);

const PinIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 10c0 5-8 12-8 12S4 15 4 10a8 8 0 1 1 16 0Z" />
    <circle cx="12" cy="10" r="3" />
  </svg>
);

const ClockIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="9" />
    <path d="M12 7v5l3 2" />
  </svg>
);

const WhatsAppIcon = () => (
  <svg width="19" height="19" viewBox="0 0 24 24" fill="currentColor">
    <path d="M12.04 2C6.58 2 2.14 6.39 2.14 11.79c0 1.72.46 3.4 1.33 4.88L2 22l5.47-1.42a10.04 10.04 0 0 0 4.57 1.1h.01c5.46 0 9.9-4.39 9.9-9.79C21.95 6.39 17.51 2 12.04 2Zm5.82 14.04c-.25.7-1.45 1.34-2.03 1.39-.52.05-1.18.07-1.9-.12-.44-.12-1-.32-1.73-.63-3.04-1.3-5.02-4.31-5.17-4.51-.15-.2-1.23-1.62-1.23-3.1 0-1.48.78-2.2 1.06-2.5.28-.3.61-.37.81-.37h.59c.19.01.45-.07.7.53.25.6.85 2.07.93 2.22.07.15.12.32.02.52-.1.2-.15.32-.3.49-.15.17-.32.38-.45.51-.15.15-.31.32-.13.62.17.3.77 1.26 1.66 2.04 1.14 1 2.1 1.31 2.4 1.46.3.15.48.12.66-.07.2-.22.75-.87.95-1.16.2-.3.4-.25.68-.15.28.1 1.78.83 2.08.98.3.15.5.22.58.35.07.12.07.72-.18 1.42Z" />
  </svg>
);

export default function Footer() {
  return (
    <footer style={{
      position: 'relative',
      overflow: 'hidden',
      background: '#030403',
      borderTop: '1px solid rgba(183,255,0,.16)',
    }}>
      <style>{`
        .pipe-footer-grid {
          display: grid;
          grid-template-columns: 1.3fr .9fr .9fr 1fr;
          gap: 34px;
        }

        .pipe-footer-link {
          color: #8d9484;
          font-size: 13px;
          font-weight: 800;
          letter-spacing: .06em;
          text-transform: uppercase;
          transition: color .2s ease;
        }

        .pipe-footer-link:hover {
          color: var(--neon);
        }

        @media (max-width: 920px) {
          .pipe-footer-grid {
            grid-template-columns: 1fr 1fr;
          }
        }

        @media (max-width: 640px) {
          .pipe-footer-grid {
            grid-template-columns: 1fr;
          }

          .pipe-footer-bottom {
            flex-direction: column;
            align-items: flex-start !important;
          }
        }
      `}</style>

      <div className="flow-shell" style={{ padding: '52px 0 26px', position: 'relative' }}>
        <div className="pipe-footer-grid">
          <div>
            <Link to="/" style={{ display: 'inline-flex', alignItems: 'center', gap: 14, marginBottom: 18 }}>
              <div style={{
                width: 50,
                height: 50,
                border: '1px solid rgba(183,255,0,.58)',
                borderRadius: 8,
                display: 'grid',
                placeItems: 'center',
                color: 'var(--neon)',
                fontFamily: '"Bebas Neue", Impact, sans-serif',
                fontSize: 32,
                boxShadow: '0 0 24px rgba(183,255,0,.12)',
              }}>
                EP
              </div>

              <div>
                <div className="flow-title" style={{ fontSize: 34, color: '#fff' }}>
                  {MARCA}
                </div>
                <div style={{
                  marginTop: 3,
                  color: 'var(--neon)',
                  fontSize: 11,
                  fontWeight: 900,
                  letterSpacing: '.18em',
                  textTransform: 'uppercase',
                }}>
                  {SELLO}
                </div>
              </div>
            </Link>

            <p style={{ maxWidth: 310, color: 'var(--muted)', fontSize: 14, lineHeight: 1.7 }}>
              Fades, disenos, barba y estilo urbano con sello propio. Reserva tu hora con Felipe en Maipu.
            </p>

            <div style={{
              marginTop: 18,
              color: '#fff',
              fontSize: 13,
              fontWeight: 800,
            }}>
              {NOMBRE}
            </div>
          </div>

          <div>
            <h3 className="flow-kicker" style={{ marginBottom: 16 }}>
              Navegacion
            </h3>

            <div style={{ display: 'grid', gap: 11 }}>
              <Link className="pipe-footer-link" to="/">Inicio</Link>
              <Link className="pipe-footer-link" to="/servicios">Servicios</Link>
              <Link className="pipe-footer-link" to="/reservar">Reservar</Link>
              <Link className="pipe-footer-link" to="/mis-citas">Mis citas</Link>
            </div>
          </div>

          <div>
            <h3 className="flow-kicker" style={{ marginBottom: 16 }}>
              Horarios
            </h3>

            <div style={{ display: 'grid', gap: 12 }}>
              {[
                ['Lun - Vie', '10:45 - 21:00'],
                ['Sabado', '10:00 - 21:00'],
                ['Domingo', 'Cerrado'],
              ].map(([dia, hora]) => (
                <div key={dia} style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  gap: 16,
                  paddingBottom: 10,
                  borderBottom: '1px solid rgba(183,255,0,.09)',
                }}>
                  <span style={{ color: '#8d9484', fontSize: 13 }}>{dia}</span>
                  <span style={{
                    color: hora === 'Cerrado' ? '#4c5147' : '#fff',
                    fontSize: 13,
                    fontWeight: 800,
                  }}>
                    {hora}
                  </span>
                </div>
              ))}
              <div style={{ fontSize: 11, color: '#5a6055', paddingTop: 4 }}>
                Almuerzo lun-vie: 16:00 - 17:00
              </div>
            </div>
          </div>

          <div>
            <h3 className="flow-kicker" style={{ marginBottom: 16 }}>
              Contacto
            </h3>

            <div style={{ display: 'grid', gap: 13, marginBottom: 22 }}>
              <div style={{ display: 'flex', gap: 10, color: '#dfe5d8', fontSize: 14 }}>
                <span style={{ color: 'var(--neon)' }}><PinIcon /></span>
                {DIRECCION}
              </div>

              <div style={{ display: 'flex', gap: 10, color: '#dfe5d8', fontSize: 14 }}>
                <span style={{ color: 'var(--neon)' }}><ClockIcon /></span>
                Agenda online disponible
              </div>

              <a
                href={INSTAGRAM}
                target="_blank"
                rel="noreferrer"
                style={{ display: 'flex', gap: 10, color: '#dfe5d8', fontSize: 14 }}
              >
                <span style={{ color: 'var(--neon)' }}><InstagramIcon /></span>
                @elpipebarber
              </a>
            </div>

            <a href={WHATSAPP} target="_blank" rel="noreferrer" className="btn-neon" style={{
              width: '100%',
              minHeight: 46,
              fontSize: 20,
            }}>
              <WhatsAppIcon />
              Escribenos
            </a>
          </div>
        </div>

        <div className="pipe-footer-bottom" style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 16,
          marginTop: 38,
          paddingTop: 18,
          borderTop: '1px solid rgba(183,255,0,.11)',
          color: '#596051',
          fontSize: 12,
          fontWeight: 700,
        }}>
          <span>
            © {new Date().getFullYear()} {MARCA}. Todos los derechos reservados.
          </span>

          <span style={{
            color: 'var(--neon)',
            fontWeight: 900,
            letterSpacing: '.12em',
            textTransform: 'uppercase',
          }}>
            {SELLO}
          </span>

          <a href={`tel:${TELEFONO.replace(/\s/g, '')}`} style={{ color: '#8d9484' }}>
            {TELEFONO}
          </a>
        </div>
      </div>
    </footer>
  );
}
