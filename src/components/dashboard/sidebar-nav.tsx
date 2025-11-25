import { 
  CalculatorIcon, 
  FolderIcon, 
  UsersIcon, 
  BuildingIcon, 
  BarChart3Icon, 
  ShieldCheckIcon,
  SettingsIcon,
  HomeIcon,
  PlusIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  UserIcon
} from "lucide-react";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";

interface SidebarNavProps {
  collapsed: boolean;
  onToggleCollapse: () => void;
  activeSection: string;
  onSectionChange: (section: string) => void;
}

const navigation = [
  { id: "dashboard", label: "Dashboard", icon: HomeIcon },
  { id: "nueva-simulacion", label: "Nueva Simulación", icon: PlusIcon, primary: true },
  { id: "simulaciones", label: "Simulaciones", icon: CalculatorIcon },
  { id: "clientes", label: "Clientes", icon: UsersIcon },
  { id: "inmuebles", label: "Inmuebles", icon: BuildingIcon },
  { id: "reportes", label: "Reportes", icon: BarChart3Icon },
  { id: "transparencia", label: "Transparencia SBS", icon: ShieldCheckIcon },
  { id: "configuracion", label: "Configuración", icon: SettingsIcon }
];

export function SidebarNav({ collapsed, onToggleCollapse, activeSection, onSectionChange }: SidebarNavProps) {
  return (
    <div className={`flex flex-col h-full bg-sidebar border-r border-sidebar-border transition-all duration-300 ${
      collapsed ? 'w-16' : 'w-64'
    }`}>
      <div className="flex items-center justify-between p-4 border-b border-sidebar-border">
        {!collapsed && (
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-sidebar-primary flex items-center justify-center">
              <span className="text-sidebar-primary-foreground font-medium">HP</span>
            </div>
            <span className="font-medium text-lg text-sidebar-foreground">HogarPlan</span>
          </div>
        )}
        <Button
          variant="ghost"
          size="sm"
          onClick={onToggleCollapse}
          className="h-8 w-8 p-0 text-sidebar-foreground hover:bg-sidebar-accent"
        >
          {collapsed ? <ChevronRightIcon className="h-4 w-4" /> : <ChevronLeftIcon className="h-4 w-4" />}
        </Button>
      </div>

      <nav className="flex-1 p-2 space-y-1">
        {navigation.map((item) => (
          <Button
            key={item.id}
            variant={activeSection === item.id ? "secondary" : "ghost"}
            className={`w-full justify-start h-10 ${
              collapsed ? 'px-2' : 'px-3'
            } ${
              item.primary ? 'bg-sidebar-primary text-sidebar-primary-foreground hover:bg-sidebar-primary/90' : 
              activeSection === item.id ? 'bg-sidebar-accent text-sidebar-accent-foreground' :
              'text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground'
            }`}
            onClick={() => onSectionChange(item.id)}
          >
            <item.icon className={`h-4 w-4 ${collapsed ? '' : 'mr-3'} flex-shrink-0`} />
            {!collapsed && <span className="flex-1 text-left">{item.label}</span>}
          </Button>
        ))}
      </nav>

      <div className="p-4 border-t border-sidebar-border">
        <div className={`flex items-center gap-3 ${collapsed ? 'justify-center' : ''}`}>
          <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center flex-shrink-0">
            <UserIcon className="h-5 w-5 text-muted-foreground" />
          </div>
          {!collapsed && (
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-sidebar-foreground truncate">Usuario</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
