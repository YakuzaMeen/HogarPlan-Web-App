import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Badge } from "../ui/badge";
import { 
  CalculatorIcon, 
  ShieldIcon, 
  TrendingUpIcon, 
  FileTextIcon,
  ScaleIcon,
  ClockIcon,
  DollarSignIcon,
  CheckCircleIcon 
} from "lucide-react";

const features = [
  {
    icon: CalculatorIcon,
    title: "Simulación Completa",
    description: "Método Francés con TEA/TNA, TCEA, períodos de gracia total y parcial, seguros y comisiones incluidos.",
    badge: "Método Francés"
  },
  {
    icon: ShieldIcon,
    title: "Transparencia SBS",
    description: "Cumple normas de transparencia de la Superintendencia de Banca. Hoja resumen digital exportable.",
    badge: "Certificado SBS"
  },
  {
    icon: TrendingUpIcon,
    title: "VAN y TIR",
    description: "Calcula el Valor Actual Neto y Tasa Interna de Retorno para evaluar la rentabilidad de tu inversión.",
    badge: "Análisis Financiero"
  },
  {
    icon: FileTextIcon,
    title: "Reportes Profesionales",
    description: "Exporta cronogramas detallados, comparaciones y hojas resumen en PDF y Excel.",
    badge: "PDF/Excel"
  },
  {
    icon: ScaleIcon,
    title: "Comparación de Escenarios",
    description: "Compara hasta 3 simulaciones lado a lado para encontrar la mejor opción financiera.",
    badge: "Comparar"
  },
  {
    icon: ClockIcon,
    title: "Períodos de Gracia",
    description: "Simula períodos de gracia total y parcial con impacto real en cuotas y cronograma.",
    badge: "Gracia"
  },
  {
    icon: DollarSignIcon,
    title: "Bono del Buen Pagador",
    description: "Incluye automáticamente el BBP para MiVivienda y evalúa alternativas como Techo Propio.",
    badge: "BBP"
  },
  {
    icon: CheckCircleIcon,
    title: "Simulación de Prepagos",
    description: "Evalúa el impacto de prepagos totales o parciales con opciones de reducir cuota o plazo.",
    badge: "Prepagos"
  }
];

export function FeaturesSection() {
  return (
    <section id="features" className="py-24 bg-muted/30">
      <div className="container">
        <div className="text-center space-y-4 mb-16">
          <Badge variant="secondary" className="w-fit mx-auto">
            Características principales
          </Badge>
          <h2 className="text-3xl md:text-4xl">
            Todo lo que necesitas para evaluar tu crédito hipotecario
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Herramientas profesionales para simular, comparar y gestionar créditos hipotecarios 
            con la transparencia que exige la SBS.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {features.map((feature, index) => (
            <Card key={index} className="h-full">
              <CardHeader className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
                    <feature.icon className="h-6 w-6 text-primary" />
                  </div>
                  <Badge variant="outline" className="text-xs">
                    {feature.badge}
                  </Badge>
                </div>
                <CardTitle className="text-lg">{feature.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">{feature.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}