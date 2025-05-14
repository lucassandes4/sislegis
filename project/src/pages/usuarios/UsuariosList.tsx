import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Users, PlusCircle, Search, UserX, Edit } from 'lucide-react';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Card from '../../components/ui/Card';
import Alert from '../../components/ui/Alert';
import { getUsers, deleteUser } from '../../services/localStorage';
import { User } from '../../types';

const UsuariosList: React.FC = () => {
  const [usuarios, setUsuarios] = useState<User[]>([]);
  const [filteredUsuarios, setFilteredUsuarios] = useState<User[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [alert, setAlert] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  useEffect(() => {
    // Load users
    setUsuarios(getUsers());
  }, []);

  useEffect(() => {
    // Apply search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      setFilteredUsuarios(
        usuarios.filter(
          user => 
            user.nome.toLowerCase().includes(term) || 
            user.login.toLowerCase().includes(term)
        )
      );
    } else {
      setFilteredUsuarios(usuarios);
    }
  }, [searchTerm, usuarios]);

  const handleDeleteUser = (id: string, nome: string) => {
    if (window.confirm(`Tem certeza que deseja excluir o usuário ${nome}?`)) {
      try {
        deleteUser(id);
        setUsuarios(getUsers());
        setAlert({ 
          type: 'success', 
          message: `Usuário ${nome} excluído com sucesso!` 
        });
      } catch (error) {
        console.error('Erro ao excluir usuário:', error);
        setAlert({ 
          type: 'error', 
          message: 'Erro ao excluir o usuário. Tente novamente.' 
        });
      }
    }
  };

  const getPerfilLabel = (perfil: string): string => {
    switch (perfil) {
      case 'admin_geral':
        return 'Administrador Geral';
      case 'vereador':
        return 'Vereador';
      default:
        return perfil;
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 mb-2">
            Gerenciamento de Usuários
          </h1>
          <p className="text-gray-600">
            Gerencie os usuários do sistema
          </p>
        </div>
        
        <Link to="/usuarios/novo" className="mt-4 md:mt-0">
          <Button 
            icon={<PlusCircle className="h-4 w-4" />}
            variant="primary"
          >
            Novo Usuário
          </Button>
        </Link>
      </div>

      {alert && (
        <Alert
          type={alert.type}
          message={alert.message}
          className="mb-6"
          onClose={() => setAlert(null)}
        />
      )}

      <Card className="mb-8">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
          <Input
            type="text"
            placeholder="Buscar por nome ou login..."
            className="pl-10"
            fullWidth
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </Card>

      <Card>
        {filteredUsuarios.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Nome
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Login
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Perfil
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Ações
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredUsuarios.map((usuario) => (
                  <tr key={usuario.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {usuario.nome}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {usuario.login}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {getPerfilLabel(usuario.perfil)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <div className="flex space-x-2">
                        <Link to={`/usuarios/editar/${usuario.id}`}>
                          <Button 
                            variant="secondary" 
                            size="sm"
                            icon={<Edit className="h-4 w-4" />}
                          >
                            Editar
                          </Button>
                        </Link>
                        
                        <Button 
                          variant="danger" 
                          size="sm"
                          icon={<UserX className="h-4 w-4" />}
                          onClick={() => handleDeleteUser(usuario.id, usuario.nome)}
                        >
                          Excluir
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-12">
            <Users className="h-12 w-12 mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhum usuário encontrado</h3>
            <p className="text-gray-500 mb-6">
              {searchTerm
                ? 'Tente ajustar a busca para encontrar o que procura.'
                : 'Não há usuários cadastrados no sistema.'}
            </p>
            <Link to="/usuarios/novo">
              <Button 
                icon={<PlusCircle className="h-4 w-4" />}
                variant="primary"
              >
                Cadastrar Usuário
              </Button>
            </Link>
          </div>
        )}
      </Card>
    </div>
  );
};

export default UsuariosList;