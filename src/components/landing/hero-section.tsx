import { Button } from "../ui/button";
import { Card } from "../ui/card";
import { Badge } from "../ui/badge";
import { ImageWithFallback } from "../figma/ImageWithFallback";
import { 
  CalculatorIcon, 
  ShieldCheckIcon, 
  TrendingUpIcon, 
  FileTextIcon,
  ArrowRightIcon 
} from "lucide-react";

export function HeroSection() {
  return (
    <section className="relative py-24 md:py-32 overflow-hidden">
      <div className="container relative">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left content */}
          <div className="space-y-8">
            <div className="space-y-4">
              <Badge variant="secondary" className="w-fit">
                Certificado SBS - Transparencia Total
              </Badge>
              <h1 className="text-4xl md:text-6xl leading-tight">
                Simula y compara tu 
                <span className="text-primary"> crédito hipotecario</span>
              </h1>
              <p className="text-xl text-muted-foreground leading-relaxed">
                La plataforma más completa para evaluar créditos hipotecarios en Perú. 
                Calcula cuotas, TCEA, VAN y TIR con transparencia total según normas SBS.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <Button size="lg" className="text-lg px-8">
                Empezar simulación
                <ArrowRightIcon className="ml-2 h-5 w-5" />
              </Button>
              <Button variant="outline" size="lg" className="text-lg px-8">
                Ver demo
              </Button>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Card className="p-4 text-center">
                <CalculatorIcon className="h-6 w-6 mx-auto mb-2 text-primary" />
                <p className="text-sm">Método Francés</p>
              </Card>
              <Card className="p-4 text-center">
                <ShieldCheckIcon className="h-6 w-6 mx-auto mb-2 text-primary" />
                <p className="text-sm">BBP Incluido</p>
              </Card>
              <Card className="p-4 text-center">
                <TrendingUpIcon className="h-6 w-6 mx-auto mb-2 text-primary" />
                <p className="text-sm">VAN y TIR</p>
              </Card>
              <Card className="p-4 text-center">
                <FileTextIcon className="h-6 w-6 mx-auto mb-2 text-primary" />
                <p className="text-sm">Exportar PDF</p>
              </Card>
            </div>
          </div>

          {/* Right content - Hero image */}
          <div className="relative">
            <div className="relative rounded-2xl overflow-hidden shadow-2xl">
              <ImageWithFallback
                src="https://images.unsplash.com/photo-1634757439914-23b8acb9d411?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtb2Rlcm4lMjBob3VzZSUyMGhvbWUlMjBmaW5hbmNlfGVufDF8fHx8MTc1OTgxMjM0M3ww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
                alt="Casa moderna representando finanzas del hogar"
                className="w-full h-[500px] object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
            </div>

            {/* Floating KPI card */}
            <Card className="absolute -bottom-6 -left-6 p-6 bg-background/95 backdrop-blur shadow-xl border">
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">Cuota estimada</p>
                <p className="text-2xl">S/ 2,850</p>
                <p className="text-sm text-green-600">TCEA: 9.8%</p>
              </div>
            </Card>

            {/* Floating comparison card */}
            <Card className="absolute -top-6 -right-6 p-4 bg-background/95 backdrop-blur shadow-xl border">
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">Ahorro vs banca tradicional</p>
                <p className="text-lg text-green-600">-S/ 45,000</p>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </section>
  );
}