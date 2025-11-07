import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ChevronDown, Search } from 'lucide-react';
import { Input } from '../components/ui/Input';
import { Card, CardContent } from '../components/ui/Card';
import { Button } from '../components/ui/Button';

const faqs = [
  {
    category: 'Général',
    questions: [
      {
        question: 'Comment fonctionne eLocation Bénin ?',
        answer: 'eLocation Bénin est une plateforme qui met en relation directement propriétaires et locataires. Vous pouvez rechercher des annonces, contacter les propriétaires et finaliser vos locations en toute sécurité.'
      },
      {
        question: 'L\'utilisation de la plateforme est-elle gratuite ?',
        answer: 'L\'inscription et la navigation sont entièrement gratuites. Nous prélevons uniquement une petite commission lors de la finalisation d\'une location pour maintenir et améliorer nos services.'
      }
    ]
  },
  {
    category: 'Pour les locataires',
    questions: [
      {
        question: 'Comment rechercher une annonce ?',
        answer: 'Utilisez notre moteur de recherche en spécifiant votre ville, le type de bien et votre budget. Vous pouvez également utiliser nos filtres avancés pour affiner votre recherche.'
      },
      {
        question: 'Comment contacter un propriétaire ?',
        answer: 'Une fois inscrit, vous pouvez contacter directement les propriétaires via notre messagerie sécurisée ou par téléphone si le numéro est affiché.'
      },
      {
        question: 'Puis-je visiter avant de louer ?',
        answer: 'Absolument ! Nous recommandons fortement de visiter le bien avant toute transaction. Organisez une visite avec le propriétaire via notre plateforme.'
      }
    ]
  },
  {
    category: 'Pour les propriétaires',
    questions: [
      {
        question: 'Comment publier une annonce ?',
        answer: 'Créez un compte propriétaire, cliquez sur "Publier une annonce", remplissez les détails de votre bien et ajoutez des photos de qualité. Votre annonce sera en ligne immédiatement.'
      },
      {
        question: 'Comment gérer mes annonces ?',
        answer: 'Votre dashboard propriétaire vous permet de voir toutes vos annonces, les statistiques de consultation, les messages reçus et de modifier vos annonces à tout moment.'
      },
      {
        question: 'Quels sont les frais pour publier ?',
        answer: 'La publication d\'annonces est gratuite. Nous prélevons uniquement une commission lors de la conclusion d\'un contrat de location via notre plateforme.'
      }
    ]
  },
  {
    category: 'Sécurité',
    questions: [
      {
        question: 'Comment vérifiez-vous les propriétaires ?',
        answer: 'Tous nos propriétaires doivent fournir une pièce d\'identité valide et un justificatif de propriété. Nous vérifions chaque inscription manuellement.'
      },
      {
        question: 'Que faire en cas de litige ?',
        answer: 'Notre équipe de médiation intervient dans tous les litiges. Contactez-nous immédiatement via le centre d\'aide et nous vous assisterons dans la résolution du problème.'
      },
      {
        question: 'Mes données personnelles sont-elles protégées ?',
        answer: 'Oui, nous appliquons les plus hauts standards de sécurité pour protéger vos données. Elles ne sont jamais partagées avec des tiers sans votre consentement explicite.'
      }
    ]
  }
];

export const FAQPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [openQuestions, setOpenQuestions] = useState<number[]>([]);

  const toggleQuestion = (index: number) => {
    setOpenQuestions(prev => 
      prev.includes(index) 
        ? prev.filter(i => i !== index)
        : [...prev, index]
    );
  };

  const filteredFaqs = faqs.map(category => ({
    ...category,
    questions: category.questions.filter(
      q => q.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
           q.answer.toLowerCase().includes(searchTerm.toLowerCase())
    )
  })).filter(category => category.questions.length > 0);

  return (
    <div className="min-h-screen bg-gray-50 pt-6">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Questions fréquentes
          </h1>
          <p className="text-lg text-gray-600 mb-8">
            Trouvez rapidement les réponses à vos questions
          </p>
          
          <div className="max-w-md mx-auto">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                type="text"
                placeholder="Rechercher dans la FAQ..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
        </div>

        <div className="space-y-8">
          {filteredFaqs.map((category, categoryIndex) => (
            <div key={category.category}>
              <h2 className="text-2xl font-semibold text-gray-900 mb-6">
                {category.category}
              </h2>
              
              <div className="space-y-4">
                {category.questions.map((faq, questionIndex) => {
                  const globalIndex = categoryIndex * 100 + questionIndex;
                  const isOpen = openQuestions.includes(globalIndex);
                  
                  return (
                    <Card key={questionIndex} className="overflow-hidden">
                      <button
                        className="w-full text-left p-6 hover:bg-gray-50 transition-colors"
                        onClick={() => toggleQuestion(globalIndex)}
                      >
                        <div className="flex items-center justify-between">
                          <h3 className="font-medium text-gray-900 pr-4">
                            {faq.question}
                          </h3>
                          <ChevronDown 
                            className={`h-5 w-5 text-gray-500 transition-transform ${
                              isOpen ? 'rotate-180' : ''
                            }`}
                          />
                        </div>
                      </button>
                      
                      {isOpen && (
                        <CardContent className="px-6 pb-6">
                          <p className="text-gray-700 leading-relaxed">
                            {faq.answer}
                          </p>
                        </CardContent>
                      )}
                    </Card>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Contact CTA */}
        <div className="mt-16 text-center">
          <Card className="bg-blue-50 border-blue-200">
            <CardContent className="p-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                Vous ne trouvez pas votre réponse ?
              </h2>
              <p className="text-gray-600 mb-6">
                Notre équipe support est disponible pour vous aider personnellement
              </p>
              <Button asChild>
                <Link to="/contact">
                  Nous contacter
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};