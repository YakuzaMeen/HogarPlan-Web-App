import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { 
  SearchIcon, 
  MenuIcon,
  SettingsIcon,
  LogOutIcon,
  UserIcon
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";

interface TopbarProps {
  onMenuToggle: () => void;
  currentSection: string;
  onLogout: () => void;
}

const sectionTitles: Record<string, string> = {
  "dashboard": "Dashboard",
  "nueva-simulacion": "Nueva Simulación",
  "simulaciones": "Simulaciones",
  "clientes": "Clientes",
  "inmuebles": "Inmuebles",
  "reportes": "Reportes",
  "transparencia": "Transparencia SBS",
  "configuracion": "Configuración"
};

export function Topbar({ onMenuToggle, currentSection, onLogout }: TopbarProps) {
  return (
    <header className="h-16 border-b bg-background flex items-center justify-between px-6">
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={onMenuToggle}
          className="lg:hidden"
        >
          <MenuIcon className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-xl font-medium">{sectionTitles[currentSection] || "Dashboard"}</h1>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <div className="relative w-80 hidden md:block">
          <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar..."
            className="pl-10"
          />
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="rounded-full">
              <UserIcon className="h-5 w-5" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>Mi Cuenta</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onSelect={() => alert('Funcionalidad de configuración en desarrollo.')}>
              <SettingsIcon className="mr-2 h-4 w-4" />
              <span>Configuración</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onSelect={onLogout} className="text-destructive focus:bg-destructive focus:text-destructive-foreground">
              <LogOutIcon className="mr-2 h-4 w-4" />
              <span>Cerrar sesión</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
