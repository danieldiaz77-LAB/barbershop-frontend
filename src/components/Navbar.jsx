import { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const MARCA = 'ELPIPEBARBER';
const SELLO = 'Flow Futurama';
const TELEFONO = '+56 9 9809 8449';
const INSTAGRAM = 'https://www.instagram.com/elpipebarber?igsh=MXN5eWF6bzZvZnoy';

const CalendarIcon = () => (
  <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.3" strokeLinecap="round" strokeLinejoin="round">
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

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  const isAdmin = user?.role === 'BARBER_ADMIN';
  const isBarber = user?.role === 'BARBER';
  const emailPendiente = user && !user.emailVerified && !isAdmin && !isBarber;

  const links = [
    { to: '/', label: 'Inicio', end: true },
    { to: '/servicios', label: 'Servicios' },
    ...(!isBarber ? [{ to: '/reservar', label: 'Reservar' }] : []),
    ...(user && !isAdmin && !isBarber ? [{ to: '/mis-citas', label: 'Mis citas' }] : []),
    ...(isBarber ? [{ to: '/barber', label: 'Mi panel' }] : []),
    ...(isAdmin ? [{ to: '/admin', label: 'Admin' }] : []),
  ];

  const closeMenu = () => setMenuOpen(false);

  const handleLogout = () => {
    logout();
    closeMenu();
    navigate('/');
  };

  return (
    <header style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 80,
        pointerEvents: 'none',
      }}>
      <style>{`
        @media (min-width: 769px) {
          .pipe-desktop-links { display: flex !important; }
          .pipe-desktop-actions { display: flex !important; }
          .pipe-menu-btn { display: none !important; }
        }

        @media (max-width: 768px) {
          .pipe-desktop-links,
          .pipe-desktop-actions { display: none !important; }
          .pipe-menu-btn { display: inline-flex !important; }
        }
      `}</style>

      {emailPendiente && (
        <div style={{
          background: 'rgba(251,191,36,.12)',
          border: '1px solid rgba(251,191,36,.35)',
          borderTop: 'none',
          borderLeft: 'none',
          borderRight: 'none',
          padding: '8px 20px',
          textAlign: 'center',
          fontSize: 12,
          fontWeight: 800,
          color: '#fbbf24',
          letterSpacing: '.06em',
          pointerEvents: 'auto',
          zIndex: 81,
          position: 'relative',
        }}>
          Verifica tu email para poder reservar.{' '}
          <Link to="/verificar-email" style={{ color: '#b7ff00', textDecoration: 'underline' }}>
            Reenviar verificacion
          </Link>
        </div>
      )}

      <nav style={{
        height: 112,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 clamp(18px, 4vw, 48px)',
        background: 'linear-gradient(180deg, rgba(0,0,0,.82) 0%, rgba(0,0,0,.42) 58%, transparent 100%)',
        pointerEvents: 'auto',
      }}>
        <Link to="/" onClick={closeMenu} style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <div style={{
            width: 46,
            height: 46,
            border: '1px solid rgba(183,255,0,.55)',
            borderRadius: 8,
            display: 'grid',
            placeItems: 'center',
            color: 'var(--neon)',
            fontFamily: '"Bebas Neue", Impact, sans-serif',
            fontSize: 30,
            lineHeight: 1,
            boxShadow: '0 0 22px rgba(183,255,0,.12)',
          }}>
            EP
          </div>

          <div style={{ lineHeight: 1 }}>
            <div className="flow-title" style={{ fontSize: 30, color: '#fff' }}>
              {MARCA}
            </div>
            <div style={{
              marginTop: 3,
              fontSize: 11,
              fontWeight: 900,
              letterSpacing: '.18em',
              textTransform: 'uppercase',
              color: 'var(--neon)',
            }}>
              {SELLO}
            </div>
          </div>
        </Link>

        <div className="pipe-desktop-links" style={{ display: 'none', alignItems: 'center', gap: 4 }}>
          {links.map(({ to, label, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              style={({ isActive }) => ({
                position: 'relative',
                padding: '10px 14px',
                color: isActive ? 'var(--neon)' : '#e7eadf',
                fontSize: 13,
                fontWeight: 900,
                letterSpacing: '.08em',
                textTransform: 'uppercase',
                opacity: isActive ? 1 : 0.78,
              })}
            >
              {({ isActive }) => (
                <>
                  {label}
                  {isActive && (
                    <span style={{
                      position: 'absolute',
                      left: 14,
                      right: 14,
                      bottom: 2,
                      height: 2,
                      background: 'var(--neon)',
                      boxShadow: '0 0 14px rgba(183,255,0,.8)',
                    }} />
                  )}
                </>
              )}
            </NavLink>
          ))}
        </div>

        <div className="pipe-desktop-actions" style={{ display: 'none', alignItems: 'center', gap: 14 }}>
          <a
            href={INSTAGRAM}
            target="_blank"
            rel="noreferrer"
            title="Instagram"
            style={{
              width: 42,
              height: 42,
              border: '1px solid rgba(255,255,255,.14)',
              borderRadius: 8,
              display: 'grid',
              placeItems: 'center',
              color: '#fff',
            }}
          >
            <InstagramIcon />
          </a>

          {!user ? (
            <>
              <Link to="/login" className="btn-ghost" style={{ minHeight: 42, padding: '8px 16px', fontSize: 18 }}>
                Login
              </Link>
              <Link to="/reservar" className="btn-neon" style={{ minHeight: 46, padding: '10px 20px' }}>
                <CalendarIcon />
                Reserva tu hora
              </Link>
            </>
          ) : (
            <>
              <span style={{
                color: 'var(--neon)',
                fontSize: 12,
                fontWeight: 900,
                letterSpacing: '.1em',
                textTransform: 'uppercase',
              }}>
                {user.fullName?.split(' ')[0] || 'Cuenta'}
              </span>
              <button onClick={handleLogout} className="btn-ghost" style={{ minHeight: 42, padding: '8px 16px', fontSize: 18 }}>
                Salir
              </button>
            </>
          )}
        </div>

        <button
          className="pipe-menu-btn"
          onClick={() => setMenuOpen(v => !v)}
          aria-label="Abrir menu"
          style={{
            display: 'none',
            width: 44,
            height: 44,
            border: '1px solid rgba(183,255,0,.35)',
            borderRadius: 8,
            background: 'rgba(183,255,0,.05)',
            color: 'var(--neon)',
            alignItems: 'center',
            justifyContent: 'center',
            flexDirection: 'column',
            gap: 5,
          }}
        >
          <span style={{ width: 20, height: 2, background: 'currentColor', transform: menuOpen ? 'rotate(45deg) translate(5px,5px)' : 'none', transition: '.2s' }} />
          <span style={{ width: 20, height: 2, background: menuOpen ? 'transparent' : 'currentColor', transition: '.2s' }} />
          <span style={{ width: 20, height: 2, background: 'currentColor', transform: menuOpen ? 'rotate(-45deg) translate(5px,-5px)' : 'none', transition: '.2s' }} />
        </button>
      </nav>

      {menuOpen && (
        <div style={{
          position: 'fixed',
          top: 112,
          left: 0,
          right: 0,
          bottom: 0,
          zIndex: 79,
          padding: '28px 22px',
          background: 'rgba(3,4,3,.98)',
          borderTop: '1px solid var(--line)',
          display: 'flex',
          flexDirection: 'column',
          gap: 22,
          pointerEvents: 'auto',
        }}>
          <div style={{ display: 'grid', gap: 4 }}>
            {links.map(({ to, label, end }) => (
              <NavLink
                key={to}
                to={to}
                end={end}
                onClick={closeMenu}
                className="flow-title"
                style={({ isActive }) => ({
                  padding: '14px 0',
                  borderBottom: '1px solid rgba(183,255,0,.12)',
                  color: isActive ? 'var(--neon)' : '#fff',
                  fontSize: 44,
                })}
              >
                {label}
              </NavLink>
            ))}
          </div>

          {!user ? (
            <div style={{ display: 'grid', gap: 12 }}>
              <Link to="/reservar" onClick={closeMenu} className="btn-neon">
                <CalendarIcon />
                Reserva tu hora
              </Link>
              <Link to="/login" onClick={closeMenu} className="btn-ghost">
                Login
              </Link>
            </div>
          ) : (
            <button onClick={handleLogout} className="btn-ghost">
              Cerrar sesion
            </button>
          )}

          <div style={{ marginTop: 'auto', color: 'var(--muted)', fontSize: 13, lineHeight: 1.8 }}>
            <strong style={{ color: 'var(--neon)' }}>{SELLO}</strong><br />
            La Galaxia 2292, Maipu<br />
            {TELEFONO}
          </div>
        </div>
      )}
    </header>
  );
}
