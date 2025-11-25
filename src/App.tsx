import { useState, useEffect } from "react";
import { AuthPage } from "./components/auth/auth-page";
import { SidebarNav } from "./components/dashboard/sidebar-nav";
import { Topbar } from "./components/dashboard/topbar";
import { DashboardOverview } from "./components/dashboard/dashboard-overview";
import { Clientes } from "./components/dashboard/Clientes";
import { Inmuebles } from "./components/dashboard/Inmuebles";
import { NuevaSimulacion } from "./components/dashboard/NuevaSimulacion";
import { Simulaciones } from "./components/dashboard/Simulaciones";
import { Reportes } from "./components/dashboard/Reportes"; // Importar Reportes
import { Placeholder } from "./components/dashboard/Placeholder";

export type SimulacionType = { 
  _id: string; 
  cliente: { _id: string; nombres: string; apellidos: string; };
  inmueble: { _id: string; nombreProyecto: string; valor: number; moneda: string; };
  montoPrestamo: number;
  plazoAnios: number;
  tipoTasa: 'Efectiva' | 'Nominal';
  tasaInteresAnual: number;
  capitalizacion: string;
  seguroDesgravamen: number;
  seguroInmueble: number;
  periodoGraciaTotalMeses: number;
  periodoGraciaParcialMeses: number;
  aplicaBonoTechoPropio: boolean;
  valorBono: number;
  cuotaMensual: number;
  tcea: number;
  van: number;
  tir: number;
  planDePagos: any[];
  fechaCreacion: string;
};

const originalFetch = window.fetch;
window.fetch = async (...args) => {
  const response = await originalFetch(...args);
  if (response.status === 401) window.dispatchEvent(new Event('unauthorized'));
  return response;
};

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [activeSection, setActiveSection] = useState("dashboard");
  const [selectedSimulacion, setSelectedSimulacion] = useState<SimulacionType | null>(null);
  const [simulacionToEdit, setSimulacionToEdit] = useState<SimulacionType | null>(null);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    sessionStorage.removeItem('token');
    setIsAuthenticated(false);
  };

  useEffect(() => {
    const token = sessionStorage.getItem('token');
    if (token) {
      setIsAuthenticated(true);
    } else {
      setIsAuthenticated(false);
    }

    const handleUnauthorized = () => handleLogout();
    window.addEventListener('unauthorized', handleUnauthorized);
    return () => {
      window.removeEventListener('unauthorized', handleUnauthorized);
    };
  }, []);

  const handleLoginSuccess = () => setIsAuthenticated(true);

  const handleSimulacionCreated = (simulacion: SimulacionType) => {
    setSelectedSimulacion(simulacion);
    setActiveSection("simulaciones");
    setSimulacionToEdit(null);
  };

  const handleEditSimulacion = (simulacion: SimulacionType) => {
    setSimulacionToEdit(simulacion);
    setActiveSection("nueva-simulacion");
  };

  if (!isAuthenticated) {
    return <AuthPage onLoginSuccess={handleLoginSuccess} />;
  }

  return (
    <div className="h-screen flex">
      <div className="hidden lg:block">
        <SidebarNav collapsed={sidebarCollapsed} onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)} activeSection={activeSection} onSectionChange={setActiveSection} />
      </div>
      {mobileMenuOpen && (
        <>
          <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-40 lg:hidden" onClick={() => setMobileMenuOpen(false)} />
          <div className="fixed left-0 top-0 h-full z-50 lg:hidden">
            <SidebarNav collapsed={false} onToggleCollapse={() => setMobileMenuOpen(false)} activeSection={activeSection} onSectionChange={(section) => { setActiveSection(section); setMobileMenuOpen(false); }} />
          </div>
        </>
      )}
      <div className="flex-1 flex flex-col overflow-hidden">
        <Topbar onMenuToggle={() => setMobileMenuOpen(!mobileMenuOpen)} currentSection={activeSection} onLogout={handleLogout} />
        <main className="flex-1 overflow-y-auto p-6">
          {activeSection === "dashboard" && <DashboardOverview />}
          {activeSection === "clientes" && <Clientes />}
          {activeSection === "inmuebles" && <Inmuebles />}
          {activeSection === "nueva-simulacion" && <NuevaSimulacion onSimulacionCreated={handleSimulacionCreated} simulacionToEdit={simulacionToEdit} />}
          {activeSection === "simulaciones" && <Simulaciones selectedSimulacion={selectedSimulacion} setSelectedSimulacion={setSelectedSimulacion} onEditSimulacion={handleEditSimulacion} />}
          {activeSection === "reportes" && <Reportes />} {/* Renderizar Reportes */}
          {activeSection === "transparencia" && <Placeholder title="Transparencia SBS" />}
          {activeSection === "configuracion" && <Placeholder title="Configuración" />}
        </main>
      </div>
    </div>
  );
}
