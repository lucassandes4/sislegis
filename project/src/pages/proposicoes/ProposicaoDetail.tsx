import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { jsPDF } from 'jspdf';
import { ArrowLeft, FileText, Edit, Download, Clock, Paperclip, AlertCircle, CheckCircle, Archive } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import Alert from '../../components/ui/Alert';
import { getProposicaoById, getUserById, updateProposicaoStatus } from '../../services/localStorage';
import { Proposicao } from '../../types';
import { formatDate, getStatusLabel, getFileNameFromBase64 } from '../../utils/helpers';

const ProposicaoDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [proposicao, setProposicao] = useState<Proposicao | null>(null);
  const [autor, setAutor] = useState<string>('');
  const [alert, setAlert] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (id) {
      const proposicaoData = getProposicaoById(id);
      if (proposicaoData) {
        setProposicao(proposicaoData);
        
        // Get author name
        const autorData = getUserById(proposicaoData.autor_id);
        if (autorData) {
          setAutor(autorData.nome);
        }
      } else {
        navigate('/proposicoes');
      }
    }
  }, [id, navigate]);

  // Check for permission
  useEffect(() => {
    if (user && proposicao) {
      // If user is vereador and not the author, redirect
      if (user.perfil === 'vereador' && user.id !== proposicao.autor_id) {
        navigate('/proposicoes');
      }
    }
  }, [user, proposicao, navigate]);

  const handleStatusChange = async (newStatus: Proposicao['status']) => {
    if (!id || !proposicao) return;
    
    setIsLoading(true);
    
    try {
      updateProposicaoStatus(id, newStatus);
      
      // Refresh proposicao data
      const updatedProposicao = getProposicaoById(id);
      if (updatedProposicao) {
        setProposicao(updatedProposicao);
      }
      
      setAlert({ 
        type: 'success', 
        message: `Status atualizado para ${getStatusLabel(newStatus)}.` 
      });
    } catch (error) {
      console.error('Erro ao atualizar status:', error);
      setAlert({ 
        type: 'error', 
        message: 'Erro ao atualizar o status. Tente novamente.' 
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownloadPdf = () => {
    if (!proposicao?.anexo) return;
    
    const pdfData = proposicao.anexo.split(',')[1]; // Remove data URI part
    const fileName = getFileNameFromBase64(proposicao.anexo) || 'documento.pdf';
    
    // Create a Blob from the base64 PDF data
    const blob = new Blob([atob(pdfData)], { type: 'application/pdf' });
    
    // Create a temporary URL for the blob
    const blobUrl = URL.createObjectURL(blob);
    
    // Create a link element and trigger the download
    const link = document.createElement('a');
    link.href = blobUrl;
    link.download = fileName;
    link.click();
    
    // Clean up by revoking the object URL
    setTimeout(() => {
      URL.revokeObjectURL(blobUrl);
    }, 100);
  };

  const generateComprovante = () => {
    if (!proposicao) return;
    
    const doc = new jsPDF();
    
    // Add header
    doc.setFontSize(18);
    doc.setFont('helvetica', 'bold');
    doc.text('Comprovante de Protocolo', 105, 20, { align: 'center' });
    
    doc.setFontSize(14);
    doc.setFont('helvetica', 'normal');
    doc.text('Sistema de Gerenciamento de Proposições Legislativas', 105, 30, { align: 'center' });
    
    // Add line
    doc.setDrawColor(0);
    doc.setLineWidth(0.5);
    doc.line(20, 35, 190, 35);
    
    // Add proposition details
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('Dados da Proposição', 20, 45);
    
    doc.setFont('helvetica', 'normal');
    doc.text(`ID: ${proposicao.id}`, 20, 55);
    doc.text(`Tipo: ${proposicao.tipo}`, 20, 65);
    doc.text(`Título: ${proposicao.titulo}`, 20, 75);
    doc.text(`Autor: ${autor}`, 20, 85);
    doc.text(`Status: ${getStatusLabel(proposicao.status)}`, 20, 95);
    doc.text(`Data de Envio: ${formatDate(proposicao.data_envio)}`, 20, 105);
    
    if (proposicao.data_protocolo) {
      doc.text(`Data de Protocolo: ${formatDate(proposicao.data_protocolo)}`, 20, 115);
    }
    
    // Add ementa
    doc.setFont('helvetica', 'bold');
    doc.text('Ementa:', 20, 130);
    doc.setFont('helvetica', 'normal');
    
    const ementaLines = doc.splitTextToSize(proposicao.ementa, 170);
    doc.text(ementaLines, 20, 140);
    
    // Footer
    const pageHeight = doc.internal.pageSize.height;
    doc.setFontSize(10);
    doc.text(`Documento gerado em: ${formatDate(new Date().toISOString())}`, 105, pageHeight - 20, { align: 'center' });
    
    // Save PDF
    doc.save(`comprovante_proposicao_${proposicao.id}.pdf`);
  };

  if (!proposicao || !user) return null;

  const isAdmin = user.perfil === 'admin_geral';
  const canEdit = proposicao.status === 'rascunho' && (isAdmin || user.id === proposicao.autor_id);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <button 
          className="flex items-center text-gray-600 hover:text-gray-900"
          onClick={() => navigate('/proposicoes')}
        >
          <ArrowLeft className="h-4 w-4 mr-1" /> Voltar para Proposições
        </button>
      </div>

      {alert && (
        <Alert
          type={alert.type}
          message={alert.message}
          className="mb-6"
          onClose={() => setAlert(null)}
        />
      )}

      <div className="flex flex-col md:flex-row justify-between mb-8">
        <div>
          <div className="flex items-center mb-2">
            <h1 className="text-2xl font-bold text-gray-800 mr-3">
              {proposicao.titulo}
            </h1>
            <Badge status={proposicao.status}>
              {getStatusLabel(proposicao.status)}
            </Badge>
          </div>
          <p className="text-gray-600 text-sm mb-2">
            <span className="font-medium">Tipo:</span> {proposicao.tipo}
          </p>
          <p className="text-gray-600 text-sm">
            <span className="font-medium">Autor:</span> {autor}
          </p>
        </div>
        
        <div className="mt-4 md:mt-0 flex flex-wrap gap-2">
          {canEdit && (
            <Button 
              variant="secondary" 
              icon={<Edit className="h-4 w-4" />}
              onClick={() => navigate(`/proposicoes/editar/${proposicao.id}`)}
            >
              Editar
            </Button>
          )}
          
          {isAdmin && proposicao.status === 'enviada' && (
            <Button 
              variant="success" 
              icon={<CheckCircle className="h-4 w-4" />}
              onClick={() => handleStatusChange('protocolada')}
              isLoading={isLoading}
            >
              Protocolar
            </Button>
          )}
          
          {isAdmin && proposicao.status === 'protocolada' && (
            <Button 
              variant="secondary" 
              icon={<Archive className="h-4 w-4" />}
              onClick={() => handleStatusChange('arquivada')}
              isLoading={isLoading}
            >
              Arquivar
            </Button>
          )}
          
          {proposicao.status === 'protocolada' && (
            <Button 
              variant="primary" 
              icon={<Download className="h-4 w-4" />}
              onClick={generateComprovante}
            >
              Gerar Comprovante
            </Button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card title="Detalhes da Proposição">
            <div className="mb-6">
              <h3 className="text-lg font-medium text-gray-900 mb-2">Ementa</h3>
              <p className="text-gray-700 whitespace-pre-line">
                {proposicao.ementa}
              </p>
            </div>
            
            {proposicao.observacoes && (
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">Observações</h3>
                <p className="text-gray-700 whitespace-pre-line">
                  {proposicao.observacoes}
                </p>
              </div>
            )}
          </Card>
        </div>
        
        <div>
          <Card>
            <h3 className="text-lg font-medium text-gray-900 mb-4">Informações</h3>
            
            <div className="space-y-4">
              <div className="flex items-start">
                <Clock className="h-5 w-5 text-gray-400 mt-0.5 mr-3" />
                <div>
                  <p className="text-sm font-medium text-gray-500">Data de Envio</p>
                  <p className="text-gray-900">
                    {formatDate(proposicao.data_envio)}
                  </p>
                </div>
              </div>
              
              {proposicao.data_protocolo && (
                <div className="flex items-start">
                  <CheckCircle className="h-5 w-5 text-gray-400 mt-0.5 mr-3" />
                  <div>
                    <p className="text-sm font-medium text-gray-500">Data de Protocolo</p>
                    <p className="text-gray-900">
                      {formatDate(proposicao.data_protocolo)}
                    </p>
                  </div>
                </div>
              )}
              
              <div className="flex items-start">
                <AlertCircle className="h-5 w-5 text-gray-400 mt-0.5 mr-3" />
                <div>
                  <p className="text-sm font-medium text-gray-500">Status Atual</p>
                  <Badge status={proposicao.status} className="mt-1">
                    {getStatusLabel(proposicao.status)}
                  </Badge>
                </div>
              </div>
              
              {proposicao.anexo && (
                <div className="border-t pt-4 mt-4">
                  <div className="flex items-start mb-3">
                    <Paperclip className="h-5 w-5 text-gray-400 mt-0.5 mr-3" />
                    <p className="text-sm font-medium text-gray-500">Anexo</p>
                  </div>
                  
                  <div className="flex items-center p-3 bg-gray-50 rounded-md border border-gray-200">
                    <FileText className="h-8 w-8 text-blue-500 mr-3" />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">
                        Documento PDF
                      </p>
                      <p className="text-xs text-gray-500">
                        Clique para baixar
                      </p>
                    </div>
                    <Button
                      variant="secondary"
                      size="sm"
                      icon={<Download className="h-4 w-4" />}
                      onClick={handleDownloadPdf}
                    >
                      Baixar
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default ProposicaoDetail;