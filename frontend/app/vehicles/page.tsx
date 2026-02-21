'use client';

import { useEffect, useState } from 'react';
import { api, type Vehicle } from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select } from '@/components/ui/select';
import { StatusPill } from '@/components/StatusPill';
import { Plus, Power } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';

export default function VehiclesPage() {
  const canEdit = useAuthStore((s) => s.hasRole('ADMIN', 'MANAGER'));
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [regionFilter, setRegionFilter] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [addForm, setAddForm] = useState({
    name: '', model: '', licensePlate: '', type: 'Van' as string,
    region: '', maxCapacity: '500', odometer: '0',
  });
  const [addError, setAddError] = useState('');

  const load = () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (statusFilter) params.set('status', statusFilter);
    if (typeFilter) params.set('type', typeFilter);
    if (regionFilter) params.set('region', regionFilter);
    api.get<Vehicle[]>(`/vehicles?${params}`).then((r) => setVehicles(r.data)).finally(() => setLoading(false));
  };

  const toggleOutOfService = async (vehicle: Vehicle) => {
    const newStatus = vehicle.status === 'Retired' ? 'Available' : 'Retired';
    try {
      await api.patch(`/vehicles/${vehicle.id}`, { status: newStatus });
      load();
    } catch (err) {
      console.error('Failed to update vehicle status', err);
    }
  };

  const markAvailable = async (vehicle: Vehicle) => {
    try {
      await api.patch(`/vehicles/${vehicle.id}`, { status: 'Available' });
      load();
    } catch (err) {
      console.error('Failed to update vehicle status', err);
    }
  };

  const handleAddVehicle = async (e: React.FormEvent) => {
    e.preventDefault();
    setAddError('');
    try {
      await api.post('/vehicles', {
        name: addForm.name,
        model: addForm.model,
        licensePlate: addForm.licensePlate,
        type: addForm.type,
        region: addForm.region,
        maxCapacity: Number(addForm.maxCapacity),
        odometer: Number(addForm.odometer) || 0,
      });
      setAddForm({ name: '', model: '', licensePlate: '', type: 'Van', region: '', maxCapacity: '500', odometer: '0' });
      setShowAddForm(false);
      load();
    } catch (err: unknown) {
      const res = (err as { response?: { data?: { error?: string } } })?.response;
      setAddError(res?.data?.error || 'Failed to add vehicle');
    }
  };

  useEffect(() => { load(); }, [statusFilter, typeFilter, regionFilter]);

  return (
    <div>
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Vehicles</h1>
          <p className="mt-1 text-sm text-muted-foreground">Manage your fleet registry</p>
        </div>
        {canEdit && (
          <Button onClick={() => { setShowAddForm(!showAddForm); setAddError(''); }}>
            <Plus className="mr-2 h-4 w-4" /> Add Vehicle
          </Button>
        )}
      </div>
      {showAddForm && canEdit && (
        <Card className="mb-6">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Add Vehicle</CardTitle>
            <Button variant="ghost" size="sm" onClick={() => setShowAddForm(false)}>Cancel</Button>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleAddVehicle} className="grid gap-4 sm:grid-cols-2">
              {addError && <p className="rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive sm:col-span-2">{addError}</p>}
              <div className="space-y-2">
                <Label>Name</Label>
                <Input value={addForm.name} onChange={(e) => setAddForm((f) => ({ ...f, name: e.target.value }))} placeholder="e.g. Van-05" required />
              </div>
              <div className="space-y-2">
                <Label>Model</Label>
                <Input value={addForm.model} onChange={(e) => setAddForm((f) => ({ ...f, model: e.target.value }))} placeholder="e.g. Cargo Van" required />
              </div>
              <div className="space-y-2">
                <Label>License Plate (unique)</Label>
                <Input value={addForm.licensePlate} onChange={(e) => setAddForm((f) => ({ ...f, licensePlate: e.target.value }))} placeholder="e.g. VAN-01" required />
              </div>
              <div className="space-y-2">
                <Label>Type</Label>
                <Select value={addForm.type} onChange={(e) => setAddForm((f) => ({ ...f, type: e.target.value }))}>
                  <option value="Truck">Truck</option>
                  <option value="Van">Van</option>
                  <option value="Bike">Bike</option>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Region</Label>
                <Input value={addForm.region} onChange={(e) => setAddForm((f) => ({ ...f, region: e.target.value }))} placeholder="e.g. North" required />
              </div>
              <div className="space-y-2">
                <Label>Max capacity (kg)</Label>
                <Input type="number" min="0" step="0.01" value={addForm.maxCapacity} onChange={(e) => setAddForm((f) => ({ ...f, maxCapacity: e.target.value }))} required />
              </div>
              <div className="space-y-2">
                <Label>Odometer</Label>
                <Input type="number" min="0" value={addForm.odometer} onChange={(e) => setAddForm((f) => ({ ...f, odometer: e.target.value }))} />
              </div>
              <div className="sm:col-span-2">
                <Button type="submit">Create Vehicle</Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}
      <Card>
        <CardHeader className="flex flex-row flex-wrap items-center gap-4">
          <CardTitle className="text-lg">Registry</CardTitle>
          <div className="flex flex-wrap gap-2">
            <Select className="w-36" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
              <option value="">All statuses</option>
              <option value="Available">Available</option>
              <option value="OnTrip">On Trip</option>
              <option value="InShop">In Shop</option>
              <option value="Retired">Retired</option>
            </Select>
            <Select className="w-32" value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)}>
              <option value="">All types</option>
              <option value="Truck">Truck</option>
              <option value="Van">Van</option>
              <option value="Bike">Bike</option>
            </Select>
            <Input placeholder="Filter by region" className="w-40" value={regionFilter} onChange={(e) => setRegionFilter(e.target.value)} />
            <Button variant="outline" size="sm" onClick={load}>Refresh</Button>
          </div>
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
                    <th className="pb-3 text-left font-medium text-muted-foreground">Plate</th>
                    <th className="pb-3 text-left font-medium text-muted-foreground">Type</th>
                    <th className="pb-3 text-left font-medium text-muted-foreground">Region</th>
                    <th className="pb-3 text-left font-medium text-muted-foreground">Max cap.</th>
                    <th className="pb-3 text-left font-medium text-muted-foreground">Odometer</th>
                    <th className="pb-3 text-left font-medium text-muted-foreground">Status</th>
                    {canEdit && <th className="pb-3 text-left font-medium text-muted-foreground">Actions</th>}
                  </tr>
                </thead>
                <tbody>
                  {vehicles.map((v) => (
                    <tr key={v.id} className="border-b border-border/50 last:border-0">
                      <td className="py-3 font-medium">{v.name}</td>
                      <td className="py-3 font-mono text-muted-foreground">{v.licensePlate}</td>
                      <td className="py-3">{v.type}</td>
                      <td className="py-3">{v.region}</td>
                      <td className="py-3">{v.maxCapacity}</td>
                      <td className="py-3">{v.odometer}</td>
                      <td className="py-3"><StatusPill status={v.status} /></td>
                      {canEdit && (
                        <td className="py-3">
                          <div className="flex flex-wrap gap-2">
                            {v.status === 'InShop' && (
                              <Button size="sm" variant="default" onClick={() => markAvailable(v)}>
                                Mark Available
                              </Button>
                            )}
                            <Button
                              variant={v.status === 'Retired' ? 'default' : 'outline'}
                              size="sm"
                              onClick={() => toggleOutOfService(v)}
                              className="gap-2"
                            >
                              <Power className="h-3 w-3" />
                              {v.status === 'Retired' ? 'Activate' : 'Out of Service'}
                            </Button>
                          </div>
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
              {vehicles.length === 0 && <p className="py-12 text-center text-muted-foreground">No vehicles found.</p>}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
