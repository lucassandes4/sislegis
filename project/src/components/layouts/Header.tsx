import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { LogOut, FileText, Users, Home } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

const Header: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <header className="bg-slate-800 text-white shadow-md">
      <div className="container mx-auto px-4 py-3">
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <FileText className="h-6 w-6 text-amber-400" />
            <h1 className="text-xl font-semibold">SisLegis</h1>
          </div>

          {user && (
            <div className="flex items-center">
              <nav className="hidden md:flex mr-6">
                <ul className="flex space-x-6">
                  <li>
                    <Link 
                      to="/dashboard" 
                      className="flex items-center hover:text-amber-300 transition-colors"
                    >
                      <Home className="w-4 h-4 mr-1" />
                      <span>Início</span>
                    </Link>
                  </li>
                  <li>
                    <Link 
                      to="/proposicoes" 
                      className="flex items-center hover:text-amber-300 transition-colors"
                    >
                      <FileText className="w-4 h-4 mr-1" />
                      <span>Proposições</span>
                    </Link>
                  </li>
                  {user.perfil === 'admin_geral' && (
                    <li>
                      <Link 
                        to="/usuarios" 
                        className="flex items-center hover:text-amber-300 transition-colors"
                      >
                        <Users className="w-4 h-4 mr-1" />
                        <span>Usuários</span>
                      </Link>
                    </li>
                  )}
                </ul>
              </nav>
              <div className="flex items-center">
                <span className="mr-4 text-sm hidden md:inline-block">
                  {user.nome}
                </span>
                <button
                  onClick={handleLogout}
                  className="flex items-center bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded text-sm transition-colors"
                >
                  <LogOut className="w-4 h-4 mr-1" /> Sair
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;