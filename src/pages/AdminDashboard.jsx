import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { adminApi, appointmentsApi, barbersApi, servicesApi, usersApi } from '../services/endpoints';

const TABS = [
  { key: 'citas', label: 'Citas' },
  { key: 'agenda', label: 'Agenda' },
  { key: 'servicios', label: 'Servicios' },
  { key: 'barberos', label: 'Barberos' },
  { key: 'usuarios', label: 'Usuarios' },
];

const STATUS = {
  PENDING: { label: 'Pendiente', tone: 'info' },
  PAID: { label: 'Pagada', tone: 'ok' },
  COMPLETED: { label: 'Completada', tone: 'ok' },
  CANCELLED: { label: 'Cancelada', tone: 'muted' },
};

const emptyBarber = {
  name: '',
  specialty: '',
  photoUrl: '',
  bio: '',
  workStart: '09:00',
  workEnd: '19:00',
  email: '',
  password: '',
};

const emptyService = {
  name: '',
  description: '',
  durationMinutes: 30,
  price: '',
  active: true,
};

const emptyBarberUser = {
  fullName: '',
  email: '',
  password: '',
  phone: '',
};

function dateISO(date = new Date()) {
  return date.toISOString().slice(0, 10);
}

function formatPrice(value) {
  return `$${Number(value || 0).toLocaleString('es-CL')}`;
}

function formatDate(value) {
  if (!value) return 'Pendiente';
  return new Date(value).toLocaleDateString('es-CL', {
    weekday: 'short',
    day: '2-digit',
    month: 'short',
  });
}

function formatTime(value) {
  if (!value) return '--:--';
  return new Date(value).toLocaleTimeString('es-CL', {
    hour: '2-digit',
    minute: '2-digit',
  });
}

function formatDuration(minutes) {
  const value = Number(minutes || 0);
  if (value < 60) return `${value} min`;
  const hours = Math.floor(value / 60);
  const rest = value % 60;
  return rest ? `${hours} h ${rest} min` : `${hours} h`;
}

function statusMeta(status) {
  return STATUS[status] || { label: status || 'Sin estado', tone: 'muted' };
}

function Stat({ label, value, hint }) {
  return (
    <article className="admin-stat">
      <span>{label}</span>
      <strong>{value}</strong>
      {hint && <small>{hint}</small>}
    </article>
  );
}

function Modal({ title, children, onClose }) {
  return (
    <div className="admin-modal-backdrop" role="presentation" onMouseDown={onClose}>
      <section className="admin-modal" role="dialog" aria-modal="true" onMouseDown={(event) => event.stopPropagation()}>
        <header className="admin-modal-head">
          <h2>{title}</h2>
          <button type="button" className="admin-icon-btn" onClick={onClose} aria-label="Cerrar">
            x
          </button>
        </header>
        {children}
      </section>
    </div>
  );
}

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [tab, setTab] = useState('citas');
  const [citas, setCitas] = useState([]);
  const [barberos, setBarberos] = useState([]);
  const [servicios, setServicios] = useState([]);
  const [usuarios, setUsuarios] = useState([]);
  const [fechaFiltro, setFechaFiltro] = useState(dateISO());
  const [busqueda, setBusqueda] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [barberModal, setBarberModal] = useState(undefined);
  const [serviceModal, setServiceModal] = useState(undefined);
  const [barberUserOpen, setBarberUserOpen] = useState(false);
  const [barberForm, setBarberForm] = useState(emptyBarber);
  const [serviceForm, setServiceForm] = useState(emptyService);
  const [barberUserForm, setBarberUserForm] = useState(emptyBarberUser);

  const loadBarbers = useCallback(async () => {
    const data = await barbersApi.list();
    setBarberos(Array.isArray(data) ? data : []);
    return Array.isArray(data) ? data : [];
  }, []);

  const loadServices = useCallback(async () => {
    try {
      const data = await servicesApi.listAll();
      setServicios(Array.isArray(data) ? data : []);
    } catch {
      const data = await servicesApi.list();
      setServicios(Array.isArray(data) ? data : []);
    }
  }, []);

  const loadUsers = useCallback(async () => {
    const data = await usersApi.list();
    setUsuarios(Array.isArray(data) ? data : []);
  }, []);

  const loadAppointments = useCallback(async (knownBarbers = null) => {
    const sourceBarbers = knownBarbers || await barbersApi.list();
    if (!knownBarbers) setBarberos(Array.isArray(sourceBarbers) ? sourceBarbers : []);

    if (!sourceBarbers.length) {
      setCitas([]);
      return;
    }

    const collected = [];
    await Promise.all(sourceBarbers.map(async (barber) => {
      try {
        const data = await appointmentsApi.byBarber(barber.id, fechaFiltro || null);
        if (Array.isArray(data)) collected.push(...data);
      } catch {
        // If one barber fails, the rest of the dashboard can still render.
      }
    }));

    collected.sort((a, b) => new Date(a.startTime) - new Date(b.startTime));
    setCitas(collected);
  }, [fechaFiltro]);

  const loadAll = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const loadedBarbers = await loadBarbers();
      await Promise.all([
        loadServices(),
        loadUsers(),
        loadAppointments(loadedBarbers),
      ]);
    } catch {
      setError('No se pudo cargar el panel. Revisa que el backend este activo y tu sesion siga vigente.');
    } finally {
      setLoading(false);
    }
  }, [loadAppointments, loadBarbers, loadServices, loadUsers]);

  useEffect(() => {
    loadAll();
  }, [loadAll]);

  useEffect(() => {
    const timer = setInterval(() => loadAppointments(), 60000);
    return () => clearInterval(timer);
  }, [loadAppointments]);

  const filteredCitas = useMemo(() => {
    const query = busqueda.trim().toLowerCase();
    if (!query) return citas;
    return citas.filter((cita) => [
      cita.clientName,
      cita.barberName,
      cita.serviceName,
      cita.status,
    ].some((value) => String(value || '').toLowerCase().includes(query)));
  }, [busqueda, citas]);

  const metrics = useMemo(() => {
    const active = citas.filter((cita) => cita.status !== 'CANCELLED');
    const ingresos = active.reduce((sum, cita) => sum + Number(cita.servicePrice || 0), 0);
    return {
      citas: citas.length,
      pendientes: citas.filter((cita) => cita.status === 'PENDING').length,
      completadas: citas.filter((cita) => cita.status === 'COMPLETED' || cita.status === 'PAID').length,
      ingresos,
    };
  }, [citas]);

  const agendaGroups = useMemo(() => {
    return barberos.map((barber) => ({
      barber,
      citas: citas.filter((cita) => cita.barberId === barber.id),
    }));
  }, [barberos, citas]);

  const flash = (message) => {
    setNotice(message);
    window.setTimeout(() => setNotice(''), 3000);
  };

  const refreshAppointments = async () => {
    setLoading(true);
    try {
      await loadAppointments();
    } finally {
      setLoading(false);
    }
  };

  const completeAppointment = async (id) => {
    if (!window.confirm('Marcar esta cita como completada?')) return;
    try {
      const updated = await appointmentsApi.complete(id);
      setCitas((prev) => prev.map((cita) => cita.id === id ? updated : cita));
      flash('Cita completada.');
    } catch {
      setError('No se pudo completar la cita.');
    }
  };

  const cancelAppointment = async (id) => {
    if (!window.confirm('Cancelar esta cita?')) return;
    try {
      const updated = await appointmentsApi.cancel(id);
      setCitas((prev) => prev.map((cita) => cita.id === id ? updated : cita));
      flash('Cita cancelada.');
    } catch {
      setError('No se pudo cancelar la cita.');
    }
  };

  const openBarber = (barber = null) => {
    setBarberModal(barber);
    setBarberForm(barber ? {
      name: barber.name || '',
      specialty: barber.specialty || '',
      photoUrl: barber.photoUrl || '',
      bio: barber.bio || '',
      workStart: barber.workStart || '09:00',
      workEnd: barber.workEnd || '19:00',
    } : emptyBarber);
  };

  const saveBarber = async (event) => {
    event.preventDefault();
    try {
      if (!barberModal) {
        // Creating new barber: first create the login account, then the barber profile
        const { email, password, name, specialty, photoUrl, bio, workStart, workEnd } = barberForm;
        if (!email || !password) {
          setError('El email y la contrasena son obligatorios para crear un barbero.');
          return;
        }
        // Create the user account with BARBER role — capture the new userId
        const newUser = await usersApi.createBarber({ fullName: name, email, password, phone: '' });
        // Then create the barber profile, linked to that userId
        const saved = await barbersApi.create({ name, specialty, photoUrl, bio, workStart, workEnd, userId: newUser.id });
        setBarberos((prev) => [...prev, saved]);
        setBarberModal(undefined);
        flash('Barbero y cuenta de login creados.');
        // Refresh users list
        loadUsers();
      } else {
        // Editing existing barber: only update profile (no password change here)
        const { name, specialty, photoUrl, bio, workStart, workEnd } = barberForm;
        const saved = await barbersApi.update(barberModal.id, { name, specialty, photoUrl, bio, workStart, workEnd });
        setBarberos((prev) => prev.map((barber) => barber.id === saved.id ? saved : barber));
        setBarberModal(undefined);
        flash('Barbero actualizado.');
      }
    } catch (err) {
      setError(err?.response?.data?.message || 'No se pudo guardar el barbero.');
    }
  };

  const deleteBarber = async (id) => {
    if (!window.confirm('Eliminar este barbero de la agenda?')) return;
    try {
      await barbersApi.remove(id);
      setBarberos((prev) => prev.filter((barber) => barber.id !== id));
      flash('Barbero eliminado.');
    } catch {
      setError('No se pudo eliminar el barbero.');
    }
  };

  const openService = (service = null) => {
    setServiceModal(service);
    setServiceForm(service ? {
      name: service.name || '',
      description: service.description || '',
      durationMinutes: service.durationMinutes || 30,
      price: service.price || '',
      active: service.active !== false,
    } : emptyService);
  };

  const saveService = async (event) => {
    event.preventDefault();
    const payload = {
      ...serviceForm,
      durationMinutes: Number(serviceForm.durationMinutes),
      price: Number(serviceForm.price),
      active: Boolean(serviceForm.active),
    };

    try {
      const saved = serviceModal
        ? await servicesApi.update(serviceModal.id, payload)
        : await servicesApi.create(payload);
      setServicios((prev) => serviceModal
        ? prev.map((service) => service.id === saved.id ? saved : service)
        : [...prev, saved]);
      setServiceModal(undefined);
      flash(serviceModal ? 'Servicio actualizado.' : 'Servicio creado.');
    } catch {
      setError('No se pudo guardar el servicio.');
    }
  };

  const toggleService = async (service) => {
    try {
      const saved = service.active
        ? (await servicesApi.remove(service.id), { ...service, active: false })
        : await servicesApi.update(service.id, {
          ...service,
          durationMinutes: Number(service.durationMinutes),
          price: Number(service.price),
          active: true,
        });
      setServicios((prev) => prev.map((item) => item.id === service.id ? saved : item));
      flash(saved.active ? 'Servicio activado.' : 'Servicio pausado.');
    } catch {
      setError('No se pudo cambiar el estado del servicio.');
    }
  };

  const createBarberUser = async (event) => {
    event.preventDefault();
    try {
      const saved = await usersApi.createBarber(barberUserForm);
      setUsuarios((prev) => [...prev, saved]);
      setBarberUserForm(emptyBarberUser);
      setBarberUserOpen(false);
      flash('Cuenta de barbero creada.');
    } catch (err) {
      setError(err?.response?.data?.message || 'No se pudo crear la cuenta de barbero.');
    }
  };

  const deleteUser = async (user) => {
  if (user.role === 'BARBER_ADMIN') {
    setError('No se puede eliminar una cuenta de administrador.');
    return;
  }
  if (!window.confirm('Eliminar este usuario?')) return;
  try {
    await usersApi.remove(user.id);
    setUsuarios((prev) => prev.filter((u) => u.id !== user.id));
    flash('Usuario eliminado.');
  } catch {
    setError('No se pudo eliminar el usuario. Puede tener citas activas.');
  }
};
  return (
    <main className="admin-page">
      <AdminStyles />

      <section className="admin-shell">
        <header className="admin-top">
          <button type="button" className="admin-back" onClick={() => navigate('/')}>
            Sitio
          </button>
          <div>
            <p>ELPIPEBARBER</p>
            <h1>Panel administrador</h1>
          </div>
          <button type="button" className="admin-refresh" onClick={refreshAppointments}>
            Actualizar
          </button>
        </header>

        <section className="admin-stats" aria-label="Metricas del dia">
          <Stat label="Citas" value={metrics.citas} hint={fechaFiltro || 'Todas'} />
          <Stat label="Pendientes" value={metrics.pendientes} hint="Por atender" />
          <Stat label="Completadas" value={metrics.completadas} hint="Cerradas/pagadas" />
          <Stat label="Ingresos" value={formatPrice(metrics.ingresos)} hint="No canceladas" />
        </section>

        {(error || notice) && (
          <div className={error ? 'admin-alert danger' : 'admin-alert ok'}>
            <span>{error || notice}</span>
            <button type="button" onClick={() => { setError(''); setNotice(''); }}>x</button>
          </div>
        )}

        <div className="admin-layout">
          <nav className="admin-tabs" aria-label="Secciones de administracion">
            {TABS.map((item) => (
              <button
                key={item.key}
                type="button"
                className={tab === item.key ? 'active' : ''}
                onClick={() => setTab(item.key)}
              >
                {item.label}
              </button>
            ))}
          </nav>

          <section className="admin-content">
            {(tab === 'citas' || tab === 'agenda') && (
              <div className="admin-toolbar">
                <label>
                  <span>Fecha</span>
                  <input type="date" value={fechaFiltro} onChange={(event) => setFechaFiltro(event.target.value)} />
                </label>
                <button type="button" onClick={() => setFechaFiltro('')}>Ver todas</button>
                {tab === 'citas' && (
                  <label className="admin-search">
                    <span>Buscar</span>
                    <input value={busqueda} onChange={(event) => setBusqueda(event.target.value)} placeholder="Cliente, servicio o barbero" />
                  </label>
                )}
              </div>
            )}

            {loading && <div className="admin-empty">Cargando panel...</div>}

            {!loading && tab === 'citas' && (
              <section className="admin-table-panel">
                <div className="admin-table-head citas">
                  <span>Hora</span>
                  <span>Cliente</span>
                  <span>Servicio</span>
                  <span>Estado</span>
                  <span>Acciones</span>
                </div>
                {filteredCitas.length === 0 ? (
                  <div className="admin-empty">No hay citas para este filtro.</div>
                ) : filteredCitas.map((cita) => {
                  const meta = statusMeta(cita.status);
                  return (
                    <article className="admin-row citas" key={cita.id}>
                      <div>
                        <strong>{formatTime(cita.startTime)} - {formatTime(cita.endTime)}</strong>
                        <small>{formatDate(cita.startTime)}</small>
                      </div>
                      <div>
                        <strong>{cita.clientName}</strong>
                        <small>{cita.barberName}</small>
                      </div>
                      <div>
                        <strong>{cita.serviceName}</strong>
                        <small>{formatDuration(cita.durationMinutes)} / {formatPrice(cita.servicePrice)}</small>
                      </div>
                      <div>
                        <span className={`admin-status ${meta.tone}`}>{meta.label}</span>
                      </div>
                      <div className="admin-actions">
                        <button type="button" onClick={() => completeAppointment(cita.id)} disabled={cita.status === 'COMPLETED' || cita.status === 'CANCELLED'}>
                          Completar
                        </button>
                        <button type="button" className="danger" onClick={() => cancelAppointment(cita.id)} disabled={cita.status === 'CANCELLED'}>
                          Cancelar
                        </button>
                      </div>
                    </article>
                  );
                })}
              </section>
            )}

            {!loading && tab === 'agenda' && (
              <section className="agenda-grid">
                {agendaGroups.map(({ barber, citas: barberCitas }) => (
                  <article className="agenda-column" key={barber.id}>
                    <header>
                      <h2>{barber.name}</h2>
                      <p>{barber.workStart} - {barber.workEnd}</p>
                    </header>
                    {barberCitas.length === 0 ? (
                      <div className="admin-empty compact">Sin citas.</div>
                    ) : barberCitas.map((cita) => {
                      const meta = statusMeta(cita.status);
                      return (
                        <div className="agenda-item" key={cita.id}>
                          <time>{formatTime(cita.startTime)} - {formatTime(cita.endTime)}</time>
                          <strong>{cita.clientName}</strong>
                          <span>{cita.serviceName} / {formatDuration(cita.durationMinutes)}</span>
                          <em className={`admin-status ${meta.tone}`}>{meta.label}</em>
                        </div>
                      );
                    })}
                  </article>
                ))}
              </section>
            )}

            {!loading && tab === 'servicios' && (
              <section>
                <div className="admin-section-head">
                  <div>
                    <p>Catalogo</p>
                    <h2>Servicios</h2>
                  </div>
                  <button type="button" className="admin-primary" onClick={() => openService()}>
                    Nuevo servicio
                  </button>
                </div>
                <div className="admin-list">
                  {servicios.map((service) => (
                    <article className="admin-manage-row" key={service.id}>
                      <div>
                        <strong>{service.name}</strong>
                        <small>{service.description || 'Sin descripcion'}</small>
                      </div>
                      <div>
                        <span>{formatDuration(service.durationMinutes)}</span>
                        <span>{formatPrice(service.price)}</span>
                        <span className={`admin-status ${service.active ? 'ok' : 'muted'}`}>{service.active ? 'Activo' : 'Pausado'}</span>
                      </div>
                      <div className="admin-actions">
                        <button type="button" onClick={() => openService(service)}>Editar</button>
                        <button type="button" onClick={() => toggleService(service)}>{service.active ? 'Pausar' : 'Activar'}</button>
                      </div>
                    </article>
                  ))}
                </div>
              </section>
            )}

            {!loading && tab === 'barberos' && (
              <section>
                <div className="admin-section-head">
                  <div>
                    <p>Agenda</p>
                    <h2>Barberos</h2>
                  </div>
                  <div style={{ display: 'flex', gap: 10 }}>
                    <button
                      type="button"
                      onClick={async () => {
                        try {
                          const msg = await adminApi.sendAgendaTest();
                          flash(typeof msg === 'string' ? msg : 'Agenda enviada al barbero.');
                        } catch {
                          setError('No se pudo enviar la agenda. Revisa que haya barberos activos.');
                        }
                      }}
                      style={{ fontSize: 12, padding: '8px 18px', border: '1px solid rgba(183,255,0,.3)', background: 'transparent', color: '#b7ff00', cursor: 'pointer', fontWeight: 700, letterSpacing: '.06em', textTransform: 'uppercase', borderRadius: 999 }}
                    >
                      ⚡ Probar email agenda
                    </button>
                    <button type="button" className="admin-primary" onClick={() => openBarber()}>
                      Nuevo barbero
                    </button>
                  </div>
                </div>
                <div className="admin-list">
                  {barberos.map((barber) => (
                    <article className="admin-manage-row" key={barber.id}>
                      <div>
                        <strong>{barber.name}</strong>
                        <small>{barber.specialty}</small>
                      </div>
                      <div>
                        <span>{barber.workStart} - {barber.workEnd}</span>
                        <span>{barber.bio || 'Sin bio'}</span>
                      </div>
                      <div className="admin-actions">
                        <button type="button" onClick={() => openBarber(barber)}>Editar</button>
                        <button type="button" className="danger" onClick={() => deleteBarber(barber.id)}>Eliminar</button>
                      </div>
                    </article>
                  ))}
                </div>
              </section>
            )}

            {!loading && tab === 'usuarios' && (
              <section>
                <div className="admin-section-head">
                  <div>
                    <p>Accesos</p>
                    <h2>Usuarios</h2>
                  </div>
                </div>
                <div className="admin-list">
                  {usuarios.map((user) => (
                    <article className="admin-manage-row" key={user.id}>
                      <div>
                        <strong>{user.fullName}</strong>
                        <small>{user.email}</small>
                      </div>
                      <div>
                        <span>{user.phone || 'Sin telefono'}</span>
                        <span className="admin-status info">{user.role}</span>
                      </div>
                      <div className="admin-actions">
                        <button type="button" className="danger" onClick={() => deleteUser(user)}>Eliminar</button>
                      </div>
                    </article>
                  ))}
                </div>
              </section>
            )}
          </section>
        </div>
      </section>

      {barberModal !== undefined && (
        <Modal title={barberModal ? 'Editar barbero' : 'Nuevo barbero'} onClose={() => setBarberModal(undefined)}>
          <form className="admin-form" onSubmit={saveBarber}>
            <label><span>Nombre</span><input required value={barberForm.name} onChange={(e) => setBarberForm({ ...barberForm, name: e.target.value })} /></label>
            <label><span>Especialidad</span><input required value={barberForm.specialty} onChange={(e) => setBarberForm({ ...barberForm, specialty: e.target.value })} /></label>
            <label><span>Foto URL (Cloudinary u otro host)</span><input placeholder="https://res.cloudinary.com/..." value={barberForm.photoUrl} onChange={(e) => setBarberForm({ ...barberForm, photoUrl: e.target.value })} /></label>
            {barberForm.photoUrl && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ width: 54, height: 58, background: '#0a0d08', overflow: 'hidden', border: '1px solid rgba(183,255,0,.2)' }}>
                  <img src={barberForm.photoUrl} alt="preview" style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center top' }} />
                </div>
                <small style={{ color: '#8d9585', fontSize: 12 }}>Preview de la foto</small>
              </div>
            )}
            <div className="admin-form-grid">
              <label><span>Inicio</span><input type="time" required value={barberForm.workStart} onChange={(e) => setBarberForm({ ...barberForm, workStart: e.target.value })} /></label>
              <label><span>Fin</span><input type="time" required value={barberForm.workEnd} onChange={(e) => setBarberForm({ ...barberForm, workEnd: e.target.value })} /></label>
            </div>
            <label><span>Bio</span><textarea rows={3} value={barberForm.bio} onChange={(e) => setBarberForm({ ...barberForm, bio: e.target.value })} /></label>
            {!barberModal && (
              <>
                <div style={{ borderTop: '1px solid rgba(183,255,0,.13)', paddingTop: 14 }}>
                  <p style={{ color: '#b7ff00', fontSize: 11, fontWeight: 900, letterSpacing: '.1em', textTransform: 'uppercase', marginBottom: 12 }}>Cuenta de acceso (login)</p>
                  <div style={{ display: 'grid', gap: 14 }}>
                    <label><span>Email de acceso</span><input type="email" required value={barberForm.email} onChange={(e) => setBarberForm({ ...barberForm, email: e.target.value })} placeholder="barbero@email.com" /></label>
                    <label><span>Contrasena</span><input type="password" minLength={6} required value={barberForm.password} onChange={(e) => setBarberForm({ ...barberForm, password: e.target.value })} placeholder="Min. 6 caracteres" /></label>
                  </div>
                </div>
              </>
            )}
            <button type="submit" className="admin-primary">{barberModal ? 'Actualizar barbero' : 'Crear barbero + cuenta'}</button>
          </form>
        </Modal>
      )}

      {serviceModal !== undefined && (
        <Modal title={serviceModal ? 'Editar servicio' : 'Nuevo servicio'} onClose={() => setServiceModal(undefined)}>
          <form className="admin-form" onSubmit={saveService}>
            <label><span>Nombre</span><input required value={serviceForm.name} onChange={(e) => setServiceForm({ ...serviceForm, name: e.target.value })} /></label>
            <label><span>Descripcion</span><textarea rows={3} value={serviceForm.description} onChange={(e) => setServiceForm({ ...serviceForm, description: e.target.value })} /></label>
            <div className="admin-form-grid">
              <label><span>Duracion min</span><input type="number" min="5" required value={serviceForm.durationMinutes} onChange={(e) => setServiceForm({ ...serviceForm, durationMinutes: e.target.value })} /></label>
              <label><span>Precio</span><input type="number" min="0" required value={serviceForm.price} onChange={(e) => setServiceForm({ ...serviceForm, price: e.target.value })} /></label>
            </div>
            <label className="admin-check"><input type="checkbox" checked={serviceForm.active} onChange={(e) => setServiceForm({ ...serviceForm, active: e.target.checked })} /> Activo</label>
            <button type="submit" className="admin-primary">Guardar</button>
          </form>
        </Modal>
      )}

      {barberUserOpen && (
        <Modal title="Cuenta de barbero" onClose={() => setBarberUserOpen(false)}>
          <form className="admin-form" onSubmit={createBarberUser}>
            <label><span>Nombre completo</span><input required value={barberUserForm.fullName} onChange={(e) => setBarberUserForm({ ...barberUserForm, fullName: e.target.value })} /></label>
            <label><span>Email</span><input type="email" required value={barberUserForm.email} onChange={(e) => setBarberUserForm({ ...barberUserForm, email: e.target.value })} /></label>
            <label><span>Telefono</span><input type="tel" required pattern="^\+?56\s?9\s?\d{4}\s?\d{4}$" value={barberUserForm.phone} onChange={(e) => setBarberUserForm({ ...barberUserForm, phone: e.target.value })} placeholder="+56 9 1234 5678" /></label>
            <label><span>Contrasena</span><input type="password" minLength={6} required value={barberUserForm.password} onChange={(e) => setBarberUserForm({ ...barberUserForm, password: e.target.value })} /></label>
            <button type="submit" className="admin-primary">Crear cuenta</button>
          </form>
        </Modal>
      )}
    </main>
  );
}

function AdminStyles() {
  return (
    <style>{`
      .admin-page {
        min-height: 100vh;
        padding: 144px 18px 54px;
        background: #030403;
        color: var(--text);
      }

      .admin-shell {
        width: min(1320px, 100%);
        margin: 0 auto;
      }

      .admin-top {
        display: grid;
        grid-template-columns: auto minmax(0, 1fr) auto;
        gap: 16px;
        align-items: end;
        padding-bottom: 20px;
        border-bottom: 1px solid rgba(183,255,0,.18);
      }

      .admin-top p,
      .admin-section-head p,
      .admin-toolbar span,
      .admin-form span {
        color: var(--neon);
        font-size: 11px;
        font-weight: 900;
        letter-spacing: .12em;
        text-transform: uppercase;
      }

      .admin-top h1,
      .admin-section-head h2,
      .admin-modal h2 {
        color: #fff;
        font-family: "Bebas Neue", Impact, sans-serif;
        font-size: clamp(38px, 5vw, 72px);
        line-height: .9;
        letter-spacing: .02em;
        margin-top: 6px;
      }

      .admin-back,
      .admin-refresh,
      .admin-tabs button,
      .admin-toolbar button,
      .admin-actions button,
      .admin-primary,
      .admin-icon-btn {
        min-height: 40px;
        border: 1px solid rgba(183,255,0,.2);
        background: rgba(255,255,255,.025);
        color: #e8eee1;
        border-radius: 8px;
        padding: 10px 14px;
        font: inherit;
        font-size: 12px;
        font-weight: 900;
        letter-spacing: .06em;
        text-transform: uppercase;
        cursor: pointer;
      }

      .admin-back:hover,
      .admin-refresh:hover,
      .admin-tabs button:hover,
      .admin-toolbar button:hover,
      .admin-actions button:hover,
      .admin-primary:hover,
      .admin-icon-btn:hover {
        border-color: var(--neon);
        color: var(--neon);
      }

      .admin-primary {
        background: var(--neon);
        color: #030403;
        border-color: var(--neon);
      }

      .admin-primary:hover {
        color: #030403;
        transform: translateY(-1px);
      }

      .admin-stats {
        display: grid;
        grid-template-columns: repeat(4, minmax(0, 1fr));
        gap: 10px;
        margin: 20px 0;
      }

      .admin-stat,
      .admin-table-panel,
      .agenda-column,
      .admin-manage-row,
      .admin-modal {
        border: 1px solid rgba(183,255,0,.14);
        background: rgba(8,10,7,.74);
      }

      .admin-stat {
        min-height: 118px;
        padding: 18px;
        display: grid;
        align-content: space-between;
      }

      .admin-stat span,
      .admin-stat small,
      .admin-row small,
      .admin-manage-row small,
      .agenda-column p,
      .agenda-item span {
        color: #8d9585;
        font-size: 12px;
      }

      .admin-stat strong {
        color: var(--neon);
        font-family: "Bebas Neue", Impact, sans-serif;
        font-size: clamp(34px, 4vw, 54px);
        line-height: .9;
      }

      .admin-alert {
        display: flex;
        justify-content: space-between;
        gap: 12px;
        padding: 12px 14px;
        border-radius: 8px;
        margin-bottom: 16px;
        font-size: 13px;
      }

      .admin-alert button {
        border: 0;
        background: transparent;
        color: inherit;
        cursor: pointer;
        font-weight: 900;
      }

      .admin-alert.ok {
        color: #b7ff00;
        border: 1px solid rgba(183,255,0,.24);
        background: rgba(183,255,0,.07);
      }

      .admin-alert.danger {
        color: #ff8a8a;
        border: 1px solid rgba(255,77,77,.24);
        background: rgba(255,77,77,.08);
      }

      .admin-layout {
        display: grid;
        grid-template-columns: 176px minmax(0, 1fr);
        gap: 18px;
        align-items: start;
      }

      .admin-tabs {
        position: sticky;
        top: 118px;
        display: grid;
        gap: 8px;
      }

      .admin-tabs button {
        text-align: left;
        color: #909989;
      }

      .admin-tabs button.active {
        background: var(--neon);
        color: #030403;
        border-color: var(--neon);
      }

      .admin-content {
        min-width: 0;
      }

      .admin-toolbar {
        display: flex;
        align-items: end;
        gap: 10px;
        flex-wrap: wrap;
        margin-bottom: 14px;
      }

      .admin-toolbar label,
      .admin-form label {
        display: grid;
        gap: 8px;
      }

      .admin-search {
        flex: 1;
        min-width: 220px;
      }

      .admin-toolbar input,
      .admin-form input,
      .admin-form textarea {
        width: 100%;
        min-height: 42px;
        border: 1px solid rgba(183,255,0,.18);
        border-radius: 8px;
        background: rgba(255,255,255,.04);
        color: #fff;
        padding: 10px 12px;
        font: inherit;
        outline: none;
      }

      .admin-toolbar input:focus,
      .admin-form input:focus,
      .admin-form textarea:focus {
        border-color: var(--neon);
        box-shadow: 0 0 0 3px rgba(183,255,0,.1);
      }

      .admin-table-head,
      .admin-row {
        display: grid;
        gap: 12px;
        align-items: center;
      }

      .admin-table-head.citas,
      .admin-row.citas {
        grid-template-columns: 170px minmax(150px, 1.1fr) minmax(160px, 1fr) 120px 190px;
      }

      .admin-table-head {
        padding: 12px 16px;
        color: #77806f;
        font-size: 11px;
        font-weight: 900;
        letter-spacing: .1em;
        text-transform: uppercase;
        border-bottom: 1px solid rgba(183,255,0,.12);
      }

      .admin-row {
        padding: 14px 16px;
        border-bottom: 1px solid rgba(183,255,0,.09);
      }

      .admin-row:last-child {
        border-bottom: 0;
      }

      .admin-row strong,
      .admin-manage-row strong,
      .agenda-item strong {
        display: block;
        color: #fff;
        font-size: 14px;
      }

      .admin-status {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        min-height: 28px;
        width: fit-content;
        border-radius: 999px;
        padding: 5px 10px;
        font-size: 10px;
        font-weight: 900;
        letter-spacing: .08em;
        text-transform: uppercase;
        font-style: normal;
      }

      .admin-status.ok {
        color: #b7ff00;
        background: rgba(183,255,0,.1);
      }

      .admin-status.info {
        color: #9ed0ff;
        background: rgba(88,166,255,.12);
      }

      .admin-status.muted {
        color: #8d9585;
        background: rgba(255,255,255,.06);
      }

      .admin-actions {
        display: flex;
        gap: 8px;
        flex-wrap: wrap;
      }

      .admin-actions button:disabled {
        opacity: .38;
        cursor: not-allowed;
      }

      .admin-actions .danger {
        border-color: rgba(255,77,77,.28);
        color: #ff9a9a;
      }

      .admin-empty {
        min-height: 160px;
        display: grid;
        place-items: center;
        color: #838c7c;
        text-align: center;
        border: 1px dashed rgba(183,255,0,.14);
        padding: 22px;
      }

      .admin-empty.compact {
        min-height: 86px;
      }

      .agenda-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
        gap: 12px;
      }

      .agenda-column {
        min-width: 0;
      }

      .agenda-column header {
        padding: 16px;
        border-bottom: 1px solid rgba(183,255,0,.12);
      }

      .agenda-column h2 {
        color: #fff;
        font-size: 18px;
      }

      .agenda-item {
        display: grid;
        gap: 4px;
        padding: 14px 16px;
        border-bottom: 1px solid rgba(183,255,0,.08);
      }

      .agenda-item time {
        color: var(--neon);
        font-size: 12px;
        font-weight: 900;
      }

      .admin-section-head {
        display: flex;
        align-items: end;
        justify-content: space-between;
        gap: 14px;
        margin-bottom: 14px;
      }

      .admin-list {
        display: grid;
        gap: 10px;
      }

      .admin-manage-row {
        display: grid;
        grid-template-columns: minmax(220px, 1.2fr) minmax(220px, 1fr) auto;
        gap: 14px;
        align-items: center;
        padding: 16px;
      }

      .admin-manage-row > div:nth-child(2) {
        display: flex;
        gap: 10px;
        align-items: center;
        flex-wrap: wrap;
        color: #d8dfd0;
        font-size: 13px;
      }

      .admin-modal-backdrop {
        position: fixed;
        inset: 0;
        z-index: 50;
        display: grid;
        place-items: center;
        padding: 18px;
        background: rgba(0,0,0,.72);
      }

      .admin-modal {
        width: min(560px, 100%);
        max-height: min(720px, calc(100vh - 36px));
        overflow: auto;
        border-radius: 8px;
      }

      .admin-modal-head {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 12px;
        padding: 18px 20px;
        border-bottom: 1px solid rgba(183,255,0,.13);
      }

      .admin-modal h2 {
        font-size: 44px;
        margin: 0;
      }

      .admin-icon-btn {
        width: 42px;
        padding: 0;
      }

      .admin-form {
        display: grid;
        gap: 14px;
        padding: 20px;
      }

      .admin-form textarea {
        resize: vertical;
        line-height: 1.5;
      }

      .admin-form-grid {
        display: grid;
        grid-template-columns: repeat(2, minmax(0, 1fr));
        gap: 12px;
      }

      .admin-check {
        display: flex !important;
        grid-template-columns: auto 1fr;
        align-items: center;
        color: #dfe6d7;
        font-weight: 800;
      }

      .admin-check input {
        width: 18px;
        min-height: 18px;
      }

      @media (max-width: 1080px) {
        .admin-stats {
          grid-template-columns: repeat(2, minmax(0, 1fr));
        }

        .admin-layout {
          grid-template-columns: 1fr;
        }

        .admin-tabs {
          position: static;
          display: flex;
          overflow-x: auto;
          padding-bottom: 4px;
        }

        .admin-tabs button {
          white-space: nowrap;
        }

        .admin-table-head {
          display: none;
        }

        .admin-row.citas,
        .admin-manage-row {
          grid-template-columns: 1fr;
        }
      }

      @media (max-width: 680px) {
        .admin-page {
          padding-top: 126px;
        }

        .admin-top {
          grid-template-columns: 1fr;
          align-items: start;
        }

        .admin-stats,
        .admin-form-grid {
          grid-template-columns: 1fr;
        }

        .admin-section-head {
          align-items: stretch;
          flex-direction: column;
        }

        .admin-actions,
        .admin-actions button,
        .admin-primary,
        .admin-refresh,
        .admin-back {
          width: 100%;
        }
      }
    `}</style>
  );
}
