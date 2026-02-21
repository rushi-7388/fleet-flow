'use client';

import { useEffect, useState } from 'react';
import { api, type MaintenanceLog, type Vehicle } from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select } from '@/components/ui/select';
import { Plus } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';

const SERVICE_TYPES = ['Oil Change', 'Repair', 'Inspection', 'Tire Change', 'Other'];

export default function MaintenancePage() {
  const canEdit = useAuthStore((s) => s.hasRole('ADMIN', 'MANAGER'));
  const [logs, setLogs] = useState<MaintenanceLog[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [vehicleId, setVehicleId] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [addForm, setAddForm] = useState({
    vehicleId: '',
    serviceType: 'Repair',
    description: '',
    cost: '',
    date: new Date().toISOString().split('T')[0],
    nextServiceDue: '',
  });
  const [addError, setAddError] = useState('');

  const loadLogs = () => {
    const q = vehicleId ? `?vehicleId=${vehicleId}` : '';
    api.get<MaintenanceLog[]>(`/maintenance-logs${q}`).then((r) => setLogs(r.data)).finally(() => setLoading(false));
  };

  useEffect(() => {
    setLoading(true);
    const q = vehicleId ? `?vehicleId=${vehicleId}` : '';
    api.get<MaintenanceLog[]>(`/maintenance-logs${q}`).then((r) => setLogs(r.data)).finally(() => setLoading(false));
  }, [vehicleId]);

  useEffect(() => {
    api.get<Vehicle[]>('/vehicles').then((r) => setVehicles(r.data));
  }, []);

  const handleAddLog = async (e: React.FormEvent) => {
    e.preventDefault();
    setAddError('');
    try {
      await api.post('/maintenance-logs', {
        vehicleId: addForm.vehicleId,
        serviceType: addForm.serviceType,
        description: addForm.description,
        cost: Number(addForm.cost),
        date: addForm.date,
        nextServiceDue: addForm.nextServiceDue || undefined,
      });
      setAddForm({
        vehicleId: '',
        serviceType: 'Repair',
        description: '',
        cost: '',
        date: new Date().toISOString().split('T')[0],
        nextServiceDue: '',
      });
      setShowAddForm(false);
      setLoading(true);
      loadLogs();
    } catch (err: unknown) {
      const res = (err as { response?: { data?: { error?: string } } })?.response;
      setAddError(res?.data?.error || 'Failed to add maintenance log');
    }
  };

  const handleMarkComplete = async (log: MaintenanceLog) => {
    try {
      await api.patch(`/maintenance-logs/${log.id}`, { status: 'Completed' });
      loadLogs();
    } catch (err) {
      console.error('Failed to mark complete', err);
    }
  };

  return (
    <div>
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Maintenance</h1>
          <p className="mt-1 text-sm text-muted-foreground">Track vehicle service and repairs</p>
        </div>
        {canEdit && (
          <Button onClick={() => { setShowAddForm(!showAddForm); setAddError(''); }}>
            <Plus className="mr-2 h-4 w-4" /> Add service entry
          </Button>
        )}
      </div>
      {showAddForm && canEdit && (
        <Card className="mb-6">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Log maintenance (vehicle → In Shop)</CardTitle>
            <Button variant="ghost" size="sm" onClick={() => setShowAddForm(false)}>Cancel</Button>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleAddLog} className="grid gap-4 sm:grid-cols-2">
              {addError && <p className="rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive sm:col-span-2">{addError}</p>}
              <div className="space-y-2">
                <Label>Vehicle</Label>
                <Select value={addForm.vehicleId} onChange={(e) => setAddForm((f) => ({ ...f, vehicleId: e.target.value }))} required>
                  <option value="">Select vehicle</option>
                  {vehicles.map((v) => (
                    <option key={v.id} value={v.id}>{v.name} ({v.licensePlate}) - {v.status}</option>
                  ))}
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Service type</Label>
                <Select value={addForm.serviceType} onChange={(e) => setAddForm((f) => ({ ...f, serviceType: e.target.value }))}>
                  {SERVICE_TYPES.map((t) => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Description</Label>
                <Input value={addForm.description} onChange={(e) => setAddForm((f) => ({ ...f, description: e.target.value }))} placeholder="e.g. Oil change, repair" required />
              </div>
              <div className="space-y-2">
                <Label>Cost</Label>
                <Input type="number" min="0" step="0.01" value={addForm.cost} onChange={(e) => setAddForm((f) => ({ ...f, cost: e.target.value }))} required />
              </div>
              <div className="space-y-2">
                <Label>Date</Label>
                <Input type="date" value={addForm.date} onChange={(e) => setAddForm((f) => ({ ...f, date: e.target.value }))} required />
              </div>
              <div className="space-y-2">
                <Label>Next service due</Label>
                <Input type="date" value={addForm.nextServiceDue} onChange={(e) => setAddForm((f) => ({ ...f, nextServiceDue: e.target.value }))} />
              </div>
              <div className="sm:col-span-2">
                <Button type="submit">Log service (vehicle set to In Shop)</Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}
      <Card>
        <CardHeader className="flex flex-row flex-wrap items-center gap-4">
          <CardTitle className="text-lg">Maintenance logs</CardTitle>
          <Input placeholder="Filter by vehicle ID" className="w-48" value={vehicleId} onChange={(e) => setVehicleId(e.target.value)} />
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
                    <th className="pb-3 text-left font-medium text-muted-foreground">Vehicle</th>
                    <th className="pb-3 text-left font-medium text-muted-foreground">Service type</th>
                    <th className="pb-3 text-left font-medium text-muted-foreground">Date</th>
                    <th className="pb-3 text-left font-medium text-muted-foreground">Description</th>
                    <th className="pb-3 text-left font-medium text-muted-foreground">Cost</th>
                    <th className="pb-3 text-left font-medium text-muted-foreground">Next due</th>
                    <th className="pb-3 text-left font-medium text-muted-foreground">Status</th>
                    {canEdit && <th className="pb-3 text-left font-medium text-muted-foreground">Actions</th>}
                  </tr>
                </thead>
                <tbody>
                  {logs.map((log) => (
                    <tr key={log.id} className="border-b border-border/50 last:border-0">
                      <td className="py-3 font-medium">{log.vehicle?.name ?? log.vehicleId} ({log.vehicle?.licensePlate})</td>
                      <td className="py-3">{log.serviceType ?? '—'}</td>
                      <td className="py-3">{new Date(log.date).toLocaleDateString()}</td>
                      <td className="py-3">{log.description}</td>
                      <td className="py-3">{log.cost}</td>
                      <td className="py-3">{log.nextServiceDue ? new Date(log.nextServiceDue).toLocaleDateString() : '—'}</td>
                      <td className="py-3">{log.status ?? 'Pending'}</td>
                      {canEdit && (
                        <td className="py-3">
                          {log.status !== 'Completed' && (
                            <Button size="sm" variant="outline" onClick={() => handleMarkComplete(log)}>
                              Mark complete
                            </Button>
                          )}
                          {log.status === 'Completed' && <span className="text-muted-foreground text-xs">Vehicle → Available</span>}
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
              {logs.length === 0 && <p className="py-12 text-center text-muted-foreground">No maintenance logs.</p>}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
