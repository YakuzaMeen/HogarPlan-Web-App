import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { Progress } from "../ui/progress";
import { 
  TrendingUpIcon, 
  TrendingDownIcon, 
  CalculatorIcon, 
  DollarSignIcon,
  ClockIcon,
  PlusIcon,
  EyeIcon,
  MoreHorizontalIcon,
  ArrowUpIcon,
  ArrowDownIcon
} from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';

// Mock data for charts
const saldoInsolutoData = [
  { mes: "Ene", saldo: 280000 },
  { mes: "Feb", saldo: 276500 },
  { mes: "Mar", saldo: 273000 },
  { mes: "Abr", saldo: 269400 },
  { mes: "May", saldo: 265700 },
  { mes: "Jun", saldo: 262000 },
  { mes: "Jul", saldo: 258200 },
  { mes: "Ago", saldo: 254300 },
  { mes: "Sep", saldo: 250400 },
  { mes: "Oct", saldo: 246400 },
  { mes: "Nov", saldo: 242300 },
  { mes: "Dic", saldo: 238200 }
];

const cuotaDesgloseData = [
  { mes: "Ene", interes: 2100, amortizacion: 750 },
  { mes: "Feb", interes: 2076, amortizacion: 774 },
  { mes: "Mar", interes: 2052, amortizacion: 798 },
  { mes: "Abr", interes: 2027, amortizacion: 823 },
  { mes: "May", interes: 2002, amortizacion: 848 },
  { mes: "Jun", interes: 1977, amortizacion: 873 }
];

const recentSimulations = [
  {
    id: 1,
    title: "Casa Los Olivos",
    amount: "S/ 350,000",
    tcea: "9.8%",
    cuota: "S/ 2,850",
    status: "completada",
    date: "2025-01-05",
    currency: "PEN"
  },
  {
    id: 2,
    title: "Dpto. San Isidro",
    amount: "US$ 120,000",
    tcea: "8.5%",
    cuota: "US$ 980",
    status: "borrador",
    date: "2025-01-04",
    currency: "USD"
  },
  {
    id: 3,
    title: "Casa Surco",
    amount: "S/ 420,000",
    tcea: "10.2%",
    cuota: "S/ 3,450",
    status: "compartida",
    date: "2025-01-03",
    currency: "PEN"
  },
  {
    id: 4,
    title: "Dpto. Miraflores",
    amount: "US$ 180,000",
    tcea: "8.9%",
    cuota: "US$ 1,470",
    status: "completada",
    date: "2025-01-02",
    currency: "USD"
  }
];

export function DashboardOverview() {
  return (
    <div className="space-y-8">
      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Cuota Estimada</CardTitle>
            <DollarSignIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl">S/ 2,850</div>
            <p className="text-xs text-muted-foreground">
              <span className="inline-flex items-center text-green-600">
                <ArrowDownIcon className="h-3 w-3 mr-1" />
                12% vs mes anterior
              </span>
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">TCEA Promedio</CardTitle>
            <TrendingUpIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl">9.8%</div>
            <p className="text-xs text-muted-foreground">
              <span className="inline-flex items-center text-red-600">
                <ArrowUpIcon className="h-3 w-3 mr-1" />
                0.3% vs mes anterior
              </span>
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Costo Total</CardTitle>
            <CalculatorIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl">S/ 513,000</div>
            <p className="text-xs text-muted-foreground">
              Incluyendo seguros y comisiones
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Plazo Promedio</CardTitle>
            <ClockIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl">15 años</div>
            <p className="text-xs text-muted-foreground">
              180 cuotas mensuales
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts Section */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Saldo Insoluto Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Evolución del Saldo Insoluto</CardTitle>
            <CardDescription>
              Proyección de disminución del saldo durante el primer año
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={saldoInsolutoData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="mes" />
                <YAxis />
                <Tooltip 
                  formatter={(value) => [`S/ ${value?.toLocaleString()}`, 'Saldo']}
                />
                <Line 
                  type="monotone" 
                  dataKey="saldo" 
                  stroke="hsl(var(--primary))" 
                  strokeWidth={2}
                  dot={{ fill: "hsl(var(--primary))" }}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Cuota Desglose Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Composición de Cuotas</CardTitle>
            <CardDescription>
              Distribución de interés vs amortización en los primeros meses
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={cuotaDesgloseData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="mes" />
                <YAxis />
                <Tooltip 
                  formatter={(value, name) => [
                    `S/ ${value}`, 
                    name === 'interes' ? 'Interés' : 'Amortización'
                  ]}
                />
                <Bar dataKey="interes" stackId="cuota" fill="hsl(var(--chart-1))" />
                <Bar dataKey="amortizacion" stackId="cuota" fill="hsl(var(--chart-2))" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Recent Simulations */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Simulaciones Recientes</CardTitle>
            <CardDescription>
              Últimas simulaciones creadas y su estado actual
            </CardDescription>
          </div>
          <Button>
            <PlusIcon className="mr-2 h-4 w-4" />
            Nueva Simulación
          </Button>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recentSimulations.map((simulation) => (
              <div key={simulation.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center space-x-4">
                  <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    <CalculatorIcon className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-medium">{simulation.title}</h4>
                      <Badge 
                        variant={
                          simulation.status === 'completada' ? 'default' : 
                          simulation.status === 'borrador' ? 'secondary' : 
                          'outline'
                        }
                        className="text-xs"
                      >
                        {simulation.status}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span>{simulation.amount}</span>
                      <span>TCEA: {simulation.tcea}</span>
                      <span>Cuota: {simulation.cuota}</span>
                      <span>{new Date(simulation.date).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <Button variant="ghost" size="sm">
                    <EyeIcon className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="sm">
                    <MoreHorizontalIcon className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
          
          <div className="text-center pt-4">
            <Button variant="outline">Ver todas las simulaciones</Button>
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <div className="grid md:grid-cols-3 gap-6">
        <Card className="cursor-pointer hover:shadow-md transition-shadow">
          <CardContent className="p-6 text-center">
            <PlusIcon className="h-12 w-12 mx-auto mb-4 text-primary" />
            <h3 className="font-medium mb-2">Nueva Simulación</h3>
            <p className="text-sm text-muted-foreground">
              Crear una nueva simulación de crédito hipotecario
            </p>
          </CardContent>
        </Card>

        <Card className="cursor-pointer hover:shadow-md transition-shadow">
          <CardContent className="p-6 text-center">
            <TrendingUpIcon className="h-12 w-12 mx-auto mb-4 text-primary" />
            <h3 className="font-medium mb-2">Comparar Simulaciones</h3>
            <p className="text-sm text-muted-foreground">
              Comparar diferentes escenarios lado a lado
            </p>
          </CardContent>
        </Card>

        <Card className="cursor-pointer hover:shadow-md transition-shadow">
          <CardContent className="p-6 text-center">
            <CalculatorIcon className="h-12 w-12 mx-auto mb-4 text-primary" />
            <h3 className="font-medium mb-2">Generar Reporte</h3>
            <p className="text-sm text-muted-foreground">
              Exportar cronogramas y hojas resumen
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}