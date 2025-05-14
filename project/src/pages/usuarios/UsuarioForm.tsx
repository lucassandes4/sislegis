import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Save, ArrowLeft, UserPlus } from 'lucide-react';
import Card from '../../components/ui/Card';
import Input from '../../components/ui/Input';
import Select from '../../components/ui/Select';
import Button from '../../components/ui/Button';
import Alert from '../../components/ui/Alert';
import { createUser, getUserById, updateUser, getUsers } from '../../services/localStorage';
import { User } from '../../types';

const UsuarioForm: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isEditing = !!id;

  const [formData, setFormData] = useState<Omit<User, 'id'>>({
    nome: '',
    login: '',
    senha: '',
    perfil: 'vereador',
  });

  const [confirmarSenha, setConfirmarSenha] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [alert, setAlert] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [existingLogins, setExistingLogins] = useState<string[]>([]);

  useEffect(() => {
    // Get all existing logins for validation
    const users = getUsers();
    setExistingLogins(users.map(user => user.login));
    
    if (isEditing && id) {
      const usuario = getUserById(id);
      if (usuario) {
        setFormData({
          nome: usuario.nome,
          login: usuario.login,
          senha: usuario.senha,
          perfil: usuario.perfil,
        });
        setConfirmarSenha(usuario.senha);
      } else {
        navigate('/usuarios');
      }
    }
  }, [id, isEditing, navigate]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear error for this field if exists
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.nome) newErrors.nome = 'O nome é obrigatório.';
    if (!formData.login) newErrors.login = 'O login é obrigatório.';
    if (!formData.senha) newErrors.senha = 'A senha é obrigatória.';
    if (formData.senha !== confirmarSenha) {
      newErrors.confirmarSenha = 'As senhas não coincidem.';
    }
    
    // Check if login already exists (only for new users or if login changed)
    if (!isEditing && existingLogins.includes(formData.login)) {
      newErrors.login = 'Este login já está em uso.';
    } else if (isEditing && id) {
      const currentUser = getUserById(id);
      if (currentUser && formData.login !== currentUser.login && existingLogins.includes(formData.login)) {
        newErrors.login = 'Este login já está em uso.';
      }
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setIsSubmitting(true);
    
    try {
      if (isEditing && id) {
        updateUser({ ...formData, id });
        setAlert({ type: 'success', message: 'Usuário atualizado com sucesso!' });
      } else {
        createUser(formData);
        setAlert({ type: 'success', message: 'Usuário criado com sucesso!' });
        // Reset form after creation
        setFormData({
          nome: '',
          login: '',
          senha: '',
          perfil: 'vereador',
        });
        setConfirmarSenha('');
      }
    } catch (error) {
      console.error('Erro ao salvar usuário:', error);
      setAlert({ type: 'error', message: 'Erro ao salvar o usuário. Tente novamente.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <button 
          className="flex items-center text-gray-600 hover:text-gray-900"
          onClick={() => navigate('/usuarios')}
        >
          <ArrowLeft className="h-4 w-4 mr-1" /> Voltar para Usuários
        </button>
      </div>

      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-800 mb-2">
          {isEditing ? 'Editar Usuário' : 'Novo Usuário'}
        </h1>
        <p className="text-gray-600">
          {isEditing ? 'Atualize os dados do usuário' : 'Preencha os campos para cadastrar um novo usuário'}
        </p>
      </div>

      {alert && (
        <Alert
          type={alert.type}
          message={alert.message}
          className="mb-6"
          onClose={() => setAlert(null)}
        />
      )}

      <Card>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Input
              label="Nome Completo *"
              name="nome"
              value={formData.nome}
              onChange={handleChange}
              error={errors.nome}
              fullWidth
              required
            />

            <Input
              label="Login *"
              name="login"
              value={formData.login}
              onChange={handleChange}
              error={errors.login}
              fullWidth
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Input
              label="Senha *"
              name="senha"
              type="password"
              value={formData.senha}
              onChange={handleChange}
              error={errors.senha}
              fullWidth
              required
            />

            <Input
              label="Confirmar Senha *"
              name="confirmarSenha"
              type="password"
              value={confirmarSenha}
              onChange={(e) => setConfirmarSenha(e.target.value)}
              error={errors.confirmarSenha}
              fullWidth
              required
            />
          </div>

          <Select
            label="Perfil do Usuário *"
            name="perfil"
            value={formData.perfil}
            onChange={handleChange}
            options={[
              { value: 'vereador', label: 'Vereador' },
              { value: 'admin_geral', label: 'Administrador Geral' }
            ]}
            error={errors.perfil}
            fullWidth
            required
          />

          <div className="flex justify-end pt-4">
            <Button
              type="submit"
              variant="primary"
              icon={isEditing ? <Save className="h-4 w-4" /> : <UserPlus className="h-4 w-4" />}
              isLoading={isSubmitting}
            >
              {isEditing ? 'Salvar Alterações' : 'Cadastrar Usuário'}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
};

export default UsuarioForm;