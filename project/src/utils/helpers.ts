import { format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';

// Generate a unique ID
export const generateId = (): string => {
  return Math.random().toString(36).substring(2, 15) + 
         Math.random().toString(36).substring(2, 15);
};

// Format date to Brazilian format
export const formatDate = (dateString: string | null | undefined): string => {
  if (!dateString) return '—';
  try {
    return format(parseISO(dateString), 'dd/MM/yyyy HH:mm', { locale: ptBR });
  } catch (error) {
    return dateString;
  }
};

// Format a file size
export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

// Get status badge color
export const getStatusColor = (status: string): string => {
  switch (status) {
    case 'rascunho':
      return 'bg-gray-200 text-gray-800';
    case 'enviada':
      return 'bg-blue-100 text-blue-800';
    case 'protocolada':
      return 'bg-green-100 text-green-800';
    case 'arquivada':
      return 'bg-amber-100 text-amber-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

// Get formatted status label
export const getStatusLabel = (status: string): string => {
  switch (status) {
    case 'rascunho':
      return 'Rascunho';
    case 'enviada':
      return 'Enviada';
    case 'protocolada':
      return 'Protocolada';
    case 'arquivada':
      return 'Arquivada';
    default:
      return status;
  }
};

// Convert file to base64
export const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = error => reject(error);
  });
};

// Extract file name from base64 string
export const getFileNameFromBase64 = (base64String: string | null): string => {
  if (!base64String) return '';
  
  try {
    // Try to extract filename from data URI if it exists
    const matches = base64String.match(/name=([^;]+)/);
    if (matches && matches[1]) {
      return decodeURIComponent(matches[1]);
    }
    
    // Default filename if no name is found
    return 'documento.pdf';
  } catch (error) {
    return 'documento.pdf';
  }
};