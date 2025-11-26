import { useState, useEffect, useRef } from 'react'; // Importar useRef
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../ui/card";
import { Button } from "../ui/button";
import { ListFilterIcon, FileTextIcon, BarChartIcon, BuildingIcon, FileDownIcon } from "lucide-react"; // Importar FileDownIcon
import { SimulacionType } from '../../App';
import html2pdf from 'html2pdf.js'; // Importar html2pdf

type Cliente = { _id: string; nombres: string; apellidos: string; tipoDocumento: string; numeroDocumento: string; email: string; ingresoMensual: number; };
type Inmueble = { _id: string; nombreProyecto: string; tipoInmueble: string; direccion: string; valor: number; moneda: string; areaMetrosCuadrados: number; };

export function Reportes() {
  const [simulaciones, setSimulaciones] = useState<SimulacionType[]>([]);
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [inmuebles, setInmuebles] = useState<Inmueble[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [reportType, setReportType] = useState<'simulaciones' | 'clientes' | 'inmuebles' | null>(null);

  // Referencias para el contenido de cada reporte
  const simulacionesReportRef = useRef<HTMLDivElement>(null);
  const clientesReportRef = useRef<HTMLDivElement>(null);
  const inmueblesReportRef = useRef<HTMLDivElement>(null);

  const fetchData = async (endpoint: string) => {
    setIsLoading(true);
    const token = sessionStorage.getItem('token');
    try {
      const response = await fetch(`http://localhost:3001/api/${endpoint}`, {
        headers: { 'x-auth-token': token || '' },
      });
      if (!response.ok) throw new Error(`Error al cargar ${endpoint} para el reporte`);
      const data = await response.json();
      return Array.isArray(data) ? data : [];
    } catch (error) {
      console.error(`Error fetching ${endpoint} for report:`, error);
      return [];
    } finally {
      setIsLoading(false);
    }
  };

  const handleGenerateReport = async (type: 'simulaciones' | 'clientes' | 'inmuebles') => {
    setReportType(type);
    if (type === 'simulaciones') {
      setSimulaciones(await fetchData('simulaciones'));
    } else if (type === 'clientes') {
      setClientes(await fetchData('clientes'));
    } else if (type === 'inmuebles') {
      setInmuebles(await fetchData('inmuebles'));
    }
  };

  const handleExportToPDF = (reportName: string, contentRef: React.RefObject<HTMLDivElement>) => {
    if (!contentRef.current) return;

    const element = contentRef.current;
    const opt = {
      margin:       0.5,
      filename:     `${reportName}_${new Date().toLocaleDateString()}.pdf`,
      image:        { type: 'jpeg', quality: 0.98 },
      html2canvas:  { scale: 2, logging: true, dpi: 192, letterRendering: true },
      jsPDF:        { unit: 'in', format: 'letter', orientation: 'portrait' }
    };

    html2pdf().set(opt).from(element).save();
  };

  const formatCurrency = (value: number, currency: string) => 
    new Intl.NumberFormat('es-PE', { style: 'currency', currency: currency === 'Soles' ? 'PEN' : 'USD' }).format(value);
  
  const formatPercentage = (value: number) => `${value.toFixed(2)}%`;

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Generación de Reportes</h2>
      <p className="text-muted-foreground">Selecciona el tipo de reporte que deseas generar.</p>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <FileTextIcon className="h-8 w-8 text-primary mb-2" />
            <CardTitle>Reporte de Simulaciones</CardTitle>
            <CardDescription>Genera un listado detallado de todas las simulaciones realizadas.</CardDescription>
          </CardHeader>
          <CardContent>
            <Button className="w-full" onClick={() => handleGenerateReport('simulaciones')} disabled={isLoading}>
              <ListFilterIcon className="mr-2 h-4 w-4" /> {isLoading && reportType === 'simulaciones' ? 'Cargando...' : 'Generar Reporte'}
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <BarChartIcon className="h-8 w-8 text-primary mb-2" />
            <CardTitle>Reporte de Clientes</CardTitle>
            <CardDescription>Obtén un resumen de la información de tus clientes.</CardDescription>
          </CardHeader>
          <CardContent>
            <Button className="w-full" onClick={() => handleGenerateReport('clientes')} disabled={isLoading}>
              <ListFilterIcon className="mr-2 h-4 w-4" /> {isLoading && reportType === 'clientes' ? 'Cargando...' : 'Generar Reporte'}
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <BuildingIcon className="h-8 w-8 text-primary mb-2" />
            <CardTitle>Reporte de Inmuebles</CardTitle>
            <CardDescription>Visualiza un informe sobre los inmuebles registrados.</CardDescription>
          </CardHeader>
          <CardContent>
            <Button className="w-full" onClick={() => handleGenerateReport('inmuebles')} disabled={isLoading}>
              <ListFilterIcon className="mr-2 h-4 w-4" /> {isLoading && reportType === 'inmuebles' ? 'Cargando...' : 'Generar Reporte'}
            </Button>
          </CardContent>
        </Card>
      </div>

      {reportType === 'simulaciones' && simulaciones.length > 0 && (
        <Card className="mt-6">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle>Reporte de Simulaciones</CardTitle>
            <Button variant="outline" size="sm" onClick={() => handleExportToPDF('Reporte_Simulaciones', simulacionesReportRef)}>
              <FileDownIcon className="mr-2 h-4 w-4" /> Exportar a PDF
            </Button>
          </CardHeader>
          <CardContent>
            <div ref={simulacionesReportRef} className="p-4 bg-background"> {/* Contenido a exportar */}
              <CardDescription>Resumen de las simulaciones generadas.</CardDescription>
              <div className="overflow-x-auto mt-4">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-left text-muted-foreground">
                      <th>Cliente</th>
                      <th>Inmueble</th>
                      <th>Monto Préstamo</th>
                      <th>Plazo</th>
                      <th>Tasa Anual</th>
                      <th>Cuota Promedio</th>
                      <th>TCEA</th>
                    </tr>
                  </thead>
                  <tbody>
                    {simulaciones.map(sim => (
                      <tr key={sim._id} className="border-b">
                        <td className="py-2">{sim.cliente.nombres} {sim.cliente.apellidos}</td>
                        <td>{sim.inmueble.nombreProyecto}</td>
                        <td>{formatCurrency(sim.montoPrestamo, sim.moneda)}</td>
                        <td>{sim.plazoAnios} años</td>
                        <td>{formatPercentage(sim.tasaInteresAnual)} ({sim.tipoTasa})</td>
                        <td>{formatCurrency(sim.cuotaMensual, sim.moneda)}</td>
                        <td>{formatPercentage(sim.tcea)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {reportType === 'clientes' && clientes.length > 0 && (
        <Card className="mt-6">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle>Reporte de Clientes</CardTitle>
            <Button variant="outline" size="sm" onClick={() => handleExportToPDF('Reporte_Clientes', clientesReportRef)}>
              <FileDownIcon className="mr-2 h-4 w-4" /> Exportar a PDF
            </Button>
          </CardHeader>
          <CardContent>
            <div ref={clientesReportRef} className="p-4 bg-background"> {/* Contenido a exportar */}
              <CardDescription>Listado de clientes registrados.</CardDescription>
              <div className="overflow-x-auto mt-4">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-left text-muted-foreground">
                      <th>Nombres</th>
                      <th>Apellidos</th>
                      <th>Tipo Doc.</th>
                      <th>N° Doc.</th>
                      <th>Email</th>
                      <th>Ingreso Mensual</th>
                    </tr>
                  </thead>
                  <tbody>
                    {clientes.map(cliente => (
                      <tr key={cliente._id} className="border-b">
                        <td className="py-2">{cliente.nombres}</td>
                        <td>{cliente.apellidos}</td>
                        <td>{cliente.tipoDocumento}</td>
                        <td>{cliente.numeroDocumento}</td>
                        <td>{cliente.email}</td>
                        <td>{formatCurrency(cliente.ingresoMensual, 'PEN')}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {reportType === 'inmuebles' && inmuebles.length > 0 && (
        <Card className="mt-6">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle>Reporte de Inmuebles</CardTitle>
            <Button variant="outline" size="sm" onClick={() => handleExportToPDF('Reporte_Inmuebles', inmueblesReportRef)}>
              <FileDownIcon className="mr-2 h-4 w-4" /> Exportar a PDF
            </Button>
          </CardHeader>
          <CardContent>
            <div ref={inmueblesReportRef} className="p-4 bg-background"> {/* Contenido a exportar */}
              <CardDescription>Visualiza un informe sobre los inmuebles registrados.</CardDescription>
              <div className="overflow-x-auto mt-4">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-left text-muted-foreground">
                      <th>Proyecto</th>
                      <th>Tipo</th>
                      <th>Dirección</th>
                      <th>Valor</th>
                      <th>Área (m²)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {inmuebles.map(inmueble => (
                      <tr key={inmueble._id} className="border-b">
                        <td className="py-2">{inmueble.nombreProyecto}</td>
                        <td>{inmueble.tipoInmueble}</td>
                        <td>{inmueble.direccion}</td>
                        <td>{formatCurrency(inmueble.valor, inmueble.moneda)}</td>
                        <td>{inmueble.areaMetrosCuadrados}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {reportType && (simulaciones.length === 0 && clientes.length === 0 && inmuebles.length === 0) && !isLoading && (
        <p className="mt-4 text-muted-foreground">No hay datos para generar el reporte de {reportType}.</p>
      )}
    </div>
  );
}
