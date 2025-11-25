import { useState } from "react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { Alert, AlertDescription } from "../ui/alert";
import { Checkbox } from "../ui/checkbox";
import { EyeIcon, EyeOffIcon, CheckIcon } from "lucide-react";

interface RegisterFormProps {
  onToggleMode: () => void;
}

export function RegisterForm({ onToggleMode }: RegisterFormProps) {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
    acceptTerms: false,
    acceptPrivacy: false
  });

  // Estados para errores específicos de validación
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [confirmPasswordError, setConfirmPasswordError] = useState("");
  const [termsError, setTermsError] = useState("");

  const passwordRequirements = [
    { text: "Al menos 8 caracteres", valid: formData.password.length >= 8 },
    { text: "Una mayúscula", valid: /[A-Z]/.test(formData.password) },
    { text: "Una minúscula", valid: /[a-z]/.test(formData.password) },
    { text: "Un número", valid: /\d/.test(formData.password) },
    { text: "Un carácter especial", valid: /[!@#$%^&*(),.?":{}|<>]/.test(formData.password) }
  ];

  const isPasswordValid = passwordRequirements.every(req => req.valid);
  const passwordsMatch = formData.password === formData.confirmPassword && formData.confirmPassword !== "";

  const validateForm = () => {
    let isValid = true;
    setEmailError("");
    setPasswordError("");
    setConfirmPasswordError("");
    setTermsError("");
    setError("");

    if (!formData.firstName.trim()) {
      setError("El nombre es requerido.");
      isValid = false;
    }
    if (!formData.lastName.trim()) {
      setError("El apellido es requerido.");
      isValid = false;
    }
    if (!formData.email.trim()) {
      setEmailError("El email es requerido.");
      isValid = false;
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      setEmailError("Formato de email inválido.");
      isValid = false;
    }
    if (!formData.password) {
      setPasswordError("La contraseña es requerida.");
      isValid = false;
    } else if (!isPasswordValid) {
      setPasswordError("La contraseña no cumple con los requisitos mínimos.");
      isValid = false;
    }
    if (!formData.confirmPassword) {
      setConfirmPasswordError("Confirma tu contraseña.");
      isValid = false;
    } else if (!passwordsMatch) {
      setConfirmPasswordError("Las contraseñas no coinciden.");
      isValid = false;
    }
    if (!formData.acceptTerms || !formData.acceptPrivacy) {
      setTermsError("Debes aceptar los términos y la política de privacidad.");
      isValid = false;
    }

    return isValid;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch('http://localhost:3001/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: formData.email, password: formData.password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.msg || 'Error al registrar la cuenta.');
      }

      setSuccess(true);

    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Limpiar errores al cambiar el input
    if (field === "email") setEmailError("");
    if (field === "password") setPasswordError("");
    if (field === "confirmPassword") setConfirmPasswordError("");
    if (field === "acceptTerms" || field === "acceptPrivacy") setTermsError("");
    setError("");
  };

  if (success) {
    return (
      <Card className="w-full max-w-md">
        <CardContent className="pt-6">
          <div className="text-center space-y-4">
            <div className="h-16 w-16 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mx-auto">
              <CheckIcon className="h-8 w-8 text-green-600 dark:text-green-400" />
            </div>
            <h2 className="text-2xl">¡Cuenta creada exitosamente!</h2>
            <p className="text-muted-foreground">
              Ya puedes iniciar sesión con tus credenciales.
            </p>
            <Button onClick={onToggleMode} className="w-full">
              Ir a iniciar sesión
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader className="space-y-2 text-center">
        <CardTitle className="text-2xl">Crear Cuenta</CardTitle>
        <CardDescription>
          Únete a HogarPlan y comienza a simular tu crédito hipotecario
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="firstName">Nombre</Label>
              <Input
                id="firstName"
                placeholder="Juan"
                value={formData.firstName}
                onChange={(e) => handleInputChange("firstName", e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="lastName">Apellido</Label>
              <Input
                id="lastName"
                placeholder="Pérez"
                value={formData.lastName}
                onChange={(e) => handleInputChange("lastName", e.target.value)}
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="tu@email.com"
              value={formData.email}
              onChange={(e) => handleInputChange("email", e.target.value)}
              required
            />
            {emailError && <p className="text-red-500 text-sm mt-1">{emailError}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Contraseña</Label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="Tu contraseña"
                value={formData.password}
                onChange={(e) => handleInputChange("password", e.target.value)}
                required
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? (
                  <EyeOffIcon className="h-4 w-4" />
                ) : (
                  <EyeIcon className="h-4 w-4" />
                )}
              </Button>
            </div>
            {passwordError && <p className="text-red-500 text-sm mt-1">{passwordError}</p>}
            {formData.password && (
              <div className="space-y-2 text-sm">
                {passwordRequirements.map((req, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <div 
                      className={`h-3 w-3 rounded-full flex items-center justify-center ${
                        req.valid ? 'bg-green-500' : 'bg-gray-300 dark:bg-gray-600'
                      }`}
                    >
                      {req.valid && <CheckIcon className="h-2 w-2 text-white" />}
                    </div>
                    <span className={req.valid ? 'text-green-600 dark:text-green-400' : 'text-muted-foreground'}>
                      {req.text}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirmPassword">Confirmar Contraseña</Label>
            <div className="relative">
              <Input
                id="confirmPassword"
                type={showConfirmPassword ? "text" : "password"}
                placeholder="Confirma tu contraseña"
                value={formData.confirmPassword}
                onChange={(e) => handleInputChange("confirmPassword", e.target.value)}
                required
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              >
                {showConfirmPassword ? (
                  <EyeOffIcon className="h-4 w-4" />
                ) : (
                  <EyeIcon className="h-4 w-4" />
                )}
              </Button>
            </div>
            {confirmPasswordError && <p className="text-red-500 text-sm mt-1">{confirmPasswordError}</p>}
            {formData.confirmPassword && (
              <div className="flex items-center gap-2 text-sm">
                <div 
                  className={`h-3 w-3 rounded-full flex items-center justify-center ${
                    passwordsMatch ? 'bg-green-500' : 'bg-red-500'
                  }`}
                >
                  <CheckIcon className="h-2 w-2 text-white" />
                </div>
                <span className={passwordsMatch ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}>
                  {passwordsMatch ? 'Las contraseñas coinciden' : 'Las contraseñas no coinciden'}
                </span>
              </div>
            )}
          </div>

          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="terms"
                checked={formData.acceptTerms}
                onCheckedChange={(checked) => handleInputChange("acceptTerms", checked as boolean)}
              />
              <Label htmlFor="terms" className="text-sm leading-tight">
                Acepto los{" "}
                <a href="#" className="text-primary hover:underline">
                  términos y condiciones
                </a>
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="privacy"
                checked={formData.acceptPrivacy}
                onCheckedChange={(checked) => handleInputChange("acceptPrivacy", checked as boolean)}
              />
              <Label htmlFor="privacy" className="text-sm leading-tight">
                Acepto la{" "}
                <a href="#" className="text-primary hover:underline">
                  política de privacidad
                </a>
              </Label>
            </div>
            {termsError && <p className="text-red-500 text-sm mt-1">{termsError}</p>}
          </div>

          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? "Creando cuenta..." : "Crear Cuenta"}
          </Button>
        </form>

        <div className="text-center text-sm">
          <span className="text-muted-foreground">¿Ya tienes cuenta? </span>
          <Button
            type="button"
            variant="link"
            className="p-0 h-auto"
            onClick={onToggleMode}
          >
            Inicia sesión aquí
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}