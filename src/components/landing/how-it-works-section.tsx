import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { 
  UserIcon, 
  CalculatorIcon, 
  BarChart3Icon, 
  DownloadIcon,
  ArrowRightIcon 
} from "lucide-react";

const steps = [
  {
    step: "01",
    icon: UserIcon,
    title: "Registra tus datos",
    description: "Crea tu cuenta y completa el onboarding de 3 pasos: datos personales, objetivo de crédito y tour del dashboard.",
    time: "2 min"
  },
  {
    step: "02",
    icon: CalculatorIcon,
    title: "Simula tu crédito",
    description: "Ingresa valor del inmueble, cuota inicial, plazo, moneda, tasa y configuraciones. La plataforma calcula automáticamente.",
    time: "5 min"
  },
  {
    step: "03",
    icon: BarChart3Icon,
    title: "Analiza resultados",
    description: "Revisa cronograma detallado, KPIs financieros, VAN, TIR y compara diferentes escenarios lado a lado.",
    time: "10 min"
  },
  {
    step: "04",
    icon: DownloadIcon,
    title: "Exporta reportes",
    description: "Descarga hoja resumen SBS, cronogramas y comparaciones en PDF o Excel para presentar a entidades financieras.",
    time: "1 min"
  }
];

export function HowItWorksSection() {
  return (
    <section id="how-it-works" className="py-24">
      <div className="container">
        <div className="text-center space-y-4 mb-16">
          <Badge variant="secondary" className="w-fit mx-auto">
            Proceso simple
          </Badge>
          <h2 className="text-3xl md:text-4xl">
            Cómo funciona HogarPlan
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            En solo 4 pasos tendrás una simulación completa y profesional 
            de tu crédito hipotecario.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {steps.map((step, index) => (
            <div key={index} className="relative">
              <Card className="h-full">
                <CardHeader className="text-center space-y-4">
                  <div className="relative mx-auto">
                    <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
                      <step.icon className="h-8 w-8 text-primary" />
                    </div>
                    <Badge className="absolute -top-2 -right-2 h-6 w-12 justify-center text-xs">
                      {step.step}
                    </Badge>
                  </div>
                  <CardTitle className="text-lg">{step.title}</CardTitle>
                  <Badge variant="outline" className="w-fit mx-auto">
                    {step.time}
                  </Badge>
                </CardHeader>
                <CardContent className="text-center">
                  <p className="text-muted-foreground">{step.description}</p>
                </CardContent>
              </Card>
              
              {/* Arrow connector */}
              {index < steps.length - 1 && (
                <div className="hidden lg:block absolute top-1/2 -right-4 z-10">
                  <ArrowRightIcon className="h-6 w-6 text-muted-foreground" />
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="text-center mt-12">
          <Button size="lg" className="text-lg px-8">
            Empezar ahora gratis
            <ArrowRightIcon className="ml-2 h-5 w-5" />
          </Button>
        </div>
      </div>
    </section>
  );
}