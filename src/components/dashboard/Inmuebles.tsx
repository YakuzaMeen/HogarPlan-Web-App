import { useState, useEffect } from 'react';
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from '../ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '../ui/alert-dialog';
import { PencilIcon, TrashIcon, PlusCircleIcon, SearchIcon } from 'lucide-react';

type Inmueble = { _id?: string; nombreProyecto: string; tipoInmueble: 'Casa' | 'Departamento' | 'Terreno'; direccion: string; valor: number; moneda: 'Soles' | 'Dólares'; areaMetrosCuadrados: number; };
const initialState: Inmueble = { nombreProyecto: '', tipoInmueble: 'Departamento', direccion: '', valor: 0, moneda: 'Soles', areaMetrosCuadrados: 0 };

// Formulario de Inmueble (reutilizable para añadir y editar)
function InmuebleForm({ inmueble, onSave, isLoading, onClose }: { inmueble: Inmueble, onSave: (inmuebleToSave: Inmueble) => void, isLoading: boolean, onClose: () => void }) {
  const [formData, setFormData] = useState<Inmueble>(inmueble);

  useEffect(() => {
    setFormData(inmueble); // Actualiza el formulario si el inmueble a editar cambia
  }, [inmueble]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 py-4">
      <div><Label htmlFor="nombreProyecto">Nombre del Proyecto</Label><Input id="nombreProyecto" value={formData.nombreProyecto} onChange={(e) => setFormData({...formData, nombreProyecto: e.target.value})} required/></div>
      <div><Label htmlFor="direccion">Dirección</Label><Input id="direccion" value={formData.direccion} onChange={(e) => setFormData({...formData, direccion: e.target.value})} required/></div>
      <div><Label htmlFor="tipoInmueble">Tipo de Inmueble</Label>
        <Select onValueChange={(v) => setFormData({...formData, tipoInmueble: v as Inmueble['tipoInmueble']})} value={formData.tipoInmueble}>
          <SelectTrigger><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="Departamento">Departamento</SelectItem>
            <SelectItem value="Casa">Casa</SelectItem>
            <SelectItem value="Terreno">Terreno</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div><Label htmlFor="valor">Valor</Label><Input id="valor" type="number" value={formData.valor} onChange={(e) => setFormData({...formData, valor: Number(e.target.value)})} required/></div>
        <div><Label htmlFor="moneda">Moneda</Label>
          <Select onValueChange={(v) => setFormData({...formData, moneda: v as Inmueble['moneda']})} value={formData.moneda}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="Soles">Soles (S/)</SelectItem>
              <SelectItem value="Dólares">Dólares ($)</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      <div><Label htmlFor="areaMetrosCuadrados">Área (m²)</Label><Input id="areaMetrosCuadrados" type="number" value={formData.areaMetrosCuadrados} onChange={(e) => setFormData({...formData, areaMetrosCuadrados: Number(e.target.value)})} required/></div>
      <DialogFooter>
        <Button type="button" variant="ghost" onClick={onClose}>Cancelar</Button>
        <Button type="submit" disabled={isLoading}>{isLoading ? 'Guardando...' : 'Guardar'}</Button>
      </DialogFooter>
    </form>
  );
}

export function Inmuebles() {
  const [inmuebles, setInmuebles] = useState<Inmueble[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingInmueble, setEditingInmueble] = useState<Inmueble | null>(null);
  const [searchTerm, setSearchTerm] = useState(''); // Nuevo estado para el término de búsqueda

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

  const handleSave = async (inmuebleToSave: Inmueble) => {
    setIsLoading(true);
    const token = sessionStorage.getItem('token');
    const isEditing = !!inmuebleToSave._id;
    const url = isEditing ? `http://localhost:3001/api/inmuebles/${inmuebleToSave._id}` : 'http://localhost:3001/api/inmuebles';
    const method = isEditing ? 'PUT' : 'POST';

    try {
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json', 'x-auth-token': token || '' },
        body: JSON.stringify(inmuebleToSave),
      });
      if (!response.ok) throw new Error((await response.json()).msg || 'Error al guardar');
      
      await fetchInmuebles();
      setIsModalOpen(false);
      setEditingInmueble(null);
    } catch (err: any) {
      console.error(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    const token = sessionStorage.getItem('token');
    await fetch(`http://localhost:3001/api/inmuebles/${id}`, {
      method: 'DELETE',
      headers: { 'x-auth-token': token || '' },
    });
    fetchInmuebles();
  };

  const handleOpenAddModal = () => {
    setEditingInmueble(initialState);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (inmueble: Inmueble) => {
    setEditingInmueble(inmueble);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingInmueble(null);
  };

  // Lógica de filtrado
  const filteredInmuebles = inmuebles.filter(inmueble => 
    inmueble.nombreProyecto.toLowerCase().includes(searchTerm.toLowerCase()) ||
    inmueble.direccion.toLowerCase().includes(searchTerm.toLowerCase()) ||
    inmueble.tipoInmueble.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl">Gestión de Inmuebles</h2>
        <Button onClick={handleOpenAddModal}><PlusCircleIcon className="mr-2 h-4 w-4" />Añadir Inmueble</Button>
      </div>
      
      {/* Barra de búsqueda */}
      <div className="relative mb-4">
        <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Buscar inmuebles por proyecto, dirección o tipo..."
          className="pl-10"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredInmuebles.map(inmueble => ( // Usar inmuebles filtrados
          <Card key={inmueble._id}>
            <CardHeader>
              <CardTitle className="flex justify-between items-center">
                <span className="truncate">{inmueble.nombreProyecto}</span>
                <div className="flex gap-2 flex-shrink-0">
                  <Button variant="ghost" size="icon" onClick={() => handleOpenEditModal(inmueble)}>
                    <PencilIcon className="h-4 w-4" />
                  </Button>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <TrashIcon className="h-4 w-4 cursor-pointer text-destructive hover:text-destructive" />
                      </Button>
                    </AlertDialogTrigger>
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

      <Dialog open={isModalOpen} onOpenChange={handleCloseModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingInmueble?._id ? 'Editar Inmueble' : 'Añadir Nuevo Inmueble'}</DialogTitle>
            <DialogDescription>
              {editingInmueble?._id ? 'Modifica los datos del inmueble.' : 'Rellena los datos para registrar un nuevo inmueble.'}
            </DialogDescription>
          </DialogHeader>
          {editingInmueble && <InmuebleForm inmueble={editingInmueble} onSave={handleSave} isLoading={isLoading} onClose={handleCloseModal} />}
        </DialogContent>
      </Dialog>
    </>
  );
}
