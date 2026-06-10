import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { appointmentsApi } from '../services/endpoints';

const neon = '#b7ff00';

const estadoMap = {
  PENDING: {
    label: 'Pendiente',
    color: '#fbbf24',
    bg: 'rgba(251,191,36,.09)',
  },
  PAID: {
    label: 'Pagada',
    color: '#4ade80',
    bg: 'rgba(74,222,128,.09)',
  },
  COMPLETED: {
    label: 'Completada',
    color: '#60a5fa',
    bg: 'rgba(96,165,250,.09)',
  },
  CANCELLED: {
    label: 'Cancelada',
    color: '#f87171',
    bg: 'rgba(248,113,113,.09)',
  },
};

function formatPrice(value) {
  return `$${Number(value || 0).toLocaleString('es-CL')}`;
}

function formatFecha(value) {
  return new Date(value).toLocaleDateString('es-CL', { timeZone: 'America/Santiago',
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

function formatHora(value) {
  return new Date(value).toLocaleTimeString('es-CL', { timeZone: 'America/Santiago',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function isUpcoming(cita) {
  return new Date(cita.startTime).getTime() > Date.now()
    && cita.status !== 'CANCELLED'
    && cita.status !== 'COMPLETED';
}

export default function MisCitas() {
  const [citas, setCitas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cancelando, setCancelando] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    appointmentsApi.mine()
      .then((data) => setCitas(Array.isArray(data) ? data : []))
      .catch(() => setError('No pudimos cargar tus citas.'))
      .finally(() => setLoading(false));
  }, []);

  const proximas = useMemo(
    () => citas.filter(isUpcoming).length,
    [citas]
  );

  const cancelar = async (id) => {
    if (!window.confirm('Cancelar esta cita?')) return;

    setError('');
    setCancelando(id);

    try {
      const updated = await appointmentsApi.cancel(id);
      setCitas((prev) => prev.map((cita) => cita.id === id ? updated : cita));
    } catch {
      setError('No se pudo cancelar la cita.');
    } finally {
      setCancelando(null);
    }
  };

  return (
    <main className="appointments-page">
      <style>{`
        .appointments-page {
          min-height: 100vh;
          padding: 150px 20px 86px;
          background:
            radial-gradient(circle at 78% 12%, rgba(183,255,0,.10), transparent 30%),
            linear-gradient(180deg, #030403 0%, #060806 48%, #030403 100%);
          color: var(--text);
        }

        .appointments-shell {
          width: min(1040px, 100%);
          margin: 0 auto;
          position: relative;
        }

        .appointments-shell::before {
          content: "FLOW";
          position: absolute;
          top: 8px;
          right: -8px;
          font-family: "Bebas Neue", Impact, sans-serif;
          font-size: clamp(90px, 14vw, 190px);
          color: rgba(183,255,0,.035);
          line-height: .8;
          pointer-events: none;
        }

        .appointments-head {
          position: relative;
          z-index: 1;
          display: grid;
          grid-template-columns: minmax(0, 1fr) auto;
          gap: 24px;
          align-items: end;
          margin-bottom: 34px;
        }

        .appointments-title {
          color: #fff;
          font-size: clamp(62px, 9vw, 122px);
          line-height: .88;
        }

        .appointments-title span {
          color: ${neon};
        }

        .appointments-copy {
          max-width: 560px;
          color: #cdd4c4;
          font-size: 16px;
          line-height: 1.7;
          margin-top: 14px;
        }

        .appointments-stat {
          min-width: 220px;
          padding: 22px;
          border-top: 1px solid rgba(183,255,0,.3);
          background: rgba(6,8,5,.58);
          text-align: right;
        }

        .appointments-stat strong {
          display: block;
          color: ${neon};
          font-family: "Bebas Neue", Impact, sans-serif;
          font-size: 58px;
          line-height: .9;
        }

        .appointments-stat span {
          color: #8d9484;
          font-size: 11px;
          font-weight: 900;
          letter-spacing: .12em;
          text-transform: uppercase;
        }

        .appointments-error {
          position: relative;
          z-index: 1;
          margin-bottom: 22px;
          padding: 13px 16px;
          border: 1px solid rgba(248,113,113,.28);
          background: rgba(248,113,113,.08);
          color: #f87171;
          font-size: 13px;
        }

        .appointments-loading,
        .appointments-empty {
          position: relative;
          z-index: 1;
          min-height: 280px;
          display: grid;
          place-items: center;
          text-align: center;
          border-top: 1px solid rgba(183,255,0,.2);
          background: rgba(6,8,5,.45);
          padding: 34px;
        }

        .appointments-empty h2 {
          color: #fff;
          font-size: clamp(42px, 7vw, 72px);
          margin-top: 10px;
        }

        .appointments-empty p,
        .appointments-loading {
          color: #8d9484;
          line-height: 1.7;
        }

        .appointments-list {
          position: relative;
          z-index: 1;
          display: grid;
          gap: 12px;
        }

        .appointment-card {
        position: relative;
        display: grid;
        grid-template-columns: 112px minmax(0, 1fr) 190px;
        gap: 28px;
        align-items: center;
        padding: 32px 0;
        border-top: 1px solid rgba(183,255,0,.17);
        overflow: hidden;
      }

      .appointment-card:first-child {
        border-top-color: rgba(183,255,0,.42);
      }

      .appointment-card::before {
        content: attr(data-index);
        position: absolute;
        right: 8px;
        top: 6px;
        font-family: "Bebas Neue", Impact, sans-serif;
        font-size: 96px;
        color: rgba(183,255,0,.04);
        z-index: -1;
      }

      .appointment-date {
        width: 96px;
        min-height: 104px;
        display: grid;
        place-items: center;
        border-left: 3px solid #b7ff00;
        color: #b7ff00;
        text-align: center;
      }

      .appointment-date strong {
        display: block;
        font-family: "Bebas Neue", Impact, sans-serif;
        font-size: 60px;
        line-height: .86;
      }

      .appointment-date span {
        display: block;
        color: #aeb5a8;
        font-size: 12px;
        font-weight: 900;
        letter-spacing: .12em;
        text-transform: uppercase;
        margin-top: 8px;
      }

      .appointment-main h2 {
        color: #fff;
        font-size: clamp(46px, 5.7vw, 74px);
        line-height: .9;
        margin-bottom: 20px;
      }

      .appointment-meta {
        display: grid;
        grid-template-columns: repeat(2, minmax(230px, 1fr));
        gap: 14px 28px;
        color: #aeb5a8;
        font-size: 16px;
        line-height: 1.45;
      }

      .appointment-meta span {
        display: grid;
        gap: 4px;
      }

      .appointment-meta em {
        color: #7f8678;
        font-style: normal;
        font-size: 11px;
        font-weight: 900;
        letter-spacing: .1em;
        text-transform: uppercase;
      }

      .appointment-meta strong {
        color: #fff;
        font-size: 17px;
      }

      .appointment-notes {
        margin-top: 14px;
        color: #737a6d;
        font-size: 14px;
        line-height: 1.5;
      }

      .appointment-side {
        min-width: 190px;
        display: grid;
        justify-items: end;
        gap: 12px;
      }

      .appointment-price {
        color: ${neon};
        font-family: "Bebas Neue", Impact, sans-serif;
        font-size: 62px;
        line-height: .85;
      }

      .appointment-status {
        padding: 8px 14px;
        border: 1px solid currentColor;
        font-size: 11px;
        font-weight: 900;
        letter-spacing: .13em;
        text-transform: uppercase;
        border-radius: 999px;
      }

      .appointment-actions {
        display: flex;
        gap: 10px;
        flex-wrap: wrap;
        justify-content: flex-end;
        margin-top: 8px;
      }

      .appointment-actions .btn-ghost {
        min-height: 48px;
        padding: 10px 20px;
        font-size: 20px;
      }

      .appointments-bottom {
        position: relative;
        z-index: 1;
        display: flex;
        justify-content: center;
        margin-top: 36px;
      }

      @media (max-width: 820px) {
        .appointments-head {
          grid-template-columns: 1fr;
        }

        .appointments-stat {
          text-align: left;
        }

        .appointment-card {
          grid-template-columns: 72px minmax(0, 1fr);
        }

        .appointment-side {
          grid-column: 2;
          justify-items: start;
          min-width: 0;
        }

        .appointment-actions {
          justify-content: flex-start;
        }
      }

      @media (max-width: 560px) {
        .appointments-page {
          padding-top: 130px;
        }

        .appointment-card {
          grid-template-columns: 1fr;
          gap: 14px;
        }

        .appointment-date,
        .appointment-side {
          grid-column: 1;
        }

        .appointment-date {
          width: 70px;
          min-height: 70px;
        }

        .appointment-side {
          justify-items: start;
        }

        .appointment-actions .btn-ghost {
          width: 100%;
        }
      }
      `}</style>

      <section className="appointments-shell">
        <header className="appointments-head fadeup">
          <div>
            <div className="flow-kicker">Tu historial</div>

            <h1 className="flow-title appointments-title">
              MIS
              <br />
              <span>CITAS.</span>
            </h1>

            <p className="appointments-copy">
              Revisa tus reservas, horarios y estado de cada cita. Si necesitas cambiar planes,
              puedes cancelar una cita pendiente desde aqui.
            </p>
          </div>

          <aside className="appointments-stat">
            <strong>{proximas}</strong>
            <span>{proximas === 1 ? 'Cita proxima' : 'Citas proximas'}</span>
          </aside>
        </header>

        {error && (
          <div className="appointments-error">
            {error}
          </div>
        )}

        {loading ? (
          <div className="appointments-loading fadeup">
            Cargando tus citas...
          </div>
        ) : citas.length === 0 ? (
          <div className="appointments-empty fadeup">
            <div>
              <div className="flow-kicker">Agenda vacia</div>

              <h2 className="flow-title">
                AUN NO TIENES CITAS
              </h2>

              <p style={{ maxWidth: 420, margin: '12px auto 26px' }}>
                Reserva tu primer corte y asegura tu hora con el sello Flow Futurama.
              </p>

              <Link to="/reservar" className="btn-neon">
                Reservar ahora
              </Link>
            </div>
          </div>
        ) : (
          <>
            <div className="appointments-list">
              {citas.map((cita, index) => {
                const estado = estadoMap[cita.status] || estadoMap.PENDING;
                const fecha = new Date(cita.startTime);

                return (
                  <article
                    key={cita.id}
                    className="appointment-card fadeup"
                    data-index={String(index + 1).padStart(2, '0')}
                  >
                    <div className="appointment-date">
                      <div>
                        <strong>{fecha.getDate()}</strong>
                        <span>
                          {fecha.toLocaleDateString('es-CL', { timeZone: 'America/Santiago', month: 'short' })}
                        </span>
                      </div>
                    </div>

                    <div className="appointment-main">
                    <h2 className="flow-title">
                      {cita.serviceName}
                    </h2>

                    <div className="appointment-meta">
                      <span>
                        <em>Barbero</em>
                        <strong>{cita.barberName}</strong>
                      </span>

                      <span>
                        <em>Fecha</em>
                        <strong>{formatFecha(cita.startTime)}</strong>
                      </span>

                      <span>
                        <em>Hora</em>
                        <strong>{formatHora(cita.startTime)} - {formatHora(cita.endTime)}</strong>
                      </span>

                      <span>
                        <em>Duracion</em>
                        <strong>{cita.durationMinutes} min</strong>
                      </span>
                    </div>

                    {cita.notes && (
                      <p className="appointment-notes">
                        Nota: {cita.notes}
                      </p>
                    )}
                  </div>

                  <div className="appointment-side">
                    <div className="appointment-price">
                      {formatPrice(cita.servicePrice)}
                    </div>

                    <div
                      className="appointment-status"
                      style={{
                        color: estado.color,
                        background: estado.bg,
                      }}
                    >
                      {estado.label}
                    </div>

                    {cita.status === 'PENDING' && (
                      <div className="appointment-actions">
                        <button
                          type="button"
                          onClick={() => cancelar(cita.id)}
                          disabled={cancelando === cita.id}
                          className="btn-ghost"
                        >
                          {cancelando === cita.id ? 'Cancelando...' : 'Cancelar cita'}
                        </button>
                      </div>
                    )}
                  </div>
                  </article>
                );
              })}
            </div>

            <div className="appointments-bottom">
              <Link to="/reservar" className="btn-neon">
                Nueva reserva
              </Link>
            </div>
          </>
        )}
      </section>
    </main>
  );
}