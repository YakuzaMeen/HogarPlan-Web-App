import { useState, useEffect } from 'react';
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from '../ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '../ui/alert-dialog';
import { PencilIcon, TrashIcon, PlusCircleIcon, SearchIcon } from 'lucide-react';

type Cliente = { _id?: string; nombres: string; apellidos: string; tipoDocumento: 'DNI' | 'Carnet de Extranjería' | 'Pasaporte'; numeroDocumento: string; email: string; telefono: string; direccion: string; ingresoMensual: number; };
const initialState: Cliente = { nombres: '', apellidos: '', tipoDocumento: 'DNI', numeroDocumento: '', email: '', telefono: '', direccion: '', ingresoMensual: 0 };

// Formulario de Cliente (reutilizable para añadir y editar)
function ClienteForm({ cliente, onSave, isLoading, onClose }: { cliente: Cliente, onSave: (clienteToSave: Cliente) => void, isLoading: boolean, onClose: () => void }) {
  const [formData, setFormData] = useState<Cliente>(cliente);

  useEffect(() => {
    setFormData(cliente); // Actualiza el formulario si el cliente a editar cambia
  }, [cliente]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 py-4">
      <div className="grid grid-cols-2 gap-4">
        <div><Label htmlFor="nombres">Nombres</Label><Input id="nombres" value={formData.nombres} onChange={(e) => setFormData({...formData, nombres: e.target.value})} required/></div>
        <div><Label htmlFor="apellidos">Apellidos</Label><Input id="apellidos" value={formData.apellidos} onChange={(e) => setFormData({...formData, apellidos: e.target.value})} required/></div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="tipoDocumento">Tipo Doc.</Label>
          <Select onValueChange={(value) => setFormData({...formData, tipoDocumento: value as Cliente['tipoDocumento']})} value={formData.tipoDocumento}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="DNI">DNI</SelectItem>
              <SelectItem value="Carnet de Extranjería">Carnet de Extranjería</SelectItem>
              <SelectItem value="Pasaporte">Pasaporte</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div><Label htmlFor="numeroDocumento">N° Documento</Label><Input id="numeroDocumento" value={formData.numeroDocumento} onChange={(e) => setFormData({...formData, numeroDocumento: e.target.value})} required/></div>
      </div>
      <div><Label htmlFor="email">Email</Label><Input id="email" type="email" value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} required/></div>
      <div><Label htmlFor="telefono">Teléfono</Label><Input id="telefono" value={formData.telefono} onChange={(e) => setFormData({...formData, telefono: e.target.value})}/></div>
      <div><Label htmlFor="direccion">Dirección</Label><Input id="direccion" value={formData.direccion} onChange={(e) => setFormData({...formData, direccion: e.target.value})}/></div>
      <div><Label htmlFor="ingresoMensual">Ingreso Mensual (S/.)</Label><Input id="ingresoMensual" type="number" value={formData.ingresoMensual} onChange={(e) => setFormData({...formData, ingresoMensual: Number(e.target.value)})} required/></div>
      <DialogFooter>
        <Button type="button" variant="ghost" onClick={onClose}>Cancelar</Button>
        <Button type="submit" disabled={isLoading}>{isLoading ? 'Guardando...' : 'Guardar'}</Button>
      </DialogFooter>
    </form>
  );
}

export function Clientes() {
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingClient, setEditingClient] = useState<Cliente | null>(null);
  const [searchTerm, setSearchTerm] = useState(''); // Nuevo estado para el término de búsqueda

  const fetchClientes = async () => {
    const token = sessionStorage.getItem('token');
    try {
      const response = await fetch('http://localhost:3001/api/clientes', { headers: { 'x-auth-token': token || '' } });
      if (!response.ok) throw new Error('Error al cargar clientes');
      const data = await response.json();
      setClientes(Array.isArray(data) ? data : []);
    } catch (err) {
      setClientes([]);
    }
  };

  useEffect(() => { fetchClientes(); }, []);

  const handleSave = async (clienteToSave: Cliente) => {
    setIsLoading(true);
    const token = sessionStorage.getItem('token');
    const isEditing = !!clienteToSave._id;
    const url = isEditing ? `http://localhost:3001/api/clientes/${clienteToSave._id}` : 'http://localhost:3001/api/clientes';
    const method = isEditing ? 'PUT' : 'POST';

    try {
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json', 'x-auth-token': token || '' },
        body: JSON.stringify(clienteToSave),
      });
      if (!response.ok) throw new Error((await response.json()).msg || 'Error al guardar');
      
      await fetchClientes();
      setIsModalOpen(false);
      setEditingClient(null);
    } catch (err: any) {
      console.error(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    const token = sessionStorage.getItem('token');
    await fetch(`http://localhost:3001/api/clientes/${id}`, {
      method: 'DELETE',
      headers: { 'x-auth-token': token || '' },
    });
    fetchClientes();
  };

  const handleOpenAddModal = () => {
    setEditingClient(initialState);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (client: Cliente) => {
    setEditingClient(client);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingClient(null);
  };

  // Lógica de filtrado
  const filteredClientes = clientes.filter(cliente => 
    cliente.nombres.toLowerCase().includes(searchTerm.toLowerCase()) ||
    cliente.apellidos.toLowerCase().includes(searchTerm.toLowerCase()) ||
    cliente.numeroDocumento.toLowerCase().includes(searchTerm.toLowerCase()) ||
    cliente.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl">Gestión de Clientes</h2>
        <Button onClick={handleOpenAddModal}><PlusCircleIcon className="mr-2 h-4 w-4" />Añadir Cliente</Button>
      </div>
      
      {/* Barra de búsqueda */}
      <div className="relative mb-4">
        <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Buscar clientes por nombre, apellido, DNI o email..."
          className="pl-10"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredClientes.map(cliente => ( // Usar clientes filtrados
          <Card key={cliente._id}>
            <CardHeader>
              <CardTitle className="flex justify-between items-center">
                <span className="truncate">{cliente.nombres} {cliente.apellidos}</span>
                <div className="flex gap-2 flex-shrink-0">
                  <Button variant="ghost" size="icon" onClick={() => handleOpenEditModal(cliente)}>
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
                      <AlertDialogFooter><AlertDialogCancel>Cancelar</AlertDialogCancel><AlertDialogAction onClick={() => handleDelete(cliente._id!)}>Eliminar</AlertDialogAction></AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent className="text-sm space-y-1">
              <p className="truncate">{cliente.email}</p>
              <p className="text-muted-foreground">{cliente.tipoDocumento}: {cliente.numeroDocumento}</p>
              {cliente.telefono && <p className="text-muted-foreground">Teléfono: {cliente.telefono}</p>}
              {cliente.direccion && <p className="text-muted-foreground">Dirección: {cliente.direccion}</p>}
              <p className="font-semibold pt-2">Ingreso: S/ {cliente.ingresoMensual.toLocaleString()}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Dialog open={isModalOpen} onOpenChange={handleCloseModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingClient?._id ? 'Editar Cliente' : 'Añadir Nuevo Cliente'}</DialogTitle>
            <DialogDescription>
              {editingClient?._id ? 'Modifica los datos del cliente.' : 'Rellena los datos para registrar un nuevo cliente.'}
            </DialogDescription>
          </DialogHeader>
          {editingClient && <ClienteForm cliente={editingClient} onSave={handleSave} isLoading={isLoading} onClose={handleCloseModal} />}
        </DialogContent>
      </Dialog>
    </>
  );
}
