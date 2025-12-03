import { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../ui/card";
import { Button } from "../ui/button";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '../ui/alert-dialog';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '../ui/dialog';
import { TrashIcon, PencilIcon, SearchIcon, FileTextIcon, FileDownIcon } from 'lucide-react'; // Importar toast
import { toast } from "sonner";
import { Input } from '../ui/input';
import { SimulacionType } from '../../App';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import html2pdf from 'html2pdf.js';

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface SimulacionesProps {
  selectedSimulacion: SimulacionType | null;
  setSelectedSimulacion: (simulacion: SimulacionType | null) => void;
  onEditSimulacion: (simulacion: SimulacionType) => void;
}

export function Simulaciones({ selectedSimulacion, setSelectedSimulacion, onEditSimulacion }: SimulacionesProps) {
  const [simulaciones, setSimulaciones] = useState<SimulacionType[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isPlanModalOpen, setIsPlanModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const contentRef = useRef<HTMLDivElement>(null);

  const fetchSimulaciones = async () => {
    setIsLoading(true);
    const token = sessionStorage.getItem('token');
    try {
      const response = await fetch('http://localhost:3001/api/simulaciones', {
        headers: { 'x-auth-token': token || '' },
      });
      const data = await response.json();
      setSimulaciones(data);
      if (selectedSimulacion && !data.find((s: SimulacionType) => s.id === selectedSimulacion.id)) {
        setSimulaciones(prev => [selectedSimulacion, ...prev]);
      }
    } catch (error) {
      console.error("Error fetching simulaciones:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSimulaciones();
  }, []);

  useEffect(() => {
    if (selectedSimulacion && simulaciones.length > 0) {
      const fullSimulacion = simulaciones.find(s => s.id === selectedSimulacion.id);
      if(fullSimulacion) setSelectedSimulacion(fullSimulacion);
    }
  }, [selectedSimulacion, simulaciones]);

  const performDelete = async (id: number) => {
    const token = sessionStorage.getItem('token');
    try {
      const response = await fetch(`http://localhost:3001/api/simulaciones/${id}`, {
        method: 'DELETE',
        headers: { 'x-auth-token': token || '' },
      });
      if (!response.ok) throw new Error((await response.json()).msg || 'Error al eliminar la simulación');

      fetchSimulaciones();
      setSelectedSimulacion(null);
      toast.success("Simulación eliminada correctamente.");
    } catch (err: any) {
      toast.error(err.message || "Error al eliminar la simulación.");
    }
  };

  const handleDelete = (simulacion: SimulacionType) => {
    toast.error(`¿Seguro que quieres eliminar la simulación de ${simulacion.cliente.nombres}?`, {
      action: { label: 'Eliminar', onClick: () => performDelete(simulacion.id) },
      cancel: { label: 'Cancelar' },
      duration: 10000,
    });
  };

  const handleExportToExcel = () => {
    if (!selectedSimulacion) return;

    const planDePagosData = selectedSimulacion.planDePagos.map(p => ({
      'N° Cuota': p.numeroCuota,
      'Saldo Inicial': p.saldoInicial,
      'Amortización': p.amortizacion,
      'Interés': p.interes,
      'Seguro Desgravamen': p.seguroDesgravamen,
      'Seguro Inmueble': p.seguroInmueble,
      'Cuota Total': p.cuota,
      'Saldo Final': p.saldoFinal,
    }));

    const ws = XLSX.utils.json_to_sheet(planDePagosData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Plan de Pagos");
    const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
    const blob = new Blob([excelBuffer], { type: 'application/octet-stream' });
    saveAs(blob, `Plan_de_Pagos_${selectedSimulacion.cliente.nombres}_${selectedSimulacion.cliente.apellidos}.xlsx`);
  };

  const handleExportToPDF = () => {
    if (!selectedSimulacion || !contentRef.current) return;
    
    const element = contentRef.current;
    const opt = {
      margin:       0.5,
      filename:     `Simulacion_${selectedSimulacion.cliente.nombres}_${selectedSimulacion.cliente.apellidos}.pdf`,
      image:        { type: 'jpeg', quality: 0.98 },
      html2canvas:  { scale: 2, logging: true, dpi: 192, letterRendering: true },
      jsPDF:        { unit: 'in', format: 'letter', orientation: 'portrait' }
    };

    html2pdf().set(opt).from(element).save();
  };
  
  const formatCurrency = (value: number, currency: string) => 
    new Intl.NumberFormat('es-PE', { style: 'currency', currency: currency === 'Soles' ? 'PEN' : 'USD' }).format(value);
  
  const formatPercentage = (value: number) => `${value.toFixed(2)}%`;
  
  const filteredSimulaciones = simulaciones.filter(sim => 
    sim.cliente.nombres.toLowerCase().includes(searchTerm.toLowerCase()) ||
    sim.cliente.apellidos.toLowerCase().includes(searchTerm.toLowerCase()) ||
    sim.inmueble.nombreProyecto.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (isLoading) return <div className="flex justify-center items-center h-64 text-muted-foreground">Cargando simulaciones...</div>;

  return (
    <div className="grid lg:grid-cols-12 gap-6 h-[calc(100vh-120px)]">
      {/* Sidebar List */}
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
              {filteredSimulaciones.length > 0 ? (
                filteredSimulaciones.map(sim => (
                  <div key={sim.id}
                       onClick={() => setSelectedSimulacion(sim)}
                       className={`group flex justify-between items-start p-3 rounded-lg cursor-pointer transition-all duration-200 border 
                         ${selectedSimulacion?.id === sim.id
                           ? 'bg-primary/5 border-primary/30 shadow-sm' 
                           : 'bg-background border-transparent hover:bg-muted/50 hover:border-border'}`}>
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

      {/* Main Content */}
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
          
          <CardContent className="flex-1 overflow-y-auto p-6 bg-muted/10">
            {selectedSimulacion ? (
              <div className="space-y-6 max-w-6xl mx-auto">
                
                {/* KPIs Section */}
                <div ref={contentRef} className="space-y-6">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                     {[
                        { label: "Cuota Promedio", value: formatCurrency(selectedSimulacion.cuotaMensual, selectedSimulacion.moneda) },
                        { label: "TCEA", value: formatPercentage(selectedSimulacion.tcea) },
                        { label: "TIR (Anual)", value: formatPercentage(selectedSimulacion.tir) },
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

                  {/* Parameters Grid */}
                  <div className="grid md:grid-cols-2 gap-6">
                      <Card className="border shadow-sm">
                        <CardHeader className="pb-3 border-b bg-muted/5 px-5 pt-5"><CardTitle className="text-sm font-medium uppercase tracking-wider text-muted-foreground">Detalles del Préstamo</CardTitle></CardHeader>
                        <CardContent className="grid grid-cols-2 gap-y-4 gap-x-6 p-5 text-sm">
                            <div className="space-y-0.5">
                                <p className="text-muted-foreground text-xs">Valor Inmueble</p> 
                                <p className="font-medium text-foreground">{formatCurrency(selectedSimulacion.inmueble?.valor ?? 0, selectedSimulacion.moneda)}</p>
                            </div>
                            <div className="space-y-0.5">
                                <p className="text-muted-foreground text-xs">Monto Préstamo</p>
                                <p className="font-medium text-foreground">{formatCurrency(selectedSimulacion.montoPrestamo, selectedSimulacion.moneda)}</p>
                            </div>
                            <div className="space-y-0.5">
                                <p className="text-muted-foreground text-xs">Plazo</p>
                                <p className="font-medium text-foreground">{selectedSimulacion.plazoAnios} años</p>
                            </div>
                            <div className="space-y-0.5">
                                <p className="text-muted-foreground text-xs">Tasa de Interés</p>
                                <p className="font-medium text-foreground">{formatPercentage(selectedSimulacion.tasaInteresAnual)} <span className="text-xs text-muted-foreground font-normal">({selectedSimulacion.tipoTasa})</span></p>
                            </div>
                            <div className="space-y-0.5">
                                <p className="text-muted-foreground text-xs">Seguro Desgravamen</p>
                                <p className="font-medium text-foreground">{formatPercentage(selectedSimulacion.seguroDesgravamen)} <span className="text-xs text-muted-foreground">/mes</span></p>
                            </div>
                             <div className="space-y-0.5">
                                <p className="text-muted-foreground text-xs">Seguro Inmueble</p>
                                <p className="font-medium text-foreground">{formatPercentage(selectedSimulacion.seguroInmueble)} <span className="text-xs text-muted-foreground">/año</span></p>
                            </div>
                        </CardContent>
                      </Card>
                      
                       <Card className="border shadow-sm">
                        <CardHeader className="pb-3 border-b bg-muted/5 px-5 pt-5"><CardTitle className="text-sm font-medium uppercase tracking-wider text-muted-foreground">Condiciones Especiales</CardTitle></CardHeader>
                        <CardContent className="grid grid-cols-2 gap-y-4 gap-x-6 p-5 text-sm">
                             <div className="space-y-0.5">
                                <p className="text-muted-foreground text-xs">Gracia Total</p>
                                <p className="font-medium text-foreground">{selectedSimulacion.periodoGraciaTotalMeses} meses</p>
                            </div>
                            <div className="space-y-0.5">
                                <p className="text-muted-foreground text-xs">Gracia Parcial</p>
                                <p className="font-medium text-foreground">{selectedSimulacion.periodoGraciaParcialMeses} meses</p>
                            </div>
                            <div className="space-y-0.5">
                                <p className="text-muted-foreground text-xs">Bono Techo Propio</p>
                                <p className="font-medium text-foreground">{selectedSimulacion.aplicaBonoTechoPropio ? formatCurrency(selectedSimulacion.valorBono, selectedSimulacion.moneda) : 'No aplica'}</p>
                            </div>
                            {selectedSimulacion.tipoTasa === 'Nominal' && (
                              <div className="space-y-0.5">
                                <p className="text-muted-foreground text-xs">Capitalización</p>
                                <p className="font-medium text-foreground">{selectedSimulacion.capitalizacion}</p>
                              </div>
                            )}
                        </CardContent>
                      </Card>
                  </div>

                  {/* Table Card */}
                  <Card className="overflow-hidden border shadow-sm">
                    <CardHeader className="bg-muted/5 py-4 px-6 flex flex-row items-center justify-between border-b">
                        <CardTitle className="text-base font-medium">Plan de Pagos (Proyección 12 meses)</CardTitle>
                        <Button variant="ghost" size="sm" onClick={() => setIsPlanModalOpen(true)} className="text-primary hover:text-primary/80 hover:bg-primary/5 p-0 h-auto font-normal text-xs">Ver proyección completa &rarr;</Button>
                    </CardHeader>
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead className="bg-muted/20 text-xs uppercase tracking-wider">
                          <tr className="text-muted-foreground/70 border-b">
                            <th className="px-6 py-3 text-left font-semibold">#</th>
                            <th className="px-6 py-3 text-right font-semibold">Cuota</th>
                            <th className="px-6 py-3 text-right font-semibold">Interés</th>
                            <th className="px-6 py-3 text-right font-semibold">Amortización</th>
                            <th className="px-6 py-3 text-right font-semibold">Seguros</th>
                            <th className="px-6 py-3 text-right font-semibold">Saldo Final</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y">
                          {selectedSimulacion.planDePagos.slice(0, 12).map((p: any) => (
                            <tr key={p.numeroCuota} className="hover:bg-muted/30 transition-colors">
                              <td className="px-6 py-3 text-muted-foreground font-mono text-xs">{p.numeroCuota}</td>
                              <td className="px-6 py-3 text-right font-medium text-foreground">{formatCurrency(p.cuota, selectedSimulacion.moneda)}</td>
                              <td className="px-6 py-3 text-right text-muted-foreground">{formatCurrency(p.interes, selectedSimulacion.moneda)}</td>
                              <td className="px-6 py-3 text-right text-muted-foreground">{formatCurrency(p.amortizacion, selectedSimulacion.moneda)}</td>
                              <td className="px-6 py-3 text-right text-muted-foreground">{formatCurrency(p.seguroDesgravamen + p.seguroInmueble, selectedSimulacion.moneda)}</td>
                              <td className="px-6 py-3 text-right font-medium text-foreground/80">{formatCurrency(p.saldoFinal, selectedSimulacion.moneda)}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </Card>
                </div>
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

      {/* Full Plan Modal */}
      <Dialog open={isPlanModalOpen} onOpenChange={setIsPlanModalOpen}>
        <DialogContent className="max-w-5xl max-h-[90vh] flex flex-col p-0 gap-0 overflow-hidden">
          <DialogHeader className="px-6 py-4 border-b">
            <DialogTitle>Plan de Pagos Completo</DialogTitle>
            <DialogDescription>
              Detalle de cuotas para {selectedSimulacion?.cliente.nombres} {selectedSimulacion?.cliente.apellidos}
            </DialogDescription>
          </DialogHeader>
          <div className="overflow-y-auto flex-grow p-0">
            <table className="w-full text-sm">
              <thead className="sticky top-0 bg-background shadow-sm z-10">
                <tr className="text-xs uppercase tracking-wider text-muted-foreground border-b">
                  <th className="px-6 py-3 text-left bg-muted/10">#</th>
                  <th className="px-6 py-3 text-right bg-muted/10">Cuota</th>
                  <th className="px-6 py-3 text-right bg-muted/10">Interés</th>
                  <th className="px-6 py-3 text-right bg-muted/10">Amortización</th>
                  <th className="px-6 py-3 text-right bg-muted/10">Seguros</th>
                  <th className="px-6 py-3 text-right bg-muted/10">Saldo Final</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {selectedSimulacion?.planDePagos.map((p: any) => (
                  <tr key={p.numeroCuota} className="hover:bg-muted/30">
                    <td className="px-6 py-2 text-muted-foreground font-mono text-xs">{p.numeroCuota}</td>
                    <td className="px-6 py-2 text-right font-medium">{formatCurrency(p.cuota, selectedSimulacion.moneda)}</td>
                    <td className="px-6 py-2 text-right text-muted-foreground">{formatCurrency(p.interes, selectedSimulacion.moneda)}</td>
                    <td className="px-6 py-2 text-right text-muted-foreground">{formatCurrency(p.amortizacion, selectedSimulacion.moneda)}</td>
                    <td className="px-6 py-2 text-right text-muted-foreground">{formatCurrency(p.seguroDesgravamen + p.seguroInmueble, selectedSimulacion.moneda)}</td>
                    <td className="px-6 py-2 text-right font-medium text-muted-foreground">{formatCurrency(p.saldoFinal, selectedSimulacion.moneda)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}