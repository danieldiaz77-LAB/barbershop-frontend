import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const neon = '#BDFF00';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const data = await login(email, password);

      navigate(
        data.role === 'BARBER_ADMIN' ? '/admin' :
        data.role === 'BARBER' ? '/barber' : '/'
      );
    } catch {
      setError('Email o contrasena incorrectos');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="login-page">
      <style>{`
        .login-page {
          min-height: 100vh;
          padding: 190px 20px 96px;
          background:
            radial-gradient(circle at 75% 18%, rgba(189,255,0,.10), transparent 30%),
            #0A0A0A;
          display: flex;
          justify-content: center;
          align-items: flex-start;
        }

        .login-box {
          width: 100%;
          max-width: 430px;
        }

        .login-head {
          margin-bottom: 38px;
        }

        .login-kicker {
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

        .login-kicker::before,
        .login-kicker::after {
          content: "";
          width: 34px;
          height: 2px;
          background: ${neon};
          box-shadow: 0 0 8px ${neon};
        }

        .login-title {
          color: #fff;
          text-align: center;
          font-size: clamp(54px, 8vw, 76px);
          line-height: .9;
        }

        .login-form {
          display: flex;
          flex-direction: column;
          gap: 18px;
        }

        .login-label {
          display: block;
          margin-bottom: 8px;
          color: #62685d;
          font-size: 10px;
          font-weight: 900;
          letter-spacing: .25em;
          text-transform: uppercase;
        }

        .login-error {
          padding: 12px 16px;
          border: 1px solid rgba(248,113,113,.25);
          background: rgba(248,113,113,.08);
          color: #f87171;
          font-size: 13px;
        }

        .login-register {
          margin-top: 28px;
          text-align: center;
          color: #5f665a;
          font-size: 14px;
        }

        .login-register a {
          color: ${neon};
          font-weight: 800;
        }

        @media (max-width: 768px) {
          .login-page {
            padding-top: 150px;
            padding-bottom: 72px;
          }
        }
      `}</style>

      <section className="login-box fadeup">
        <header className="login-head">
          <div className="login-kicker">Bienvenido de vuelta</div>

          <h1 className="flow-title login-title">
            INICIAR SESION
          </h1>
        </header>

        <form onSubmit={onSubmit} className="login-form">
          <div>
            <label className="login-label">Email</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="tu@email.com"
              className="input-dark"
            />
          </div>

          <div>
            <label className="login-label">Contrasena</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="********"
              className="input-dark"
            />
          </div>

          {error && (
            <div className="login-error">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="btn-neon"
            style={{ width: '100%', justifyContent: 'center', marginTop: 8 }}
          >
            {loading ? 'Ingresando...' : 'Ingresar ->'}
          </button>
        </form>

        <div className="login-register">
          No tienes cuenta?{' '}
          <Link to="/register">Registrate</Link>
        </div>
      </section>
    </main>
  );
}