import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { 
  ShieldCheckIcon, 
  FileTextIcon, 
  EyeIcon, 
  DownloadIcon,
  CheckIcon 
} from "lucide-react";

const transparencyFeatures = [
  "Tasas de interés claramente especificadas (TEA/TNA)",
  "Desglose completo de comisiones y seguros",
  "Cálculo exacto de TCEA según normas SBS",
  "Cronograma detallado con fechas y montos",
  "Información sobre penalidades por prepago",
  "Derechos y obligaciones del deudor",
  "Comparación objetiva de productos financieros",
  "Exportación en formatos estándar (PDF/Excel)"
];

export function TransparencySection() {
  return (
    <section id="transparency" className="py-24 bg-muted/30">
      <div className="container">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left content */}
          <div className="space-y-8">
            <div className="space-y-4">
              <Badge variant="secondary" className="w-fit">
                Certificación SBS
              </Badge>
              <h2 className="text-3xl md:text-4xl">
                Transparencia total según normas de la 
                <span className="text-primary"> Superintendencia de Banca</span>
              </h2>
              <p className="text-xl text-muted-foreground">
                HogarPlan cumple con todas las normativas de transparencia financiera, 
                proporcionando información clara y completa sobre costos, tasas y condiciones.
              </p>
            </div>

            <div className="grid gap-3">
              {transparencyFeatures.map((feature, index) => (
                <div key={index} className="flex items-center gap-3">
                  <div className="h-5 w-5 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center flex-shrink-0">
                    <CheckIcon className="h-3 w-3 text-green-600 dark:text-green-400" />
                  </div>
                  <p className="text-muted-foreground">{feature}</p>
                </div>
              ))}
            </div>

            <Button size="lg" className="w-fit">
              Ver ejemplo de hoja resumen
              <EyeIcon className="ml-2 h-5 w-5" />
            </Button>
          </div>

          {/* Right content - Cards */}
          <div className="space-y-6">
            <Card>
              <CardHeader className="flex flex-row items-center space-y-0 pb-4">
                <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mr-4">
                  <ShieldCheckIcon className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <CardTitle>Certificación SBS</CardTitle>
                  <p className="text-muted-foreground">Normativa de transparencia</p>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Todos nuestros cálculos y reportes cumplen con las normas de 
                  transparencia establecidas por la Superintendencia de Banca, 
                  Seguros y AFP del Perú.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center space-y-0 pb-4">
                <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mr-4">
                  <FileTextIcon className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <CardTitle>Hoja Resumen Digital</CardTitle>
                  <p className="text-muted-foreground">Formato estándar exportable</p>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">
                  Genera hojas resumen en formato digital que puedes presentar 
                  directamente a las entidades financieras.
                </p>
                <Button variant="outline" size="sm">
                  <DownloadIcon className="mr-2 h-4 w-4" />
                  Descargar ejemplo
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center space-y-0 pb-4">
                <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mr-4">
                  <EyeIcon className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <CardTitle>Información Clara</CardTitle>
                  <p className="text-muted-foreground">Sin letra pequeña</p>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Todos los costos, tasas, comisiones y condiciones se muestran 
                  de forma clara y entendible, sin sorpresas ni letra pequeña.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </section>
  );
}