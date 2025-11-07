import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, ArrowRight, ArrowLeft, User, Phone, Shield, CheckCircle } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import logoImage from '../../assets/e_location.png';

export const RegisterPage: React.FC = () => {
  const [currentStep, setCurrentStep] = useState(() => {
    const saved = sessionStorage.getItem('registerStep');
    return saved ? parseInt(saved) : 1;
  });
  const [formData, setFormData] = useState(() => {
    const saved = sessionStorage.getItem('registerFormData');
    return saved ? JSON.parse(saved) : {
      firstName: '',
      lastName: '',
      phone: '',
      email: '',
      password: '',
      confirmPassword: '',
      referralCode: '',
      birthDate: '',
      gender: ''
    };
  });
  const [acceptedTerms, setAcceptedTerms] = useState(() => {
    const saved = sessionStorage.getItem('registerAcceptedTerms');
    return saved ? JSON.parse(saved) : false;
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const { register, loading } = useAuth();
  const { success, error } = useToast();
  const navigate = useNavigate();

  const steps = [
    { id: 1, title: 'Informations personnelles', icon: User, description: 'Vos nom et prénom' },
    { id: 2, title: 'Contact & Compte', icon: Phone, description: 'Téléphone et type de compte' },
    { id: 3, title: 'Sécurité', icon: Shield, description: 'Mot de passe et confirmation' }
  ];



  const handleChange = (field: string, value: string) => {
    const newFormData = { ...formData, [field]: value };
    setFormData(newFormData);
    sessionStorage.setItem('registerFormData', JSON.stringify(newFormData));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const validateStep = (step: number): boolean => {
    const newErrors: Record<string, string> = {};
    
    if (step === 1) {
      if (!formData.firstName.trim()) newErrors.firstName = 'Le prénom est requis';
      if (!formData.lastName.trim()) newErrors.lastName = 'Le nom de famille est requis';
      if (!formData.birthDate) {
        newErrors.birthDate = 'La date de naissance est requise';
      } else {
        const birthDate = new Date(formData.birthDate);
        const today = new Date();
        let age = today.getFullYear() - birthDate.getFullYear();
        const monthDiff = today.getMonth() - birthDate.getMonth();
        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
          age--;
        }
        if (age < 18) {
          newErrors.birthDate = 'Vous devez avoir au moins 18 ans';
        }
      }
      if (!formData.gender) newErrors.gender = 'Le sexe est requis';
    }
    
    if (step === 2) {
      if (!formData.phone.trim()) {
        newErrors.phone = 'Le numéro de téléphone est requis';
      } else if (!/^\+[1-9]\d{1,14}$/.test(formData.phone)) {
        newErrors.phone = 'Le numéro doit être au format international (+22999154678)';
      }
      if (formData.email && !/\S+@\S+\.\S+/.test(formData.email)) {
        newErrors.email = 'Email invalide';
      }
    }
    
    if (step === 3) {
      if (!formData.password) {
        newErrors.password = 'Le mot de passe est requis';
      } else if (formData.password.length < 6) {
        newErrors.password = 'Le mot de passe doit contenir au moins 6 caractères';
      }
      if (formData.password !== formData.confirmPassword) {
        newErrors.confirmPassword = 'Les mots de passe ne correspondent pas';
      }
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const nextStep = () => {
    if (validateStep(currentStep)) {
      const newStep = Math.min(currentStep + 1, 3);
      setCurrentStep(newStep);
      sessionStorage.setItem('registerStep', newStep.toString());
    }
  };

  const prevStep = () => {
    const newStep = Math.max(currentStep - 1, 1);
    setCurrentStep(newStep);
    sessionStorage.setItem('registerStep', newStep.toString());
  };

  const handleSubmit = async () => {
    if (!validateStep(3) || !acceptedTerms) return;
    
    try {
      const result = await register(formData.firstName, formData.lastName, formData.phone, formData.password, formData.email || undefined, formData.referralCode || undefined, acceptedTerms, formData.birthDate, formData.gender as 'masculin' | 'féminin');
      // Nettoyer le sessionStorage après inscription réussie
      sessionStorage.removeItem('registerFormData');
      sessionStorage.removeItem('registerStep');
      sessionStorage.removeItem('registerAcceptedTerms');
      
      success(
        'Inscription réussie !', 
        'Votre compte a été créé avec succès. Vérifiez votre téléphone pour activer votre compte.'
      );
      navigate('/verify-otp', { 
        state: { 
          phone: result.phone, 
          email: formData.email
        } 
      });
    } catch (err: any) {
      error(
        'Erreur d\'inscription',
        err.response?.data?.message || 'Une erreur est survenue lors de l\'inscription'
      );
      setErrors({ phone: 'Une erreur est survenue lors de l\'inscription' });
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <div className="flex justify-center mb-4">
                <User className="h-12 w-12 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Informations personnelles</h3>
              <p className="text-gray-600">Commençons par vos nom et prénom</p>
            </div>
            <Input
              label="Prénom"
              type="text"
              value={formData.firstName}
              onChange={(e) => handleChange('firstName', e.target.value)}
              error={errors.firstName}
              required
              placeholder="Jean"
            />
            <Input
              label="Nom de famille"
              type="text"
              value={formData.lastName}
              onChange={(e) => handleChange('lastName', e.target.value)}
              error={errors.lastName}
              required
              placeholder="Dupont"
            />
            <Input
              label="Date de naissance"
              type="date"
              value={formData.birthDate}
              onChange={(e) => handleChange('birthDate', e.target.value)}
              error={errors.birthDate}
              required
              max={new Date(new Date().setFullYear(new Date().getFullYear() - 18)).toISOString().split('T')[0]}
            />
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">
                Sexe <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.gender}
                onChange={(e) => handleChange('gender', e.target.value)}
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.gender ? 'border-red-500' : 'border-gray-300'
                }`}
                required
              >
                <option value="">Sélectionnez votre sexe</option>
                <option value="masculin">Masculin</option>
                <option value="féminin">Féminin</option>
              </select>
              {errors.gender && (
                <p className="text-sm text-red-600">{errors.gender}</p>
              )}
            </div>
          </div>
        );
      
      case 2:
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <div className="flex justify-center mb-4">
                <Phone className="h-12 w-12 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Informations de contact</h3>
              <p className="text-gray-600">Vos informations de contact</p>
            </div>
            <Input
              label="Numéro de téléphone"
              type="tel"
              value={formData.phone}
              onChange={(e) => handleChange('phone', e.target.value)}
              error={errors.phone}
              required
              placeholder="+22999154678"
            />
            <Input
              label="Email"
              type="email"
              required
              value={formData.email}
              onChange={(e) => handleChange('email', e.target.value)}
              error={errors.email}
              placeholder="votre@email.com"
            />
            <Input
              label="Code de parrainage (optionnel)"
              type="text"
              value={formData.referralCode}
              onChange={(e) => handleChange('referralCode', e.target.value.toUpperCase())}
              placeholder="JEA123ABC"
              maxLength={10}
            />

          </div>
        );
      
      case 3:
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <div className="flex justify-center mb-4">
                <Shield className="h-12 w-12 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Sécurité</h3>
              <p className="text-gray-600">Créez un mot de passe sécurisé</p>
            </div>
            <div className="relative">
              <Input
                label="Mot de passe"
                type={showPassword ? 'text' : 'password'}
                value={formData.password}
                onChange={(e) => handleChange('password', e.target.value)}
                error={errors.password}
                required
                placeholder="••••••••"
              />
              <button
                type="button"
                className="absolute right-3 top-9 text-gray-400 hover:text-gray-600"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            <div className="relative">
              <Input
                label="Confirmer le mot de passe"
                type={showConfirmPassword ? 'text' : 'password'}
                value={formData.confirmPassword}
                onChange={(e) => handleChange('confirmPassword', e.target.value)}
                error={errors.confirmPassword}
                required
                placeholder="••••••••"
              />
              <button
                type="button"
                className="absolute right-3 top-9 text-gray-400 hover:text-gray-600"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              >
                {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            
            {/* Récapitulatif */}
            <div className="bg-gray-50 rounded-lg p-4 sm:p-6 mt-6">
              <h4 className="font-medium text-gray-900 mb-4 flex items-center">
                <CheckCircle className="h-5 w-5 text-green-600 mr-2" />
                Récapitulatif
              </h4>
              <div className="space-y-3 text-sm">
                <div className="flex flex-col sm:flex-row sm:justify-between">
                  <span className="text-gray-600 mb-1 sm:mb-0">Nom complet:</span>
                  <span className="font-medium">{formData.firstName} {formData.lastName}</span>
                </div>
                <div className="flex flex-col sm:flex-row sm:justify-between">
                  <span className="text-gray-600 mb-1 sm:mb-0">Téléphone:</span>
                  <span className="font-medium">{formData.phone}</span>
                </div>
                {formData.email && (
                  <div className="flex flex-col sm:flex-row sm:justify-between">
                    <span className="text-gray-600 mb-1 sm:mb-0">Email:</span>
                    <span className="font-medium break-all">{formData.email}</span>
                  </div>
                )}

              </div>
            </div>
            
            <div className="flex items-start">
              <input
                id="terms"
                name="terms"
                type="checkbox"
                checked={acceptedTerms}
                onChange={(e) => {
                  const checked = e.target.checked;
                  setAcceptedTerms(checked);
                  sessionStorage.setItem('registerAcceptedTerms', JSON.stringify(checked));
                }}
                required
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded mt-0.5"
              />
              <label htmlFor="terms" className="ml-2 block text-sm text-gray-900">
                J'accepte les{' '}
                <Link to="/terms" className="text-blue-600 hover:text-blue-500 underline">
                  conditions d'utilisation
                </Link>
                {' '}d'eLocation Bénin
              </label>
            </div>
          </div>
        );
      
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-2xl">
        <div className="flex justify-center">
          <Link to="/">
            <img src={logoImage} alt="eLocation Bénin" className="h-16 w-auto" />
          </Link>
        </div>
        <h2 className="mt-6 text-center text-3xl font-bold text-gray-900">
          Créez votre compte
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          Ou{' '}
          <Link to="/login" className="font-medium text-blue-600 hover:text-blue-500">
            connectez-vous à votre compte existant
          </Link>
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-2xl px-4 sm:px-0">
        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center">
            {steps.map((step, index) => {
              const StepIcon = step.icon;
              const isActive = currentStep === step.id;
              const isCompleted = currentStep > step.id;
              
              return (
                <React.Fragment key={step.id}>
                  <div className="flex flex-col items-center">
                    <div className={`flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 rounded-full border-2 transition-all duration-300 ${
                      isCompleted 
                        ? 'bg-green-500 border-green-500 text-white' 
                        : isActive 
                          ? 'bg-blue-600 border-blue-600 text-white' 
                          : 'bg-white border-gray-300 text-gray-400'
                    }`}>
                      {isCompleted ? (
                        <CheckCircle className="h-5 w-5 sm:h-6 sm:w-6" />
                      ) : (
                        <StepIcon className="h-5 w-5 sm:h-6 sm:w-6" />
                      )}
                    </div>
                  </div>
                  
                  {index < steps.length - 1 && (
                    <div className={`flex-1 h-1 mx-2 sm:mx-4 transition-all duration-300 ${
                      currentStep > step.id ? 'bg-green-500' : 'bg-gray-200'
                    }`} />
                  )}
                </React.Fragment>
              );
            })}
          </div>
          
          <div className="grid grid-cols-3 gap-2 mt-4">
            {steps.map((step) => (
              <div key={step.id} className="text-center">
                <p className={`text-xs sm:text-sm font-medium ${
                  currentStep === step.id ? 'text-blue-600' : 
                  currentStep > step.id ? 'text-green-600' : 'text-gray-500'
                }`}>
                  {step.title}
                </p>
                <p className="text-xs text-gray-500 mt-1 hidden sm:block">{step.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Step Content */}
        <Card className="shadow-xl border-0 overflow-hidden">
          <CardContent className="p-4 sm:p-6 lg:p-8">
            <div className="transition-all duration-500 ease-in-out transform">
              {renderStep()}
            </div>
            
            {/* Navigation Buttons */}
            <div className="flex flex-col sm:flex-row justify-between gap-4 mt-8 pt-6 border-t border-gray-200">
              <Button
                variant="outline"
                onClick={prevStep}
                disabled={currentStep === 1}
                className="flex items-center justify-center order-2 sm:order-1"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Précédent
              </Button>
              
              {currentStep < 3 ? (
                <Button
                  onClick={nextStep}
                  className="flex items-center justify-center bg-blue-600 hover:bg-blue-700 order-1 sm:order-2"
                >
                  Suivant
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              ) : (
                <Button
                  onClick={handleSubmit}
                  disabled={loading || !acceptedTerms}
                  className="flex items-center justify-center bg-green-600 hover:bg-green-700 order-1 sm:order-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Inscription...' : 'Créer mon compte'}
                  <CheckCircle className="h-4 w-4 ml-2" />
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};