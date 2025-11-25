import { useState, useEffect } from 'react';
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { Switch } from '../ui/switch';
import { SimulacionType } from '../../App';

type Cliente = { _id: string; nombres: string; apellidos: string; };
type Inmueble = { _id: string; nombreProyecto: string; valor: number; moneda: string; };

interface NuevaSimulacionProps {
  onSimulacionCreated: (simulacion: SimulacionType) => void;
  simulacionToEdit: SimulacionType | null;
}

export function NuevaSimulacion({ onSimulacionCreated, simulacionToEdit }: NuevaSimulacionProps) {
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [inmuebles, setInmuebles] = useState<Inmueble[]>([]);
  
  const [selectedCliente, setSelectedCliente] = useState('');
  const [selectedInmueble, setSelectedInmueble] = useState('');
  
  const [montoPrestamo, setMontoPrestamo] = useState(150000);
  const [plazoAnios, setPlazoAnios] = useState(20);
  const [tipoTasa, setTipoTasa] = useState('Efectiva');
  const [tasaInteresAnual, setTasaInteresAnual] = useState(9.5);
  const [capitalizacion, setCapitalizacion] = useState('Mensual'); // Nuevo estado para capitalización
  const [seguroDesgravamen, setSeguroDesgravamen] = useState(0.028);
  const [seguroInmueble, setSeguroInmueble] = useState(0.03);
  
  const [periodoGraciaTotalMeses, setPeriodoGraciaTotalMeses] = useState(0);
  const [periodoGraciaParcialMeses, setPeriodoGraciaParcialMeses] = useState(0);
  const [aplicaBonoTechoPropio, setAplicaBonoTechoPropio] = useState(false);
  const [valorBono, setValorBono] = useState(43300);

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  // Cargar datos iniciales para edición
  useEffect(() => {
    if (simulacionToEdit) {
      setSelectedCliente(simulacionToEdit.cliente._id);
      setSelectedInmueble(simulacionToEdit.inmueble._id);
      setMontoPrestamo(simulacionToEdit.montoPrestamo);
      setPlazoAnios(simulacionToEdit.plazoAnios);
      setTipoTasa(simulacionToEdit.tipoTasa);
      setTasaInteresAnual(simulacionToEdit.tasaInteresAnual);
      setCapitalizacion(simulacionToEdit.capitalizacion || 'Mensual'); // Cargar capitalización
      setSeguroDesgravamen(simulacionToEdit.seguroDesgravamen);
      setSeguroInmueble(simulacionToEdit.seguroInmueble);
      setPeriodoGraciaTotalMeses(simulacionToEdit.periodoGraciaTotalMeses);
      setPeriodoGraciaParcialMeses(simulacionToEdit.periodoGraciaParcialMeses);
      setAplicaBonoTechoPropio(simulacionToEdit.aplicaBonoTechoPropio);
      setValorBono(simulacionToEdit.valorBono);
    } else {
      // Resetear a valores por defecto si no hay simulación para editar
      setSelectedCliente('');
      setSelectedInmueble('');
      setMontoPrestamo(150000);
      setPlazoAnios(20);
      setTipoTasa('Efectiva');
      setTasaInteresAnual(9.5);
      setCapitalizacion('Mensual'); // Resetear capitalización
      setSeguroDesgravamen(0.028);
      setSeguroInmueble(0.03);
      setPeriodoGraciaTotalMeses(0);
      setPeriodoGraciaParcialMeses(0);
      setAplicaBonoTechoPropio(false);
      setValorBono(43300);
    }
  }, [simulacionToEdit]);

  useEffect(() => {
    const fetchData = async (endpoint: string, setData: Function) => {
      const token = sessionStorage.getItem('token');
      const response = await fetch(`http://localhost:3001/api/${endpoint}`, { headers: { 'x-auth-token': token || '' } });
      const data = await response.json();
      setData(data);
    };
    fetchData('clientes', setClientes);
    fetchData('inmuebles', setInmuebles);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    
    if (!selectedCliente || !selectedInmueble) {
      setError('Debe seleccionar un cliente y un inmueble.');
      setIsLoading(false);
      return;
    }

    const token = sessionStorage.getItem('token');
    const body = {
      clienteId: selectedCliente,
      inmuebleId: selectedInmueble,
      montoPrestamo,
      plazoAnios,
      tipoTasa,
      tasaInteresAnual,
      capitalizacion, // Incluir capitalización en el body
      seguroDesgravamen,
      seguroInmueble,
      periodoGraciaTotalMeses,
      periodoGraciaParcialMeses,
      aplicaBonoTechoPropio,
      valorBono,
    };

    const url = simulacionToEdit ? `http://localhost:3001/api/simulaciones/${simulacionToEdit._id}` : 'http://localhost:3001/api/simulaciones';
    const method = simulacionToEdit ? 'PUT' : 'POST';

    try {
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json', 'x-auth-token': token || '' },
        body: JSON.stringify(body),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.msg || 'Error al guardar la simulación');
      
      onSimulacionCreated(data);

    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="max-w-5xl mx-auto">
      <CardHeader><CardTitle className="text-2xl">{simulacionToEdit ? 'Editar Simulación' : 'Crear Nueva Simulación'}</CardTitle></CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid md:grid-cols-2 gap-6 border-b pb-6">
            <div><Label>Cliente</Label><Select onValueChange={setSelectedCliente} value={selectedCliente}><SelectTrigger><SelectValue placeholder="Seleccione un cliente..." /></SelectTrigger><SelectContent>{clientes.map(c => <SelectItem key={c._id} value={c._id}>{c.nombres} {c.apellidos}</SelectItem>)}</SelectContent></Select></div>
            <div><Label>Inmueble</Label><Select onValueChange={setSelectedInmueble} value={selectedInmueble}><SelectTrigger><SelectValue placeholder="Seleccione un inmueble..." /></SelectTrigger><SelectContent>{inmuebles.map(i => <SelectItem key={i._id} value={i._id}>{i.nombreProyecto} - {i.moneda} {i.valor.toLocaleString()}</SelectItem>)}</SelectContent></Select></div>
          </div>
          <h3 className="text-lg font-medium">Parámetros Financieros</h3>
          <div className="grid md:grid-cols-4 gap-6">
            <div><Label htmlFor="montoPrestamo">Monto del Préstamo</Label><Input id="montoPrestamo" type="number" value={montoPrestamo} onChange={e => setMontoPrestamo(Number(e.target.value))} /></div>
            <div><Label htmlFor="plazoAnios">Plazo (Años)</Label><Input id="plazoAnios" type="number" value={plazoAnios} onChange={e => setPlazoAnios(Number(e.target.value))} /></div>
            <div><Label>Tipo de Tasa</Label><Select onValueChange={setTipoTasa} value={tipoTasa}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="Efectiva">Efectiva Anual (TEA)</SelectItem><SelectItem value="Nominal">Nominal Anual (TNA)</SelectItem></SelectContent></Select></div>
            <div><Label htmlFor="tasaInteresAnual">Tasa Interés Anual (%)</Label><Input id="tasaInteresAnual" type="number" step="0.01" value={tasaInteresAnual} onChange={e => setTasaInteresAnual(Number(e.target.value))} /></div>
          </div>
          <div className="grid md:grid-cols-4 gap-6 items-start">
            <div><Label>Capitalización</Label>
              <Select onValueChange={setCapitalizacion} value={capitalizacion} disabled={tipoTasa === 'Efectiva'}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Diaria">Diaria</SelectItem>
                  <SelectItem value="Quincenal">Quincenal</SelectItem>
                  <SelectItem value="Mensual">Mensual</SelectItem>
                  <SelectItem value="Bimestral">Bimestral</SelectItem>
                  <SelectItem value="Trimestral">Trimestral</SelectItem>
                  <SelectItem value="Cuatrimestral">Cuatrimestral</SelectItem>
                  <SelectItem value="Semestral">Semestral</SelectItem>
                  <SelectItem value="Anual">Anual</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div><Label htmlFor="seguroDesgravamen">Seg. Desgravamen (% mensual)</Label><Input id="seguroDesgravamen" type="number" step="0.001" value={seguroDesgravamen} onChange={e => setSeguroDesgravamen(Number(e.target.value))} /></div>
            <div><Label htmlFor="seguroInmueble">Seg. Inmueble (% anual)</Label><Input id="seguroInmueble" type="number" step="0.001" value={seguroInmueble} onChange={e => setSeguroInmueble(Number(e.target.value))} /></div>
            <div><Label htmlFor="periodoGraciaTotalMeses">Gracia Total (meses)</Label><Input id="periodoGraciaTotalMeses" type="number" value={periodoGraciaTotalMeses} onChange={e => setPeriodoGraciaTotalMeses(Number(e.target.value))} /></div>
          </div>
          <div className="grid md:grid-cols-2 gap-6 items-center">
            <div><Label htmlFor="periodoGraciaParcialMeses">Gracia Parcial (meses)</Label><Input id="periodoGraciaParcialMeses" type="number" value={periodoGraciaParcialMeses} onChange={e => setPeriodoGraciaParcialMeses(Number(e.target.value))} /></div>
            <div className="flex items-center space-x-2"><Switch id="aplicaBono" checked={aplicaBonoTechoPropio} onCheckedChange={setAplicaBonoTechoPropio} /><Label htmlFor="aplicaBono">Aplica a Bono (Techo Propio / BBP)</Label></div>
            {aplicaBonoTechoPropio && <div><Label htmlFor="valorBono">Valor del Bono</Label><Input id="valorBono" type="number" value={valorBono} onChange={e => setValorBono(Number(e.target.value))} /></div>}
          </div>
          <Button type="submit" className="w-full" disabled={isLoading}>{isLoading ? 'Calculando...' : 'Calcular y Guardar Simulación'}</Button>
          {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
        </form>
      </CardContent>
    </Card>
  );
}
