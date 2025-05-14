import { User, Proposicao } from '../types';
import { generateId } from '../utils/helpers';

// Initial admin user
const defaultAdminUser: User = {
  id: '1',
  nome: 'Administrador Geral',
  login: 'admin',
  senha: 'admin123',
  perfil: 'admin_geral',
};

// Initial vereador user
const defaultVereadorUser: User = {
  id: '2',
  nome: 'João Vereador',
  login: 'vereador',
  senha: 'vereador123',
  perfil: 'vereador',
};

// Initialize localStorage with default data if empty
export const initializeLocalStorage = (): void => {
  // Initialize users
  if (!localStorage.getItem('usuarios')) {
    localStorage.setItem('usuarios', JSON.stringify([defaultAdminUser, defaultVereadorUser]));
  }

  // Initialize proposições with sample data
  if (!localStorage.getItem('proposicoes')) {
    const sampleProposicoes: Proposicao[] = [
      {
        id: '1',
        tipo: 'Projeto de Lei',
        titulo: 'Reforma da Praça Central',
        ementa: 'Projeto para reforma e revitalização da praça central do município',
        autor_id: '2',
        status: 'enviada',
        data_envio: new Date().toISOString(),
        anexo: null,
        observacoes: 'Projeto prioritário para o primeiro semestre'
      },
      {
        id: '2',
        tipo: 'Requerimento',
        titulo: 'Manutenção de Vias Públicas',
        ementa: 'Solicitação de manutenção urgente das vias públicas do bairro Jardim das Flores',
        autor_id: '2',
        status: 'protocolada',
        data_envio: new Date().toISOString(),
        data_protocolo: new Date().toISOString(),
        anexo: null,
        observacoes: 'Atender reclamações dos moradores'
      }
    ];
    localStorage.setItem('proposicoes', JSON.stringify(sampleProposicoes));
  }
};

// User related operations
export const getUsers = (): User[] => {
  const users = localStorage.getItem('usuarios');
  return users ? JSON.parse(users) : [];
};

export const getUserById = (id: string): User | undefined => {
  const users = getUsers();
  return users.find(user => user.id === id);
};

export const authenticateUser = (login: string, senha: string): User | null => {
  const users = getUsers();
  return users.find(user => user.login === login && user.senha === senha) || null;
};

export const createUser = (user: Omit<User, 'id'>): User => {
  const users = getUsers();
  const newUser: User = {
    ...user,
    id: generateId(),
  };
  localStorage.setItem('usuarios', JSON.stringify([...users, newUser]));
  return newUser;
};

export const updateUser = (updatedUser: User): void => {
  const users = getUsers();
  const updatedUsers = users.map(user => 
    user.id === updatedUser.id ? updatedUser : user
  );
  localStorage.setItem('usuarios', JSON.stringify(updatedUsers));
};

export const deleteUser = (id: string): void => {
  const users = getUsers();
  const filteredUsers = users.filter(user => user.id !== id);
  localStorage.setItem('usuarios', JSON.stringify(filteredUsers));
};

// Proposição related operations
export const getProposicoes = (): Proposicao[] => {
  const proposicoes = localStorage.getItem('proposicoes');
  return proposicoes ? JSON.parse(proposicoes) : [];
};

export const getProposicoesByUserId = (userId: string): Proposicao[] => {
  const proposicoes = getProposicoes();
  return proposicoes.filter(prop => prop.autor_id === userId);
};

export const getProposicaoById = (id: string): Proposicao | undefined => {
  const proposicoes = getProposicoes();
  return proposicoes.find(prop => prop.id === id);
};

export const createProposicao = (proposicao: Omit<Proposicao, 'id'>): Proposicao => {
  const proposicoes = getProposicoes();
  const newProposicao: Proposicao = {
    ...proposicao,
    id: generateId(),
  };
  localStorage.setItem('proposicoes', JSON.stringify([...proposicoes, newProposicao]));
  return newProposicao;
};

export const updateProposicao = (updatedProposicao: Proposicao): void => {
  const proposicoes = getProposicoes();
  const updatedProposicoes = proposicoes.map(proposicao => 
    proposicao.id === updatedProposicao.id ? updatedProposicao : proposicao
  );
  localStorage.setItem('proposicoes', JSON.stringify(updatedProposicoes));
};

export const deleteProposicao = (id: string): void => {
  const proposicoes = getProposicoes();
  const filteredProposicoes = proposicoes.filter(proposicao => proposicao.id !== id);
  localStorage.setItem('proposicoes', JSON.stringify(filteredProposicoes));
};

// Update the status of a proposição
export const updateProposicaoStatus = (id: string, newStatus: Proposicao['status']): void => {
  const proposicoes = getProposicoes();
  const updatedProposicoes = proposicoes.map(proposicao => {
    if (proposicao.id === id) {
      const updates: Partial<Proposicao> = { status: newStatus };
      
      // Add dates based on status
      if (newStatus === 'enviada' && !proposicao.data_envio) {
        updates.data_envio = new Date().toISOString();
      }
      if (newStatus === 'protocolada' && !proposicao.data_protocolo) {
        updates.data_protocolo = new Date().toISOString();
      }
      
      return { ...proposicao, ...updates };
    }
    return proposicao;
  });
  
  localStorage.setItem('proposicoes', JSON.stringify(updatedProposicoes));
};