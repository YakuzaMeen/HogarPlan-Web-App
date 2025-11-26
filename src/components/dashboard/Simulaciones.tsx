import { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../ui/card";
import { Button } from "../ui/button";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '../ui/alert-dialog';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '../ui/dialog';
import { TrashIcon, EyeIcon, PencilIcon, SearchIcon, FileTextIcon, FileDownIcon } from 'lucide-react';
import { Input } from '../ui/input';
import { SimulacionType } from '../../App';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import html2pdf from 'html2pdf.js';

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
      if (selectedSimulacion && !data.find((s: SimulacionType) => s._id === selectedSimulacion._id)) {
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
      const fullSimulacion = simulaciones.find(s => s._id === selectedSimulacion._id);
      if(fullSimulacion) setSelectedSimulacion(fullSimulacion);
    }
  }, [selectedSimulacion, simulaciones]);

  const handleDelete = async (id: string) => {
    const token = sessionStorage.getItem('token');
    try {
      const response = await fetch(`http://localhost:3001/api/simulaciones/${id}`, {
        method: 'DELETE',
        headers: { 'x-auth-token': token || '' },
      });
      if (!response.ok) throw new Error((await response.json()).msg || 'Error al eliminar la simulación');
      
      fetchSimulaciones();
      setSelectedSimulacion(null);
    } catch (err) {
      console.error("Error deleting simulación:", err);
    }
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
    const data = new Blob([excelBuffer], { type: 'application/octet-stream' });
    saveAs(data, `Plan_de_Pagos_${selectedSimulacion.cliente.nombres}_${selectedSimulacion.cliente.apellidos}.xlsx`);
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

  if (isLoading) return <p>Cargando simulaciones...</p>;

  return (
    <div className="grid md:grid-cols-3 gap-6">
      <div className="md:col-span-1">
        <Card>
          <CardHeader><CardTitle>Simulaciones Guardadas</CardTitle></CardHeader>
          <CardContent className="max-h-[70vh] overflow-y-auto">
            <div className="relative mb-4">
              <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar simulaciones..."
                className="pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            {filteredSimulaciones.length > 0 ? (
              filteredSimulaciones.map(sim => (
                <div key={sim._id} 
                     className={`p-3 mb-2 border rounded-lg cursor-pointer flex justify-between items-center ${selectedSimulacion?._id === sim._id ? 'bg-muted' : 'hover:bg-muted/50'}`}>
                  <div onClick={() => setSelectedSimulacion(sim)} className="flex-grow">
                    <p className="font-semibold">{sim.cliente.nombres} {sim.cliente.apellidos}</p>
                    <p className="text-sm text-muted-foreground">{sim.inmueble.nombreProyecto}</p>
                    <p className="text-xs text-muted-foreground">{new Date(sim.fechaCreacion).toLocaleDateString()}</p>
                  </div>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="ghost" size="icon" className="ml-2">
                        <TrashIcon className="h-4 w-4 text-destructive hover:text-destructive" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader><AlertDialogTitle>¿Estás seguro?</AlertDialogTitle><AlertDialogDescription>Esta acción no se puede deshacer.</AlertDialogDescription></AlertDialogHeader>
                      <AlertDialogFooter><AlertDialogCancel>Cancelar</AlertDialogCancel><AlertDialogAction onClick={() => handleDelete(sim._id!)}>Eliminar</AlertDialogAction></AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              ))
            ) : <p>No hay simulaciones guardadas que coincidan con la búsqueda.</p>}
          </CardContent>
        </Card>
      </div>

      <div className="md:col-span-2">
        <Card>
          <CardHeader>
            <CardTitle>Detalle de la Simulación</CardTitle>
            <CardDescription>
              {selectedSimulacion ? `Resultados para ${selectedSimulacion.cliente.nombres}` : "Seleccione una simulación para ver los detalles"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {selectedSimulacion ? (
              <div className="space-y-6">
                <div className="flex flex-wrap justify-end gap-2">
                  <Button variant="outline" size="sm" onClick={handleExportToExcel}><FileTextIcon className="mr-2 h-4 w-4" />Excel</Button>
                  <Button variant="outline" size="sm" onClick={handleExportToPDF}><FileDownIcon className="mr-2 h-4 w-4" />PDF</Button>
                  <Button variant="outline" size="sm" onClick={() => onEditSimulacion(selectedSimulacion)}><PencilIcon className="mr-2 h-4 w-4" />Editar</Button>
                </div>

                <div ref={contentRef} className="p-4 bg-background">
                  <Card>
                    <CardHeader><CardTitle>Resultados Clave</CardTitle></CardHeader>
                    <CardContent className="grid grid-cols-2 lg:grid-cols-4 gap-4 text-center">
                      <div className="p-4 bg-muted rounded-lg flex flex-col justify-center"><p className="text-sm text-muted-foreground">Cuota Promedio</p><p className="text-xl font-bold truncate">{formatCurrency(selectedSimulacion.cuotaMensual, selectedSimulacion.moneda)}</p></div>
                      <div className="p-4 bg-muted rounded-lg flex flex-col justify-center"><p className="text-sm text-muted-foreground">TCEA</p><p className="text-xl font-bold">{formatPercentage(selectedSimulacion.tcea)}</p></div>
                      <div className="p-4 bg-muted rounded-lg flex flex-col justify-center"><p className="text-sm text-muted-foreground">TIR (Anual)</p><p className="text-xl font-bold">{formatPercentage(selectedSimulacion.tir)}</p></div>
                      <div className="p-4 bg-muted rounded-lg flex flex-col justify-center"><p className="text-sm text-muted-foreground">VAN</p><p className="text-xl font-bold truncate">{formatCurrency(selectedSimulacion.van, selectedSimulacion.moneda)}</p></div>
                    </CardContent>
                  </Card>

                  <Card className="mt-6">
                    <CardHeader><CardTitle>Parámetros de la Simulación</CardTitle></CardHeader>
                    <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-3 text-sm">
                      <p><strong>Cliente:</strong> {selectedSimulacion.cliente.nombres} {selectedSimulacion.cliente.apellidos}</p>
                      <p><strong>Inmueble:</strong> {selectedSimulacion.inmueble.nombreProyecto}</p>
                      <p><strong>Valor Inmueble:</strong> {formatCurrency(selectedSimulacion.valorInmueble, selectedSimulacion.moneda)}</p>
                      <p><strong>Monto Préstamo:</strong> {formatCurrency(selectedSimulacion.montoPrestamo, selectedSimulacion.moneda)}</p>
                      <p><strong>Plazo:</strong> {selectedSimulacion.plazoAnios} años</p>
                      <p><strong>Tasa de Interés:</strong> {formatPercentage(selectedSimulacion.tasaInteresAnual)} ({selectedSimulacion.tipoTasa})</p>
                      {selectedSimulacion.tipoTasa === 'Nominal' && <p><strong>Capitalización:</strong> {selectedSimulacion.capitalizacion}</p>}
                      <p><strong>Seguro Desgravamen:</strong> {formatPercentage(selectedSimulacion.seguroDesgravamen)} (mensual)</p>
                      <p><strong>Seguro Inmueble:</strong> {formatPercentage(selectedSimulacion.seguroInmueble)} (anual)</p>
                      <p><strong>Gracia Total:</strong> {selectedSimulacion.periodoGraciaTotalMeses} meses</p>
                      <p><strong>Gracia Parcial:</strong> {selectedSimulacion.periodoGraciaParcialMeses} meses</p>
                      <p><strong>Aplica Bono:</strong> {selectedSimulacion.aplicaBonoTechoPropio ? 'Sí' : 'No'}</p>
                      {selectedSimulacion.aplicaBonoTechoPropio && <p><strong>Valor Bono:</strong> {formatCurrency(selectedSimulacion.valorBono, selectedSimulacion.moneda)}</p>}
                    </CardContent>
                  </Card>

                  <Card className="mt-6">
                    <CardHeader><CardTitle>Plan de Pagos (Primeras 12 cuotas)</CardTitle></CardHeader>
                    <CardContent className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead><tr className="text-left text-muted-foreground">
                          <th className="p-2">#</th><th className="p-2">Cuota</th><th className="p-2">Interés</th><th className="p-2">Amortización</th><th className="p-2">Seguros</th><th className="p-2">Saldo Final</th>
                        </tr></thead>
                        <tbody>
                          {selectedSimulacion.planDePagos.slice(0, 12).map((p: any) => (
                            <tr key={p.numeroCuota} className="border-b">
                              <td className="p-2">{p.numeroCuota}</td>
                              <td className="p-2">{formatCurrency(p.cuota, selectedSimulacion.moneda)}</td>
                              <td className="p-2">{formatCurrency(p.interes, selectedSimulacion.moneda)}</td>
                              <td className="p-2">{formatCurrency(p.amortizacion, selectedSimulacion.moneda)}</td>
                              <td className="p-2">{formatCurrency(p.seguroDesgravamen + p.seguroInmueble, selectedSimulacion.moneda)}</td>
                              <td className="p-2">{formatCurrency(p.saldoFinal, selectedSimulacion.moneda)}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </CardContent>
                  </Card>
                </div>
              </div>
            ) : <p>No hay detalles para mostrar.</p>}
          </CardContent>
        </Card>
      </div>

      <Dialog open={isPlanModalOpen} onOpenChange={setIsPlanModalOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] flex flex-col">
          <DialogHeader>
            <DialogTitle>Plan de Pagos Completo</DialogTitle>
            <DialogDescription>
              Detalle de todas las cuotas para la simulación de {selectedSimulacion?.cliente.nombres} {selectedSimulacion?.cliente.apellidos}.
            </DialogDescription>
          </DialogHeader>
          <div className="overflow-y-auto flex-grow">
            <table className="w-full text-sm table-fixed">
              <thead>
                <tr className="text-left text-muted-foreground">
                  <th className="p-2 w-1/12">#</th><th className="p-2 w-2/12">Cuota</th><th className="p-2 w-2/12">Interés</th><th className="p-2 w-2/12">Amortización</th><th className="p-2 w-2/12">Seguros</th><th className="p-2 w-3/12">Saldo Final</th>
                </tr>
              </thead>
              <tbody>
                {selectedSimulacion?.planDePagos.map((p: any) => (
                  <tr key={p.numeroCuota} className="border-b">
                    <td className="p-2">{p.numeroCuota}</td>
                    <td className="p-2">{formatCurrency(p.cuota, selectedSimulacion.moneda)}</td>
                    <td className="p-2">{formatCurrency(p.interes, selectedSimulacion.moneda)}</td>
                    <td className="p-2">{formatCurrency(p.amortizacion, selectedSimulacion.moneda)}</td>
                    <td className="p-2">{formatCurrency(p.seguroDesgravamen + p.seguroInmueble, selectedSimulacion.moneda)}</td>
                    <td className="p-2">{formatCurrency(p.saldoFinal, selectedSimulacion.moneda)}</td>
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
