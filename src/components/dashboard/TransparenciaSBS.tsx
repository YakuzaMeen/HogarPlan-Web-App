import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../ui/table";
import { ShieldCheckIcon } from "lucide-react";

export function TransparenciaSBS() {
  const tasasReferenciales = [
    { entidad: "Banco A", producto: "Crédito Hipotecario MiVivienda", tea: "8.50%", tcea: "9.80%", comisiones: "S/ 150", seguros: "0.03%" },
    { entidad: "Banco B", producto: "Crédito Hipotecario Tradicional", tea: "9.00%", tcea: "10.20%", comisiones: "S/ 180", seguros: "0.04%" },
    { entidad: "Banco C", producto: "Crédito Hipotecario Verde", tea: "8.20%", tcea: "9.50%", comisiones: "S/ 120", seguros: "0.035%" },
  ];

  const comisionesGastos = [
    { concepto: "Comisión de Desembolso", monto: "S/ 100.00", frecuencia: "Única" },
    { concepto: "Gastos de Tasación", monto: "S/ 350.00", frecuencia: "Única" },
    { concepto: "Gastos Notariales", monto: "Variable", frecuencia: "Única" },
    { concepto: "Mantenimiento de Cuenta", monto: "S/ 10.00", frecuencia: "Mensual" },
  ];

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Transparencia SBS</h2>
      <p className="text-muted-foreground">
        Información referencial sobre tasas, comisiones y gastos de productos hipotecarios,
        simulando datos de la Superintendencia de Banca, Seguros y AFP (SBS).
      </p>

      <Card>
        <CardHeader>
          <CardTitle>Tasas de Interés Referenciales (TEA y TCEA)</CardTitle>
          <CardDescription>Tasas promedio de productos hipotecarios en el mercado.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Entidad Financiera</TableHead>
                <TableHead>Producto</TableHead>
                <TableHead>TEA</TableHead>
                <TableHead>TCEA</TableHead>
                <TableHead>Comisiones</TableHead>
                <TableHead>Seguros</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {tasasReferenciales.map((tasa, index) => (
                <TableRow key={index}>
                  <TableCell className="font-medium">{tasa.entidad}</TableCell>
                  <TableCell>{tasa.producto}</TableCell>
                  <TableCell>{tasa.tea}</TableCell>
                  <TableCell>{tasa.tcea}</TableCell>
                  <TableCell>{tasa.comisiones}</TableCell>
                  <TableCell>{tasa.seguros}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Comisiones y Gastos Asociados</CardTitle>
          <CardDescription>Detalle de los costos adicionales en créditos hipotecarios.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Concepto</TableHead>
                <TableHead>Monto Referencial</TableHead>
                <TableHead>Frecuencia</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {comisionesGastos.map((item, index) => (
                <TableRow key={index}>
                  <TableCell className="font-medium">{item.concepto}</TableCell>
                  <TableCell>{item.monto}</TableCell>
                  <TableCell>{item.frecuencia}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Bono del Buen Pagador (BBP) y Techo Propio</CardTitle>
          <CardDescription>Información sobre los subsidios del Estado.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-2">
          <p>
            El **Bono del Buen Pagador (BBP)** es una ayuda económica que otorga el Estado a las familias que acceden a un Crédito MIVIVIENDA, siempre que cumplan con las condiciones establecidas. Este bono no se devuelve y reduce el monto a financiar.
          </p>
          <p>
            El programa **Techo Propio** está dirigido a familias de bajos recursos que desean comprar, construir o mejorar su vivienda. Ofrece un Bono Familiar Habitacional (BFH) que, al igual que el BBP, no se devuelve.
          </p>
          <p className="text-sm text-muted-foreground">
            *La información aquí mostrada es referencial y debe ser validada con la entidad financiera y la normativa vigente de la SBS y el Fondo MiVivienda.*
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
