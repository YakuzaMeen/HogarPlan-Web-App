import { useState, useEffect } from "react";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge"; // Importar Badge
import { 
  SearchIcon, 
  MenuIcon,
  SettingsIcon,
  LogOutIcon,
  UserIcon,
  BellIcon // Importar BellIcon
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

type NotificationType = {
  _id: string;
  message: string;
  type: 'success' | 'info' | 'warning' | 'error';
  read: boolean;
  createdAt: string;
};

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
  const [notifications, setNotifications] = useState<NotificationType[]>([]);
  const unreadCount = notifications.filter(n => !n.read).length;

  const fetchNotifications = async () => {
    const token = sessionStorage.getItem('token');
    if (!token) return;
    try {
      const response = await fetch('http://localhost:3001/api/notifications', {
        headers: { 'x-auth-token': token },
      });
      if (!response.ok) throw new Error('Error al cargar notificaciones');
      const data = await response.json();
      setNotifications(data);
    } catch (err) {
      console.error("Error fetching notifications:", err);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const markAsRead = async (id: string) => {
    const token = sessionStorage.getItem('token');
    if (!token) return;
    try {
      const response = await fetch(`http://localhost:3001/api/notifications/${id}/read`, {
        method: 'PUT',
        headers: { 'x-auth-token': token },
      });
      if (!response.ok) throw new Error('Error al marcar como leída');
      fetchNotifications(); // Recargar notificaciones
    } catch (err) {
      console.error("Error marking notification as read:", err);
    }
  };

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

        {/* Notificaciones */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" className="h-9 w-9 p-0 relative">
              <BellIcon className="h-4 w-4" />
              {unreadCount > 0 && (
                <Badge className="absolute -top-1 -right-1 h-5 w-5 text-xs p-0 flex items-center justify-center">
                  {unreadCount}
                </Badge>
              )}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-80">
            <DropdownMenuLabel>Notificaciones</DropdownMenuLabel>
            <DropdownMenuSeparator />
            {notifications.length > 0 ? (
              notifications.map((notification) => (
                <DropdownMenuItem key={notification._id} className="flex flex-col items-start p-3" onSelect={() => markAsRead(notification._id)}>
                  <div className="flex items-center justify-between w-full">
                    <span className={`text-sm ${notification.read ? 'text-muted-foreground' : 'font-medium'}`}>
                      {notification.message}
                    </span>
                    {!notification.read && (
                      <div className="h-2 w-2 bg-primary rounded-full ml-2" />
                    )}
                  </div>
                  <span className="text-xs text-muted-foreground mt-1">
                    {new Date(notification.createdAt).toLocaleString()}
                  </span>
                </DropdownMenuItem>
              ))
            ) : (
              <DropdownMenuItem className="text-sm text-muted-foreground">No hay notificaciones.</DropdownMenuItem>
            )}
            <DropdownMenuSeparator />
            <DropdownMenuItem className="text-center text-sm text-primary" onSelect={() => alert('Ver todas las notificaciones (en desarrollo)')}>
              Ver todas las notificaciones
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="relative h-9 w-9 rounded-full">
              <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center">
                <UserIcon className="h-5 w-5 text-muted-foreground" />
              </div>
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
