'use client';

import { useEffect, useState } from 'react';
import { api, type DashboardKpis, type DashboardFleetRow } from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select } from '@/components/ui/select';
import { StatusPill } from '@/components/StatusPill';
import { Truck, AlertTriangle, Activity, Package, CheckCircle, XCircle } from 'lucide-react';

const API_BASE = typeof window !== 'undefined' ? (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000') : '';

export default function DashboardPage() {
  const [kpis, setKpis] = useState<DashboardKpis | null>(null);
  const [fleet, setFleet] = useState<DashboardFleetRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [fleetLoading, setFleetLoading] = useState(true);
  const [apiStatus, setApiStatus] = useState<'checking' | 'ok' | 'error'>('checking');
  const [typeFilter, setTypeFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [regionFilter, setRegionFilter] = useState('');

  useEffect(() => {
    api.get<DashboardKpis>('/analytics/kpis').then((r) => setKpis(r.data)).catch(() => setKpis(null)).finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    const params = new URLSearchParams();
    if (typeFilter) params.set('type', typeFilter);
    if (statusFilter) params.set('status', statusFilter);
    if (regionFilter) params.set('region', regionFilter);
    setFleetLoading(true);
    api.get<DashboardFleetRow[]>(`/analytics/dashboard-fleet?${params}`).then((r) => setFleet(r.data)).catch(() => setFleet([])).finally(() => setFleetLoading(false));
  }, [typeFilter, statusFilter, regionFilter]);

  useEffect(() => {
    if (!API_BASE) return;
    fetch(`${API_BASE}/health`)
      .then((r) => (r.ok ? setApiStatus('ok') : setApiStatus('error')))
      .catch(() => setApiStatus('error'));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  const cards = [
    { title: 'Active Fleet', value: kpis?.activeFleet ?? 0, icon: Truck, desc: 'Vehicles available or on trip', color: 'text-blue-600', bg: 'bg-blue-500/10' },
    { title: 'Maintenance Alerts', value: kpis?.maintenanceAlerts ?? 0, icon: AlertTriangle, desc: 'Vehicles in shop', color: 'text-amber-600', bg: 'bg-amber-500/10' },
    { title: 'Utilization Rate', value: `${kpis?.utilizationRate ?? 0}%`, icon: Activity, desc: 'Active / total fleet', color: 'text-emerald-600', bg: 'bg-emerald-500/10' },
    { title: 'Pending Cargo', value: kpis?.pendingCargo ?? 0, icon: Package, desc: 'Draft trip cargo (kg)', color: 'text-violet-600', bg: 'bg-violet-500/10' },
  ];

  return (
    <div>
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
          <p className="mt-1 text-sm text-muted-foreground">Overview of your fleet operations</p>
        </div>
        <span className="flex items-center gap-2 rounded-lg bg-muted/50 px-3 py-2 text-sm text-muted-foreground">
          {apiStatus === 'checking' && <span className="animate-pulse">Checking API…</span>}
          {apiStatus === 'ok' && (
            <>
             
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
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map((c) => {
          const Icon = c.icon;
          return (
            <Card key={c.title} className="overflow-hidden">
              <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">{c.title}</CardTitle>
                <div className={`rounded-lg p-2 ${c.bg}`}>
                  <Icon className={`h-5 w-5 ${c.color}`} />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold tracking-tight">{c.value}</div>
                <p className="mt-1 text-xs text-muted-foreground">{c.desc}</p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="mt-8">
        <div className="mb-4 flex flex-wrap items-center gap-2">
          <span className="text-sm font-medium text-muted-foreground">Filters:</span>
          <Select className="w-36" value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)}>
            <option value="">All types</option>
            <option value="Truck">Truck</option>
            <option value="Van">Van</option>
            <option value="Bike">Bike</option>
          </Select>
          <Select className="w-36" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
            <option value="">All statuses</option>
            <option value="Available">Available</option>
            <option value="OnTrip">On Trip</option>
            <option value="InShop">In Shop</option>
          </Select>
          <input
            type="text"
            placeholder="Region"
            className="h-10 w-32 rounded-lg border border-input bg-background px-3 text-sm"
            value={regionFilter}
            onChange={(e) => setRegionFilter(e.target.value)}
          />
        </div>
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Fleet overview</CardTitle>
          </CardHeader>
          <CardContent>
            {fleetLoading ? (
              <div className="flex justify-center py-8">
                <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm table-hover">
                  <thead>
                    <tr className="border-b border-border/80">
                      <th className="pb-2 text-left font-medium text-muted-foreground">Vehicle ID</th>
                      <th className="pb-2 text-left font-medium text-muted-foreground">Driver</th>
                      <th className="pb-2 text-left font-medium text-muted-foreground">Status</th>
                      <th className="pb-2 text-left font-medium text-muted-foreground">Location</th>
                      <th className="pb-2 text-left font-medium text-muted-foreground">Load (kg)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {fleet.map((row) => (
                      <tr key={row.vehicleId} className="border-b border-border/50 last:border-0">
                        <td className="py-2 font-medium">{row.licensePlate} ({row.vehicleName})</td>
                        <td className="py-2">{row.driverName ?? '—'}</td>
                        <td className="py-2"><StatusPill status={row.status} /></td>
                        <td className="py-2 text-muted-foreground">{row.location ?? '—'}</td>
                        <td className="py-2">{row.load != null ? row.load : '—'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {fleet.length === 0 && <p className="py-6 text-center text-muted-foreground">No vehicles match filters.</p>}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
