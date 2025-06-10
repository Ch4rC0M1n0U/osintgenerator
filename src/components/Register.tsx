import React, { useState, useEffect } from 'react';
import { Shield, User, Mail, Lock, Eye, EyeOff, AlertCircle, CheckCircle, ArrowLeft } from 'lucide-react';
import { useTranslation } from '../hooks/useTranslation';

interface RegisterProps {
  onRegister: (token: string) => void;
  onBackToLogin: () => void;
}

interface PasswordStrength {
  score: number;
  label: string;
  color: string;
  bgColor: string;
}

const Register: React.FC<RegisterProps> = ({ onRegister, onBackToLogin }) => {
  const { t } = useTranslation();
  const [formData, setFormData] = useState({
    lastName: '',
    firstName: '',
    matricule: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [passwordStrength, setPasswordStrength] = useState<PasswordStrength>({
    score: 0,
    label: '',
    color: '',
    bgColor: ''
  });
  const [isFormValid, setIsFormValid] = useState(false);

  // Validation functions
  const validateName = (name: string): boolean => {
    return /^[A-Za-zÀ-ÿ\s\-']+$/.test(name) && name.trim().length >= 2;
  };

  const validateMatricule = (matricule: string): boolean => {
    // Accepte exactement 9 chiffres commençant par 4
    return /^4\d{8}$/.test(matricule);
  };

  const validateEmail = (email: string): boolean => {
    return email.endsWith('@police.belgium.eu') && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const calculatePasswordStrength = (password: string): PasswordStrength => {
    let score = 0;
    const checks = {
      length: password.length >= 12,
      uppercase: /[A-Z]/.test(password),
      lowercase: /[a-z]/.test(password),
      number: /\d/.test(password),
      special: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)
    };

    score = Object.values(checks).filter(Boolean).length;

    if (score === 0 || password.length === 0) {
      return { score: 0, label: '', color: '', bgColor: '' };
    } else if (score <= 2) {
      return { score: 1, label: 'Faible', color: 'text-red-400', bgColor: 'bg-red-500' };
    } else if (score <= 3) {
      return { score: 2, label: 'Moyen', color: 'text-orange-400', bgColor: 'bg-orange-500' };
    } else if (score <= 4) {
      return { score: 3, label: 'Fort', color: 'text-yellow-400', bgColor: 'bg-yellow-500' };
    } else {
      return { score: 4, label: 'Très fort', color: 'text-green-400', bgColor: 'bg-green-500' };
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    // Only show errors for touched fields
    if (touched.lastName && !validateName(formData.lastName)) {
      newErrors.lastName = 'Le nom de famille doit contenir uniquement des lettres (minimum 2 caractères)';
    }

    if (touched.firstName && !validateName(formData.firstName)) {
      newErrors.firstName = 'Le prénom doit contenir uniquement des lettres (minimum 2 caractères)';
    }

    if (touched.matricule && !validateMatricule(formData.matricule)) {
      newErrors.matricule = 'Le matricule doit être au format 4xxxxxxxx (9 chiffres commençant par 4)';
    }

    if (touched.email && !validateEmail(formData.email)) {
      newErrors.email = 'Adresse email invalide. Utilisez votre adresse @police.belgium.eu';
    }

    if (touched.password) {
      if (formData.password.length > 0 && formData.password.length < 12) {
        newErrors.password = 'Le mot de passe doit contenir au moins 12 caractères';
      } else if (formData.password.length >= 12 && passwordStrength.score < 4) {
        newErrors.password = 'Le mot de passe ne respecte pas tous les critères de sécurité';
      }
    }

    if (touched.confirmPassword && formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Les mots de passe ne correspondent pas';
    }

    setErrors(newErrors);
    
    // Check if form is valid (all fields filled and no errors)
    const allFieldsFilled = Object.values(formData).every(value => value.trim() !== '');
    const noErrors = Object.keys(newErrors).length === 0;
    const passwordValid = passwordStrength.score === 4;
    const passwordsMatch = formData.password === formData.confirmPassword;
    
    setIsFormValid(allFieldsFilled && noErrors && passwordValid && passwordsMatch);
  };

  useEffect(() => {
    setPasswordStrength(calculatePasswordStrength(formData.password));
  }, [formData.password]);

  useEffect(() => {
    validateForm();
  }, [formData, passwordStrength, touched]);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleBlur = (field: string) => {
    setTouched(prev => ({ ...prev, [field]: true }));
  };

  const handleMatriculeChange = (value: string) => {
    // Ne garder que les chiffres et limiter à 9 caractères
    const numericValue = value.replace(/\D/g, '').slice(0, 9);
    handleInputChange('matricule', numericValue);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Mark all fields as touched to show any remaining errors
    setTouched({
      lastName: true,
      firstName: true,
      matricule: true,
      email: true,
      password: true,
      confirmPassword: true
    });

    if (!isFormValid) return;

    setLoading(true);
    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          lastName: formData.lastName,
          firstName: formData.firstName,
          matricule: formData.matricule,
          email: formData.email,
          password: formData.password,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        localStorage.setItem('authToken', data.token);
        onRegister(data.token);
      } else {
        setErrors({ submit: data.error || 'Erreur lors de l\'inscription' });
      }
    } catch (error) {
      setErrors({ submit: 'Erreur de connexion au serveur' });
    } finally {
      setLoading(false);
    }
  };

  const passwordCriteria = [
    { met: formData.password.length >= 12, text: 'Au moins 12 caractères' },
    { met: /[A-Z]/.test(formData.password), text: 'Au moins 1 majuscule' },
    { met: /[a-z]/.test(formData.password), text: 'Au moins 1 minuscule' },
    { met: /\d/.test(formData.password), text: 'Au moins 1 chiffre' },
    { met: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(formData.password), text: 'Au moins 1 caractère spécial' }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-blue-800 to-blue-900 flex items-center justify-center px-4">
      <div className="max-w-md w-full space-y-8">
        {/* Header */}
        <div className="text-center">
          <div className="flex justify-center mb-6">
            <div className="bg-white p-4 rounded-full shadow-lg">
              <Shield className="h-12 w-12 text-blue-800" />
            </div>
          </div>
          <h2 className="text-3xl font-bold text-white mb-2">
            Inscription
          </h2>
          <p className="text-blue-200">
            Portail OSINT - Police Fédérale Belge
          </p>
        </div>

        {/* Registration Form */}
        <div className="bg-white rounded-lg shadow-xl p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {errors.submit && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center space-x-3">
                <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0" />
                <span className="text-red-700 text-sm">{errors.submit}</span>
              </div>
            )}

            {/* Last Name */}
            <div>
              <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-2">
                <User className="inline h-4 w-4 mr-2" />
                Nom de famille *
              </label>
              <input
                id="lastName"
                type="text"
                required
                value={formData.lastName}
                onChange={(e) => handleInputChange('lastName', e.target.value)}
                onBlur={() => handleBlur('lastName')}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.lastName ? 'border-red-300 bg-red-50' : 'border-gray-300'
                }`}
                placeholder="Dupont"
              />
              {errors.lastName && (
                <p className="mt-1 text-sm text-red-600">{errors.lastName}</p>
              )}
            </div>

            {/* First Name */}
            <div>
              <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-2">
                <User className="inline h-4 w-4 mr-2" />
                Prénom *
              </label>
              <input
                id="firstName"
                type="text"
                required
                value={formData.firstName}
                onChange={(e) => handleInputChange('firstName', e.target.value)}
                onBlur={() => handleBlur('firstName')}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.firstName ? 'border-red-300 bg-red-50' : 'border-gray-300'
                }`}
                placeholder="Jean"
              />
              {errors.firstName && (
                <p className="mt-1 text-sm text-red-600">{errors.firstName}</p>
              )}
            </div>

            {/* Matricule */}
            <div>
              <label htmlFor="matricule" className="block text-sm font-medium text-gray-700 mb-2">
                <Shield className="inline h-4 w-4 mr-2" />
                Matricule policier *
              </label>
              <input
                id="matricule"
                type="text"
                required
                maxLength={9}
                value={formData.matricule}
                onChange={(e) => handleMatriculeChange(e.target.value)}
                onBlur={() => handleBlur('matricule')}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.matricule ? 'border-red-300 bg-red-50' : 'border-gray-300'
                }`}
                placeholder="412345678"
              />
              <p className="mt-1 text-xs text-gray-500">
                Format: 4xxxxxxxx (9 chiffres commençant par 4)
              </p>
              {errors.matricule && (
                <p className="mt-1 text-sm text-red-600">{errors.matricule}</p>
              )}
            </div>

            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                <Mail className="inline h-4 w-4 mr-2" />
                Adresse email professionnelle *
              </label>
              <input
                id="email"
                type="email"
                required
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value.toLowerCase())}
                onBlur={() => handleBlur('email')}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.email ? 'border-red-300 bg-red-50' : 'border-gray-300'
                }`}
                placeholder="prenom.nom@police.belgium.eu"
              />
              {errors.email && (
                <p className="mt-1 text-sm text-red-600">{errors.email}</p>
              )}
            </div>

            {/* Password */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                <Lock className="inline h-4 w-4 mr-2" />
                Mot de passe *
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={formData.password}
                  onChange={(e) => handleInputChange('password', e.target.value)}
                  onBlur={() => handleBlur('password')}
                  className={`w-full px-3 py-2 pr-10 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.password ? 'border-red-300 bg-red-50' : 'border-gray-300'
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4 text-gray-400" />
                  ) : (
                    <Eye className="h-4 w-4 text-gray-400" />
                  )}
                </button>
              </div>

              {/* Password Strength Indicator */}
              {formData.password && (
                <div className="mt-2">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs text-gray-600">Force du mot de passe:</span>
                    <span className={`text-xs font-medium ${passwordStrength.color}`}>
                      {passwordStrength.label}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full transition-all duration-300 ${passwordStrength.bgColor}`}
                      style={{ width: `${(passwordStrength.score / 4) * 100}%` }}
                    ></div>
                  </div>
                </div>
              )}

              {/* Password Criteria */}
              {formData.password && (
                <div className="mt-3 space-y-1">
                  {passwordCriteria.map((criterion, index) => (
                    <div key={index} className="flex items-center space-x-2">
                      {criterion.met ? (
                        <CheckCircle className="h-4 w-4 text-green-500" />
                      ) : (
                        <AlertCircle className="h-4 w-4 text-gray-400" />
                      )}
                      <span className={`text-xs ${criterion.met ? 'text-green-600' : 'text-gray-500'}`}>
                        {criterion.text}
                      </span>
                    </div>
                  ))}
                </div>
              )}

              {errors.password && (
                <p className="mt-1 text-sm text-red-600">{errors.password}</p>
              )}
            </div>

            {/* Confirm Password */}
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
                <Lock className="inline h-4 w-4 mr-2" />
                Confirmer le mot de passe *
              </label>
              <div className="relative">
                <input
                  id="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  required
                  value={formData.confirmPassword}
                  onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                  onBlur={() => handleBlur('confirmPassword')}
                  className={`w-full px-3 py-2 pr-10 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.confirmPassword ? 'border-red-300 bg-red-50' : 'border-gray-300'
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                >
                  {showConfirmPassword ? (
                    <EyeOff className="h-4 w-4 text-gray-400" />
                  ) : (
                    <Eye className="h-4 w-4 text-gray-400" />
                  )}
                </button>
              </div>
              {errors.confirmPassword && (
                <p className="mt-1 text-sm text-red-600">{errors.confirmPassword}</p>
              )}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={!isFormValid || loading}
              className={`w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white transition-colors ${
                isFormValid && !loading
                  ? 'bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500'
                  : 'bg-gray-400 cursor-not-allowed'
              }`}
            >
              {loading ? (
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
              ) : (
                'Créer mon compte'
              )}
            </button>
          </form>

          {/* Back to Login */}
          <div className="mt-6 text-center">
            <button
              onClick={onBackToLogin}
              className="flex items-center justify-center space-x-2 text-blue-600 hover:text-blue-500 text-sm font-medium mx-auto"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Retour à la connexion</span>
            </button>
          </div>
        </div>

        {/* Security Notice */}
        <div className="bg-blue-800/50 rounded-lg p-4 text-center">
          <p className="text-blue-200 text-sm">
            🔒 Vos données sont protégées selon les standards de sécurité de la Police Fédérale Belge
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;