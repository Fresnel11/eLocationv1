import React, { useState, useEffect } from 'react';
import { ArrowLeft, MessageCircle, FileText, HelpCircle, Search, Plus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Card, CardContent } from '../components/ui/Card';
import { ChatWidget } from '../components/ui/ChatWidget';
import { api } from '../services/api';

interface FAQ {
  id: string;
  question: string;
  answer: string;
  category: string;
}

interface Article {
  id: string;
  title: string;
  content: string;
  category: string;
}

export const SupportPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [faqs, setFaqs] = useState<FAQ[]>([]);
  const [articles, setArticles] = useState<Article[]>([]);
  const [searchResults, setSearchResults] = useState<{ faqs: FAQ[]; articles: Article[] } | null>(null);
  const [showChat, setShowChat] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    try {
      const [faqRes, articlesRes] = await Promise.all([
        api.get('/support/faq'),
        api.get('/support/knowledge-base')
      ]);
      setFaqs(faqRes.data.slice(0, 6));
      setArticles(articlesRes.data.slice(0, 6));
    } catch (error) {
      console.error('Erreur chargement données support:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      setSearchResults(null);
      return;
    }

    try {
      const response = await api.get(`/support/search?q=${encodeURIComponent(searchQuery)}`);
      setSearchResults(response.data);
    } catch (error) {
      console.error('Erreur recherche:', error);
    }
  };

  const supportOptions = [
    {
      title: 'Chat en direct',
      description: 'Discutez avec notre équipe support',
      icon: MessageCircle,
      color: 'bg-blue-600',
      action: () => setShowChat(true)
    },
    {
      title: 'Créer un ticket',
      description: 'Signalez un problème détaillé',
      icon: FileText,
      color: 'bg-green-600',
      action: () => navigate('/support/tickets/new')
    },
    {
      title: 'FAQ',
      description: 'Questions fréquemment posées',
      icon: HelpCircle,
      color: 'bg-purple-600',
      action: () => navigate('/support/faq')
    },
    {
      title: 'Base de connaissances',
      description: 'Guides et tutoriels détaillés',
      icon: FileText,
      color: 'bg-orange-600',
      action: () => navigate('/support/knowledge-base')
    }
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow-sm border-b">
        <div className="px-4 py-4">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate(-1)}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <ArrowLeft className="h-5 w-5 text-gray-600" />
            </button>
            <h1 className="text-xl font-semibold text-gray-900">Centre d'aide</h1>
          </div>
        </div>
      </div>

      <div className="p-4 space-y-6">
        {/* Recherche */}
        <Card>
          <CardContent className="p-6">
            <h2 className="text-lg font-semibold mb-4">Comment pouvons-nous vous aider ?</h2>
            <div className="flex gap-2">
              <Input
                placeholder="Rechercher dans l'aide..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                className="flex-1"
              />
              <Button onClick={handleSearch}>
                <Search className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Résultats de recherche */}
        {searchResults && (
          <Card>
            <CardContent className="p-6">
              <h3 className="font-semibold mb-4">Résultats de recherche</h3>
              
              {searchResults.faqs.length > 0 && (
                <div className="mb-6">
                  <h4 className="font-medium text-gray-900 mb-3">FAQ</h4>
                  <div className="space-y-2">
                    {searchResults.faqs.map((faq) => (
                      <div key={faq.id} className="p-3 bg-gray-50 rounded-lg">
                        <p className="font-medium text-sm">{faq.question}</p>
                        <p className="text-sm text-gray-600 mt-1">{faq.answer.substring(0, 100)}...</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {searchResults.articles.length > 0 && (
                <div>
                  <h4 className="font-medium text-gray-900 mb-3">Articles</h4>
                  <div className="space-y-2">
                    {searchResults.articles.map((article) => (
                      <div key={article.id} className="p-3 bg-gray-50 rounded-lg">
                        <p className="font-medium text-sm">{article.title}</p>
                        <p className="text-sm text-gray-600 mt-1">{article.content.substring(0, 100)}...</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {searchResults.faqs.length === 0 && searchResults.articles.length === 0 && (
                <p className="text-gray-600">Aucun résultat trouvé pour "{searchQuery}"</p>
              )}
            </CardContent>
          </Card>
        )}

        {/* Options de support */}
        <div className="grid grid-cols-2 gap-4">
          {supportOptions.map((option) => {
            const Icon = option.icon;
            return (
              <Card key={option.title} className="cursor-pointer hover:shadow-md transition-shadow" onClick={option.action}>
                <CardContent className="p-4 text-center">
                  <div className={`w-12 h-12 ${option.color} rounded-full flex items-center justify-center mx-auto mb-3`}>
                    <Icon className="h-6 w-6 text-white" />
                  </div>
                  <h3 className="font-medium text-gray-900 mb-1">{option.title}</h3>
                  <p className="text-sm text-gray-600">{option.description}</p>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* FAQ populaires */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold">Questions fréquentes</h3>
              <Button variant="outline" size="sm" onClick={() => navigate('/support/faq')}>
                Voir tout
              </Button>
            </div>
            <div className="space-y-3">
              {faqs.map((faq) => (
                <div key={faq.id} className="border-b border-gray-100 pb-3 last:border-0">
                  <p className="font-medium text-sm text-gray-900 mb-1">{faq.question}</p>
                  <p className="text-sm text-gray-600">{faq.answer.substring(0, 120)}...</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Articles populaires */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold">Articles utiles</h3>
              <Button variant="outline" size="sm" onClick={() => navigate('/support/knowledge-base')}>
                Voir tout
              </Button>
            </div>
            <div className="space-y-3">
              {articles.map((article) => (
                <div key={article.id} className="border-b border-gray-100 pb-3 last:border-0">
                  <p className="font-medium text-sm text-gray-900 mb-1">{article.title}</p>
                  <p className="text-sm text-gray-600">{article.content.substring(0, 120)}...</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Chat Widget */}
      {showChat && (
        <ChatWidget onClose={() => setShowChat(false)} />
      )}
    </div>
  );
};