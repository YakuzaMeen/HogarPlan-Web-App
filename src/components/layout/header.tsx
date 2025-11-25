import { Button } from "../ui/button";
import { MoonIcon, SunIcon, MenuIcon } from "lucide-react";
import { useState, useEffect } from "react";

interface HeaderProps {
  onMenuToggle?: () => void;
  showMenu?: boolean;
}

export function Header({ onMenuToggle, showMenu = false }: HeaderProps) {
  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    const isDark = document.documentElement.classList.contains('dark');
    setDarkMode(isDark);
  }, []);

  const toggleDarkMode = () => {
    document.documentElement.classList.toggle('dark');
    setDarkMode(!darkMode);
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center gap-4">
          {showMenu && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onMenuToggle}
              className="md:hidden"
            >
              <MenuIcon className="h-5 w-5" />
            </Button>
          )}
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
              <span className="text-primary-foreground font-medium">HP</span>
            </div>
            <span className="font-medium">HogarPlan</span>
          </div>
        </div>

        <nav className="hidden md:flex items-center gap-6">
          <a href="#features" className="hover:text-primary transition-colors">
            Características
          </a>
          <a href="#how-it-works" className="hover:text-primary transition-colors">
            Cómo funciona
          </a>
          <a href="#transparency" className="hover:text-primary transition-colors">
            Transparencia SBS
          </a>
        </nav>

        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={toggleDarkMode}
            className="h-9 w-9 p-0"
          >
            {darkMode ? (
              <SunIcon className="h-4 w-4" />
            ) : (
              <MoonIcon className="h-4 w-4" />
            )}
          </Button>
          <Button variant="outline" size="sm">
            Iniciar Sesión
          </Button>
          <Button size="sm">
            Empezar Gratis
          </Button>
        </div>
      </div>
    </header>
  );
}