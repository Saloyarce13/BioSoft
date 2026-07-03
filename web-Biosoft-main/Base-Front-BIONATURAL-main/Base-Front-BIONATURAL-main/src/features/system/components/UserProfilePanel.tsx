import React, { useState, useEffect } from 'react';
import { Button } from '../../../components/ui/button';
import { Badge } from '../../../components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../../components/ui/card';
import { Input } from '../../../components/ui/input';
import { Label } from '../../../components/ui/label';
import { Avatar, AvatarFallback, AvatarImage } from '../../../components/ui/avatar';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '../../../components/ui/dialog';
import { toast } from 'sonner';
import { apiFetch } from '../../../lib/api';
import {
  User, Mail, Phone, MapPin, CreditCard, TrendingUp,
  ShoppingBag, Users, Package, Calendar, Award, Edit3, LogOut, Shield, Building2
} from 'lucide-react';

interface UserProfilePanelProps {
  user: { name: string; email: string; role: string };
  onLogout: () => void;
}

const getUserStats = (role: string) => {
  switch (role) {
    case 'Administrador':
      return [
        { label: 'Usuarios Activos',    value: '1,234',   icon: Users,       color: 'text-blue-600' },
        { label: 'Ventas del Mes',       value: '$156,300', icon: TrendingUp,  color: 'text-green-600' },
        { label: 'Productos Activos',    value: '456',     icon: Package,     color: 'text-purple-600' },
        { label: 'Órdenes Procesadas',   value: '2,891',   icon: ShoppingBag, color: 'text-orange-600' },
      ];
    case 'Vendedor':
      return [
        { label: 'Ventas Realizadas',   value: '89',     icon: ShoppingBag, color: 'text-green-600' },
        { label: 'Clientes Atendidos',  value: '156',    icon: Users,       color: 'text-blue-600' },
        { label: 'Comisiones',          value: '$2,340', icon: TrendingUp,  color: 'text-purple-600' },
        { label: 'Meta Mensual',        value: '76%',    icon: Award,       color: 'text-orange-600' },
      ];
    case 'Bodega':
      return [
        { label: 'Productos Gestionados', value: '456', icon: Package,     color: 'text-blue-600' },
        { label: 'Envíos Procesados',     value: '234', icon: ShoppingBag, color: 'text-green-600' },
        { label: 'Stock Actualizado',     value: '98%', icon: TrendingUp,  color: 'text-purple-600' },
        { label: 'Alertas Resueltas',     value: '12',  icon: Award,       color: 'text-orange-600' },
      ];
    case 'Contador':
      return [
        { label: 'Reportes Generados', value: '45',      icon: TrendingUp,  color: 'text-green-600' },
        { label: 'Pagos Procesados',   value: '$89,456', icon: CreditCard,  color: 'text-blue-600' },
        { label: 'Facturas Emitidas',  value: '234',     icon: Calendar,    color: 'text-purple-600' },
        { label: 'Conciliaciones',     value: '12',      icon: Award,       color: 'text-orange-600' },
      ];
    default:
      return [
        { label: 'Compras Realizadas',  value: '12',   icon: ShoppingBag, color: 'text-green-600' },
        { label: 'Productos Favoritos', value: '8',    icon: Package,     color: 'text-blue-600' },
        { label: 'Puntos Acumulados',   value: '1,250', icon: Award,      color: 'text-purple-600' },
        { label: 'Ahorros Totales',     value: '$156',  icon: TrendingUp, color: 'text-orange-600' },
      ];
  }
};

export function UserProfilePanel({ user, onLogout }: UserProfilePanelProps) {
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [saving, setSaving] = useState(false);
  const [profileData, setProfileData] = useState({
    name:    user.name,
    phone:   '',
    address: '',
    company: '',
  });

  // Cargar datos reales del usuario desde la API
  useEffect(() => {
    const load = async () => {
      try {
        const res = await apiFetch<any>('/auth/me');
        if (res.success && res.data) {
          const emp = res.data;
          setProfileData({
            name:    emp.name    || user.name,
            phone:   emp.phone   || '',
            address: emp.address || '',
            company: emp.company || '',
          });
        }
      } catch { /* usar valores por defecto */ }
    };
    load();
  }, [user.name]);

  const userStats = getUserStats(user.role);

  const getUserInitials = (name: string) =>
    name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'Administrador': return 'bg-red-100 text-red-800';
      case 'Vendedor':      return 'bg-blue-100 text-blue-800';
      case 'Bodega':        return 'bg-green-100 text-green-800';
      case 'Contador':      return 'bg-purple-100 text-purple-800';
      default:              return 'bg-gray-100 text-gray-800';
    }
  };

  const handleSave = async (data: typeof profileData) => {
    if (!data.name.trim()) { toast.error('El nombre es obligatorio'); return; }
    if (data.phone && !/^\+?\d{7,30}$/.test(data.phone)) {
      toast.error('El teléfono debe tener entre 7 y 30 dígitos'); return;
    }
    setSaving(true);
    try {
      await apiFetch('/auth/profile', {
        method: 'PUT',
        body: JSON.stringify({
          name:    data.name.trim(),
          phone:   data.phone   || undefined,
          address: data.address || undefined,
        }),
      });
      setProfileData(data);
      setIsEditingProfile(false);
      toast.success('Perfil actualizado correctamente');
      // Disparar actualización automática en todos los módulos que usan useAutoRefresh
      window.dispatchEvent(new CustomEvent('app:refresh'));
    } catch (err: any) {
      toast.error(err?.message || 'Error al guardar el perfil');
    } finally { setSaving(false); }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">

      {/* Header del perfil */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center gap-6">
            <Avatar className="h-20 w-20">
              <AvatarImage src="" alt={user.name} />
              <AvatarFallback className="bg-primary text-primary-foreground text-xl">
                {getUserInitials(profileData.name || user.name)}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-2xl font-semibold">{profileData.name || user.name}</h1>
                <Badge className={getRoleColor(user.role)}>
                  <Shield className="h-3 w-3 mr-1" />
                  {user.role}
                </Badge>
              </div>
              <p className="text-muted-foreground mb-4">{user.email}</p>
              <div className="flex gap-2">
                <Dialog open={isEditingProfile} onOpenChange={setIsEditingProfile}>
                  <DialogTrigger asChild>
                    <Button variant="outline" size="sm">
                      <Edit3 className="h-4 w-4 mr-2" />
                      Editar Perfil
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Editar Información Personal</DialogTitle>
                      <DialogDescription>Actualiza tu información de perfil</DialogDescription>
                    </DialogHeader>
                    <ProfileEditForm
                      data={profileData}
                      email={user.email}
                      saving={saving}
                      onChange={setProfileData}
                      onSave={handleSave}
                      onClose={() => setIsEditingProfile(false)}
                    />
                  </DialogContent>
                </Dialog>
                <Button variant="outline" size="sm" onClick={onLogout} className="text-red-600 hover:text-red-700">
                  <LogOut className="h-4 w-4 mr-2" />
                  Cerrar Sesión
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Estadísticas */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Estadísticas {user.role === 'Administrador' ? 'del Sistema' : 'Personales'}
          </CardTitle>
          <CardDescription>Resumen de tu actividad y rendimiento</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {userStats.map((stat, index) => (
              <div key={index} className="text-center p-4 border rounded-lg">
                <stat.icon className={`h-8 w-8 mx-auto mb-2 ${stat.color}`} />
                <div className="text-2xl font-semibold mb-1">{stat.value}</div>
                <div className="text-sm text-muted-foreground">{stat.label}</div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Información Personal — sin tabs de Métodos de Pago ni Configuración */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Información Personal
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center gap-3">
              <Mail className="h-4 w-4 text-muted-foreground shrink-0" />
              <div className="min-w-0">
                <p className="text-sm text-muted-foreground">Email</p>
                <p className="font-medium truncate">{user.email}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Phone className="h-4 w-4 text-muted-foreground shrink-0" />
              <div>
                <p className="text-sm text-muted-foreground">Teléfono</p>
                <p className="font-medium">{profileData.phone || '—'}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <MapPin className="h-4 w-4 text-muted-foreground shrink-0" />
              <div>
                <p className="text-sm text-muted-foreground">Dirección</p>
                <p className="font-medium">{profileData.address || '—'}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Building2 className="h-4 w-4 text-muted-foreground shrink-0" />
              <div>
                <p className="text-sm text-muted-foreground">Empresa</p>
                <p className="font-medium">{profileData.company || '—'}</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function ProfileEditForm({
  data, email, saving, onChange, onSave, onClose,
}: {
  data: { name: string; phone: string; address: string; company: string };
  email: string;
  saving: boolean;
  onChange: (d: any) => void;
  onSave: (d: any) => void;
  onClose: () => void;
}) {
  const [local, setLocal] = useState({ ...data });
  const [phoneError, setPhoneError] = useState('');

  const handlePhoneChange = (val: string) => {
    // Solo dígitos, máx 30
    const cleaned = val.replace(/\D/g, '').slice(0, 30);
    setLocal(p => ({ ...p, phone: cleaned }));
    if (cleaned && !/^\d{7,30}$/.test(cleaned)) {
      setPhoneError('Debe tener entre 7 y 30 dígitos numéricos');
    } else {
      setPhoneError('');
    }
  };

  return (
    <div className="space-y-4">
      {/* Nombre Completo */}
      <div>
        <Label htmlFor="name">Nombre Completo</Label>
        <Input
          id="name"
          value={local.name}
          onChange={e => setLocal(p => ({ ...p, name: e.target.value.slice(0, 100) }))}
          maxLength={100}
          autoComplete="off"
        />
      </div>

      {/* Email — solo lectura */}
      <div>
        <Label htmlFor="email">
          Email <span className="text-xs text-muted-foreground font-normal">(no se puede cambiar)</span>
        </Label>
        <Input id="email" value={email} disabled className="bg-muted cursor-not-allowed opacity-70" />
      </div>

      {/* Teléfono — solo números */}
      <div>
        <Label htmlFor="phone">Teléfono</Label>
        <Input
          id="phone"
          value={local.phone}
          onChange={e => handlePhoneChange(e.target.value)}
          inputMode="numeric"
          maxLength={30}
          placeholder="3001234567"
          autoComplete="off"
          className={phoneError ? 'border-destructive' : ''}
        />
        {phoneError
          ? <p className="text-xs text-destructive mt-1">{phoneError}</p>
          : local.phone && <p className="text-xs text-muted-foreground mt-1">{local.phone.length}/30 dígitos</p>
        }
      </div>

      {/* Empresa */}
      <div>
        <Label htmlFor="company">Empresa</Label>
        <Input
          id="company"
          value={local.company}
          onChange={e => setLocal(p => ({ ...p, company: e.target.value.slice(0, 150) }))}
          maxLength={150}
          placeholder="Nombre de la empresa"
          autoComplete="off"
        />
      </div>

      {/* Dirección */}
      <div>
        <Label htmlFor="address">Dirección</Label>
        <Input
          id="address"
          value={local.address}
          onChange={e => setLocal(p => ({ ...p, address: e.target.value.slice(0, 250) }))}
          maxLength={250}
          autoComplete="off"
          placeholder="Calle 123 #45-67, Ciudad"
        />
      </div>

      <div className="flex gap-2 justify-end pt-2">
        <Button variant="outline" onClick={onClose} disabled={saving}>Cancelar</Button>
        <Button onClick={() => { onChange(local); onSave(local); }} disabled={saving || !!phoneError}>
          {saving ? 'Guardando...' : 'Guardar Cambios'}
        </Button>
      </div>
    </div>
  );
}
