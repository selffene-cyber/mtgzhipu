'use client';

import { AdminLayout } from '@/components/layout/admin-layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  BarChart3,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Car,
  Users,
  Calendar
} from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { useEffect, useState } from 'react';

// Mock data for charts
const monthlyData = [
  { month: 'Ene', ventas: 12, leads: 45, reservas: 18 },
  { month: 'Feb', ventas: 15, leads: 52, reservas: 22 },
  { month: 'Mar', ventas: 18, leads: 61, reservas: 28 },
  { month: 'Abr', ventas: 14, leads: 48, reservas: 20 },
  { month: 'May', ventas: 22, leads: 73, reservas: 35 },
  { month: 'Jun', ventas: 19, leads: 65, reservas: 30 },
];

const vehicleTypes = [
  { name: 'Sedán', value: 35 },
  { name: 'SUV', value: 28 },
  { name: 'Hatchback', value: 18 },
  { name: 'Pickup', value: 12 },
  { name: 'Deportivo', value: 7 },
];

const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'];

export default function ReportesPage() {
  const [period, setPeriod] = useState('6m');
  const [stats, setStats] = useState({
    totalVehicles: 0,
    totalLeads: 0,
    totalReservations: 0,
    conversionRate: 0,
  });

  useEffect(() => {
    async function fetchStats() {
      try {
        const [vehiclesRes, leadsRes, reservationsRes] = await Promise.all([
          fetch('/api/vehicles'),
          fetch('/api/leads'),
          fetch('/api/reservations'),
        ]);

        const vehiclesData = await vehiclesRes.json();
        const leadsData = await leadsRes.json();
        const reservationsData = await reservationsRes.json();

        if (vehiclesData.success && leadsData.success && reservationsData.success) {
          const totalVehicles = vehiclesData.pagination?.total || 0;
          const totalLeads = leadsData.pagination?.total || 0;
          const totalReservations = reservationsData.pagination?.total || 0;

          setStats({
            totalVehicles,
            totalLeads,
            totalReservations,
            conversionRate: totalLeads > 0 ? ((totalReservations / totalLeads) * 100).toFixed(1) : 0,
          });
        }
      } catch (error) {
        console.error('Error fetching stats:', error);
      }
    }
    fetchStats();
  }, []);

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold">Reportes y Métricas</h1>
            <p className="text-muted-foreground">Análisis de rendimiento del negocio</p>
          </div>
          <Select value={period} onValueChange={setPeriod}>
            <SelectTrigger className="w-40">
              <Calendar className="w-4 h-4 mr-2" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1m">Último mes</SelectItem>
              <SelectItem value="3m">Últimos 3 meses</SelectItem>
              <SelectItem value="6m">Últimos 6 meses</SelectItem>
              <SelectItem value="1y">Último año</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <Car className="w-8 h-8 text-primary" />
                <Badge variant="secondary">+12%</Badge>
              </div>
              <p className="text-2xl font-bold mt-2">{stats.totalVehicles}</p>
              <p className="text-sm text-muted-foreground">Vehículos en inventario</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <Users className="w-8 h-8 text-green-500" />
                <Badge variant="secondary">+8%</Badge>
              </div>
              <p className="text-2xl font-bold mt-2">{stats.totalLeads}</p>
              <p className="text-sm text-muted-foreground">Leads totales</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <Calendar className="w-8 h-8 text-yellow-500" />
                <Badge variant="secondary">+15%</Badge>
              </div>
              <p className="text-2xl font-bold mt-2">{stats.totalReservations}</p>
              <p className="text-sm text-muted-foreground">Reservas</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <TrendingUp className="w-8 h-8 text-purple-500" />
                <Badge className="bg-green-100 text-green-700">+3%</Badge>
              </div>
              <p className="text-2xl font-bold mt-2">{stats.conversionRate}%</p>
              <p className="text-sm text-muted-foreground">Tasa de conversión</p>
            </CardContent>
          </Card>
        </div>

        {/* Charts */}
        <div className="grid lg:grid-cols-2 gap-6">
          {/* Sales Chart */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Ventas Mensuales</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={monthlyData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Area
                      type="monotone"
                      dataKey="ventas"
                      stroke="#3B82F6"
                      fill="#3B82F6"
                      fillOpacity={0.3}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Leads Chart */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Leads vs Reservas</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={monthlyData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="leads" fill="#10B981" />
                    <Bar dataKey="reservas" fill="#F59E0B" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Pie Chart */}
        <div className="grid lg:grid-cols-3 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Tipos de Vehículos Vendidos</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={vehicleTypes}
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={80}
                      fill="#8884d8"
                      paddingAngle={5}
                      dataKey="value"
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    >
                      {vehicleTypes.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Top Vehicles */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="text-lg">Vehículos Más Consultados</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  { brand: 'Toyota', model: 'Corolla', queries: 45, trend: 'up' },
                  { brand: 'Chevrolet', model: 'Cruze', queries: 38, trend: 'up' },
                  { brand: 'Hyundai', model: 'Tucson', queries: 32, trend: 'down' },
                  { brand: 'Ford', model: 'Ranger', queries: 28, trend: 'up' },
                  { brand: 'Nissan', model: 'X-Trail', queries: 25, trend: 'same' },
                ].map((vehicle, index) => (
                  <div key={index} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center font-bold text-primary">
                        {index + 1}
                      </div>
                      <div>
                        <p className="font-medium">{vehicle.brand} {vehicle.model}</p>
                        <p className="text-sm text-muted-foreground">{vehicle.queries} consultas</p>
                      </div>
                    </div>
                    {vehicle.trend === 'up' && <TrendingUp className="w-5 h-5 text-green-500" />}
                    {vehicle.trend === 'down' && <TrendingDown className="w-5 h-5 text-red-500" />}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* KPIs Summary */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">KPIs del Negocio</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-6">
              <div className="space-y-4">
                <h4 className="font-medium text-muted-foreground">Ventas</h4>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm">Tiempo promedio en inventario</span>
                    <span className="font-medium">23 días</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Margen promedio</span>
                    <span className="font-medium text-green-600">12.5%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Vehículos vendidos este mes</span>
                    <span className="font-medium">19</span>
                  </div>
                </div>
              </div>
              <div className="space-y-4">
                <h4 className="font-medium text-muted-foreground">Leads</h4>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm">Tasa de contacto</span>
                    <span className="font-medium">87%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Tiempo de primera respuesta</span>
                    <span className="font-medium">1.5 hrs</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Leads cerrados ganados</span>
                    <span className="font-medium text-green-600">28%</span>
                  </div>
                </div>
              </div>
              <div className="space-y-4">
                <h4 className="font-medium text-muted-foreground">Reservas</h4>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm">Tasa de confirmación</span>
                    <span className="font-medium">82%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Abono promedio</span>
                    <span className="font-medium">$50,000</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Expiración promedio</span>
                    <span className="font-medium">18 hrs</span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}
