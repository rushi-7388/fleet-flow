'use client';

import { useEffect, useState } from 'react';
import { api, type DashboardKpis } from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Truck, AlertTriangle, Activity, Package, CheckCircle, XCircle } from 'lucide-react';

const API_BASE = typeof window !== 'undefined' ? (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000') : '';

export default function DashboardPage() {
  const [kpis, setKpis] = useState<DashboardKpis | null>(null);
  const [loading, setLoading] = useState(true);
  const [apiStatus, setApiStatus] = useState<'checking' | 'ok' | 'error'>('checking');

  useEffect(() => {
    api.get<DashboardKpis>('/analytics/kpis').then((r) => setKpis(r.data)).catch(() => setKpis(null)).finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (!API_BASE) return;
    fetch(`${API_BASE}/health`)
      .then((r) => (r.ok ? setApiStatus('ok') : setApiStatus('error')))
      .catch(() => setApiStatus('error'));
  }, []);

  if (loading) return <div className="text-muted-foreground">Loading KPIs...</div>;

  const cards = [
    { title: 'Active Fleet', value: kpis?.activeFleet ?? 0, icon: Truck, desc: 'Vehicles available or on trip' },
    { title: 'Maintenance Alerts', value: kpis?.maintenanceAlerts ?? 0, icon: AlertTriangle, desc: 'Vehicles in shop' },
    { title: 'Utilization Rate', value: `${kpis?.utilizationRate ?? 0}%`, icon: Activity, desc: 'Active / total fleet' },
    { title: 'Pending Cargo', value: kpis?.pendingCargo ?? 0, icon: Package, desc: 'Draft trip cargo (kg)' },
  ];

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Dashboard</h1>
        <span className="flex items-center gap-2 text-sm text-muted-foreground">
          {apiStatus === 'checking' && <span>Checking API…</span>}
          {apiStatus === 'ok' && (
            <>
              <CheckCircle className="h-4 w-4 text-green-600" />
              Backend connected
            </>
          )}
          {apiStatus === 'error' && (
            <>
              <XCircle className="h-4 w-4 text-destructive" />
              Backend unreachable
            </>
          )}
        </span>
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {cards.map((c) => {
          const Icon = c.icon;
          return (
            <Card key={c.title}>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">{c.title}</CardTitle>
                <Icon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{c.value}</div>
                <p className="text-xs text-muted-foreground">{c.desc}</p>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
