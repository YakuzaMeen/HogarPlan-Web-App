// simulaciones.tsx
import { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../ui/card";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { toast } from "sonner";
import { SimulacionType } from '../../App';

import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import html2pdf from 'html2pdf.js';

import { TrashIcon, PencilIcon, SearchIcon, FileTextIcon, FileDownIcon } from 'lucide-react';

interface SimulacionesProps {
  selectedSimulacion: SimulacionType | null;
  setSelectedSimulacion: (simulacion: SimulacionType | null) => void;
  onEditSimulacion: (simulacion: SimulacionType) => void;
}

export function Simulaciones({ selectedSimulacion, setSelectedSimulacion, onEditSimulacion }: SimulacionesProps) {
  const [simulaciones, setSimulaciones] = useState<SimulacionType[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isDetailLoading, setIsDetailLoading] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);

  // ==============================
  // GET SIMULACIONES (LISTA)
  // ==============================
  const fetchSimulaciones = async () => {
    setIsLoading(true);
    const token = sessionStorage.getItem('token');
    try {
      const res = await fetch("http://localhost:3001/api/simulaciones", {
        headers: { 'x-auth-token': token || '' },
      });
      if (!res.ok) {
        console.error("Error HTTP:", res.status);
        // Aquí podrías manejar el error, por ejemplo, redirigiendo al login si es 401
        return;
      }

      const data = await res.json();
      if (!Array.isArray(data)) {
        console.error("El backend no devolvió un array.");
        setSimulaciones([]); // Asegurarse de que sea un array vacío
        return;
      }

      setSimulaciones(data);
    } catch (error) {
      console.error("Error fetching simulaciones:", error);
    } finally {
      setIsLoading(false); // Ocultar el loader principal
    }
  };

  useEffect(() => {
    fetchSimulaciones();
  }, []);

  // ==============================
  // GET DETALLE DE SIMULACIÓN
  // ==============================
  const handleSelectSimulacion = async (sim: SimulacionType) => {
    // Si la simulación que clickeamos ya tiene el plan de pagos, no la volvemos a buscar.
    if (sim.planDePagos && sim.planDePagos.length > 0) {
      setSelectedSimulacion(sim);
      return;
    }

    // Si no, buscamos los detalles completos.
    setIsDetailLoading(true);
    setSelectedSimulacion(null); // Limpia la selección anterior para mostrar el loader
    const token = sessionStorage.getItem('token');
    try {
      const response = await fetch(`http://localhost:3001/api/simulaciones/${sim.id}`, {
        headers: { 'x-auth-token': token || '' },
      });
      const fullData = await response.json();

      // Actualizamos la simulación en la lista local para no volver a buscarla
      setSimulaciones(prevSims => prevSims.map(s => s.id === fullData.id ? fullData : s));
      setSelectedSimulacion(fullData);

    } catch (error) {
      console.error("Error fetching simulation details:", error);
      toast.error("No se pudieron cargar los detalles de la simulación.");
    } finally {
      setIsDetailLoading(false);
    }
  };

  // ==============================
  // DELETE SIMULACIÓN
  // ==============================
  const performDelete = async (id: number) => {
    const token = sessionStorage.getItem('token');
    try {
      const response = await fetch(`http://localhost:3001/api/simulaciones/${id}`, {
        method: 'DELETE',
        headers: { 'x-auth-token': token || '' },
      });

      if (!response.ok) throw new Error((await response.json()).msg || "Error al eliminar");

      // Refrescar la lista y limpiar la selección
      await fetchSimulaciones();
      setSelectedSimulacion(null);
      toast.success("Simulación eliminada.");
    } catch (err: any) {
      toast.error(err.message || "Error al eliminar la simulación.");
    }
  };

  const handleDelete = (sim: SimulacionType) => {
    toast.error(`¿Eliminar simulación de ${sim.cliente.nombres}?`, {
      action: { label: "Eliminar", onClick: () => performDelete(sim.id) },
      cancel: { label: "Cancelar" },
      duration: 10000,
    });
  };

  // ==============================
  // EXPORTAR EXCEL
  // ==============================
  const handleExportToExcel = () => {
    if (!selectedSimulacion?.planDePagos) return;

    const planData = selectedSimulacion.planDePagos.map(p => ({
      'N° Cuota': p.numeroCuota,
      'P.G.': p.graceFlag,
      'Saldo Inicial': p.saldoInicial,
      'Interés': p.interes,
      'Amortización': p.amortizacion,
      'Cuota (P+I)': p.cuotaFija,
      'Seguro Desgravamen': p.seguroDesgravamen,
      'Seguro Inmueble': p.seguroInmueble,
      'Portes': p.portes,
      'Cuota Total': p.cuota,
      'Saldo Final': p.saldoFinal,
      'Flujo': p.flujo,
    }));

    const ws = XLSX.utils.json_to_sheet(planData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Plan de Pagos");
    const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });

    saveAs(new Blob([excelBuffer]), `Plan_${selectedSimulacion.cliente.nombres}.xlsx`);
  };

  // ==============================
  // EXPORTAR PDF
  // ==============================
  const handleExportToPDF = () => {
    if (!selectedSimulacion || !contentRef.current) return;

    html2pdf()
      .set({
        margin: 0.5,
        filename: `Simulacion_${selectedSimulacion.cliente.nombres}.pdf`,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2 },
        jsPDF: { format: 'letter' },
      })
      .from(contentRef.current)
      .save();
  };

  // ==============================
  // FORMATEADORES
  // ==============================
  const formatCurrency = (value: any, currency: string) => {
    const num = parseFloat(value);
    if (isNaN(num)) return 'S/ 0.00';
    return new Intl.NumberFormat('es-PE', {
      style: 'currency',
      currency: currency === 'Soles' ? 'PEN' : 'USD'
    }).format(num);
  }

  const formatPercentage = (value: any) => {
    const num = parseFloat(value);
    if (isNaN(num)) {
      return '0.00%';
    }
    return `${num.toFixed(2)}%`;
  }

  // ==============================
  // FILTRO BUSCADOR
  // ==============================
  const filtered = simulaciones.filter(sim =>
    (sim.cliente?.nombres?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
    (sim.cliente?.apellidos?.toLowerCase() || '').includes(searchTerm.toLowerCase())
  );

  // ==============================
  // RENDER
  // ==============================
  if (isLoading) {
    return <div className="flex justify-center items-center h-64 text-muted-foreground">Cargando simulaciones...</div>;
  }

  return (
    <div className="grid lg:grid-cols-12 gap-6 h-[calc(100vh-120px)]">

      {/* SIDEBAR */}
      <div className="lg:col-span-4 xl:col-span-3 flex flex-col h-full">
        <Card className="h-full flex flex-col border-0 shadow-none md:border md:shadow-sm">
          <CardHeader className="pb-3 px-4 pt-4">
            <CardTitle className="text-lg font-semibold">Historial</CardTitle>
          </CardHeader>
          <CardContent className="flex-grow overflow-hidden flex flex-col p-0">
            <div className="px-4 pb-4">
              <div className="relative">
                <SearchIcon className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar por nombre..."
                  className="pl-9 bg-muted/40 border-none focus-visible:ring-1 focus-visible:ring-primary/20"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
            <div className="overflow-y-auto px-3 pb-3 space-y-1 flex-1 custom-scrollbar">
              {filtered.length > 0 ? (
                filtered.map(sim => (
                  <div
                    key={sim.id}
                    onClick={() => handleSelectSimulacion(sim)}
                    className={`group flex justify-between items-start p-3 rounded-lg cursor-pointer transition-all duration-200 border
                      ${selectedSimulacion?.id === sim.id
                        ? 'bg-primary/5 border-primary/30 shadow-sm'
                        : 'bg-background border-transparent hover:bg-muted/50 hover:border-border'}`}
                  >
                    <div className="flex-grow min-w-0">
                      <div className="flex justify-between items-center mb-1">
                        <p className={`font-medium text-sm truncate ${selectedSimulacion?.id === sim.id ? 'text-primary' : 'text-foreground'}`} title={sim.cliente ? `${sim.cliente.nombres} ${sim.cliente.apellidos}` : 'Cliente no disponible'}>
                          {sim.cliente ? `${sim.cliente.nombres} ${sim.cliente.apellidos}` : 'Cargando...'}
                        </p>
                        <span className="text-[10px] text-muted-foreground shrink-0 ml-2 bg-muted px-1.5 py-0.5 rounded-full">
                          {new Date(sim.fechaCreacion).toLocaleDateString(undefined, { day: '2-digit', month: '2-digit' })}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground truncate font-medium">{sim.inmueble ? sim.inmueble.nombreProyecto : 'Cargando...'}</p>
                      <p className="text-xs text-muted-foreground/70 mt-1 truncate">
                        {formatCurrency(sim.montoPrestamo, sim.moneda)} • {sim.plazoAnios} años
                      </p>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className={`h-7 w-7 -mr-1 ml-1 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-destructive/10 hover:text-destructive ${selectedSimulacion?.id === sim.id ? 'opacity-100' : ''}`}
                      onClick={(e) => { e.stopPropagation(); handleDelete(sim); }}
                    >
                      <TrashIcon className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                ))
              ) : <div className="text-center py-8 text-muted-foreground text-sm">No se encontraron resultados.</div>}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* MAIN VIEW */}
      <div className="lg:col-span-8 xl:col-span-9 h-full overflow-hidden">
        <Card className="h-full flex flex-col shadow-sm border-0 md:border">
          <CardHeader className="border-b bg-card py-4 px-6 shrink-0">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
              <div>
                <CardTitle className="text-xl font-bold text-foreground" title={selectedSimulacion?.cliente ? `${selectedSimulacion.cliente.nombres} ${selectedSimulacion.cliente.apellidos}` : ''}>
                  {selectedSimulacion?.cliente ? `${selectedSimulacion.cliente.nombres} ${selectedSimulacion.cliente.apellidos}` : "Detalle de Simulación"}
                </CardTitle>
                <CardDescription className="mt-1" title={selectedSimulacion?.inmueble ? selectedSimulacion.inmueble.nombreProyecto : ''}>
                  {selectedSimulacion?.inmueble ? selectedSimulacion.inmueble.nombreProyecto : "Selecciona una simulación para ver sus detalles completos"}
                </CardDescription>
              </div>
              {selectedSimulacion && (
                <div className="flex gap-2 shrink-0">
                  <Button variant="outline" size="sm" className="h-9 text-xs" onClick={handleExportToExcel}><FileTextIcon className="mr-2 h-3.5 w-3.5" />Excel</Button>
                  <Button variant="outline" size="sm" className="h-9 text-xs" onClick={handleExportToPDF}><FileDownIcon className="mr-2 h-3.5 w-3.5" />PDF</Button>
                  <Button variant="default" size="sm" className="h-9 text-xs" onClick={() => onEditSimulacion(selectedSimulacion)}><PencilIcon className="mr-2 h-3.5 w-3.5" />Editar</Button>
                </div>
              )}
            </div>
          </CardHeader>
          <CardContent className="flex-1 overflow-y-auto p-6 bg-muted/10 relative">
            {isDetailLoading ? (
              <div className="absolute inset-0 flex items-center justify-center bg-background/50 backdrop-blur-sm z-20">
                <p className="text-muted-foreground animate-pulse">Cargando detalles...</p>
              </div>
            ) : selectedSimulacion ? (
              <div ref={contentRef} className="space-y-6 max-w-6xl mx-auto">
                {/* KPIs Section */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {[
                    { label: "Cuota Promedio", value: formatCurrency(selectedSimulacion.cuotaMensual, selectedSimulacion.moneda) },
                    { label: "TCEA", value: formatPercentage(selectedSimulacion.tcea) },
                    { label: "TIR (Período)", value: formatPercentage(selectedSimulacion.tir) },
                    { label: "VAN", value: formatCurrency(selectedSimulacion.van, selectedSimulacion.moneda) }
                  ].map((item, idx) => (
                    <Card key={idx} className="bg-background border shadow-sm hover:shadow-md transition-all">
                      <CardContent className="p-4 flex flex-col items-center justify-center text-center h-24">
                        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1">{item.label}</p>
                        <p className="text-lg md:text-xl font-bold text-foreground tracking-tight truncate w-full" title={item.value}>{item.value}</p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
                {/* Parameters Grid & Table Card */}
                {/* ... (el resto del JSX para mostrar los detalles y la tabla) ... */}
                <Card className="border shadow-sm flex flex-col" style={{ height: 'calc(100vh - 450px)', minHeight: '400px' }}>
                  <CardHeader className="bg-muted/5 py-4 px-6 border-b shrink-0">
                    <CardTitle className="text-base font-medium">Plan de Pagos Completo</CardTitle>
                  </CardHeader>
                  <div className="overflow-auto flex-grow">
                    <table className="w-full text-sm">
                      <thead className="sticky top-0 bg-background shadow-sm z-10">
                        <tr className="text-xs uppercase tracking-wider text-muted-foreground border-b">
                          <th className="px-4 py-2 text-center font-semibold">#</th>
                          <th className="px-4 py-2 text-center font-semibold">P.G.</th>
                          <th className="px-4 py-2 text-right font-semibold">Saldo Inicial</th>
                          <th className="px-4 py-2 text-right font-semibold">Interés</th>
                          <th className="px-4 py-2 text-right font-semibold">Amort.</th>
                          <th className="px-4 py-2 text-right font-semibold">Cuota (P+I)</th>
                          <th className="px-4 py-2 text-right font-semibold">Seg. Desgr.</th>
                          <th className="px-4 py-2 text-right font-semibold">Seg. Riesgo</th>
                          <th className="px-4 py-2 text-right font-semibold">Portes</th>
                          <th className="px-4 py-2 text-right font-semibold">Cuota Total</th>
                          <th className="px-4 py-2 text-right font-semibold">Saldo Final</th>
                          <th className="px-4 py-2 text-right font-semibold">Flujo</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y">
                        {selectedSimulacion.planDePagos?.map((p: any) => (
                          <tr key={p.numeroCuota} className="hover:bg-muted/30 transition-colors">
                            <td className="px-4 py-2 text-center text-muted-foreground font-mono text-xs">{p.numeroCuota}</td>
                            <td className="px-4 py-2 text-center font-bold text-primary/80">{p.graceFlag}</td>
                            <td className="px-4 py-2 text-right">{formatCurrency(p.saldoInicial, selectedSimulacion.moneda)}</td>
                            <td className="px-4 py-2 text-right text-muted-foreground">{formatCurrency(p.interes, selectedSimulacion.moneda)}</td>
                            <td className="px-4 py-2 text-right text-muted-foreground">{formatCurrency(p.amortizacion, selectedSimulacion.moneda)}</td>
                            <td className="px-4 py-2 text-right font-medium">{formatCurrency(p.cuotaFija, selectedSimulacion.moneda)}</td>
                            <td className="px-4 py-2 text-right text-muted-foreground">{formatCurrency(p.seguroDesgravamen, selectedSimulacion.moneda)}</td>
                            <td className="px-4 py-2 text-right text-muted-foreground">{formatCurrency(p.seguroInmueble, selectedSimulacion.moneda)}</td>
                            <td className="px-4 py-2 text-right text-muted-foreground">{formatCurrency(p.portes, selectedSimulacion.moneda)}</td>
                            <td className="px-4 py-2 text-right font-bold text-foreground">{formatCurrency(p.cuota, selectedSimulacion.moneda)}</td>
                            <td className="px-4 py-2 text-right font-medium text-foreground/80">{formatCurrency(p.saldoFinal, selectedSimulacion.moneda)}</td>
                            <td className="px-4 py-2 text-right text-red-500/80">({formatCurrency(Math.abs(p.flujo), selectedSimulacion.moneda)})</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </Card>
              </div>
            ) : isDetailLoading ? (
                <div className="absolute inset-0 flex items-center justify-center bg-background/50 backdrop-blur-sm">
                  <p className="text-muted-foreground animate-pulse">Cargando detalles...</p>
                </div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-muted-foreground/40 p-8">
                <div className="bg-muted/20 p-6 rounded-full mb-4">
                  <FileTextIcon className="h-12 w-12 stroke-[1.5]" />
                </div>
                <p className="text-xl font-semibold text-foreground/60">Sin selección</p>
                <p className="text-sm mt-2 max-w-xs text-center">Selecciona una simulación del panel izquierdo para visualizar los resultados detallados.</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}