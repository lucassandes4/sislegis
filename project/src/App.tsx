import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import ProposicoesList from './pages/proposicoes/ProposicoesList';
import ProposicaoForm from './pages/proposicoes/ProposicaoForm';
import ProposicaoDetail from './pages/proposicoes/ProposicaoDetail';
import UsuariosList from './pages/usuarios/UsuariosList';
import UsuarioForm from './pages/usuarios/UsuarioForm';
import Header from './components/layouts/Header';
import { initializeLocalStorage } from './services/localStorage';

// Protected route component
const ProtectedRoute: React.FC<{ 
  element: React.ReactNode;
  adminOnly?: boolean;
}> = ({ element, adminOnly = false }) => {
  const { user, isAuthenticated } = useAuth();
  
  if (!isAuthenticated) {
    return <Navigate to="/" replace />;
  }
  
  if (adminOnly && user?.perfil !== 'admin_geral') {
    return <Navigate to="/dashboard" replace />;
  }
  
  return (
    <>
      <Header />
      {element}
    </>
  );
};

const AppRoutes: React.FC = () => {
  const { isAuthenticated } = useAuth();
  
  return (
    <Routes>
      <Route 
        path="/" 
        element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <Login />} 
      />
      <Route
        path="/dashboard"
        element={<ProtectedRoute element={<Dashboard />} />}
      />
      <Route
        path="/proposicoes"
        element={<ProtectedRoute element={<ProposicoesList />} />}
      />
      <Route
        path="/proposicoes/novo"
        element={<ProtectedRoute element={<ProposicaoForm />} />}
      />
      <Route
        path="/proposicoes/editar/:id"
        element={<ProtectedRoute element={<ProposicaoForm />} />}
      />
      <Route
        path="/proposicoes/:id"
        element={<ProtectedRoute element={<ProposicaoDetail />} />}
      />
      <Route
        path="/usuarios"
        element={<ProtectedRoute element={<UsuariosList />} adminOnly />}
      />
      <Route
        path="/usuarios/novo"
        element={<ProtectedRoute element={<UsuarioForm />} adminOnly />}
      />
      <Route
        path="/usuarios/editar/:id"
        element={<ProtectedRoute element={<UsuarioForm />} adminOnly />}
      />

      {/* Catch all route */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

function App() {
  // Initialize localStorage with default data
  useEffect(() => {
    initializeLocalStorage();
  }, []);

  return (
    <Router>
      <AuthProvider>
        <div className="min-h-screen bg-gray-100">
          <AppRoutes />
        </div>
      </AuthProvider>
    </Router>
  );
}

export default App;