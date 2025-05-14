import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { PlusCircle, Search, Filter, FileText } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import Input from '../../components/ui/Input';
import Select from '../../components/ui/Select';
import Card from '../../components/ui/Card';
import { getProposicoes, getProposicoesByUserId, getUserById } from '../../services/localStorage';
import { Proposicao } from '../../types';
import { formatDate, getStatusLabel } from '../../utils/helpers';

const ProposicoesList: React.FC = () => {
  const { user } = useAuth();
  const [proposicoes, setProposicoes] = useState<Proposicao[]>([]);
  const [filteredProposicoes, setFilteredProposicoes] = useState<Proposicao[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('todos');
  
  useEffect(() => {
    if (user) {
      let proposicoesData: Proposicao[] = [];
      
      if (user.perfil === 'admin_geral') {
        proposicoesData = getProposicoes().map(prop => {
          const autor = getUserById(prop.autor_id);
          return {
            ...prop,
            autor_nome: autor ? autor.nome : 'Usuário Desconhecido'
          };
        });
      } else {
        proposicoesData = getProposicoesByUserId(user.id);
      }
      
      setProposicoes(proposicoesData);
      setFilteredProposicoes(proposicoesData);
    }
  }, [user]);

  useEffect(() => {
    applyFilters();
  }, [searchTerm, statusFilter, proposicoes]);

  const applyFilters = () => {
    let filtered = [...proposicoes];
    
    // Apply search term filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(
        prop => 
          prop.titulo.toLowerCase().includes(term) || 
          prop.ementa.toLowerCase().includes(term) ||
          prop.tipo.toLowerCase().includes(term)
      );
    }
    
    // Apply status filter
    if (statusFilter !== 'todos') {
      filtered = filtered.filter(prop => prop.status === statusFilter);
    }
    
    setFilteredProposicoes(filtered);
  };

  if (!user) return null;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 mb-2">
            Proposições Legislativas
          </h1>
          <p className="text-gray-600">
            {user.perfil === 'admin_geral' 
              ? 'Gerenciamento de todas as proposições do sistema' 
              : 'Suas proposições legislativas'}
          </p>
        </div>
        
        {user.perfil === 'vereador' && (
          <Link to="/proposicoes/novo" className="mt-4 md:mt-0">
            <Button 
              icon={<PlusCircle className="h-4 w-4" />}
              variant="primary"
            >
              Nova Proposição
            </Button>
          </Link>
        )}
      </div>

      <Card className="mb-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="col-span-2">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
              <Input
                type="text"
                placeholder="Buscar por título, ementa ou tipo..."
                className="pl-10"
                fullWidth
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
          <div>
            <div className="flex items-center">
              <Filter className="h-5 w-5 text-gray-400 mr-2" />
              <Select
                options={[
                  { value: 'todos', label: 'Todos os Status' },
                  { value: 'rascunho', label: 'Rascunho' },
                  { value: 'enviada', label: 'Enviada' },
                  { value: 'protocolada', label: 'Protocolada' },
                  { value: 'arquivada', label: 'Arquivada' }
                ]}
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                fullWidth
              />
            </div>
          </div>
        </div>
      </Card>

      <Card>
        {filteredProposicoes.length > 0 ? (
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
                  {user.perfil === 'admin_geral' && (
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Autor
                    </th>
                  )}
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
                {filteredProposicoes.map((proposicao) => (
                  <tr key={proposicao.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {proposicao.tipo}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {proposicao.titulo}
                    </td>
                    {user.perfil === 'admin_geral' && (
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {proposicao.autor_nome}
                      </td>
                    )}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Badge status={proposicao.status}>
                        {getStatusLabel(proposicao.status)}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(proposicao.data_envio)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <div className="flex space-x-2">
                        <Link to={`/proposicoes/${proposicao.id}`}>
                          <Button 
                            variant="primary" 
                            size="sm"
                            icon={<FileText className="h-4 w-4" />}
                          >
                            Visualizar
                          </Button>
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-12">
            <FileText className="h-12 w-12 mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhuma proposição encontrada</h3>
            <p className="text-gray-500 mb-6">
              {searchTerm || statusFilter !== 'todos'
                ? 'Tente ajustar os filtros para encontrar o que procura.'
                : 'Você ainda não possui proposições cadastradas.'}
            </p>
            {user.perfil === 'vereador' && (
              <Link to="/proposicoes/novo">
                <Button 
                  icon={<PlusCircle className="h-4 w-4" />}
                  variant="primary"
                >
                  Criar Primeira Proposição
                </Button>
              </Link>
            )}
          </div>
        )}
      </Card>
    </div>
  );
};

export default ProposicoesList;