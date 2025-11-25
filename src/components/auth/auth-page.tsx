import { useState } from "react";
import { LoginForm } from "./login-form";
import { RegisterForm } from "./register-form";
import { ImageWithFallback } from "../figma/ImageWithFallback";

interface AuthPageProps {
  onLoginSuccess: () => void;
}

export function AuthPage({ onLoginSuccess }: AuthPageProps) {
  const [isLogin, setIsLogin] = useState(true);

  return (
    <div className="min-h-screen grid lg:grid-cols-2">
      {/* Left side - Form */}
      <div className="flex items-center justify-center p-8">
        <div className="w-full max-w-md space-y-8">
          {/* Logo */}
          <div className="text-center">
            <div className="flex items-center justify-center gap-2 mb-8">
              <div className="h-10 w-10 rounded-lg bg-primary flex items-center justify-center">
                <span className="text-primary-foreground font-medium text-lg">HP</span>
              </div>
              <span className="font-medium text-2xl">HogarPlan</span>
            </div>
          </div>

          {/* Auth Form */}
          {isLogin ? (
            <LoginForm 
              onToggleMode={() => setIsLogin(false)} 
              onLoginSuccess={onLoginSuccess}
            />
          ) : (
            <RegisterForm onToggleMode={() => setIsLogin(true)} />
          )}
        </div>
      </div>

      {/* Right side - Visual */}
      <div className="hidden lg:block relative bg-muted">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-primary/5" />
        <ImageWithFallback
          src="https://images.unsplash.com/photo-1634757439914-23b8acb9d411?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtb2Rlcm4lMjBob3VzZSUyMGhvbWUlMjBmaW5hbmNlfGVufDF8fHx8MTc1OTgxMjM0M3ww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
          alt="Casa moderna"
          className="w-full h-full object-cover"
        />
        
        {/* Overlay content */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="max-w-md text-center space-y-6 p-8">
            <div className="space-y-4">
              <h2 className="text-white text-3xl">
                Tu casa ideal está a un clic de distancia
              </h2>
              <p className="text-white/90 text-lg">
                Simula y compara créditos hipotecarios con transparencia total. 
                Toma decisiones informadas para tu futuro hogar.
              </p>
            </div>
            
            <div className="grid grid-cols-3 gap-4 text-center">
              <div className="bg-white/10 backdrop-blur rounded-lg p-4">
                <div className="text-white text-2xl mb-1">9.8%</div>
                <div className="text-white/80 text-sm">TCEA promedio</div>
              </div>
              <div className="bg-white/10 backdrop-blur rounded-lg p-4">
                <div className="text-white text-2xl mb-1">S/ 2,850</div>
                <div className="text-white/80 text-sm">Cuota promedio</div>
              </div>
              <div className="bg-white/10 backdrop-blur rounded-lg p-4">
                <div className="text-white text-2xl mb-1">15</div>
                <div className="text-white/80 text-sm">Años promedio</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}