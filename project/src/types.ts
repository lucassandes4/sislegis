export interface User {
  id: string;
  nome: string;
  login: string;
  senha: string;
  perfil: 'admin_geral' | 'vereador';
}

export interface Proposicao {
  id: string;
  tipo: string;
  titulo: string;
  ementa: string;
  autor_id: string;
  autor_nome?: string;
  status: 'rascunho' | 'enviada' | 'protocolada' | 'arquivada';
  data_envio: string | null;
  data_protocolo?: string | null;
  anexo: string | null; // Base64 encoded string for PDF
  observacoes: string;
}

export interface AuthContextType {
  user: User | null;
  login: (login: string, senha: string) => Promise<boolean>;
  logout: () => void;
  isAuthenticated: boolean;
}