import { Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import ProtectedRoute from './components/ProtectedRoute';

import Home            from './pages/Home';
import Login           from './pages/Login';
import Register        from './pages/Register';
import VerificarEmail  from './pages/VerificarEmail';
import Servicios       from './pages/Servicios';
import Reservar        from './pages/Reservar';
import MisCitas        from './pages/MisCitas';
import AdminDashboard  from './pages/AdminDashboard';
import BarberDashboard from './pages/BarberDashboard';

export default function App() {
  return (
    <AuthProvider>
      <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
        <Navbar />
        <main style={{ flex: 1 }}>
          <Routes>
            <Route path="/"          element={<Home />} />
            <Route path="/login"     element={<Login />} />
            <Route path="/register"  element={<Register />} />
            <Route path="/servicios" element={<Servicios />} />

            {/* verificacion de email */}
            <Route path="/verificar-email" element={<VerificarEmail />} />

            {/* rutas protegidas */}
            <Route path="/reservar" element={
              <ProtectedRoute><Reservar /></ProtectedRoute>
            } />
            <Route path="/mis-citas" element={
              <ProtectedRoute><MisCitas /></ProtectedRoute>
            } />

            {/* solo BARBER */}
            <Route path="/barber" element={
              <ProtectedRoute requireRole="BARBER">
                <BarberDashboard />
              </ProtectedRoute>
            } />

            {/* solo BARBER_ADMIN */}
            <Route path="/admin" element={
              <ProtectedRoute requireRole="BARBER_ADMIN">
                <AdminDashboard />
              </ProtectedRoute>
            } />
          </Routes>
        </main>
        <Footer />
      </div>
    </AuthProvider>
  );
}
