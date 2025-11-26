import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../ui/card";
import { Button } from "../ui/button";
import { Label } from "../ui/label";
import { Input } from "../ui/input";
import { UserIcon, MailIcon, KeyIcon } from 'lucide-react';

export function Profile() {
  const [userEmail, setUserEmail] = useState('Cargando...');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchUserProfile = async () => {
      const token = sessionStorage.getItem('token');
      if (!token) {
        setError('No autenticado.');
        setIsLoading(false);
        return;
      }
      try {
        const response = await fetch('http://localhost:3001/api/users/me', {
          headers: { 'x-auth-token': token },
        });
        if (!response.ok) throw new Error('Error al cargar el perfil del usuario');
        const data = await response.json();
        setUserEmail(data.email);
      } catch (err) {
        console.error("Error fetching user profile:", err);
        setError('No se pudo cargar el perfil.');
      } finally {
        setIsLoading(false);
      }
    };
    fetchUserProfile();
  }, []);

  const handleChangePassword = () => {
    alert('Funcionalidad para cambiar contraseña en desarrollo.');
    // Aquí iría la lógica para abrir un modal o redirigir a un formulario de cambio de contraseña
  };

  if (isLoading) return <p>Cargando perfil...</p>;
  if (error) return <p className="text-red-500">{error}</p>;

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Mi Perfil</h2>
      <p className="text-muted-foreground">Gestiona la información de tu cuenta.</p>

      <Card className="max-w-md">
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><UserIcon className="h-5 w-5" /> Información de Usuario</CardTitle>
          <CardDescription>Detalles de tu cuenta en HogarPlan.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="email" className="flex items-center gap-2"><MailIcon className="h-4 w-4" /> Email</Label>
            <Input id="email" type="email" value={userEmail} readOnly className="mt-1" />
          </div>
          <Button variant="outline" className="w-full" onClick={handleChangePassword}>
            <KeyIcon className="mr-2 h-4 w-4" /> Cambiar Contraseña
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
