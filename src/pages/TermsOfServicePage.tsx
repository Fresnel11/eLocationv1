import React from 'react';

export const TermsOfServicePage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50 pt-6">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
        <div className="bg-white rounded-lg shadow-sm p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">
            Conditions d'utilisation
          </h1>
          
          <div className="prose max-w-none">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">1. Acceptation des conditions</h2>
            <p className="mb-6 text-gray-700">
              En utilisant eLocation Bénin, vous acceptez d'être lié par ces conditions d'utilisation. 
              Si vous n'acceptez pas ces conditions, veuillez ne pas utiliser notre service.
            </p>

            <h2 className="text-xl font-semibold text-gray-900 mb-4">2. Description du service</h2>
            <p className="mb-6 text-gray-700">
              eLocation Bénin est une plateforme en ligne qui met en relation les propriétaires et les locataires 
              pour la location de biens immobiliers au Bénin. Nous facilitons les transactions mais ne sommes pas 
              partie prenante des contrats de location.
            </p>

            <h2 className="text-xl font-semibold text-gray-900 mb-4">3. Inscription et compte utilisateur</h2>
            <p className="mb-4 text-gray-700">
              Pour utiliser certaines fonctionnalités, vous devez créer un compte en fournissant des informations 
              exactes et complètes. Vous êtes responsable de :
            </p>
            <ul className="list-disc pl-6 mb-6 text-gray-700">
              <li>La confidentialité de votre mot de passe</li>
              <li>Toutes les activités effectuées sous votre compte</li>
              <li>La mise à jour de vos informations personnelles</li>
            </ul>

            <h2 className="text-xl font-semibold text-gray-900 mb-4">4. Utilisation de la plateforme</h2>
            <p className="mb-4 text-gray-700">Vous vous engagez à :</p>
            <ul className="list-disc pl-6 mb-6 text-gray-700">
              <li>Fournir des informations exactes et véridiques</li>
              <li>Respecter les lois en vigueur au Bénin</li>
              <li>Ne pas publier de contenu offensant ou illégal</li>
              <li>Ne pas utiliser la plateforme à des fins frauduleuses</li>
            </ul>

            <h2 className="text-xl font-semibold text-gray-900 mb-4">5. Annonces et transactions</h2>
            <p className="mb-6 text-gray-700">
              Les propriétaires sont responsables de l'exactitude de leurs annonces. eLocation Bénin ne garantit 
              pas la disponibilité ou l'état des biens proposés. Toute transaction se fait directement entre 
              propriétaires et locataires.
            </p>

            <h2 className="text-xl font-semibold text-gray-900 mb-4">6. Frais et paiements</h2>
            <p className="mb-6 text-gray-700">
              L'inscription et la consultation des annonces sont gratuites. Des frais de service peuvent s'appliquer 
              lors de la finalisation d'une location. Ces frais seront clairement indiqués avant toute transaction.
            </p>

            <h2 className="text-xl font-semibold text-gray-900 mb-4">7. Propriété intellectuelle</h2>
            <p className="mb-6 text-gray-700">
              Tous les contenus de la plateforme (textes, images, logos) sont protégés par les droits d'auteur. 
              Vous ne pouvez pas reproduire ou utiliser ces contenus sans autorisation écrite.
            </p>

            <h2 className="text-xl font-semibold text-gray-900 mb-4">8. Limitation de responsabilité</h2>
            <p className="mb-6 text-gray-700">
              eLocation Bénin ne peut être tenu responsable des dommages directs ou indirects résultant de 
              l'utilisation de la plateforme ou des transactions entre utilisateurs.
            </p>

            <h2 className="text-xl font-semibold text-gray-900 mb-4">9. Modification des conditions</h2>
            <p className="mb-6 text-gray-700">
              Nous nous réservons le droit de modifier ces conditions à tout moment. Les modifications seront 
              publiées sur cette page et prendront effet immédiatement.
            </p>

            <h2 className="text-xl font-semibold text-gray-900 mb-4">10. Contact</h2>
            <p className="mb-6 text-gray-700">
              Pour toute question concernant ces conditions d'utilisation, contactez-nous à : 
              <br />
              Email : elocationcontact@gmail.com
              <br />
              Téléphone : +229 0199154678
            </p>

            <p className="text-sm text-gray-500 mt-8">
              Dernière mise à jour : {new Date().toLocaleDateString('fr-FR')}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};