    import { useState, useEffect } from 'react';
    import { Button } from "../ui/button";
    import { Input } from "../ui/input";
    import { Label } from "../ui/label";
    import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "../ui/card";
    import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '../ui/dialog';
    import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '../ui/alert-dialog';
    import { PencilIcon, TrashIcon, PlusCircleIcon, MailIcon, PhoneIcon, CreditCardIcon, SearchIcon, MapPinIcon, WalletIcon } from 'lucide-react';
    import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
    import { toast } from "sonner";

    type Cliente = {
      id?: string;
      nombres: string;
      apellidos: string;
      tipoDocumento: 'DNI' | 'Carnet de Extranjería' | 'Pasaporte';
      numeroDocumento: string;
      email: string;
      telefono: string;
      direccion: string;
      ingresoMensual: number;
    };

    const initialState: Cliente = {
      nombres: '',
      apellidos: '',
      tipoDocumento: 'DNI',
      numeroDocumento: '',
      email: '',
      telefono: '',
      direccion: '',
      ingresoMensual: 0
    };

    export function Clientes() {
      const [clientes, setClientes] = useState<Cliente[]>([]);
      const [isLoading, setIsLoading] = useState(false);
      const [isModalOpen, setIsModalOpen] = useState(false);
      const [editingClient, setEditingClient] = useState<Cliente | null>(null);
      const [errors, setErrors] = useState<Record<string, string>>({});
      const [searchTerm, setSearchTerm] = useState('');
      const [clientToDelete, setClientToDelete] = useState<string | null>(null);

      const fetchClientes = async () => {
        setIsLoading(true);
        const token = sessionStorage.getItem('token');
        try {
          const response = await fetch('http://localhost:3001/api/clientes', { headers: { 'x-auth-token': token || '' } });
          if (!response.ok) throw new Error('Error al cargar clientes');
          const data = await response.json();
          setClientes(Array.isArray(data) ? data : []);
        } catch (err) {
          console.error(err);
          setClientes([]);
        } finally {
          setIsLoading(false);
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
        const isEditing = !!editingClient.id;
        const url = isEditing ? `http://localhost:3001/api/clientes/${editingClient.id}` : 'http://localhost:3001/api/clientes';
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

      const confirmDelete = async () => {
        if (!clientToDelete) return;

        const token = sessionStorage.getItem('token');
        try {
          const response = await fetch(`http://localhost:3001/api/clientes/${clientToDelete}`, {
            method: 'DELETE',
            headers: { 'x-auth-token': token || '' },
          });
          if (!response.ok) throw new Error("Error al eliminar");

          fetchClientes();
          toast.success('Cliente eliminado correctamente.');
        } catch (err) {
          toast.error('Error al eliminar el cliente.');
        } finally {
          setClientToDelete(null);
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

      const filteredClientes = clientes.filter(c =>
        c.nombres.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.apellidos.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.numeroDocumento.includes(searchTerm)
      );

      const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('es-PE', {
          style: 'currency',
          currency: 'PEN',
          maximumFractionDigits: 0
        }).format(amount);
      };

      const getInitials = (nombre: string, apellido: string) => {
        return `${nombre.charAt(0)}${apellido.charAt(0)}`.toUpperCase();
      };

      return (
        <div className="space-y-6 p-1">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h2 className="text-3xl font-bold tracking-tight">Gestión de Clientes</h2>
              <p className="text-muted-foreground mt-1">Administra la base de datos de tus clientes y prospectos.</p>
            </div>
            <Button onClick={() => handleOpenModal(null)} className="shrink-0">
              <PlusCircleIcon className="mr-2 h-4 w-4" />
              Añadir Cliente
            </Button>
          </div>

          <div className="relative">
            <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por nombre, apellido o documento..."
              className="pl-10 max-w-md"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {isLoading && clientes.length === 0 ? (
             <div className="text-center py-12 text-muted-foreground">Cargando clientes...</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {filteredClientes.length > 0 ? (
                filteredClientes.map(cliente => (
                  <Card key={cliente.id} className="flex flex-col transition-all hover:shadow-md border-muted/60">
                    <CardHeader className="pb-3">
                      <div className="flex justify-between items-start gap-2">
                        <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-sm border border-primary/20">
                                {getInitials(cliente.nombres, cliente.apellidos)}
                            </div>
                            <div className="min-w-0">
                                <CardTitle className="text-base font-semibold truncate">{cliente.nombres} {cliente.apellidos}</CardTitle>
                                <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                                    <CreditCardIcon className="h-3 w-3" /> {cliente.tipoDocumento}: {cliente.numeroDocumento}
                                </p>
                            </div>
                        </div>

                        <div className="flex gap-1">
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-primary" onClick={() => handleOpenModal(cliente)}>
                            <PencilIcon className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-muted-foreground hover:text-destructive"
                            onClick={() => setClientToDelete(cliente.id!)}
                          >
                            <TrashIcon className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="flex-grow space-y-3 text-sm pt-2">
                      <div className="flex items-center gap-2 text-muted-foreground">
                         <MailIcon className="h-4 w-4 shrink-0 text-muted-foreground/70" />
                         <span className="truncate">{cliente.email}</span>
                      </div>
                      <div className="flex items-center gap-2 text-muted-foreground">
                         <PhoneIcon className="h-4 w-4 shrink-0 text-muted-foreground/70" />
                         <span>{cliente.telefono || 'Sin teléfono'}</span>
                      </div>
                      <div className="flex items-center gap-2 text-muted-foreground">
                         <MapPinIcon className="h-4 w-4 shrink-0 text-muted-foreground/70" />
                         <span className="truncate">{cliente.direccion || 'Sin dirección'}</span>
                      </div>
                    </CardContent>
                    <CardFooter className="border-t bg-muted/5 py-3 px-6">
                       <div className="w-full flex justify-between items-center">
                          <div className="flex items-center gap-2 text-muted-foreground text-xs font-medium uppercase tracking-wider">
                            <WalletIcon className="h-3.5 w-3.5" />
                            Ingreso Mensual
                          </div>
                          <span className="font-bold text-primary">{formatCurrency(cliente.ingresoMensual)}</span>
                       </div>
                    </CardFooter>
                  </Card>
                ))
              ) : (
                <div className="col-span-full text-center py-12 bg-muted/10 rounded-lg border border-dashed">
                  <p className="text-muted-foreground">No se encontraron clientes.</p>
                </div>
              )}
            </div>
          )}

          <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
            <DialogContent className="sm:max-w-[600px]">
              <DialogHeader>
                <DialogTitle>{editingClient?.id ? 'Editar Cliente' : 'Crear Nuevo Cliente'}</DialogTitle>
                <DialogDescription>Complete la información del perfil del cliente.</DialogDescription>
              </DialogHeader>
              {editingClient && (
                <div className="space-y-6 py-4">
                  <div className="space-y-4">
                      <h4 className="text-sm font-medium text-muted-foreground border-b pb-1">Información Personal</h4>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="nombres">Nombres</Label>
                            <Input id="nombres" placeholder="Ej. Juan" value={editingClient.nombres} onChange={(e) => setEditingClient({...editingClient, nombres: e.target.value})} className={errors.nombres ? "border-destructive" : ""} />
                            {errors.nombres && <p className="text-destructive text-xs">{errors.nombres}</p>}
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="apellidos">Apellidos</Label>
                            <Input id="apellidos" placeholder="Ej. Pérez" value={editingClient.apellidos} onChange={(e) => setEditingClient({...editingClient, apellidos: e.target.value})} className={errors.apellidos ? "border-destructive" : ""} />
                            {errors.apellidos && <p className="text-destructive text-xs">{errors.apellidos}</p>}
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="tipoDocumento">Tipo Doc.</Label>
                          <Select onValueChange={(v) => setEditingClient({...editingClient, tipoDocumento: v as Cliente['tipoDocumento']})} value={editingClient.tipoDocumento}>
                            <SelectTrigger id="tipoDocumento"><SelectValue /></SelectTrigger>
                            <SelectContent>
                              <SelectItem key="DNI" value="DNI">DNI</SelectItem>
                              <SelectItem key="Carnet de Extranjería" value="Carnet de Extranjería">Carnet de Extranjería</SelectItem>
                              <SelectItem key="Pasaporte" value="Pasaporte">Pasaporte</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="numeroDocumento">N° Documento</Label>
                            <Input id="numeroDocumento" placeholder="Ej. 12345678" value={editingClient.numeroDocumento} onChange={(e) => setEditingClient({...editingClient, numeroDocumento: e.target.value})} className={errors.numeroDocumento ? "border-destructive" : ""} />
                            {errors.numeroDocumento && <p className="text-destructive text-xs">{errors.numeroDocumento}</p>}
                        </div>
                      </div>
                  </div>

                  <div className="space-y-4">
                      <h4 className="text-sm font-medium text-muted-foreground border-b pb-1">Datos de Contacto</h4>
                      <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                              <Label htmlFor="email">Correo Electrónico</Label>
                              <Input id="email" type="email" placeholder="correo@ejemplo.com" value={editingClient.email} onChange={(e) => setEditingClient({...editingClient, email: e.target.value})} className={errors.email ? "border-destructive" : ""} />
                              {errors.email && <p className="text-destructive text-xs">{errors.email}</p>}
                          </div>
                           <div className="space-y-2">
                              <Label htmlFor="telefono">Teléfono / Celular</Label>
                              <Input id="telefono" placeholder="Ej. 999888777" value={editingClient.telefono} onChange={(e) => setEditingClient({...editingClient, telefono: e.target.value})} />
                          </div>
                      </div>
                      <div className="space-y-2">
                          <Label htmlFor="direccion">Dirección de Residencia</Label>
                          <Input id="direccion" placeholder="Av. Las Flores 123" value={editingClient.direccion} onChange={(e) => setEditingClient({...editingClient, direccion: e.target.value})} />
                      </div>
                  </div>

                  <div className="space-y-4">
                      <h4 className="text-sm font-medium text-muted-foreground border-b pb-1">Información Financiera</h4>
                      <div className="space-y-2">
                          <Label htmlFor="ingresoMensual">Ingreso Mensual Neto (S/.)</Label>
                          <div className="relative">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">S/</span>
                            <Input
                                id="ingresoMensual"
                                type="number"
                                min="0"
                                className="pl-8"
                                value={editingClient.ingresoMensual}
                                onChange={(e) => setEditingClient({...editingClient, ingresoMensual: Number(e.target.value)})}
                            />
                          </div>
                          {errors.ingresoMensual && <p className="text-destructive text-xs">{errors.ingresoMensual}</p>}
                          <p className="text-xs text-muted-foreground">Este valor se usará como base para las simulaciones.</p>
                      </div>
                  </div>

                </div>
              )}
              <DialogFooter>
                <Button variant="outline" onClick={handleCloseModal}>Cancelar</Button>
                <Button onClick={handleSave} disabled={isLoading}>
                    {isLoading ? 'Guardando...' : 'Guardar Cambios'}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          <AlertDialog open={!!clientToDelete} onOpenChange={(open) => !open && setClientToDelete(null)}>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
                <AlertDialogDescription>
                  Esta acción no se puede deshacer. Esto eliminará permanentemente al cliente y todas sus simulaciones asociadas.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel onClick={() => setClientToDelete(null)}>Cancelar</AlertDialogCancel>
                <AlertDialogAction onClick={confirmDelete} className="bg-destructive hover:bg-destructive/90">
                  Eliminar
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>

        </div>
      );
    }
    