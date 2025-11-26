import { useState, useEffect } from 'react';
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '../ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '../ui/alert-dialog';
import { PencilIcon, TrashIcon, PlusCircleIcon } from 'lucide-react';
import { toast } from "sonner";

type Inmueble = { _id?: string; nombreProyecto: string; tipoInmueble: 'Casa' | 'Departamento' | 'Terreno'; direccion: string; valor: number; moneda: 'Soles' | 'Dólares'; areaMetrosCuadrados: number; };
const initialState: Inmueble = { nombreProyecto: '', tipoInmueble: 'Departamento', direccion: '', valor: 0, moneda: 'Soles', areaMetrosCuadrados: 0 };

export function Inmuebles() {
  const [inmuebles, setInmuebles] = useState<Inmueble[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingInmueble, setEditingInmueble] = useState<Inmueble | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const fetchInmuebles = async () => {
    const token = sessionStorage.getItem('token');
    try {
      const response = await fetch('http://localhost:3001/api/inmuebles', { headers: { 'x-auth-token': token || '' } });
      if (!response.ok) throw new Error('Error al cargar inmuebles');
      const data = await response.json();
      setInmuebles(Array.isArray(data) ? data : []);
    } catch (err) {
      setInmuebles([]);
    }
  };

  useEffect(() => { fetchInmuebles(); }, []);

  const validateForm = () => {
    if (!editingInmueble) return false;
    const newErrors: Record<string, string> = {};
    if (!editingInmueble.nombreProyecto.trim()) newErrors.nombreProyecto = "El nombre del proyecto es requerido.";
    if (!editingInmueble.direccion.trim()) newErrors.direccion = "La dirección es requerida.";
    if (editingInmueble.valor <= 0) newErrors.valor = "El valor debe ser un número positivo.";
    if (editingInmueble.areaMetrosCuadrados <= 0) newErrors.areaMetrosCuadrados = "El área debe ser un número positivo.";
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validateForm() || !editingInmueble) return;
    setIsLoading(true);
    const token = sessionStorage.getItem('token');
    const isEditing = !!editingInmueble._id;
    const url = isEditing ? `http://localhost:3001/api/inmuebles/${editingInmueble._id}` : 'http://localhost:3001/api/inmuebles';
    const method = isEditing ? 'PUT' : 'POST';

    try {
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json', 'x-auth-token': token || '' },
        body: JSON.stringify(editingInmueble),
      });
      if (!response.ok) throw new Error((await response.json()).msg || 'Error al guardar');
      
      await fetchInmuebles();
      handleCloseModal();
      toast.success(`Inmueble ${isEditing ? 'actualizado' : 'creado'} con éxito.`);
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    const token = sessionStorage.getItem('token');
    try {
      await fetch(`http://localhost:3001/api/inmuebles/${id}`, {
        method: 'DELETE',
        headers: { 'x-auth-token': token || '' },
      });
      fetchInmuebles();
      toast.info('Inmueble eliminado.');
    } catch (err) {
      toast.error('Error al eliminar el inmueble.');
    }
  };

  const handleOpenModal = (inmueble: Inmueble | null) => {
    setEditingInmueble(inmueble || initialState);
    setErrors({});
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingInmueble(null);
  };

  return (
    <>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl">Gestión de Inmuebles</h2>
        <Button onClick={() => handleOpenModal(null)}><PlusCircleIcon className="mr-2 h-4 w-4" />Añadir Inmueble</Button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {inmuebles.map(inmueble => (
          <Card key={inmueble._id}>
            <CardHeader>
              <CardTitle className="flex justify-between items-center">
                <span className="truncate">{inmueble.nombreProyecto}</span>
                <div className="flex gap-2 flex-shrink-0">
                  <Button variant="ghost" size="icon" onClick={() => handleOpenModal(inmueble)}><PencilIcon className="h-4 w-4" /></Button>
                  <AlertDialog>
                    <AlertDialogTrigger asChild><Button variant="ghost" size="icon"><TrashIcon className="h-4 w-4 text-destructive" /></Button></AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader><AlertDialogTitle>¿Estás seguro?</AlertDialogTitle><AlertDialogDescription>Esta acción no se puede deshacer.</AlertDialogDescription></AlertDialogHeader>
                      <AlertDialogFooter><AlertDialogCancel>Cancelar</AlertDialogCancel><AlertDialogAction onClick={() => handleDelete(inmueble._id!)}>Eliminar</AlertDialogAction></AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent className="text-sm space-y-1">
              <p className="truncate">{inmueble.direccion}</p>
              <p className="text-muted-foreground">{inmueble.tipoInmueble} | {inmueble.areaMetrosCuadrados} m²</p>
              <p className="font-semibold pt-2">{inmueble.moneda === 'Soles' ? 'S/' : '$'} {inmueble.valor.toLocaleString()}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingInmueble?._id ? 'Editar Inmueble' : 'Añadir Nuevo Inmueble'}</DialogTitle>
            <DialogDescription>Rellena los campos para continuar.</DialogDescription>
          </DialogHeader>
          {editingInmueble && (
            <div className="space-y-4 py-4">
              <div><Label htmlFor="nombreProyecto">Nombre del Proyecto</Label><Input id="nombreProyecto" value={editingInmueble.nombreProyecto} onChange={(e) => setEditingInmueble({...editingInmueble, nombreProyecto: e.target.value})} />{errors.nombreProyecto && <p className="text-red-500 text-xs mt-1">{errors.nombreProyecto}</p>}</div>
              <div><Label htmlFor="direccion">Dirección</Label><Input id="direccion" value={editingInmueble.direccion} onChange={(e) => setEditingInmueble({...editingInmueble, direccion: e.target.value})} />{errors.direccion && <p className="text-red-500 text-xs mt-1">{errors.direccion}</p>}</div>
              <div><Label htmlFor="tipoInmueble">Tipo de Inmueble</Label>
                <Select onValueChange={(v) => setEditingInmueble({...editingInmueble, tipoInmueble: v as Inmueble['tipoInmueble']})} value={editingInmueble.tipoInmueble}>
                  <SelectTrigger id="tipoInmueble"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Departamento">Departamento</SelectItem>
                    <SelectItem value="Casa">Casa</SelectItem>
                    <SelectItem value="Terreno">Terreno</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div><Label htmlFor="valor">Valor</Label><Input id="valor" type="number" value={editingInmueble.valor} onChange={(e) => setEditingInmueble({...editingInmueble, valor: Number(e.target.value)})} />{errors.valor && <p className="text-red-500 text-xs mt-1">{errors.valor}</p>}</div>
                <div><Label htmlFor="moneda">Moneda</Label>
                  <Select onValueChange={(v) => setEditingInmueble({...editingInmueble, moneda: v as Inmueble['moneda']})} value={editingInmueble.moneda}>
                    <SelectTrigger id="moneda"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Soles">Soles (S/)</SelectItem>
                      <SelectItem value="Dólares">Dólares ($)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div><Label htmlFor="areaMetrosCuadrados">Área (m²)</Label><Input id="areaMetrosCuadrados" type="number" value={editingInmueble.areaMetrosCuadrados} onChange={(e) => setEditingInmueble({...editingInmueble, areaMetrosCuadrados: Number(e.target.value)})} />{errors.areaMetrosCuadrados && <p className="text-red-500 text-xs mt-1">{errors.areaMetrosCuadrados}</p>}</div>
            </div>
          )}
          <DialogFooter>
            <Button variant="ghost" onClick={handleCloseModal}>Cancelar</Button>
            <Button onClick={handleSave} disabled={isLoading}>{isLoading ? 'Guardando...' : 'Guardar'}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
