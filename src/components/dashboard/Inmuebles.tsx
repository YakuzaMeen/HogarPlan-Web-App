    import { useState, useEffect } from 'react';
    import { Button } from "../ui/button";
    import { Input } from "../ui/input";
    import { Label } from "../ui/label";
    import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "../ui/card";
    import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
    import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '../ui/dialog';
    import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '../ui/alert-dialog';
    import { PencilIcon, TrashIcon, PlusCircleIcon, MapPinIcon, Building2Icon, RulerIcon, SearchIcon, HomeIcon } from 'lucide-react';
    import { toast } from "sonner";

    type Inmueble = {
      id?: string;
      nombreProyecto: string;
      tipoInmueble: 'Casa' | 'Departamento' | 'Terreno';
      direccion: string;
      valor: number;
      moneda: 'Soles' | 'Dólares';
      areaMetrosCuadrados: number;
    };

    const initialState: Inmueble = {
      nombreProyecto: '',
      tipoInmueble: 'Departamento',
      direccion: '',
      valor: 0,
      moneda: 'Soles',
      areaMetrosCuadrados: 0
    };

    export function Inmuebles() {
      const [inmuebles, setInmuebles] = useState<Inmueble[]>([]);
      const [isLoading, setIsLoading] = useState(false);
      const [isModalOpen, setIsModalOpen] = useState(false);
      const [editingInmueble, setEditingInmueble] = useState<Inmueble | null>(null);
      const [errors, setErrors] = useState<Record<string, string>>({});
      const [searchTerm, setSearchTerm] = useState('');
      const [inmuebleToDelete, setInmuebleToDelete] = useState<string | null>(null);

      const fetchInmuebles = async () => {
        setIsLoading(true);
        const token = sessionStorage.getItem('token');
        try {
          const response = await fetch('http://localhost:3001/api/inmuebles', { headers: { 'x-auth-token': token || '' } });
          if (!response.ok) throw new Error('Error al cargar inmuebles');
          const data = await response.json();
          setInmuebles(Array.isArray(data) ? data : []);
        } catch (err) {
          console.error(err);
          setInmuebles([]);
        } finally {
          setIsLoading(false);
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
        const isEditing = !!editingInmueble.id;
        const url = isEditing ? `http://localhost:3001/api/inmuebles/${editingInmueble.id}` : 'http://localhost:3001/api/inmuebles';
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

      const confirmDelete = async () => {
        if (!inmuebleToDelete) return;

        const token = sessionStorage.getItem('token');
        try {
          const response = await fetch(`http://localhost:3001/api/inmuebles/${inmuebleToDelete}`, {
            method: 'DELETE',
            headers: { 'x-auth-token': token || '' },
          });
          if(!response.ok) throw new Error("Error al eliminar");

          fetchInmuebles();
          toast.success('Inmueble eliminado correctamente.');
        } catch (err) {
          toast.error('Error al eliminar el inmueble.');
        } finally {
          setInmuebleToDelete(null);
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

      const formatCurrency = (amount: number, currency: 'Soles' | 'Dólares') => {
        return new Intl.NumberFormat('es-PE', {
          style: 'currency',
          currency: currency === 'Soles' ? 'PEN' : 'USD',
          maximumFractionDigits: 0
        }).format(amount);
      };

      const filteredInmuebles = inmuebles.filter(inmueble =>
        inmueble.nombreProyecto.toLowerCase().includes(searchTerm.toLowerCase()) ||
        inmueble.direccion.toLowerCase().includes(searchTerm.toLowerCase())
      );

      return (
        <div className="space-y-6 p-1">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h2 className="text-3xl font-bold tracking-tight">Gestión de Inmuebles</h2>
              <p className="text-muted-foreground mt-1">Administra tu catálogo de propiedades disponibles.</p>
            </div>
            <Button onClick={() => handleOpenModal(null)} className="shrink-0">
              <PlusCircleIcon className="mr-2 h-4 w-4" />
              Añadir Inmueble
            </Button>
          </div>

          <div className="relative">
            <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por proyecto o dirección..."
              className="pl-10 max-w-md"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {isLoading && inmuebles.length === 0 ? (
             <div className="text-center py-12 text-muted-foreground">Cargando inmuebles...</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {filteredInmuebles.length > 0 ? (
                filteredInmuebles.map(inmueble => (
                  <Card key={inmueble.id} className="flex flex-col transition-all hover:shadow-md border-muted/60">
                    <CardHeader className="pb-3">
                      <div className="flex justify-between items-start gap-2">
                        <div className="bg-primary/10 p-2 rounded-full text-primary shrink-0">
                          <HomeIcon className="h-5 w-5" />
                        </div>
                        <div className="flex gap-1">
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-primary" onClick={() => handleOpenModal(inmueble)}>
                            <PencilIcon className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-muted-foreground hover:text-destructive"
                            onClick={() => setInmuebleToDelete(inmueble.id!)}
                          >
                            <TrashIcon className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                      <CardTitle className="mt-3 text-xl">{inmueble.nombreProyecto}</CardTitle>
                    </CardHeader>
                    <CardContent className="flex-grow space-y-3 text-sm">
                      <div className="flex items-start gap-2 text-muted-foreground">
                        <MapPinIcon className="h-4 w-4 mt-0.5 shrink-0" />
                        <span className="leading-tight">{inmueble.direccion}</span>
                      </div>
                      <div className="grid grid-cols-2 gap-2 pt-2">
                        <div className="flex items-center gap-2 bg-muted/30 p-2 rounded text-foreground/80">
                          <Building2Icon className="h-4 w-4 text-muted-foreground" />
                          <span>{inmueble.tipoInmueble}</span>
                        </div>
                        <div className="flex items-center gap-2 bg-muted/30 p-2 rounded text-foreground/80">
                          <RulerIcon className="h-4 w-4 text-muted-foreground" />
                          <span>{inmueble.areaMetrosCuadrados} m²</span>
                        </div>
                      </div>
                    </CardContent>
                    <CardFooter className="border-t bg-muted/5 py-3 px-6">
                      <div className="w-full flex justify-between items-center">
                        <span className="text-xs uppercase tracking-wider text-muted-foreground font-medium">Valor Venta</span>
                        <span className="text-lg font-bold text-primary">
                          {formatCurrency(inmueble.valor, inmueble.moneda)}
                        </span>
                      </div>
                    </CardFooter>
                  </Card>
                ))
              ) : (
                <div className="col-span-full text-center py-12 bg-muted/10 rounded-lg border border-dashed">
                  <p className="text-muted-foreground">No se encontraron inmuebles.</p>
                </div>
              )}
            </div>
          )}

          <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle>{editingInmueble?.id ? 'Editar Inmueble' : 'Crear Nuevo Inmueble'}</DialogTitle>
                <DialogDescription>
                  Complete los detalles de la propiedad a continuación.
                </DialogDescription>
              </DialogHeader>
              {editingInmueble && (
                <div className="space-y-4 py-2">
                  <div className="space-y-2">
                    <Label htmlFor="nombreProyecto">Nombre del Proyecto</Label>
                    <Input
                      id="nombreProyecto"
                      placeholder="Ej. Residencial Los Pinos"
                      value={editingInmueble.nombreProyecto}
                      onChange={(e) => setEditingInmueble({...editingInmueble, nombreProyecto: e.target.value})}
                      className={errors.nombreProyecto ? "border-destructive" : ""}
                    />
                    {errors.nombreProyecto && <p className="text-destructive text-xs">{errors.nombreProyecto}</p>}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="direccion">Dirección</Label>
                    <Input
                      id="direccion"
                      placeholder="Av. Principal 123, Distrito"
                      value={editingInmueble.direccion}
                      onChange={(e) => setEditingInmueble({...editingInmueble, direccion: e.target.value})}
                      className={errors.direccion ? "border-destructive" : ""}
                    />
                    {errors.direccion && <p className="text-destructive text-xs">{errors.direccion}</p>}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="tipoInmueble">Tipo de Inmueble</Label>
                    <Select onValueChange={(v) => setEditingInmueble({...editingInmueble, tipoInmueble: v as Inmueble['tipoInmueble']})} value={editingInmueble.tipoInmueble}>
                      <SelectTrigger id="tipoInmueble"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem key="Departamento" value="Departamento">Departamento</SelectItem>
                        <SelectItem key="Casa" value="Casa">Casa</SelectItem>
                        <SelectItem key="Terreno" value="Terreno">Terreno</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="valor">Valor</Label>
                      <Input
                        id="valor"
                        type="number"
                        min="0"
                        value={editingInmueble.valor}
                        onChange={(e) => setEditingInmueble({...editingInmueble, valor: Number(e.target.value)})}
                        className={errors.valor ? "border-destructive" : ""}
                      />
                      {errors.valor && <p className="text-destructive text-xs">{errors.valor}</p>}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="moneda">Moneda</Label>
                      <Select onValueChange={(v) => setEditingInmueble({...editingInmueble, moneda: v as Inmueble['moneda']})} value={editingInmueble.moneda}>
                        <SelectTrigger id="moneda"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem key="Soles" value="Soles">Soles (S/)</SelectItem>
                          <SelectItem key="Dólares" value="Dólares">Dólares ($)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="areaMetrosCuadrados">Área (m²)</Label>
                    <Input
                      id="areaMetrosCuadrados"
                      type="number"
                      min="0"
                      value={editingInmueble.areaMetrosCuadrados}
                      onChange={(e) => setEditingInmueble({...editingInmueble, areaMetrosCuadrados: Number(e.target.value)})}
                      className={errors.areaMetrosCuadrados ? "border-destructive" : ""}
                    />
                    {errors.areaMetrosCuadrados && <p className="text-destructive text-xs">{errors.areaMetrosCuadrados}</p>}
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

          <AlertDialog open={!!inmuebleToDelete} onOpenChange={(open) => !open && setInmuebleToDelete(null)}>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
                <AlertDialogDescription>
                  Esta acción eliminará permanentemente el inmueble.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel onClick={() => setInmuebleToDelete(null)}>Cancelar</AlertDialogCancel>
                <AlertDialogAction onClick={confirmDelete} className="bg-destructive hover:bg-destructive/90">
                  Eliminar
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      );
    }
    