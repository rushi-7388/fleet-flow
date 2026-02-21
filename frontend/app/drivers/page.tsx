'use client';

import { useEffect, useState } from 'react';
import { api, type Driver } from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select } from '@/components/ui/select';
import { StatusPill } from '@/components/StatusPill';
import { AlertTriangle, Plus } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';

export default function DriversPage() {
  const canEdit = useAuthStore((s) => s.hasRole('ADMIN', 'MANAGER'));
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [addForm, setAddForm] = useState({
    name: '',
    licenseType: 'Van',
    licenseExpiry: '',
    safetyScore: '100',
    status: 'OffDuty' as string,
  });
  const [addError, setAddError] = useState('');

  const load = () => {
    setLoading(true);
    const params = statusFilter ? `?status=${statusFilter}` : '';
    api.get<Driver[]>(`/drivers${params}`).then((r) => setDrivers(r.data)).finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, [statusFilter]);

  const handleAddDriver = async (e: React.FormEvent) => {
    e.preventDefault();
    setAddError('');
    try {
      await api.post('/drivers', {
        name: addForm.name,
        licenseType: addForm.licenseType,
        licenseExpiry: addForm.licenseExpiry || new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        safetyScore: Number(addForm.safetyScore) || 100,
        status: addForm.status,
      });
      setAddForm({ name: '', licenseType: 'Van', licenseExpiry: '', safetyScore: '100', status: 'OffDuty' });
      setShowAddForm(false);
      load();
    } catch (err: unknown) {
      const res = (err as { response?: { data?: { error?: string } } })?.response;
      setAddError(res?.data?.error || 'Failed to add driver');
    }
  };

  const isExpired = (dateStr: string) => new Date(dateStr) < new Date();
  const isExpiringSoon = (dateStr: string) => {
    const expiry = new Date(dateStr);
    const in30Days = new Date();
    in30Days.setDate(in30Days.getDate() + 30);
    return expiry >= new Date() && expiry <= in30Days;
  };

  const setDriverStatus = async (driverId: string, status: string) => {
    try {
      await api.patch(`/drivers/${driverId}`, { status });
      load();
    } catch (err) {
      console.error('Failed to update driver status', err);
    }
  };

  return (
    <div>
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Drivers</h1>
          <p className="mt-1 text-sm text-muted-foreground">Manage driver profiles and status</p>
        </div>
        {canEdit && (
          <Button onClick={() => { setShowAddForm(!showAddForm); setAddError(''); }}>
            <Plus className="mr-2 h-4 w-4" /> Add Driver
          </Button>
        )}
      </div>
      {showAddForm && canEdit && (
        <Card className="mb-6">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Add Driver</CardTitle>
            <Button variant="ghost" size="sm" onClick={() => setShowAddForm(false)}>Cancel</Button>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleAddDriver} className="grid gap-4 sm:grid-cols-2">
              {addError && <p className="rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive sm:col-span-2">{addError}</p>}
              <div className="space-y-2">
                <Label>Name</Label>
                <Input value={addForm.name} onChange={(e) => setAddForm((f) => ({ ...f, name: e.target.value }))} placeholder="e.g. Alex" required />
              </div>
              <div className="space-y-2">
                <Label>License type</Label>
                <Select value={addForm.licenseType} onChange={(e) => setAddForm((f) => ({ ...f, licenseType: e.target.value }))}>
                  <option value="Van">Van</option>
                  <option value="Truck">Truck</option>
                  <option value="Bike">Bike</option>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>License expiry (YYYY-MM-DD)</Label>
                <Input type="date" value={addForm.licenseExpiry} onChange={(e) => setAddForm((f) => ({ ...f, licenseExpiry: e.target.value }))} required />
              </div>
              <div className="space-y-2">
                <Label>Safety score (0–100)</Label>
                <Input type="number" min="0" max="100" value={addForm.safetyScore} onChange={(e) => setAddForm((f) => ({ ...f, safetyScore: e.target.value }))} />
              </div>
              <div className="space-y-2">
                <Label>Status</Label>
                <Select value={addForm.status} onChange={(e) => setAddForm((f) => ({ ...f, status: e.target.value }))}>
                  <option value="OnDuty">On Duty</option>
                  <option value="OffDuty">Off Duty</option>
                  <option value="Suspended">Suspended</option>
                </Select>
              </div>
              <div className="sm:col-span-2">
                <Button type="submit">Create Driver</Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}
      <Card>
        <CardHeader className="flex flex-row flex-wrap items-center gap-4">
          <CardTitle className="text-lg">Profiles</CardTitle>
          <Select className="w-40" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
            <option value="">All statuses</option>
            <option value="OnDuty">On Duty</option>
            <option value="OffDuty">Off Duty</option>
            <option value="OnTrip">On Trip</option>
            <option value="Suspended">Suspended</option>
          </Select>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm table-hover">
                <thead>
                  <tr className="border-b border-border/80">
                    <th className="pb-3 text-left font-medium text-muted-foreground">Name</th>
                    <th className="pb-3 text-left font-medium text-muted-foreground">License</th>
                    <th className="pb-3 text-left font-medium text-muted-foreground">Expiry</th>
                    <th className="pb-3 text-left font-medium text-muted-foreground">Safety</th>
                    <th className="pb-3 text-left font-medium text-muted-foreground">Status</th>
                    <th className="pb-3 text-left font-medium text-muted-foreground">Compliance</th>
                    {canEdit && <th className="pb-3 text-left font-medium text-muted-foreground">Set status</th>}
                  </tr>
                </thead>
                <tbody>
                  {drivers.map((d) => {
                    const expired = isExpired(d.licenseExpiry);
                    return (
                      <tr key={d.id} className="border-b border-border/50 last:border-0">
                        <td className="py-3 font-medium">{d.name}</td>
                        <td className="py-3">{d.licenseType}</td>
                        <td className="py-3">{new Date(d.licenseExpiry).toLocaleDateString()}</td>
                        <td className="py-3">{d.safetyScore}</td>
                        <td className="py-3"><StatusPill status={d.status} /></td>
                        <td className="py-3">
                          {expired ? (
                            <span className="inline-flex items-center gap-1 rounded-lg bg-destructive/10 px-2.5 py-1 text-xs font-medium text-destructive">
                              <AlertTriangle className="h-3 w-3" /> License expired
                            </span>
                          ) : isExpiringSoon(d.licenseExpiry) ? (
                            <span className="inline-flex items-center gap-1 rounded-lg bg-amber-500/10 px-2.5 py-1 text-xs font-medium text-amber-700 dark:text-amber-400">
                              <AlertTriangle className="h-3 w-3" /> Expiring soon
                            </span>
                          ) : (
                            <span className="text-muted-foreground text-xs">OK</span>
                          )}
                        </td>
                        {canEdit && (
                          <td className="py-3">
                            <Select
                              className="h-8 w-28 text-xs"
                              value={d.status}
                              onChange={(e) => setDriverStatus(d.id, e.target.value)}
                            >
                              <option value="OnDuty">On Duty</option>
                              <option value="OffDuty">Off Duty</option>
                              <option value="Suspended">Suspended</option>
                              <option value="OnTrip" disabled>On Trip</option>
                            </Select>
                          </td>
                        )}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
              {drivers.length === 0 && <p className="py-12 text-center text-muted-foreground">No drivers found.</p>}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
