import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Save, Send, ArrowLeft, Upload } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import Card from '../../components/ui/Card';
import Input from '../../components/ui/Input';
import Select from '../../components/ui/Select';
import TextArea from '../../components/ui/TextArea';
import Button from '../../components/ui/Button';
import Alert from '../../components/ui/Alert';
import { createProposicao, getProposicaoById, updateProposicao } from '../../services/localStorage';
import { Proposicao } from '../../types';
import { fileToBase64 } from '../../utils/helpers';

const ProposicaoForm: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const isEditing = !!id;

  const [formData, setFormData] = useState<Omit<Proposicao, 'id'>>({
    tipo: '',
    titulo: '',
    ementa: '',
    autor_id: user?.id || '',
    status: 'rascunho',
    data_envio: null,
    anexo: null,
    observacoes: ''
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [alert, setAlert] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  useEffect(() => {
    if (isEditing && id) {
      const proposicao = getProposicaoById(id);
      if (proposicao) {
        setFormData({
          tipo: proposicao.tipo,
          titulo: proposicao.titulo,
          ementa: proposicao.ementa,
          autor_id: proposicao.autor_id,
          status: proposicao.status,
          data_envio: proposicao.data_envio,
          data_protocolo: proposicao.data_protocolo,
          anexo: proposicao.anexo,
          observacoes: proposicao.observacoes
        });
      } else {
        navigate('/proposicoes');
      }
    }
  }, [id, isEditing, navigate]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
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

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.type !== 'application/pdf') {
        setErrors(prev => ({ ...prev, anexo: 'Apenas arquivos PDF são permitidos.' }));
        return;
      }
      
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        setErrors(prev => ({ ...prev, anexo: 'O arquivo não pode exceder 5MB.' }));
        return;
      }
      
      setSelectedFile(file);
      
      // Clear anexo error if exists
      if (errors.anexo) {
        setErrors(prev => {
          const newErrors = { ...prev };
          delete newErrors.anexo;
          return newErrors;
        });
      }
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.tipo) newErrors.tipo = 'O tipo da proposição é obrigatório.';
    if (!formData.titulo) newErrors.titulo = 'O título é obrigatório.';
    if (!formData.ementa) newErrors.ementa = 'A ementa é obrigatória.';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const saveAsRascunho = async () => {
    setIsSubmitting(true);
    
    try {
      // Process file if selected
      if (selectedFile) {
        const base64File = await fileToBase64(selectedFile);
        setFormData(prev => ({ ...prev, anexo: base64File }));
      }
      
      // Create or update proposition
      if (isEditing && id) {
        updateProposicao({ 
          ...formData, 
          id,
          anexo: selectedFile ? await fileToBase64(selectedFile) : formData.anexo
        });
        setAlert({ type: 'success', message: 'Proposição atualizada com sucesso!' });
      } else {
        const newProposicao = createProposicao({
          ...formData,
          anexo: selectedFile ? await fileToBase64(selectedFile) : null
        });
        setAlert({ type: 'success', message: 'Proposição salva como rascunho!' });
        // Redirect to edit page after creation
        navigate(`/proposicoes/${newProposicao.id}`);
      }
    } catch (error) {
      console.error('Erro ao salvar proposição:', error);
      setAlert({ type: 'error', message: 'Erro ao salvar a proposição. Tente novamente.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const submitProposicao = async () => {
    if (!validateForm()) return;
    
    setIsSubmitting(true);
    
    try {
      const updatedData = {
        ...formData,
        status: 'enviada',
        data_envio: new Date().toISOString(),
        anexo: selectedFile ? await fileToBase64(selectedFile) : formData.anexo
      };
      
      if (isEditing && id) {
        updateProposicao({ ...updatedData, id });
        setAlert({ type: 'success', message: 'Proposição enviada com sucesso!' });
      } else {
        const newProposicao = createProposicao(updatedData);
        setAlert({ type: 'success', message: 'Proposição enviada com sucesso!' });
        // Redirect to edit page after creation
        navigate(`/proposicoes/${newProposicao.id}`);
      }
    } catch (error) {
      console.error('Erro ao enviar proposição:', error);
      setAlert({ type: 'error', message: 'Erro ao enviar a proposição. Tente novamente.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!user) return null;

  // Prevent vereador from editing others' propositions
  if (isEditing && user.perfil === 'vereador' && formData.autor_id !== user.id) {
    navigate('/proposicoes');
    return null;
  }

  const isPastDraft = formData.status !== 'rascunho';

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

      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-800 mb-2">
          {isEditing ? 'Editar Proposição' : 'Nova Proposição'}
        </h1>
        <p className="text-gray-600">
          {isEditing ? 'Atualize os dados da proposição' : 'Preencha os campos para cadastrar uma nova proposição'}
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
        <form className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Select
              label="Tipo de Proposição *"
              name="tipo"
              value={formData.tipo}
              onChange={handleChange}
              options={[
                { value: '', label: 'Selecione um tipo' },
                { value: 'Projeto de Lei', label: 'Projeto de Lei' },
                { value: 'Requerimento', label: 'Requerimento' },
                { value: 'Indicação', label: 'Indicação' },
                { value: 'Moção', label: 'Moção' }
              ]}
              error={errors.tipo}
              disabled={isPastDraft}
              fullWidth
              required
            />

            <Input
              label="Título *"
              name="titulo"
              value={formData.titulo}
              onChange={handleChange}
              error={errors.titulo}
              disabled={isPastDraft}
              fullWidth
              required
            />
          </div>

          <TextArea
            label="Ementa *"
            name="ementa"
            value={formData.ementa}
            onChange={handleChange}
            error={errors.ementa}
            disabled={isPastDraft}
            fullWidth
            rows={3}
            required
          />

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Anexo (PDF)
            </label>
            <div className="mt-1 flex items-center">
              {!formData.anexo && !selectedFile ? (
                <div className="w-full">
                  <label 
                    className={`
                      flex justify-center items-center px-6 py-4 border-2 border-dashed rounded-md
                      ${errors.anexo ? 'border-red-300' : 'border-gray-300'}
                      ${isPastDraft ? 'bg-gray-100 cursor-not-allowed' : 'hover:bg-gray-50 cursor-pointer'}
                    `}
                  >
                    <div className="space-y-1 text-center">
                      <Upload className="mx-auto h-10 w-10 text-gray-400" />
                      <div className="text-sm text-gray-600">
                        <span className="font-medium text-blue-600 hover:text-blue-500">
                          Clique para selecionar
                        </span>{' '}
                        ou arraste e solte um arquivo PDF
                      </div>
                      <p className="text-xs text-gray-500">PDF até 5MB</p>
                    </div>
                    <input
                      type="file"
                      name="anexo"
                      accept="application/pdf"
                      onChange={handleFileChange}
                      disabled={isPastDraft}
                      className="sr-only"
                    />
                  </label>
                  {errors.anexo && (
                    <p className="mt-1 text-sm text-red-600">{errors.anexo}</p>
                  )}
                </div>
              ) : (
                <div className="flex items-center justify-between w-full p-4 border border-gray-300 rounded-md">
                  <div className="flex items-center">
                    <FileText className="h-8 w-8 text-blue-500 mr-3" />
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        {selectedFile ? selectedFile.name : 'documento.pdf'}
                      </p>
                      <p className="text-xs text-gray-500">
                        {selectedFile ? `${(selectedFile.size / 1024 / 1024).toFixed(2)} MB` : 'PDF Anexado'}
                      </p>
                    </div>
                  </div>
                  {!isPastDraft && (
                    <button
                      type="button"
                      className="text-sm text-red-600 hover:text-red-800"
                      onClick={() => {
                        setSelectedFile(null);
                        setFormData(prev => ({ ...prev, anexo: null }));
                      }}
                    >
                      Remover
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>

          <TextArea
            label="Observações"
            name="observacoes"
            value={formData.observacoes}
            onChange={handleChange}
            disabled={isPastDraft}
            fullWidth
            rows={4}
          />

          {!isPastDraft && (
            <div className="flex flex-col md:flex-row justify-end space-y-3 md:space-y-0 md:space-x-3 pt-4">
              <Button
                type="button"
                variant="secondary"
                icon={<Save className="h-4 w-4" />}
                onClick={saveAsRascunho}
                isLoading={isSubmitting}
              >
                Salvar como Rascunho
              </Button>
              <Button
                type="button"
                variant="primary"
                icon={<Send className="h-4 w-4" />}
                onClick={submitProposicao}
                isLoading={isSubmitting}
              >
                Enviar Proposição
              </Button>
            </div>
          )}
        </form>
      </Card>
    </div>
  );
};

export default ProposicaoForm;