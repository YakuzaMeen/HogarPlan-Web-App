import { useState, useEffect } from 'react';
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '../ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '../ui/alert-dialog';
import { PencilIcon, TrashIcon, PlusCircleIcon } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { toast } from "sonner";

type Cliente = { _id?: string; nombres: string; apellidos: string; tipoDocumento: 'DNI' | 'Carnet de Extranjería' | 'Pasaporte'; numeroDocumento: string; email: string; telefono: string; direccion: string; ingresoMensual: number; };
const initialState: Cliente = { nombres: '', apellidos: '', tipoDocumento: 'DNI', numeroDocumento: '', email: '', telefono: '', direccion: '', ingresoMensual: 0 };

export function Clientes() {
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingClient, setEditingClient] = useState<Cliente | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});

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

  const validateForm = () => {
    if (!editingClient) return false;
    const newErrors: Record<string, string> = {};
    if (!editingClient.nombres.trim()) newErrors.nombres = "El nombre es requerido.";
    if (!editingClient.apellidos.trim()) newErrors.apellidos = "El apellido es requerido.";
    if (!editingClient.email.trim()) newErrors.email = "El email es requerido.";
    else if (!/\S+@\S+\.\S+/.test(editingClient.email)) newErrors.email = "Formato de email inválido.";
    if (!editingClient.numeroDocumento.trim()) newErrors.numeroDocumento = "El N° de documento es requerido.";
    else if (editingClient.tipoDocumento === 'DNI' && !/^\d{8}$/.test(editingClient.numeroDocumento)) newErrors.numeroDocumento = "El DNI debe tener 8 dígitos.";
    if (editingClient.ingresoMensual <= 0) newErrors.ingresoMensual = "El ingreso debe ser un número positivo.";
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validateForm() || !editingClient) return;
    setIsLoading(true);
    const token = sessionStorage.getItem('token');
    const isEditing = !!editingClient._id;
    const url = isEditing ? `http://localhost:3001/api/clientes/${editingClient._id}` : 'http://localhost:3001/api/clientes';
    const method = isEditing ? 'PUT' : 'POST';

    try {
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json', 'x-auth-token': token || '' },
        body: JSON.stringify(editingClient),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.msg || 'Error al guardar');
      
      await fetchClientes();
      handleCloseModal();
      toast.success(`Cliente ${isEditing ? 'actualizado' : 'creado'} con éxito.`);
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    const token = sessionStorage.getItem('token');
    try {
      await fetch(`http://localhost:3001/api/clientes/${id}`, {
        method: 'DELETE',
        headers: { 'x-auth-token': token || '' },
      });
      fetchClientes();
      toast.info('Cliente eliminado.');
    } catch (err) {
      toast.error('Error al eliminar el cliente.');
    }
  };

  const handleOpenModal = (cliente: Cliente | null) => {
    setEditingClient(cliente || initialState);
    setErrors({});
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingClient(null);
  };

  return (
    <>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl">Gestión de Clientes</h2>
        <Button onClick={() => handleOpenModal(null)}><PlusCircleIcon className="mr-2 h-4 w-4" />Añadir Cliente</Button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {clientes.map(cliente => (
          <Card key={cliente._id}>
            <CardHeader>
              <CardTitle className="flex justify-between items-center">
                <span className="truncate">{cliente.nombres} {cliente.apellidos}</span>
                <div className="flex gap-2 flex-shrink-0">
                  <Button variant="ghost" size="icon" onClick={() => handleOpenModal(cliente)}><PencilIcon className="h-4 w-4" /></Button>
                  <AlertDialog>
                    <AlertDialogTrigger asChild><Button variant="ghost" size="icon"><TrashIcon className="h-4 w-4 text-destructive" /></Button></AlertDialogTrigger>
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
            </CardContent>
          </Card>
        ))}
      </div>

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingClient?._id ? 'Editar Cliente' : 'Añadir Nuevo Cliente'}</DialogTitle>
            <DialogDescription>Rellena los campos para continuar.</DialogDescription>
          </DialogHeader>
          {editingClient && (
            <div className="space-y-4 py-4">
              <h4 className="text-sm font-medium text-muted-foreground">Información Personal</h4>
              <div className="grid grid-cols-2 gap-4">
                <div><Label htmlFor="nombres">Nombres</Label><Input id="nombres" value={editingClient.nombres} onChange={(e) => setEditingClient({...editingClient, nombres: e.target.value})} />{errors.nombres && <p className="text-red-500 text-xs mt-1">{errors.nombres}</p>}</div>
                <div><Label htmlFor="apellidos">Apellidos</Label><Input id="apellidos" value={editingClient.apellidos} onChange={(e) => setEditingClient({...editingClient, apellidos: e.target.value})} />{errors.apellidos && <p className="text-red-500 text-xs mt-1">{errors.apellidos}</p>}</div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="tipoDocumento">Tipo Doc.</Label>
                  <Select onValueChange={(v) => setEditingClient({...editingClient, tipoDocumento: v as Cliente['tipoDocumento']})} value={editingClient.tipoDocumento}>
                    <SelectTrigger id="tipoDocumento"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="DNI">DNI</SelectItem>
                      <SelectItem value="Carnet de Extranjería">Carnet de Extranjería</SelectItem>
                      <SelectItem value="Pasaporte">Pasaporte</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div><Label htmlFor="numeroDocumento">N° Documento</Label><Input id="numeroDocumento" value={editingClient.numeroDocumento} onChange={(e) => setEditingClient({...editingClient, numeroDocumento: e.target.value})} />{errors.numeroDocumento && <p className="text-red-500 text-xs mt-1">{errors.numeroDocumento}</p>}</div>
              </div>
              <h4 className="text-sm font-medium text-muted-foreground pt-4">Datos de Contacto y Financieros</h4>
              <div><Label htmlFor="email">Email</Label><Input id="email" type="email" value={editingClient.email} onChange={(e) => setEditingClient({...editingClient, email: e.target.value})} />{errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}</div>
              <div><Label htmlFor="ingresoMensual">Ingreso Mensual (S/.)</Label><Input id="ingresoMensual" type="number" value={editingClient.ingresoMensual} onChange={(e) => setEditingClient({...editingClient, ingresoMensual: Number(e.target.value)})} />{errors.ingresoMensual && <p className="text-red-500 text-xs mt-1">{errors.ingresoMensual}</p>}</div>
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
