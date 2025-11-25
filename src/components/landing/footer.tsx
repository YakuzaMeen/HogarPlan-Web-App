import { Button } from "../ui/button";
import { Separator } from "../ui/separator";
import { 
  FacebookIcon, 
  TwitterIcon, 
  LinkedinIcon, 
  MailIcon,
  PhoneIcon,
  MapPinIcon 
} from "lucide-react";

const footerLinks = {
  product: {
    title: "Producto",
    links: [
      { label: "Características", href: "#features" },
      { label: "Cómo funciona", href: "#how-it-works" },
      { label: "Transparencia SBS", href: "#transparency" },
      { label: "Precios", href: "#pricing" },
      { label: "API", href: "#api" }
    ]
  },
  company: {
    title: "Empresa",
    links: [
      { label: "Sobre nosotros", href: "#about" },
      { label: "Blog", href: "#blog" },
      { label: "Carreras", href: "#careers" },
      { label: "Prensa", href: "#press" },
      { label: "Contacto", href: "#contact" }
    ]
  },
  support: {
    title: "Soporte",
    links: [
      { label: "Centro de ayuda", href: "#help" },
      { label: "Documentación", href: "#docs" },
      { label: "Tutoriales", href: "#tutorials" },
      { label: "Comunidad", href: "#community" },
      { label: "Estado del servicio", href: "#status" }
    ]
  },
  legal: {
    title: "Legal",
    links: [
      { label: "Términos de uso", href: "#terms" },
      { label: "Política de privacidad", href: "#privacy" },
      { label: "Cookie policy", href: "#cookies" },
      { label: "Licencias", href: "#licenses" },
      { label: "SBS Compliance", href: "#compliance" }
    ]
  }
};

export function Footer() {
  return (
    <footer className="bg-background border-t">
      <div className="container py-16">
        <div className="grid lg:grid-cols-5 gap-8">
          {/* Logo and description */}
          <div className="lg:col-span-2 space-y-6">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
                <span className="text-primary-foreground font-medium">HP</span>
              </div>
              <span className="font-medium text-xl">HogarPlan</span>
            </div>
            <p className="text-muted-foreground max-w-md">
              La plataforma más completa para evaluar créditos hipotecarios en Perú. 
              Transparencia total según normas SBS.
            </p>
            <div className="space-y-3">
              <div className="flex items-center gap-3 text-muted-foreground">
                <MailIcon className="h-4 w-4" />
                <span>contacto@hogarplan.pe</span>
              </div>
              <div className="flex items-center gap-3 text-muted-foreground">
                <PhoneIcon className="h-4 w-4" />
                <span>+51 1 234-5678</span>
              </div>
              <div className="flex items-center gap-3 text-muted-foreground">
                <MapPinIcon className="h-4 w-4" />
                <span>Lima, Perú</span>
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" className="h-9 w-9 p-0">
                <FacebookIcon className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="sm" className="h-9 w-9 p-0">
                <TwitterIcon className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="sm" className="h-9 w-9 p-0">
                <LinkedinIcon className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Footer links */}
          {Object.entries(footerLinks).map(([key, section]) => (
            <div key={key} className="space-y-4">
              <h4 className="font-medium">{section.title}</h4>
              <ul className="space-y-3">
                {section.links.map((link, index) => (
                  <li key={index}>
                    <a 
                      href={link.href}
                      className="text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <Separator className="my-8" />

        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-muted-foreground text-sm">
            © 2025 HogarPlan. Todos los derechos reservados.
          </p>
          <div className="flex items-center gap-6 text-sm text-muted-foreground">
            <span>Certificado por SBS</span>
            <span>ISO 27001</span>
            <span>SSL Seguro</span>
          </div>
        </div>
      </div>
    </footer>
  );
}