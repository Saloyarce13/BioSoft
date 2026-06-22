import { BarChart3, Briefcase, Building2, DollarSign, FileText, Package, Shield, ShoppingCart, Truck, Users, Tag } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

export interface SidebarItem {
  icon: LucideIcon;
  label: string;
  id: string;
  roles: string[];
  permission?: string;
}

export interface SidebarGroup {
  icon: LucideIcon;
  label: string;
  id: string;                // id único del grupo (no es una vista)
  roles: string[];           // roles que pueden ver el grupo
  children: SidebarItem[];   // subprocesos
}

// Ítem suelto (sin grupo) — solo Dashboard
export const SIDEBAR_TOP: SidebarItem[] = [
  { icon: BarChart3, label: 'Estadísticas', id: 'dashboard', roles: ['Administrador', 'administrador', 'Vendedor', 'Contador'], permission: 'reports.view' },
];

// Grupos con subprocesos
export const SIDEBAR_GROUPS: SidebarGroup[] = [
  {
    icon: Users,
    label: 'Usuarios',
    id: 'group-usuarios',
    roles: ['Administrador', 'administrador'],
    children: [
      { icon: Users,    label: 'Usuarios',   id: 'users',     roles: ['Administrador', 'administrador'], permission: 'users.view' },
      { icon: Briefcase,label: 'Empleados',  id: 'employees', roles: ['Administrador', 'administrador'], permission: 'employees.view' },
      { icon: Shield,   label: 'Roles',      id: 'roles',     roles: ['Administrador', 'administrador'], permission: 'roles.view' },
    ],
  },
  {
    icon: Truck,
    label: 'Compras',
    id: 'group-compras',
    roles: ['Administrador', 'administrador'],
    children: [
      { icon: Building2,   label: 'Proveedores', id: 'providers',  roles: ['Administrador', 'administrador'], permission: 'providers.view' },
      { icon: Package,     label: 'Productos',   id: 'products',   roles: ['Administrador', 'administrador'], permission: 'products.view' },
      { icon: Tag,         label: 'Categorías',  id: 'categories', roles: ['Administrador', 'administrador'], permission: 'categories.view' },
      { icon: ShoppingCart,label: 'Compras',     id: 'purchases',  roles: ['Administrador', 'administrador'], permission: 'purchases.view' },
    ],
  },
  {
    icon: DollarSign,
    label: 'Ventas',
    id: 'group-ventas',
    roles: ['Administrador', 'administrador', 'Vendedor', 'vendedor'],
    children: [
      { icon: Users,    label: 'Clientes', id: 'clients', roles: ['Administrador', 'administrador'], permission: 'clients.view' },
      { icon: FileText, label: 'Pedidos',  id: 'orders',  roles: ['Administrador', 'administrador', 'Vendedor', 'vendedor'], permission: 'sales.view' },
      { icon: DollarSign,label: 'Ventas', id: 'sales',   roles: ['Administrador', 'administrador'], permission: 'sales.view' },
    ],
  },
];

// Mantener SIDEBAR_ITEMS plano para compatibilidad con lógica de permisos existente
export const SIDEBAR_ITEMS: SidebarItem[] = [
  ...SIDEBAR_TOP,
  ...SIDEBAR_GROUPS.flatMap(g => g.children),
];
