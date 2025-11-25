import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../ui/card";
import { Button } from "../ui/button";
import { ListFilterIcon, FileTextIcon, BarChartIcon } from "lucide-react";

export function Reportes() {
  const handleGenerateReport = (reportType: string) => {
    alert(`Generando reporte: ${reportType} (funcionalidad en desarrollo)`);
    // Aquí iría la lógica para generar el reporte real
  };

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
            <Button className="w-full" onClick={() => handleGenerateReport('Simulaciones')}>
              <ListFilterIcon className="mr-2 h-4 w-4" /> Generar Reporte
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
            <Button className="w-full" onClick={() => handleGenerateReport('Clientes')}>
              <ListFilterIcon className="mr-2 h-4 w-4" /> Generar Reporte
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
            <Button className="w-full" onClick={() => handleGenerateReport('Inmuebles')}>
              <ListFilterIcon className="mr-2 h-4 w-4" /> Generar Reporte
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}