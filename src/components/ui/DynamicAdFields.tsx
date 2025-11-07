import React from 'react';

interface DynamicAdFieldsProps {
  categoryName: string;
  subCategoryName?: string;
  formData: any;
  onChange: (field: string, value: string | number) => void;
  errors?: Record<string, string>;
}

export const DynamicAdFields: React.FC<DynamicAdFieldsProps> = ({
  categoryName,
  subCategoryName,
  formData,
  onChange,
  errors = {}
}) => {
  const renderImmobilierFields = () => (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Chambres *</label>
        <select
          required
          value={formData.bedrooms || ''}
          onChange={(e) => onChange('bedrooms', parseInt(e.target.value))}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          <option value="">Sélectionner</option>
          <option value="1">1 chambre</option>
          <option value="2">2 chambres</option>
          <option value="3">3 chambres</option>
          <option value="4">4 chambres</option>
          <option value="5">5+ chambres</option>
        </select>
        {errors.bedrooms && <p className="text-red-500 text-xs mt-1">{errors.bedrooms}</p>}
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Salles de bain *</label>
        <select
          required
          value={formData.bathrooms || ''}
          onChange={(e) => onChange('bathrooms', parseInt(e.target.value))}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          <option value="">Sélectionner</option>
          <option value="1">1 salle de bain</option>
          <option value="2">2 salles de bain</option>
          <option value="3">3+ salles de bain</option>
        </select>
        {errors.bathrooms && <p className="text-red-500 text-xs mt-1">{errors.bathrooms}</p>}
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Surface (m²) *</label>
        <input
          type="number"
          required
          value={formData.area || ''}
          onChange={(e) => onChange('area', parseInt(e.target.value))}
          placeholder="50"
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
        {errors.area && <p className="text-red-500 text-xs mt-1">{errors.area}</p>}
      </div>
    </div>
  );

  const renderVehiculeFields = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Marque *</label>
        <input
          type="text"
          required
          value={formData.brand || ''}
          onChange={(e) => onChange('brand', e.target.value)}
          placeholder="Toyota, Honda..."
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
        {errors.brand && <p className="text-red-500 text-xs mt-1">{errors.brand}</p>}
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Modèle *</label>
        <input
          type="text"
          required
          value={formData.model || ''}
          onChange={(e) => onChange('model', e.target.value)}
          placeholder="Corolla, Civic..."
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
        {errors.model && <p className="text-red-500 text-xs mt-1">{errors.model}</p>}
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Année *</label>
        <input
          type="number"
          required
          value={formData.year || ''}
          onChange={(e) => onChange('year', parseInt(e.target.value))}
          placeholder="2020"
          min="1990"
          max={new Date().getFullYear()}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
        {errors.year && <p className="text-red-500 text-xs mt-1">{errors.year}</p>}
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Carburant *</label>
        <select
          required
          value={formData.fuel || ''}
          onChange={(e) => onChange('fuel', e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          <option value="">Sélectionner</option>
          <option value="essence">Essence</option>
          <option value="diesel">Diesel</option>
          <option value="hybride">Hybride</option>
          <option value="electrique">Électrique</option>
        </select>
        {errors.fuel && <p className="text-red-500 text-xs mt-1">{errors.fuel}</p>}
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Transmission *</label>
        <select
          required
          value={formData.transmission || ''}
          onChange={(e) => onChange('transmission', e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          <option value="">Sélectionner</option>
          <option value="manuelle">Manuelle</option>
          <option value="automatique">Automatique</option>
        </select>
        {errors.transmission && <p className="text-red-500 text-xs mt-1">{errors.transmission}</p>}
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Kilométrage</label>
        <input
          type="number"
          value={formData.mileage || ''}
          onChange={(e) => onChange('mileage', parseInt(e.target.value))}
          placeholder="50000"
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>
    </div>
  );

  const renderElectromenagerFields = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Marque *</label>
        <input
          type="text"
          required
          value={formData.brand || ''}
          onChange={(e) => onChange('brand', e.target.value)}
          placeholder="Samsung, LG..."
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
        {errors.brand && <p className="text-red-500 text-xs mt-1">{errors.brand}</p>}
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Modèle</label>
        <input
          type="text"
          value={formData.model || ''}
          onChange={(e) => onChange('model', e.target.value)}
          placeholder="Modèle de l'appareil"
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">État *</label>
        <select
          required
          value={formData.condition || ''}
          onChange={(e) => onChange('condition', e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          <option value="">Sélectionner</option>
          <option value="neuf">Neuf</option>
          <option value="tres-bon">Très bon état</option>
          <option value="bon">Bon état</option>
          <option value="correct">État correct</option>
        </select>
        {errors.condition && <p className="text-red-500 text-xs mt-1">{errors.condition}</p>}
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Puissance/Capacité</label>
        <input
          type="text"
          value={formData.power || ''}
          onChange={(e) => onChange('power', e.target.value)}
          placeholder="500W, 200L..."
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>
    </div>
  );

  const renderAutresFields = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">État *</label>
        <select
          required
          value={formData.condition || ''}
          onChange={(e) => onChange('condition', e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          <option value="">Sélectionner</option>
          <option value="neuf">Neuf</option>
          <option value="tres-bon">Très bon état</option>
          <option value="bon">Bon état</option>
          <option value="correct">État correct</option>
        </select>
        {errors.condition && <p className="text-red-500 text-xs mt-1">{errors.condition}</p>}
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Marque</label>
        <input
          type="text"
          value={formData.brand || ''}
          onChange={(e) => onChange('brand', e.target.value)}
          placeholder="Marque du produit"
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>
    </div>
  );

  // Champ couleur commun
  const renderColorField = () => (
    <div className="mt-4">
      <label className="block text-sm font-medium text-gray-700 mb-1">Couleur</label>
      <input
        type="text"
        value={formData.color || ''}
        onChange={(e) => onChange('color', e.target.value)}
        placeholder="Couleur principale"
        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
      />
    </div>
  );

  return (
    <div className="space-y-4">
      {categoryName === 'Immobilier' && renderImmobilierFields()}
      {categoryName === 'Véhicules' && renderVehiculeFields()}
      {categoryName === 'Électroménager' && renderElectromenagerFields()}
      {(categoryName === 'Événementiel' || categoryName === 'Autres') && renderAutresFields()}
      
      {/* Couleur pour toutes les catégories sauf Immobilier */}
      {categoryName !== 'Immobilier' && renderColorField()}
    </div>
  );
};