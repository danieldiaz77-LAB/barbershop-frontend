import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { authApi } from '../services/endpoints';
import { useAuth } from '../context/AuthContext';

const neon = '#b7ff00';

export default function VerificarEmail() {
  const [searchParams] = useSearchParams();
  const { user } = useAuth();
  const token = searchParams.get('token');

  const [estado, setEstado] = useState('idle'); // idle | verificando | ok | error | reenvio
  const [msg, setMsg] = useState('');
  const [email, setEmail] = useState(user?.email || '');
  const [resendLoading, setResendLoading] = useState(false);
  const [resendMsg, setResendMsg] = useState('');

  useEffect(() => {
    if (!token) return;
    setEstado('verificando');
    authApi.verifyEmail(token)
      .then((data) => {
        setEstado('ok');
        setMsg(data.message || 'Email verificado correctamente.');
      })
      .catch((err) => {
        setEstado('error');
        setMsg(err?.response?.data?.message || 'Link invalido o expirado.');
      });
  }, [token]);

  const resend = async (e) => {
    e.preventDefault();
    if (!email) return;
    setResendLoading(true);
    setResendMsg('');
    try {
      const data = await authApi.resendVerification(email);
      setResendMsg(data.message || 'Email enviado.');
    } catch (err) {
      setResendMsg(err?.response?.data?.message || 'No pudimos enviar el email.');
    } finally {
      setResendLoading(false);
    }
  };

  return (
    <main style={{
      minHeight: '100vh',
      padding: '190px 20px 96px',
      background: 'radial-gradient(circle at 74% 15%, rgba(189,255,0,.10), transparent 30%), #0A0A0A',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'flex-start',
    }}>
      <section style={{ width: '100%', maxWidth: 430 }} className="fadeup">

        {/* Si viene token: mostrar resultado de verificacion */}
        {token && (
          <>
            {estado === 'verificando' && (
              <div style={{ textAlign: 'center', color: '#8d9484', paddingTop: 40 }}>
                Verificando tu email...
              </div>
            )}

            {estado === 'ok' && (
              <div style={{ textAlign: 'center' }}>
                <div style={{
                  width: 72, height: 72, margin: '0 auto 24px',
                  border: `2px solid ${neon}`, borderRadius: '50%',
                  display: 'grid', placeItems: 'center', color: neon, fontSize: 36,
                }}>✓</div>
                <div className="flow-kicker" style={{ marginBottom: 12 }}>Email verificado</div>
                <h1 className="flow-title" style={{ color: '#fff', fontSize: 'clamp(48px,7vw,68px)', marginBottom: 20 }}>
                  LISTO.
                </h1>
                <p style={{ color: '#8d9484', lineHeight: 1.7, marginBottom: 28 }}>{msg}</p>
                <Link to="/reservar" className="btn-neon" style={{ width: '100%', justifyContent: 'center' }}>
                  Reservar ahora
                </Link>
                <div style={{ marginTop: 16, textAlign: 'center' }}>
                  <Link to="/login" style={{ color: neon, fontSize: 13, fontWeight: 800 }}>
                    Iniciar sesion
                  </Link>
                </div>
              </div>
            )}

            {estado === 'error' && (
              <div style={{ textAlign: 'center' }}>
                <div style={{
                  width: 72, height: 72, margin: '0 auto 24px',
                  border: '2px solid #f87171', borderRadius: '50%',
                  display: 'grid', placeItems: 'center', color: '#f87171', fontSize: 36,
                }}>✕</div>
                <div className="flow-kicker" style={{ color: '#f87171', marginBottom: 12 }}>Link invalido</div>
                <h1 className="flow-title" style={{ color: '#fff', fontSize: 'clamp(48px,7vw,68px)', marginBottom: 20 }}>
                  LINK EXPIRADO.
                </h1>
                <p style={{ color: '#8d9484', lineHeight: 1.7, marginBottom: 28 }}>{msg}</p>
                <p style={{ color: '#6b7280', fontSize: 13, marginBottom: 20 }}>
                  Solicita un nuevo link ingresando tu email:
                </p>
              </div>
            )}
          </>
        )}

        {/* Panel de reenvio: mostrar si no hay token, o si hubo error */}
        {(!token || estado === 'error') && (
          <div>
            {!token && (
              <>
                <div className="flow-kicker" style={{ textAlign: 'center', marginBottom: 12 }}>Verificacion</div>
                <h1 className="flow-title" style={{ color: '#fff', fontSize: 'clamp(48px,7vw,68px)', textAlign: 'center', marginBottom: 20 }}>
                  REENVIAR EMAIL
                </h1>
                <p style={{ color: '#8d9484', lineHeight: 1.7, textAlign: 'center', marginBottom: 28 }}>
                  Si no recibiste el email de verificacion, ingresa tu correo para enviarte uno nuevo.
                </p>
              </>
            )}

            <form onSubmit={resend} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div>
                <label style={{
                  display: 'block', marginBottom: 8, color: '#62685d',
                  fontSize: 10, fontWeight: 900, letterSpacing: '.25em', textTransform: 'uppercase',
                }}>Email</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="tu@email.com"
                  className="input-dark"
                />
              </div>

              {resendMsg && (
                <div style={{
                  padding: '12px 16px',
                  border: resendMsg.includes('enviado') || resendMsg.includes('verificado')
                    ? '1px solid rgba(183,255,0,.25)'
                    : '1px solid rgba(248,113,113,.25)',
                  background: resendMsg.includes('enviado') || resendMsg.includes('verificado')
                    ? 'rgba(183,255,0,.06)'
                    : 'rgba(248,113,113,.08)',
                  color: resendMsg.includes('enviado') || resendMsg.includes('verificado')
                    ? neon
                    : '#f87171',
                  fontSize: 13,
                  borderRadius: 6,
                }}>
                  {resendMsg}
                </div>
              )}

              <button
                type="submit"
                disabled={resendLoading}
                className="btn-neon"
                style={{ width: '100%', justifyContent: 'center' }}
              >
                {resendLoading ? 'Enviando...' : 'Reenviar email ->'}
              </button>
            </form>

            <div style={{ marginTop: 24, textAlign: 'center', color: '#5f665a', fontSize: 14 }}>
              <Link to="/login" style={{ color: neon, fontWeight: 800 }}>Volver al login</Link>
            </div>
          </div>
        )}
      </section>
    </main>
  );
}
