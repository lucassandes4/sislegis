import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FilePlus, Users, PlusCircle, FileText, CheckCircle } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import Card from '../components/ui/Card';
import Badge from '../components/ui/Badge';
import Button from '../components/ui/Button';
import { getProposicoes, getProposicoesByUserId, getUsers } from '../services/localStorage';
import { Proposicao, User } from '../types';
import { formatDate, getStatusLabel } from '../utils/helpers';

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const [proposicoes, setProposicoes] = useState<Proposicao[]>([]);
  const [userCount, setUserCount] = useState(0);
  
  useEffect(() => {
    if (user) {
      if (user.perfil === 'admin_geral') {
        setProposicoes(getProposicoes());
        setUserCount(getUsers().length);
      } else {
        setProposicoes(getProposicoesByUserId(user.id));
      }
    }
  }, [user]);

  const countByStatus = (status: Proposicao['status']) => {
    return proposicoes.filter(prop => prop.status === status).length;
  };

  if (!user) return null;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-800 mb-2">
          Bem-vindo(a), {user.nome}
        </h1>
        <p className="text-gray-600">
          {user.perfil === 'admin_geral' 
            ? 'Painel de Administração do Sistema' 
            : 'Painel de Gerenciamento de Proposições'}
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white">
          <div className="flex items-center">
            <div className="rounded-full bg-white/20 p-3 mr-4">
              <FileText className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-blue-100">Total de Proposições</p>
              <h3 className="text-2xl font-bold">{proposicoes.length}</h3>
            </div>
          </div>
        </Card>

        <Card className="bg-gradient-to-br from-amber-500 to-amber-600 text-white">
          <div className="flex items-center">
            <div className="rounded-full bg-white/20 p-3 mr-4">
              <FilePlus className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-amber-100">Rascunhos</p>
              <h3 className="text-2xl font-bold">{countByStatus('rascunho')}</h3>
            </div>
          </div>
        </Card>

        <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white">
          <div className="flex items-center">
            <div className="rounded-full bg-white/20 p-3 mr-4">
              <CheckCircle className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-green-100">Protocoladas</p>
              <h3 className="text-2xl font-bold">{countByStatus('protocolada')}</h3>
            </div>
          </div>
        </Card>

        {user.perfil === 'admin_geral' ? (
          <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white">
            <div className="flex items-center">
              <div className="rounded-full bg-white/20 p-3 mr-4">
                <Users className="h-6 w-6" />
              </div>
              <div>
                <p className="text-sm font-medium text-purple-100">Usuários</p>
                <h3 className="text-2xl font-bold">{userCount}</h3>
              </div>
            </div>
          </Card>
        ) : (
          <Card className="bg-gradient-to-br from-indigo-500 to-indigo-600 text-white">
            <div className="flex items-center">
              <div className="rounded-full bg-white/20 p-3 mr-4">
                <FileText className="h-6 w-6" />
              </div>
              <div>
                <p className="text-sm font-medium text-indigo-100">Enviadas</p>
                <h3 className="text-2xl font-bold">{countByStatus('enviada')}</h3>
              </div>
            </div>
          </Card>
        )}
      </div>

      {/* Action Buttons */}
      <div className="flex flex-wrap gap-4 mb-8">
        {user.perfil === 'vereador' && (
          <Link to="/proposicoes/novo">
            <Button 
              icon={<PlusCircle className="h-4 w-4" />}
              variant="primary"
            >
              Nova Proposição
            </Button>
          </Link>
        )}
        <Link to="/proposicoes">
          <Button 
            icon={<FileText className="h-4 w-4" />}
            variant="secondary"
          >
            Ver Todas Proposições
          </Button>
        </Link>
        {user.perfil === 'admin_geral' && (
          <Link to="/usuarios">
            <Button 
              icon={<Users className="h-4 w-4" />}
              variant="secondary"
            >
              Gerenciar Usuários
            </Button>
          </Link>
        )}
      </div>

      {/* Recent Propositions */}
      <Card title="Proposições Recentes">
        {proposicoes.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Tipo
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Título
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Data de Envio
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Ações
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {proposicoes.slice(0, 5).map((proposicao) => (
                  <tr key={proposicao.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {proposicao.tipo}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {proposicao.titulo}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Badge status={proposicao.status}>
                        {getStatusLabel(proposicao.status)}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(proposicao.data_envio)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <Link to={`/proposicoes/${proposicao.id}`}>
                        <Button 
                          variant="primary" 
                          size="sm"
                        >
                          Visualizar
                        </Button>
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-6 text-gray-500">
            Nenhuma proposição encontrada.
          </div>
        )}
      </Card>
    </div>
  );
};

export default Dashboard;