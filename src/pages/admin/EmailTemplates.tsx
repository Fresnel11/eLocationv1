import React, { useState, useEffect } from 'react';
import { Mail, Save, RotateCcw, Eye, EyeOff } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { useToast } from '../../context/ToastContext';
import { api } from '../../services/api';

interface EmailTemplate {
  id: string;
  type: string;
  subject: string;
  htmlContent: string;
  textContent: string;
  isActive: boolean;
  variables: string[];
}

const templateLabels = {
  welcome: 'Email de bienvenue',
  booking_confirmation: 'Confirmation de réservation',
  booking_cancelled: 'Annulation de réservation',
  ad_approved: 'Annonce approuvée',
  ad_rejected: 'Annonce rejetée',
  review_notification: 'Notification d\'avis',
  password_reset: 'Réinitialisation mot de passe'
};

export const EmailTemplates: React.FC = () => {
  const [templates, setTemplates] = useState<EmailTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);
  const [expandedTemplate, setExpandedTemplate] = useState<string | null>(null);
  const { success, error } = useToast();

  useEffect(() => {
    fetchTemplates();
  }, []);

  const fetchTemplates = async () => {
    try {
      const response = await api.get('/admin/email-templates');
      setTemplates(response.data);
    } catch (err) {
      error('Erreur', 'Impossible de charger les templates');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (template: EmailTemplate) => {
    setSaving(template.id);
    try {
      await api.put(`/admin/email-templates/${template.id}`, {
        subject: template.subject,
        htmlContent: template.htmlContent,
        textContent: template.textContent,
        isActive: template.isActive
      });
      success('Template sauvegardé', 'Le template d\'email a été mis à jour');
    } catch (err) {
      error('Erreur', 'Impossible de sauvegarder le template');
    } finally {
      setSaving(null);
    }
  };

  const handleInitialize = async () => {
    setSaving('init');
    try {
      await api.post('/admin/email-templates/initialize');
      await fetchTemplates();
      success('Templates initialisés', 'Les templates par défaut ont été créés');
    } catch (err) {
      error('Erreur', 'Impossible d\'initialiser les templates');
    } finally {
      setSaving(null);
    }
  };

  const updateTemplate = (id: string, field: string, value: any) => {
    setTemplates(prev => prev.map(template => 
      template.id === id ? { ...template, [field]: value } : template
    ));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Mail className="w-6 h-6 text-blue-600" />
          <h1 className="text-2xl font-bold text-gray-900">Templates d'Emails</h1>
        </div>
        <Button
          onClick={handleInitialize}
          disabled={saving === 'init'}
          variant="outline"
          className="flex items-center gap-2"
        >
          <RotateCcw className="w-4 h-4" />
          {saving === 'init' ? 'Initialisation...' : 'Initialiser par défaut'}
        </Button>
      </div>

      {templates.length === 0 ? (
        <div className="text-center py-12">
          <Mail className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Aucun template configuré</h3>
          <p className="text-gray-500 mb-4">Cliquez sur "Initialiser par défaut" pour créer les templates de base</p>
        </div>
      ) : (
        <div className="space-y-6">
          {templates.map((template) => (
            <div key={template.id} className="bg-white rounded-lg border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <h3 className="text-lg font-medium text-gray-900">
                    {templateLabels[template.type] || template.type}
                  </h3>
                  <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                    {template.type}
                  </span>
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={template.isActive}
                      onChange={(e) => updateTemplate(template.id, 'isActive', e.target.checked)}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-700">Actif</span>
                  </label>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    onClick={() => setExpandedTemplate(
                      expandedTemplate === template.id ? null : template.id
                    )}
                    variant="outline"
                    size="sm"
                    className="flex items-center gap-2"
                  >
                    {expandedTemplate === template.id ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    {expandedTemplate === template.id ? 'Réduire' : 'Développer'}
                  </Button>
                  <Button
                    onClick={() => handleSave(template)}
                    disabled={saving === template.id}
                    className="bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-2"
                  >
                    <Save className="w-4 h-4" />
                    {saving === template.id ? 'Sauvegarde...' : 'Sauvegarder'}
                  </Button>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Sujet
                  </label>
                  <Input
                    value={template.subject}
                    onChange={(e) => updateTemplate(template.id, 'subject', e.target.value)}
                    placeholder="Sujet de l'email"
                  />
                </div>

                {expandedTemplate === template.id && (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Contenu HTML
                      </label>
                      <textarea
                        value={template.htmlContent}
                        onChange={(e) => updateTemplate(template.id, 'htmlContent', e.target.value)}
                        rows={10}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm"
                        placeholder="Contenu HTML de l'email"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Contenu texte (optionnel)
                      </label>
                      <textarea
                        value={template.textContent || ''}
                        onChange={(e) => updateTemplate(template.id, 'textContent', e.target.value)}
                        rows={6}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Version texte de l'email"
                      />
                    </div>

                    {template.variables && template.variables.length > 0 && (
                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                        <h4 className="text-sm font-medium text-blue-900 mb-2">Variables disponibles :</h4>
                        <div className="flex flex-wrap gap-2">
                          {template.variables.map((variable) => (
                            <span
                              key={variable}
                              className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded font-mono"
                            >
                              {`{{${variable}}}`}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};