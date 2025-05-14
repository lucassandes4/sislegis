import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FileText } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';
import Alert from '../components/ui/Alert';

const Login: React.FC = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!username || !password) {
      setError('Por favor, preencha todos os campos');
      return;
    }
    
    setIsLoading(true);
    setError('');
    
    try {
      const success = await login(username, password);
      
      if (success) {
        navigate('/dashboard');
      } else {
        setError('Usuário ou senha inválidos');
      }
    } catch (err) {
      setError('Ocorreu um erro durante o login. Tente novamente.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-lg shadow-md">
        <div className="text-center">
          <div className="mx-auto flex justify-center">
            <FileText className="h-12 w-12 text-blue-600" />
          </div>
          <h2 className="mt-4 text-3xl font-extrabold text-gray-900">
            SisLegis
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Sistema de Gerenciamento de Proposições Legislativas
          </p>
        </div>

        {error && (
          <Alert
            type="error"
            message={error}
            onClose={() => setError('')}
          />
        )}

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div>
            <Input
              label="Usuário"
              id="username"
              name="username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              fullWidth
              required
              autoFocus
              placeholder="Digite seu usuário"
            />
          </div>
          <div>
            <Input
              label="Senha"
              id="password"
              name="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              fullWidth
              required
              placeholder="Digite sua senha"
            />
          </div>

          <div>
            <Button
              type="submit"
              fullWidth
              isLoading={isLoading}
              className="w-full"
            >
              Entrar
            </Button>
          </div>

          <div className="text-center text-sm text-gray-500 mt-4">
            <div className="mb-2">
              <strong>Credenciais de Demonstração:</strong>
            </div>
            <div>
              <div><strong>Admin:</strong> login: admin / senha: admin123</div>
              <div><strong>Vereador:</strong> login: vereador / senha: vereador123</div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Login;