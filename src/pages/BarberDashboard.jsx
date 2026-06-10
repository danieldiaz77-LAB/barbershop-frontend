import { useCallback, useEffect, useMemo, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { adminApi, appointmentsApi, barbersApi } from '../services/endpoints';

const neon = '#b7ff00';

const ESTADO = {
  PENDING: { label: 'Pendiente', color: '#fbbf24', bg: 'rgba(251,191,36,.09)' },
  PAID: { label: 'Pagada', color: '#4ade80', bg: 'rgba(74,222,128,.09)' },
  COMPLETED: { label: 'Completada', color: '#60a5fa', bg: 'rgba(96,165,250,.09)' },
  CANCELLED: { label: 'Cancelada', color: '#f87171', bg: 'rgba(248,113,113,.09)' },
};

function formatDateISO(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

function formatHora(value) {
  return new Date(value).toLocaleTimeString('es-CL', {
    hour: '2-digit',
    minute: '2-digit',
  });
}

function formatFecha(value) {
  return new Date(value).toLocaleDateString('es-CL', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  });
}

function formatPrice(value) {
  return `$${Number(value || 0).toLocaleString('es-CL')}`;
}

export default function BarberDashboard() {
  const { user } = useAuth();

  const [tab, setTab] = useState('jornada');
  const [barbero, setBarbero] = useState(null);
  const [citas, setCitas] = useState([]);
  const [todasCitas, setTodasCitas] = useState([]);
  const [fecha, setFecha] = useState(formatDateISO(new Date()));
  const [loading, setLoading] = useState(true);
  const [completando, setCompletando] = useState(null);
  const [error, setError] = useState('');
  const [ok, setOk] = useState('');

  const cargarPerfil = useCallback(async () => {
    try {
      const barberos = await barbersApi.list();
      const mio = barberos.find((b) => b.userId === user?.id);
      setBarbero(mio || null);
      return mio || null;
    } catch {
      setError('No pudimos cargar tu perfil de barbero.');
      return null;
    }
  }, [user?.id]);

  const cargarCitas = useCallback(async (perfil = barbero) => {
    if (!perfil) return;

    setLoading(true);
    setError('');

    try {
      const [delDia, historial] = await Promise.all([
        appointmentsApi.byBarber(perfil.id, fecha),
        appointmentsApi.byBarber(perfil.id, null),
      ]);

      setCitas(Array.isArray(delDia) ? delDia : []);
      setTodasCitas(Array.isArray(historial) ? historial : []);
    } catch {
      setError('No pudimos cargar tus citas.');
    } finally {
      setLoading(false);
    }
  }, [barbero, fecha]);

  useEffect(() => {
    cargarPerfil().then((perfil) => {
      if (perfil) cargarCitas(perfil);
      else setLoading(false);
    });
  }, [cargarPerfil]);

  useEffect(() => {
    if (barbero) cargarCitas(barbero);
  }, [fecha, barbero, cargarCitas]);

  const completarCita = async (id) => {
    if (!window.confirm('Marcar esta cita como completada?')) return;

    setCompletando(id);
    setError('');
    setOk('');

    try {
      await appointmentsApi.complete(id);
      setCitas((prev) => prev.map((c) => c.id === id ? { ...c, status: 'COMPLETED' } : c));
      setTodasCitas((prev) => prev.map((c) => c.id === id ? { ...c, status: 'COMPLETED' } : c));
      setOk('Cita marcada como completada.');
    } catch {
      setError('No pudimos completar la cita.');
    } finally {
      setCompletando(null);
    }
  };

  const citasActivas = citas.filter((c) => c.status !== 'CANCELLED');
  const pendientes = citas.filter((c) => c.status === 'PENDING').length;
  const completadas = citas.filter((c) => c.status === 'COMPLETED' || c.status === 'PAID').length;
  const ingresos = citasActivas.reduce((sum, c) => sum + Number(c.servicePrice || 0), 0);

  const proximaCita = useMemo(() => {
    return citas
      .filter((c) => c.status === 'PENDING' && new Date(c.startTime).getTime() >= Date.now())
      .sort((a, b) => new Date(a.startTime) - new Date(b.startTime))[0];
  }, [citas]);

  const clientes = useMemo(() => {
    const mapa = new Map();

    todasCitas.forEach((cita) => {
      if (!cita.clientId) return;

      const actual = mapa.get(cita.clientId) || {
        id: cita.clientId,
        nombre: cita.clientName,
        total: 0,
        ultima: cita.startTime,
      };

      actual.total += 1;

      if (new Date(cita.startTime) > new Date(actual.ultima)) {
        actual.ultima = cita.startTime;
      }

      mapa.set(cita.clientId, actual);
    });

    return Array.from(mapa.values())
      .sort((a, b) => new Date(b.ultima) - new Date(a.ultima));
  }, [todasCitas]);

  const horas = useMemo(() => {
    const inicio = Number(barbero?.workStart?.split(':')[0] || 9);
    const fin = Number(barbero?.workEnd?.split(':')[0] || 19);
    return Array.from({ length: Math.max(fin - inicio, 1) }, (_, i) => inicio + i);
  }, [barbero]);

  const citaPorHora = (hora) => {
    return citas.find((cita) => new Date(cita.startTime).getHours() === hora);
  };

  if (!loading && !barbero) {
    return (
      <main className="barber-page">
        <DashboardStyles />
        <section className="barber-empty flow-shell">
          <div className="flow-kicker">Panel barbero</div>
          <h1 className="flow-title">CUENTA SIN PERFIL</h1>
          <p>Pidele al administrador que vincule tu usuario con un perfil de barbero.</p>
        </section>
      </main>
    );
  }

  return (
    <main className="barber-page">
      <DashboardStyles />

      <section className="flow-shell barber-shell">
        <header className="barber-hero fadeup">
          <div>
            <div className="flow-kicker">Panel barbero</div>

            <h1 className="flow-title barber-title">
              JORNADA
              <br />
              <span>DE CORTE.</span>
            </h1>

            <p>
              Controla tu agenda diaria, revisa clientes y marca tus servicios completados
              sin salir del flow.
            </p>
          </div>

          <div className="barber-profile">
            <div className="profile-mark">
              {barbero?.name?.charAt(0) || 'B'}
            </div>
            <div>
              <strong>{barbero?.name || 'Barbero'}</strong>
              <span>{barbero?.specialty || 'Flow Futurama'}</span>
              <small>{barbero?.workStart} - {barbero?.workEnd}</small>
            </div>
          </div>
        </header>

        <div className="barber-toolbar fadeup">
          <div className="date-control">
            <span>Dia de trabajo</span>
            <input
              type="date"
              value={fecha}
              onChange={(event) => setFecha(event.target.value)}
            />
          </div>

          <button
            type="button"
            onClick={async () => {
              try {
                await adminApi.sendAgendaTest();
                setOk('Agenda enviada a tu correo.');
                window.setTimeout(() => setOk(''), 3500);
              } catch {
                setError('No se pudo enviar la agenda.');
                window.setTimeout(() => setError(''), 3500);
              }
            }}
            style={{
              padding: '9px 20px',
              border: '1px solid rgba(183,255,0,.3)',
              borderRadius: 999,
              background: 'transparent',
              color: neon,
              fontSize: 12,
              fontWeight: 900,
              letterSpacing: '.07em',
              textTransform: 'uppercase',
              cursor: 'pointer',
              whiteSpace: 'nowrap',
            }}
          >
            ⚡ Enviar agenda al correo
          </button>

          <div className="tabs">
            {[
              ['jornada', 'Jornada'],
              ['citas', 'Citas'],
              ['clientes', 'Clientes'],
            ].map(([key, label]) => (
              <button
                key={key}
                type="button"
                onClick={() => setTab(key)}
                className={tab === key ? 'active' : ''}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {(error || ok) && (
          <div className={error ? 'barber-alert error' : 'barber-alert ok'}>
            {error || ok}
          </div>
        )}

        <section className="metric-grid fadeup">
          <Metric label="Pendientes" value={pendientes} />
          <Metric label="Completadas" value={completadas} />
          <Metric label="Ingreso del dia" value={formatPrice(ingresos)} />
        </section>

        {tab === 'jornada' && (
          <section className="barber-layout fadeup">
            <div className="workday-panel">
              <div className="section-head">
                <div>
                  <div className="flow-kicker">{formatFecha(`${fecha}T12:00:00`)}</div>
                  <h2 className="flow-title">AGENDA POR HORA</h2>
                </div>
              </div>

              {loading ? (
                <div className="empty-state">Cargando agenda...</div>
              ) : (
                <div className="timeline">
                  {horas.map((hora) => {
                    const cita = citaPorHora(hora);
                    const estado = cita ? (ESTADO[cita.status] || ESTADO.PENDING) : null;

                    return (
                      <div key={hora} className={cita ? 'time-row booked' : 'time-row'}>
                        <div className="time-label">
                          {String(hora).padStart(2, '0')}:00
                        </div>

                        {cita ? (
                          <div className="time-card">
                            <div>
                              <div className="time-range">
                                {formatHora(cita.startTime)} - {formatHora(cita.endTime)}
                              </div>
                              <h3>{cita.clientName}</h3>
                              <p>{cita.serviceName} / {cita.durationMinutes} min / {formatPrice(cita.servicePrice)}</p>
                              {cita.notes && <small>Nota: {cita.notes}</small>}
                            </div>

                            <div className="time-actions">
                              <span style={{ color: estado.color, background: estado.bg }}>
                                {estado.label}
                              </span>

                              {cita.status === 'PENDING' && (
                                <button
                                  type="button"
                                  onClick={() => completarCita(cita.id)}
                                  disabled={completando === cita.id}
                                >
                                  {completando === cita.id ? '...' : 'Completar'}
                                </button>
                              )}
                            </div>
                          </div>
                        ) : (
                          <div className="free-slot">Disponible</div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            <aside className="next-panel">
              <div className="flow-kicker">Proxima cita</div>

              {proximaCita ? (
                <>
                  <h2 className="flow-title">{formatHora(proximaCita.startTime)}</h2>
                  <h3>{proximaCita.clientName}</h3>
                  <p>{proximaCita.serviceName}</p>

                  <div className="next-lines">
                    <span>
                      Duracion
                      <strong>{proximaCita.durationMinutes} min</strong>
                    </span>
                    <span>
                      Total
                      <strong>{formatPrice(proximaCita.servicePrice)}</strong>
                    </span>
                  </div>

                  {proximaCita.notes && (
                    <div className="next-note">
                      {proximaCita.notes}
                    </div>
                  )}

                  <button
                    type="button"
                    onClick={() => completarCita(proximaCita.id)}
                    disabled={completando === proximaCita.id}
                    className="btn-neon"
                  >
                    {completando === proximaCita.id ? 'Marcando...' : 'Marcar completada'}
                  </button>
                </>
              ) : (
                <div className="empty-next">
                  No hay citas pendientes para esta fecha.
                </div>
              )}
            </aside>
          </section>
        )}

        {tab === 'citas' && (
          <section className="list-panel fadeup">
            <div className="section-head">
              <div>
                <div className="flow-kicker">Lista del dia</div>
                <h2 className="flow-title">CITAS</h2>
              </div>
            </div>

            {loading ? (
              <div className="empty-state">Cargando citas...</div>
            ) : citas.length === 0 ? (
              <div className="empty-state">No tienes citas para esta fecha.</div>
            ) : (
              <div className="appointment-list">
                {citas.map((cita, index) => {
                  const estado = ESTADO[cita.status] || ESTADO.PENDING;

                  return (
                    <article key={cita.id} className="appointment-row" data-index={String(index + 1).padStart(2, '0')}>
                      <div className="row-time">
                        <strong>{formatHora(cita.startTime)}</strong>
                        <span>{formatHora(cita.endTime)}</span>
                      </div>

                      <div className="row-main">
                        <h3 className="flow-title">{cita.clientName}</h3>
                        <p>{cita.serviceName} / {cita.durationMinutes} min</p>
                        {cita.notes && <small>Nota: {cita.notes}</small>}
                      </div>

                      <div className="row-side">
                        <strong>{formatPrice(cita.servicePrice)}</strong>
                        <span style={{ color: estado.color, background: estado.bg }}>
                          {estado.label}
                        </span>

                        {cita.status === 'PENDING' && (
                          <button
                            type="button"
                            onClick={() => completarCita(cita.id)}
                            disabled={completando === cita.id}
                          >
                            {completando === cita.id ? '...' : 'Completar'}
                          </button>
                        )}
                      </div>
                    </article>
                  );
                })}
              </div>
            )}
          </section>
        )}

        {tab === 'clientes' && (
          <section className="list-panel fadeup">
            <div className="section-head">
              <div>
                <div className="flow-kicker">Clientes atendidos</div>
                <h2 className="flow-title">CLIENTES</h2>
              </div>
            </div>

            {clientes.length === 0 ? (
              <div className="empty-state">Aun no tienes clientes registrados.</div>
            ) : (
              <div className="client-grid">
                {clientes.map((cliente) => (
                  <article key={cliente.id} className="client-card">
                    <div className="client-avatar">
                      {cliente.nombre?.charAt(0) || 'C'}
                    </div>

                    <div>
                      <h3>{cliente.nombre}</h3>
                      <p>Ultima cita: {formatFecha(cliente.ultima)}</p>
                    </div>

                    <strong>{cliente.total}</strong>
                  </article>
                ))}
              </div>
            )}
          </section>
        )}
      </section>
    </main>
  );
}

function Metric({ label, value }) {
  return (
    <article className="metric-card">
      <span>{label}</span>
      <strong>{value}</strong>
    </article>
  );
}

function DashboardStyles() {
  return (
    <style>{`
      .barber-page {
        min-height: 100vh;
        padding: 150px 0 86px;
        background:
          radial-gradient(circle at 82% 8%, rgba(183,255,0,.12), transparent 28%),
          linear-gradient(180deg, #030403 0%, #050705 50%, #030403 100%);
        color: var(--text);
      }

      .barber-shell {
        position: relative;
      }

      .barber-shell::before {
        content: "BARBER";
        position: absolute;
        top: 10px;
        right: -20px;
        font-family: "Bebas Neue", Impact, sans-serif;
        font-size: clamp(80px, 14vw, 190px);
        color: rgba(183,255,0,.035);
        line-height: .8;
        pointer-events: none;
      }

      .barber-hero,
      .barber-toolbar,
      .metric-grid,
      .barber-layout,
      .list-panel,
      .barber-alert {
        position: relative;
        z-index: 1;
      }

      .barber-hero {
        display: grid;
        grid-template-columns: minmax(0, 1fr) 340px;
        gap: 28px;
        align-items: end;
        margin-bottom: 30px;
      }

      .barber-title {
        color: #fff;
        font-size: clamp(62px, 9vw, 126px);
        line-height: .88;
      }

      .barber-title span {
        color: ${neon};
      }

      .barber-hero p {
        max-width: 620px;
        color: #cdd4c4;
        font-size: 16px;
        line-height: 1.7;
        margin-top: 16px;
      }

      .barber-profile {
        display: grid;
        grid-template-columns: 76px 1fr;
        gap: 16px;
        align-items: center;
        padding: 20px;
        border-top: 1px solid rgba(183,255,0,.32);
        background: rgba(6,8,5,.62);
      }

      .profile-mark {
        width: 76px;
        height: 76px;
        display: grid;
        place-items: center;
        color: #030403;
        background: ${neon};
        font-family: "Bebas Neue", Impact, sans-serif;
        font-size: 48px;
      }

      .barber-profile strong,
      .barber-profile span,
      .barber-profile small {
        display: block;
      }

      .barber-profile strong {
        color: #fff;
        font-size: 18px;
        font-weight: 900;
        text-transform: uppercase;
      }

      .barber-profile span {
        color: ${neon};
        font-size: 12px;
        font-weight: 900;
        letter-spacing: .1em;
        text-transform: uppercase;
        margin-top: 4px;
      }

      .barber-profile small {
        color: #8d9484;
        margin-top: 8px;
      }

      .barber-toolbar {
        display: flex;
        justify-content: space-between;
        gap: 18px;
        align-items: center;
        flex-wrap: wrap;
        margin-bottom: 22px;
      }

      .date-control {
        display: flex;
        gap: 12px;
        align-items: center;
        flex-wrap: wrap;
      }

      .date-control span {
        color: #8d9484;
        font-size: 11px;
        font-weight: 900;
        letter-spacing: .12em;
        text-transform: uppercase;
      }

      .date-control input {
        min-height: 44px;
        padding: 0 14px;
        border: 1px solid rgba(183,255,0,.22);
        background: rgba(255,255,255,.035);
        color: #fff;
        color-scheme: dark;
      }

      .tabs {
        display: flex;
        gap: 8px;
        flex-wrap: wrap;
      }

      .tabs button {
        min-height: 44px;
        padding: 0 18px;
        border: 1px solid rgba(183,255,0,.16);
        background: transparent;
        color: #8d9484;
        font-size: 12px;
        font-weight: 900;
        letter-spacing: .1em;
        text-transform: uppercase;
        cursor: pointer;
      }

      .tabs button.active {
        color: #030403;
        background: ${neon};
        border-color: ${neon};
      }

      .barber-alert {
        margin-bottom: 18px;
        padding: 13px 16px;
        font-size: 13px;
      }

      .barber-alert.error {
        color: #f87171;
        border: 1px solid rgba(248,113,113,.28);
        background: rgba(248,113,113,.08);
      }

      .barber-alert.ok {
        color: #4ade80;
        border: 1px solid rgba(74,222,128,.28);
        background: rgba(74,222,128,.08);
      }

      .metric-grid {
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        gap: 12px;
        margin-bottom: 24px;
      }

      .metric-card {
        padding: 22px;
        border-top: 1px solid rgba(183,255,0,.28);
        background: rgba(6,8,5,.56);
      }

      .metric-card span {
        display: block;
        color: #8d9484;
        font-size: 11px;
        font-weight: 900;
        letter-spacing: .12em;
        text-transform: uppercase;
        margin-bottom: 10px;
      }

      .metric-card strong {
        color: ${neon};
        font-family: "Bebas Neue", Impact, sans-serif;
        font-size: 58px;
        line-height: .85;
      }

      .barber-layout {
        display: grid;
        grid-template-columns: minmax(0, 1fr) 330px;
        gap: 24px;
        align-items: start;
      }

      .workday-panel,
      .next-panel,
      .list-panel {
        border-top: 1px solid rgba(183,255,0,.25);
        background: rgba(6,8,5,.46);
      }

      .workday-panel,
      .list-panel {
        padding: 24px;
      }

      .next-panel {
        position: sticky;
        top: 126px;
        padding: 24px;
      }

      .section-head {
        display: flex;
        justify-content: space-between;
        gap: 18px;
        align-items: end;
        margin-bottom: 22px;
      }

      .section-head h2 {
        color: #fff;
        font-size: clamp(38px, 5vw, 68px);
        margin-top: 6px;
      }

      .timeline {
        display: grid;
        gap: 8px;
      }

      .time-row {
        display: grid;
        grid-template-columns: 78px minmax(0, 1fr);
        gap: 12px;
        align-items: stretch;
      }

      .time-label {
        color: ${neon};
        font-size: 12px;
        font-weight: 900;
        letter-spacing: .08em;
        padding-top: 18px;
        text-align: right;
      }

      .free-slot,
      .time-card {
        min-height: 74px;
        border: 1px solid rgba(183,255,0,.10);
        background: rgba(255,255,255,.018);
      }

      .free-slot {
        display: flex;
        align-items: center;
        padding: 0 18px;
        color: #596051;
        font-size: 12px;
        font-weight: 900;
        letter-spacing: .1em;
        text-transform: uppercase;
      }

      .time-card {
        display: flex;
        justify-content: space-between;
        gap: 16px;
        padding: 16px 18px;
        border-color: rgba(183,255,0,.24);
        background: rgba(183,255,0,.045);
      }

      .time-range {
        color: ${neon};
        font-size: 11px;
        font-weight: 900;
        letter-spacing: .12em;
        text-transform: uppercase;
        margin-bottom: 6px;
      }

      .time-card h3 {
        color: #fff;
        font-size: 20px;
        margin-bottom: 4px;
      }

      .time-card p,
      .time-card small {
        color: #aeb5a8;
        line-height: 1.45;
      }

      .time-card small {
        display: block;
        margin-top: 6px;
      }

      .time-actions {
        display: grid;
        justify-items: end;
        align-content: start;
        gap: 10px;
      }

      .time-actions span,
      .row-side span {
        padding: 7px 10px;
        border: 1px solid currentColor;
        font-size: 10px;
        font-weight: 900;
        letter-spacing: .12em;
        text-transform: uppercase;
        white-space: nowrap;
      }

      .time-actions button,
      .row-side button {
        min-height: 38px;
        padding: 8px 14px;
        border: 1px solid ${neon};
        background: rgba(183,255,0,.06);
        color: ${neon};
        font-family: "Bebas Neue", Impact, sans-serif;
        font-size: 18px;
        cursor: pointer;
      }

      .next-panel h2 {
        color: ${neon};
        font-size: 76px;
        line-height: .85;
        margin: 14px 0 12px;
      }

      .next-panel h3 {
        color: #fff;
        font-size: 24px;
        margin-bottom: 6px;
      }

      .next-panel p,
      .empty-next,
      .empty-state {
        color: #aeb5a8;
        line-height: 1.6;
      }

      .next-lines {
        display: grid;
        gap: 10px;
        margin: 22px 0;
      }

      .next-lines span {
        display: flex;
        justify-content: space-between;
        gap: 18px;
        color: #7f8678;
        font-size: 12px;
        font-weight: 900;
        letter-spacing: .08em;
        text-transform: uppercase;
        padding-bottom: 10px;
        border-bottom: 1px solid rgba(183,255,0,.1);
      }

      .next-lines strong {
        color: #fff;
        font-size: 14px;
      }

      .next-note {
        color: #cdd4c4;
        border-left: 2px solid ${neon};
        padding-left: 12px;
        margin-bottom: 18px;
        line-height: 1.5;
      }

      .next-panel .btn-neon {
        width: 100%;
      }

      .empty-state {
        min-height: 180px;
        display: grid;
        place-items: center;
        text-align: center;
        border: 1px solid rgba(183,255,0,.1);
        background: rgba(255,255,255,.018);
        padding: 28px;
      }

      .appointment-list {
        display: grid;
        gap: 10px;
      }

      .appointment-row {
        position: relative;
        display: grid;
        grid-template-columns: 112px minmax(0, 1fr) 170px;
        gap: 22px;
        align-items: center;
        padding: 22px 0;
        border-top: 1px solid rgba(183,255,0,.14);
        overflow: hidden;
      }

      .appointment-row::before {
        content: attr(data-index);
        position: absolute;
        right: 0;
        top: 2px;
        font-family: "Bebas Neue", Impact, sans-serif;
        font-size: 88px;
        color: rgba(183,255,0,.035);
        z-index: -1;
      }

      .row-time {
        border-left: 3px solid ${neon};
        padding-left: 16px;
      }

      .row-time strong {
        display: block;
        color: ${neon};
        font-family: "Bebas Neue", Impact, sans-serif;
        font-size: 44px;
        line-height: .9;
      }

      .row-time span {
        color: #8d9484;
        font-size: 12px;
        font-weight: 900;
      }

      .row-main h3 {
        color: #fff;
        font-size: clamp(32px, 4vw, 56px);
        line-height: .9;
        margin-bottom: 8px;
      }

      .row-main p,
      .row-main small {
        color: #aeb5a8;
        line-height: 1.5;
      }

      .row-main small {
        display: block;
        margin-top: 6px;
      }

      .row-side {
        display: grid;
        justify-items: end;
        gap: 10px;
      }

      .row-side > strong {
        color: ${neon};
        font-family: "Bebas Neue", Impact, sans-serif;
        font-size: 48px;
        line-height: .85;
      }

      .client-grid {
        display: grid;
        gap: 10px;
      }

      .client-card {
        display: grid;
        grid-template-columns: 64px minmax(0, 1fr) 70px;
        gap: 16px;
        align-items: center;
        padding: 18px;
        border: 1px solid rgba(183,255,0,.12);
        background: rgba(255,255,255,.018);
      }

      .client-avatar {
        width: 64px;
        height: 64px;
        display: grid;
        place-items: center;
        color: #030403;
        background: ${neon};
        font-family: "Bebas Neue", Impact, sans-serif;
        font-size: 40px;
      }

      .client-card h3 {
        color: #fff;
        font-size: 18px;
        margin-bottom: 5px;
      }

      .client-card p {
        color: #8d9484;
      }

      .client-card > strong {
        color: ${neon};
        font-family: "Bebas Neue", Impact, sans-serif;
        font-size: 48px;
        text-align: right;
      }

      .barber-empty {
        min-height: 62vh;
        display: grid;
        place-items: center;
        text-align: center;
      }

      .barber-empty h1 {
        color: #fff;
        font-size: clamp(54px, 8vw, 96px);
        margin-top: 10px;
      }

      .barber-empty p {
        color: #aeb5a8;
        max-width: 460px;
      }

      @media (max-width: 960px) {
        .barber-hero,
        .barber-layout {
          grid-template-columns: 1fr;
        }

        .next-panel {
          position: static;
        }

        .metric-grid {
          grid-template-columns: 1fr;
        }
      }

      @media (max-width: 680px) {
        .barber-page {
          padding-top: 130px;
        }

        .barber-toolbar {
          align-items: stretch;
        }

        .tabs,
        .tabs button,
        .date-control,
        .date-control input {
          width: 100%;
        }

        .time-row,
        .appointment-row,
        .client-card {
          grid-template-columns: 1fr;
        }

        .time-label,
        .row-side,
        .time-actions {
          text-align: left;
          justify-items: start;
        }

        .time-card {
          flex-direction: column;
        }
      }
    `}</style>
  );
}