import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { barbersApi, servicesApi, appointmentsApi } from '../services/endpoints';
import { useAuth } from '../context/AuthContext';

const neon = '#b7ff00';
const TZ = 'America/Santiago';

function formatPrice(value) {
  return `$${Number(value || 0).toLocaleString('es-CL')}`;
}

function formatHora(dt) {
  return new Date(dt).toLocaleTimeString('es-CL', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
    timeZone: TZ,
  });
}

function formatFecha(dt) {
  return new Date(dt).toLocaleDateString('es-CL', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    timeZone: TZ,
  });
}

function formatDateISO(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function sameDay(a, b) {
  return formatDateISO(a) === formatDateISO(b);
}

function getWeekDays(baseDate) {
  const d = new Date(baseDate);
  const day = d.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  d.setDate(d.getDate() + diff);

  return Array.from({ length: 7 }, (_, index) => {
    const cur = new Date(d);
    cur.setDate(d.getDate() + index);
    cur.setHours(0, 0, 0, 0);
    return cur;
  });
}

function CalendarIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M8 2v4M16 2v4M3 10h18M5 4h14a2 2 0 0 1 2 2v13a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2Z" />
    </svg>
  );
}

function ScissorsIcon() {
  return (
    <svg width="31" height="31" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="6" cy="6" r="3" />
      <circle cx="6" cy="18" r="3" />
      <path d="M20 4 8.12 15.88M14.47 14.48 20 20M8.12 8.12 12 12" />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg width="21" height="21" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round">
      <path d="m20 6-11 11-5-5" />
    </svg>
  );
}

function StepBar({ paso }) {
  const steps = ['Servicio', 'Horario', 'Confirmar'];

  return (
    <div className="booking-steps">
      {steps.map((label, index) => {
        const num = index + 1;
        const active = paso === num;
        const done = paso > num;

        return (
          <div key={label} className="booking-step">
            <span className={active || done ? 'booking-step-dot active' : 'booking-step-dot'}>
              {done ? <CheckIcon /> : `0${num}`}
            </span>
            <span className={active || done ? 'booking-step-label active' : 'booking-step-label'}>
              {label}
            </span>
          </div>
        );
      })}
    </div>
  );
}

export default function Reservar() {
  const navigate = useNavigate();
  const { user } = useAuth();

  // ── todos los hooks PRIMERO, sin excepción ──
  const [paso, setPaso] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [barberos, setBarberos] = useState([]);
  const [servicios, setServicios] = useState([]);
  const [slots, setSlots] = useState([]);
  const [slotsLoading, setSlotsLoading] = useState(false);

  const [barbero, setBarbero] = useState(null);
  const [servicio, setServicio] = useState(null);
  const [slot, setSlot] = useState(null);
  const [cita, setCita] = useState(null);
  const [notes, setNotes] = useState('');

  const today = useMemo(() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
  }, []);

  const [weekBase, setWeekBase] = useState(today);
  const [diaSelec, setDiaSelec] = useState(null);

  const weekDays = getWeekDays(weekBase);
  const mesAnio = new Intl.DateTimeFormat('es-CL', {
    month: 'long',
    year: 'numeric',
    timeZone: TZ,
  }).format(weekDays[0]);

  useEffect(() => {
    barbersApi.list().then(setBarberos).catch(() => {});
    servicesApi.list().then(setServicios).catch(() => {});
  }, []);

  useEffect(() => {
    if (!barbero || !servicio || !diaSelec) {
      setSlots([]);
      setSlot(null);
      return;
    }

    setSlotsLoading(true);
    setSlots([]);
    setSlot(null);

    appointmentsApi
      .availability(barbero.id, servicio.id, formatDateISO(diaSelec))
      .then((data) => setSlots(Array.isArray(data) ? data : []))
      .catch(() => setSlots([]))
      .finally(() => setSlotsLoading(false));
  }, [barbero, servicio, diaSelec]);

  // ── early return DESPUÉS de todos los hooks ──
  if (user && !user.emailVerified) {
    return (
      <main style={{
        minHeight: '100vh',
        padding: '180px 20px 86px',
        background: 'linear-gradient(180deg, #030403 0%, #050705 46%, #030403 100%)',
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'center',
      }}>
        <section style={{ maxWidth: 520, width: '100%', textAlign: 'center' }} className="fadeup">
          <div style={{
            width: 72, height: 72, margin: '0 auto 24px',
            border: '2px solid #fbbf24', borderRadius: '50%',
            display: 'grid', placeItems: 'center', color: '#fbbf24', fontSize: 36,
          }}>⚠</div>
          <div className="flow-kicker" style={{ color: '#fbbf24', marginBottom: 12 }}>Verificacion pendiente</div>
          <h1 className="flow-title" style={{ color: '#fff', fontSize: 'clamp(52px,8vw,80px)', marginBottom: 20 }}>
            VERIFICA TU EMAIL
          </h1>
          <p style={{ color: '#8d9484', lineHeight: 1.7, marginBottom: 28 }}>
            Para reservar debes verificar tu correo electronico.
            Revisa tu bandeja de entrada (y carpeta de spam) y haz click en el link que te enviamos.
          </p>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link to="/verificar-email" className="btn-neon">
              Reenviar verificacion
            </Link>
            <Link to="/" className="btn-ghost">
              Volver al inicio
            </Link>
          </div>
        </section>
      </main>
    );
  }

  const confirmar = async () => {
    setError('');
    setLoading(true);

    try {
      const data = await appointmentsApi.book({
        barberId: barbero.id,
        serviceId: servicio.id,
        startTime: slot,
        notes: notes || null,
      });

      setCita(data);
      setPaso(4);
    } catch (err) {
      setError(err?.response?.data?.message || 'No pudimos crear la reserva. Intenta otra vez.');
    } finally {
      setLoading(false);
    }
  };

  const prevWeek = () => {
    const d = new Date(weekBase);
    d.setDate(d.getDate() - 7);
    setWeekBase(d);
    setDiaSelec(null);
  };

  const nextWeek = () => {
    const d = new Date(weekBase);
    d.setDate(d.getDate() + 7);
    setWeekBase(d);
    setDiaSelec(null);
  };

  if (paso === 4 && cita) {
    return (
      <main className="booking-page booking-success-page">
        <BookingStyles />

        <section className="booking-success flow-shell fadeup">
          <div className="success-mark">
            <CheckIcon />
          </div>

          <div className="flow-kicker">Cita confirmada</div>

          <h1 className="flow-title success-title">
            NOS VEMOS
            <br />
            <span>PRONTO.</span>
          </h1>

          <p>
            Tu cita con <strong>{cita.barberName}</strong> quedo agendada para el{' '}
            <strong>{formatFecha(cita.startTime)}</strong> a las{' '}
            <strong>{formatHora(cita.startTime)}</strong>.
          </p>

          <div className="success-actions">
            <button onClick={() => navigate('/mis-citas')} className="btn-neon">
              Ver mis citas
            </button>

            <button
              onClick={() => {
                setPaso(1);
                setServicio(null);
                setBarbero(null);
                setDiaSelec(null);
                setSlot(null);
                setCita(null);
                setNotes('');
              }}
              className="btn-ghost"
            >
              Nueva reserva
            </button>
          </div>
        </section>
      </main>
    );
  }

  return (
    <main className="booking-page">
      <BookingStyles />

      <div className="flow-shell booking-shell">
        <header className="booking-header fadeup">
          <div>
            <div className="flow-kicker">Reserva online</div>

            <h1 className="flow-title booking-title">
              TOMA TU
              <br />
              <span>HORA.</span>
            </h1>

            <p>
              Elige servicio, barbero y horario disponible. Felipe se encarga del flow.
            </p>
          </div>

          <StepBar paso={paso} />
        </header>

        {paso === 1 && (
          <section className="booking-grid fadeup">
            <div className="booking-block">
              <div className="block-head">
                <span className="flow-kicker">01 / Servicio</span>
                <h2 className="flow-title">QUE TE HARAS?</h2>
              </div>

              <div className="service-picker">
                {servicios.map((s, index) => {
                  const selected = servicio?.id === s.id;

                  return (
                    <button
                      key={s.id}
                      type="button"
                      onClick={() => setServicio(s)}
                      className={selected ? 'service-choice selected' : 'service-choice'}
                    >
                      <span className="service-number">{String(index + 1).padStart(2, '0')}</span>

                      <span>
                        <strong>{s.name}</strong>
                        <small>{s.description || 'Servicio profesional con sello Flow Futurama.'}</small>
                      </span>

                      <span className="service-choice-meta">
                        <b>{formatPrice(s.price)}</b>
                        <small>{s.durationMinutes} min</small>
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="booking-block">
              <div className="block-head">
                <span className="flow-kicker">02 / Barbero</span>
                <h2 className="flow-title">QUIEN TE ATIENDE?</h2>
              </div>

              <div className="barber-picker">
                {barberos.map((b) => {
                  const selected = barbero?.id === b.id;

                  return (
                    <button
                      key={b.id}
                      type="button"
                      onClick={() => setBarbero(b)}
                      className={selected ? 'barber-choice selected' : 'barber-choice'}
                    >
                      <div className="barber-photo">
                        {b.photoUrl ? (
                          <img src={b.photoUrl} alt={b.name} />
                        ) : (
                          <span>{b.name?.charAt(0) || 'B'}</span>
                        )}
                      </div>

                      <div>
                        <strong>{b.name}</strong>
                        <small>{b.specialty || 'Barbero profesional'}</small>
                        <em>{b.workStart} - {b.workEnd}</em>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            <aside className="booking-summary">
              <div className="flow-kicker">Resumen</div>

              <h3 className="flow-title">TU FLOW</h3>

              <div className="summary-lines">
                <p>
                  <span>Servicio</span>
                  <strong>{servicio?.name || 'Pendiente'}</strong>
                </p>

                <p>
                  <span>Barbero</span>
                  <strong>{barbero?.name || 'Pendiente'}</strong>
                </p>

                <p>
                  <span>Total</span>
                  <strong>{servicio ? formatPrice(servicio.price) : '$0'}</strong>
                </p>
              </div>

              <button
                onClick={() => servicio && barbero && setPaso(2)}
                disabled={!servicio || !barbero}
                className="btn-neon"
              >
                Continuar
              </button>
            </aside>
          </section>
        )}

        {paso === 2 && (
          <section className="booking-grid booking-calendar-grid fadeup">
            <div className="booking-block">
              <div className="block-head calendar-head">
                <div>
                  <span className="flow-kicker">03 / Fecha</span>
                  <h2 className="flow-title">{mesAnio}</h2>
                </div>

                <div className="week-actions">
                  <button onClick={prevWeek} type="button">‹</button>
                  <button onClick={nextWeek} type="button">›</button>
                </div>
              </div>

              <div className="week-strip">
                {weekDays.map((day) => {
                  const past = day < today;
                  const sunday = day.getDay() === 0;
                  const disabled = past || sunday;
                  const selected = diaSelec && sameDay(day, diaSelec);

                  return (
                    <button
                      key={formatDateISO(day)}
                      type="button"
                      disabled={disabled}
                      onClick={() => {
                        setDiaSelec(day);
                        setSlot(null);
                      }}
                      className={selected ? 'day-choice selected' : 'day-choice'}
                    >
                      <span>
                        {day.toLocaleDateString('es-CL', { weekday: 'short', timeZone: TZ })}
                      </span>
                      <strong>{day.getDate()}</strong>
                      <small>{sunday ? 'cerrado' : past ? 'pasado' : 'disponible'}</small>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="booking-block">
              <div className="block-head">
                <span className="flow-kicker">04 / Hora</span>
                <h2 className="flow-title">HORARIOS</h2>
              </div>

              {!diaSelec && (
                <div className="empty-slots">
                  <CalendarIcon />
                  Selecciona un dia para ver horarios.
                </div>
              )}

              {diaSelec && slotsLoading && (
                <div className="empty-slots">Consultando horarios...</div>
              )}

              {diaSelec && !slotsLoading && slots.length === 0 && (
                <div className="empty-slots">
                  Sin horarios disponibles para este dia.
                </div>
              )}

              {diaSelec && !slotsLoading && slots.length > 0 && (
                <div className="slots-grid">
                  {slots.map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => setSlot(s)}
                      className={slot === s ? 'slot-choice selected' : 'slot-choice'}
                    >
                      {formatHora(s)} – {formatHora(new Date(new Date(s).getTime() + servicio.durationMinutes * 60000))}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <aside className="booking-summary">
              <div className="flow-kicker">Tu seleccion</div>

              <h3 className="flow-title">CASI LISTO</h3>

              <div className="summary-lines">
                <p>
                  <span>Servicio</span>
                  <strong>{servicio?.name}</strong>
                </p>

                <p>
                  <span>Barbero</span>
                  <strong>{barbero?.name}</strong>
                </p>

                <p>
                  <span>Fecha</span>
                  <strong>{diaSelec ? formatFecha(diaSelec) : 'Pendiente'}</strong>
                </p>

                <p>
                  <span>Hora</span>
                  <strong>{slot ? formatHora(slot) : 'Pendiente'}</strong>
                </p>
              </div>

              <button
                onClick={() => diaSelec && slot && setPaso(3)}
                disabled={!diaSelec || !slot}
                className="btn-neon"
              >
                Confirmar datos
              </button>

              <button onClick={() => setPaso(1)} className="btn-ghost">
                Volver
              </button>
            </aside>
          </section>
        )}

        {paso === 3 && (
          <section className="confirm-layout fadeup">
            <div className="confirm-ticket">
              <div className="ticket-top">
                <span className="flow-kicker">Confirmacion</span>
                <h2 className="flow-title">TU RESERVA</h2>
              </div>

              <div className="ticket-main">
                <div>
                  <span>Servicio</span>
                  <strong>{servicio?.name}</strong>
                </div>

                <div>
                  <span>Barbero</span>
                  <strong>{barbero?.name}</strong>
                </div>

                <div>
                  <span>Fecha</span>
                  <strong>{diaSelec ? formatFecha(diaSelec) : ''}</strong>
                </div>

                <div>
                  <span>Hora</span>
                  <strong>{slot ? formatHora(slot) : ''}</strong>
                </div>

                <div>
                  <span>Duracion</span>
                  <strong>{servicio?.durationMinutes} min</strong>
                </div>

                <div>
                  <span>Total</span>
                  <strong className="ticket-price">{formatPrice(servicio?.price)}</strong>
                </div>
              </div>
            </div>

            <aside className="confirm-side">
              <label>
                <span className="flow-kicker">Notas opcionales</span>
                <textarea
                  rows={5}
                  value={notes}
                  onChange={(event) => setNotes(event.target.value)}
                  placeholder="Ej: quiero mantener largo arriba, referencia de fade, detalles del diseno..."
                />
              </label>

              <div className="booking-rules">
                <p>Llega 5 minutos antes de tu hora.</p>
                <p>Domingos cerrado.</p>
                <p>Almuerzo: lun–vie 16:00 – 17:00 (sin citas).</p>
                <p>El pago se realiza en el local.</p>
              </div>

              {error && <div className="booking-error">{error}</div>}

              <button onClick={confirmar} disabled={loading} className="btn-neon">
                {loading ? 'Reservando...' : 'Confirmar cita'}
              </button>

              <button onClick={() => setPaso(2)} className="btn-ghost">
                Modificar horario
              </button>
            </aside>
          </section>
        )}
      </div>
    </main>
  );
}

function BookingStyles() {
  return (
    <style>{`
      .booking-page {
      min-height: 100vh;
      padding: 188px 0 86px;
      background:
        radial-gradient(circle at 82% 10%, rgba(183,255,0,.12), transparent 28%),
        linear-gradient(180deg, #030403 0%, #050705 46%, #030403 100%);
      color: var(--text);
    }

    .booking-shell::before {
      content: "FLOW";
      position: absolute;
      top: -12px;
      right: -20px;
      font-family: "Bebas Neue", Impact, sans-serif;
      font-size: clamp(72px, 12vw, 170px);
      color: rgba(183,255,0,.028);
      line-height: .8;
      pointer-events: none;
      overflow: hidden;
      max-width: 100%;
    }

    .booking-shell {
      position: relative;
      overflow-x: hidden;
    }

    .booking-header {
      position: relative;
      z-index: 1;
      display: grid;
      grid-template-columns: minmax(0, 1fr) auto;
      gap: 28px;
      align-items: end;
      margin-bottom: 44px;
    }

    .booking-title {
      font-size: clamp(58px, 8vw, 108px);
      line-height: .88;
    }

      .booking-title span,
      .success-title span {
        color: ${neon};
      }

      .booking-header p {
        max-width: 560px;
        color: #cdd4c4;
        font-size: 16px;
        line-height: 1.7;
        margin-top: 16px;
      }

      .booking-steps {
        display: flex;
        gap: 10px;
        align-items: center;
        flex-wrap: wrap;
        justify-content: flex-end;
      }

      .booking-step {
        display: flex;
        align-items: center;
        gap: 10px;
        min-height: 42px;
        padding: 6px 10px;
        border: 1px solid rgba(183,255,0,.13);
        background: rgba(255,255,255,.02);
      }

      .booking-step-dot {
        width: 32px;
        height: 32px;
        display: grid;
        place-items: center;
        color: #737a6d;
        font-size: 11px;
        font-weight: 900;
        border: 1px solid rgba(183,255,0,.15);
      }

      .booking-step-dot.active {
        color: #030403;
        background: ${neon};
        border-color: ${neon};
      }

      .booking-step-label {
        color: #8b9284;
        font-size: 11px;
        font-weight: 900;
        letter-spacing: .1em;
        text-transform: uppercase;
      }

      .booking-step-label.active {
        color: #fff;
      }

      .booking-grid {
        position: relative;
        z-index: 1;
        display: grid;
        grid-template-columns: minmax(0, 1.15fr) minmax(0, .9fr) 320px;
        gap: 18px;
        align-items: start;
      }

      .booking-calendar-grid {
        grid-template-columns: minmax(0, 1fr) minmax(0, .9fr) 320px;
      }

      .booking-block,
      .booking-summary,
      .confirm-ticket,
      .confirm-side {
        border-top: 1px solid rgba(183,255,0,.28);
        background: rgba(6,8,5,.58);
        backdrop-filter: blur(14px);
      }

      .booking-block {
        padding: 24px;
      }

      .block-head {
        margin-bottom: 20px;
      }

      .block-head h2 {
        margin-top: 6px;
        color: #fff;
        font-size: clamp(34px, 4vw, 56px);
      }

      .service-picker,
      .barber-picker {
        display: grid;
        gap: 8px;
      }

      .service-choice,
      .barber-choice {
        width: 100%;
        border: 1px solid rgba(183,255,0,.12);
        background: rgba(255,255,255,.018);
        color: inherit;
        text-align: left;
        cursor: pointer;
        transition: border-color .2s ease, background .2s ease, transform .2s ease;
      }

      .service-choice {
        display: grid;
        grid-template-columns: 44px minmax(0, 1fr) auto;
        gap: 16px;
        align-items: center;
        padding: 16px;
      }

      .service-choice:hover,
      .barber-choice:hover,
      .service-choice.selected,
      .barber-choice.selected {
        border-color: rgba(183,255,0,.58);
        background: rgba(183,255,0,.06);
        transform: translateY(-1px);
      }

      .service-number {
        color: ${neon};
        font-family: "Bebas Neue", Impact, sans-serif;
        font-size: 34px;
        line-height: 1;
      }

      .service-choice strong,
      .barber-choice strong {
        display: block;
        color: #fff;
        font-size: 16px;
        font-weight: 900;
        text-transform: uppercase;
      }

      .service-choice small,
      .barber-choice small {
        display: block;
        color: #92998c;
        font-size: 13px;
        line-height: 1.45;
        margin-top: 4px;
      }

      .service-choice-meta {
        text-align: right;
      }

      .service-choice-meta b {
        display: block;
        color: ${neon};
        font-size: 22px;
        font-weight: 900;
      }

      .barber-choice {
        display: grid;
        grid-template-columns: 78px minmax(0, 1fr);
        gap: 14px;
        align-items: center;
        padding: 12px;
      }

      .barber-photo {
        width: 78px;
        height: 82px;
        background: #0a0d08;
        display: grid;
        place-items: center;
        overflow: hidden;
        color: ${neon};
        font-family: "Bebas Neue", Impact, sans-serif;
        font-size: 42px;
      }

      .barber-photo img {
        width: 100%;
        height: 100%;
        object-fit: cover;
        object-position: center top;
      }

      .barber-choice em {
        display: block;
        color: ${neon};
        font-size: 11px;
        font-style: normal;
        font-weight: 900;
        letter-spacing: .08em;
        text-transform: uppercase;
        margin-top: 8px;
      }

      .booking-summary {
        position: sticky;
        top: 122px;
        padding: 24px;
      }

      .booking-summary h3 {
        color: #fff;
        font-size: 44px;
        margin-top: 6px;
      }

      .summary-lines {
        display: grid;
        gap: 12px;
        margin: 22px 0;
      }

      .summary-lines p {
        display: flex;
        justify-content: space-between;
        gap: 16px;
        padding-bottom: 12px;
        border-bottom: 1px solid rgba(183,255,0,.11);
      }

      .summary-lines span {
        color: #7f8678;
        font-size: 12px;
        font-weight: 900;
        letter-spacing: .08em;
        text-transform: uppercase;
      }

      .summary-lines strong {
        color: #fff;
        text-align: right;
        font-size: 13px;
      }

      .booking-summary .btn-neon,
      .booking-summary .btn-ghost {
        width: 100%;
        margin-top: 10px;
      }

      .calendar-head {
        display: flex;
        align-items: end;
        justify-content: space-between;
        gap: 20px;
      }

      .calendar-head h2 {
        text-transform: capitalize;
      }

      .week-actions {
        display: flex;
        gap: 8px;
      }

      .week-actions button {
        width: 40px;
        height: 40px;
        border: 1px solid rgba(183,255,0,.2);
        background: transparent;
        color: ${neon};
        font-size: 26px;
        cursor: pointer;
      }

      .week-strip {
        display: grid;
        grid-template-columns: repeat(7, minmax(0, 1fr));
        gap: 6px;
      }

      .day-choice,
      .slot-choice {
        border: 1px solid rgba(183,255,0,.14);
        background: rgba(255,255,255,.02);
        color: #fff;
        cursor: pointer;
        transition: all .2s ease;
      }

      .day-choice {
        min-height: 96px;
        padding: 12px 6px;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
      }

      .day-choice span,
      .day-choice small {
        color: #8b9284;
        font-size: 7px;
        font-weight: 900;
        letter-spacing: .08em;
        text-transform: uppercase;
      }

      .day-choice strong {
        color: #fff;
        font-family: "Bebas Neue", Impact, sans-serif;
        font-size: 38px;
        line-height: .95;
        margin: 5px 0;
      }

      .day-choice:disabled {
        opacity: .32;
        cursor: not-allowed;
      }

      .day-choice:not(:disabled):hover,
      .day-choice.selected,
      .slot-choice:hover,
      .slot-choice.selected {
        border-color: ${neon};
        background: ${neon};
        color: #030403;
      }

      .day-choice.selected span,
      .day-choice.selected small,
      .day-choice.selected strong {
        color: #030403;
      }

      .slots-grid {
        display: grid;
        grid-template-columns: repeat(4, 1fr);
        gap: 8px;
      }

      .slot-choice {
      min-height: 52px;
      font-family: "Bebas Neue", Impact, sans-serif;
      font-size: 16px;
      font-weight: 400;
      letter-spacing: .04em;
      line-height: 1.3;
      border: 1px solid rgba(183,255,0,.18);
      background: transparent;
      color: #c8d4be;
      cursor: pointer;
      transition: all .2s ease;
    }

      .empty-slots {
        min-height: 180px;
        display: grid;
        place-items: center;
        gap: 12px;
        text-align: center;
        color: #8d9484;
        border: 1px solid rgba(183,255,0,.1);
        background: rgba(255,255,255,.015);
        padding: 24px;
      }

      .confirm-layout {
        position: relative;
        z-index: 1;
        display: grid;
        grid-template-columns: minmax(0, 1fr) 360px;
        gap: 22px;
        align-items: start;
      }

      .confirm-ticket {
        overflow: hidden;
      }

      .ticket-top {
        padding: 28px;
        border-bottom: 1px solid rgba(183,255,0,.14);
      }

      .ticket-top h2 {
        color: #fff;
        font-size: clamp(50px, 8vw, 96px);
        margin-top: 8px;
      }

      .ticket-main {
        display: grid;
        grid-template-columns: repeat(2, 1fr);
      }

      .ticket-main div {
        min-height: 112px;
        padding: 22px 24px;
        border-right: 1px solid rgba(183,255,0,.11);
        border-bottom: 1px solid rgba(183,255,0,.11);
      }

      .ticket-main span {
        display: block;
        color: #7f8678;
        font-size: 11px;
        font-weight: 900;
        letter-spacing: .1em;
        text-transform: uppercase;
        margin-bottom: 8px;
      }

      .ticket-main strong {
        color: #fff;
        font-size: 20px;
      }

      .ticket-price {
        color: ${neon} !important;
        font-family: "Bebas Neue", Impact, sans-serif;
        font-size: 54px !important;
        line-height: .9;
      }

      .confirm-side {
        padding: 24px;
      }

      .confirm-side textarea {
        width: 100%;
        margin-top: 12px;
        padding: 14px 15px;
        background: rgba(255,255,255,.04);
        color: #fff;
        border: 1px solid rgba(183,255,0,.18);
        outline: none;
        resize: vertical;
        font: inherit;
        line-height: 1.6;
      }

      .confirm-side textarea:focus {
        border-color: ${neon};
        box-shadow: 0 0 0 3px rgba(183,255,0,.1);
      }

      .booking-rules {
        display: grid;
        gap: 10px;
        margin: 20px 0;
        padding: 14px 16px;
        border: 1px solid rgba(183,255,0,.16);
        background: rgba(183,255,0,.04);
        border-radius: 6px;
        color: #969d90;
        font-size: 13px;
        line-height: 1.5;
      }

      .booking-rules p {
        padding-bottom: 10px;
        border-bottom: 1px solid rgba(183,255,0,.1);
        margin: 0;
      }

      .booking-rules p:last-child {
        padding-bottom: 0;
        border-bottom: 0;
      }

      .booking-error {
        color: #ff7b7b;
        border: 1px solid rgba(255,77,77,.3);
        background: rgba(255,77,77,.08);
        padding: 12px 14px;
        margin-bottom: 14px;
        font-size: 13px;
      }

      .confirm-side .btn-neon,
      .confirm-side .btn-ghost {
        width: 100%;
        margin-top: 10px;
      }

      .booking-success-page {
        display: grid;
        place-items: center;
      }

      .booking-success {
        text-align: center;
        max-width: 720px;
      }

      .success-mark {
        width: 82px;
        height: 82px;
        display: grid;
        place-items: center;
        margin: 0 auto 24px;
        background: ${neon};
        color: #030403;
      }

      .success-title {
        color: #fff;
        font-size: clamp(66px, 11vw, 132px);
        margin-top: 12px;
      }

      .booking-success p {
        color: #cbd2c2;
        max-width: 560px;
        margin: 18px auto 0;
        line-height: 1.7;
      }

      .booking-success strong {
        color: #fff;
      }

      .success-actions {
        display: flex;
        justify-content: center;
        gap: 14px;
        flex-wrap: wrap;
        margin-top: 30px;
      }

      @media (max-width: 1180px) {
  .booking-calendar-grid {
    grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
  }
  .booking-calendar-grid .booking-summary {
    grid-column: 1 / -1;
    position: static;
  }
}

      @media (max-width: 980px) {
        .booking-header,
        .booking-grid,
        .booking-calendar-grid,
        .confirm-layout {
          grid-template-columns: 1fr;
        }

        .booking-steps {
          justify-content: flex-start;
        }

        .booking-summary {
          position: static;
        }
      }

      @media (max-width: 680px) {
      .booking-page {
        padding-top: 140px;
        background:
          radial-gradient(circle at 50% 8%, rgba(183,255,0,.09), transparent 38%),
          linear-gradient(180deg, #030403 0%, #050705 46%, #030403 100%);
      }

      .booking-step-label {
        display: none;
      }

      .service-choice {
        grid-template-columns: 38px minmax(0, 1fr);
      }

      .service-choice-meta {
        grid-column: 2;
        text-align: left;
      }

      .week-strip {
        grid-template-columns: repeat(4, 1fr);
      }

      .slots-grid {
        grid-template-columns: repeat(3, 1fr);
      }

      .ticket-main {
        grid-template-columns: 1fr;
      }
    }
    `}</style>
  );
}
