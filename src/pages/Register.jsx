import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const neon = '#BDFF00';

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    fullName: '',
    email: '',
    password: '',
    phone: '',
    role: 'CLIENT',
  });

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [registered, setRegistered] = useState(false);

  const change = (key) => (event) => {
    setForm({ ...form, [key]: event.target.value });
  };

  const onSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setLoading(true);

    try {
      await register(form);
      setRegistered(true);
    } catch (err) {
      setError(err?.response?.data?.message || 'No pudimos crear tu cuenta.');
    } finally {
      setLoading(false);
    }
  };

  if (registered) {
    return (
      <main className="register-page">
        <RegisterStyles neon={neon} />
        <section className="register-box fadeup" style={{ textAlign: 'center' }}>
          <div style={{
            width: 72,
            height: 72,
            margin: '0 auto 24px',
            border: `2px solid ${neon}`,
            borderRadius: '50%',
            display: 'grid',
            placeItems: 'center',
            color: neon,
            fontSize: 36,
          }}>
            ✓
          </div>

          <div className="register-kicker">Cuenta creada</div>

          <h1 className="flow-title register-title" style={{ marginBottom: 20 }}>
            REVISA TU EMAIL
          </h1>

          <p style={{ color: '#8d9484', fontSize: 15, lineHeight: 1.7, marginBottom: 28 }}>
            Te enviamos un link de verificacion a <strong style={{ color: '#fff' }}>{form.email}</strong>.
            <br />
            Debes verificar tu email antes de poder reservar una cita.
          </p>

          <div style={{
            padding: '16px 20px',
            background: 'rgba(183,255,0,.06)',
            border: '1px solid rgba(183,255,0,.2)',
            borderRadius: 8,
            color: '#a5aa9d',
            fontSize: 13,
            lineHeight: 1.6,
            marginBottom: 28,
            textAlign: 'left',
          }}>
            <strong style={{ color: neon }}>Pasos:</strong><br />
            1. Revisa tu bandeja de entrada (y spam).<br />
            2. Haz click en el link de verificacion.<br />
            3. Inicia sesion y reserva tu hora.
          </div>

          <button
            onClick={() => navigate('/login')}
            className="btn-neon"
            style={{ width: '100%', justifyContent: 'center' }}
          >
            Ir a iniciar sesion
          </button>

          <div className="register-login" style={{ marginTop: 16 }}>
            No recibiste el email?{' '}
            <Link to="/verificar-email">Reenviar verificacion</Link>
          </div>
        </section>
      </main>
    );
  }

  return (
    <main className="register-page">
      <RegisterStyles neon={neon} />

      <section className="register-box fadeup">
        <header className="register-head">
          <div className="register-kicker">Unete al flow</div>

          <h1 className="flow-title register-title">
            CREAR CUENTA
          </h1>
        </header>

        <div style={{
          padding: '12px 16px',
          background: 'rgba(183,255,0,.05)',
          border: '1px solid rgba(183,255,0,.18)',
          borderRadius: 6,
          color: '#8d9484',
          fontSize: 13,
          lineHeight: 1.6,
          marginBottom: 24,
        }}>
          <strong style={{ color: neon }}>Importante:</strong> Al registrarte recibiras un email de verificacion.
          Debes verificar tu correo antes de poder reservar.
        </div>

        <form onSubmit={onSubmit} className="register-form">
          <div>
            <label className="register-label">Nombre completo</label>
            <input
              className="input-dark"
              value={form.fullName}
              onChange={change('fullName')}
              required
              placeholder="Tu nombre"
            />
          </div>

          <div>
            <label className="register-label">Email</label>
            <input
              type="email"
              className="input-dark"
              value={form.email}
              onChange={change('email')}
              required
              placeholder="tu@email.com"
            />
          </div>

          <div>
            <label className="register-label">Telefono (chileno)</label>
            <input
              className="input-dark"
              value={form.phone}
              onChange={change('phone')}
              required
              placeholder="+56 9 9809 8449"
            />
            <span style={{ color: '#5a6055', fontSize: 11, marginTop: 4, display: 'block' }}>
              Formato: +56 9 XXXX XXXX
            </span>
          </div>

          <div>
            <label className="register-label">Contrasena</label>
            <input
              type="password"
              minLength={6}
              className="input-dark"
              value={form.password}
              onChange={change('password')}
              required
              placeholder="Minimo 6 caracteres"
            />
          </div>

          {error && (
            <div className="register-error">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="btn-neon"
            style={{ width: '100%', justifyContent: 'center', marginTop: 8 }}
          >
            {loading ? 'Creando cuenta...' : 'Crear cuenta ->'}
          </button>
        </form>

        <div className="register-login">
          Ya tienes cuenta?{' '}
          <Link to="/login">Inicia sesion</Link>
        </div>
      </section>
    </main>
  );
}

function RegisterStyles({ neon }) {
  return (
    <style>{`
      .register-page {
        min-height: 100vh;
        padding: 190px 20px 96px;
        background:
          radial-gradient(circle at 74% 15%, rgba(189,255,0,.10), transparent 30%),
          #0A0A0A;
        display: flex;
        justify-content: center;
        align-items: flex-start;
      }

      .register-box {
        width: 100%;
        max-width: 430px;
      }

      .register-head {
        margin-bottom: 28px;
      }

      .register-kicker {
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 10px;
        margin-bottom: 14px;
        color: ${neon};
        font-size: 11px;
        font-weight: 900;
        letter-spacing: .35em;
        text-transform: uppercase;
      }

      .register-kicker::before,
      .register-kicker::after {
        content: "";
        width: 34px;
        height: 2px;
        background: ${neon};
        box-shadow: 0 0 8px ${neon};
      }

      .register-title {
        color: #fff;
        text-align: center;
        font-size: clamp(54px, 8vw, 76px);
        line-height: .9;
      }

      .register-form {
        display: flex;
        flex-direction: column;
        gap: 18px;
      }

      .register-label {
        display: block;
        margin-bottom: 8px;
        color: #62685d;
        font-size: 10px;
        font-weight: 900;
        letter-spacing: .25em;
        text-transform: uppercase;
      }

      .register-error {
        padding: 12px 16px;
        border: 1px solid rgba(248,113,113,.25);
        background: rgba(248,113,113,.08);
        color: #f87171;
        font-size: 13px;
        border-radius: 6px;
      }

      .register-login {
        margin-top: 28px;
        text-align: center;
        color: #5f665a;
        font-size: 14px;
      }

      .register-login a {
        color: ${neon};
        font-weight: 800;
      }

      @media (max-width: 768px) {
        .register-page {
          padding-top: 150px;
          padding-bottom: 72px;
        }
      }
    `}</style>
  );
}
