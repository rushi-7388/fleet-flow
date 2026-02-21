'use client';

import { useEffect, useState } from 'react';
import { api, type Trip, type Vehicle, type Driver } from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select } from '@/components/ui/select';
import { StatusPill } from '@/components/StatusPill';
import { useAuthStore } from '@/store/authStore';

export default function TripsPage() {
  const canDispatch = useAuthStore((s) => s.hasRole('ADMIN', 'DISPATCHER'));
  const [trips, setTrips] = useState<Trip[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [formOpen, setFormOpen] = useState(false);
  const [ruleError, setRuleError] = useState('');
  const [submitError, setSubmitError] = useState('');
  const [completingId, setCompletingId] = useState<string | null>(null);
  const [completeEndOdo, setCompleteEndOdo] = useState('');
  const [form, setForm] = useState({
    vehicleId: '',
    driverId: '',
    cargoWeight: '',
    origin: '',
    destination: '',
  });

  const loadTrips = () => api.get<Trip[]>(`/trips${statusFilter ? `?status=${statusFilter}` : ''}`).then((r) => setTrips(r.data));
  const loadVehicles = () => api.get<Vehicle[]>('/vehicles?status=Available').then((r) => setVehicles(r.data));
  const loadDrivers = () => api.get<Driver[]>('/drivers?status=OnDuty').then((r) => setDrivers(r.data));

  useEffect(() => {
    setLoading(true);
    Promise.all([loadTrips(), loadVehicles(), loadDrivers()]).finally(() => setLoading(false));
  }, [statusFilter]);

  const availableVehicles = vehicles.filter((v) => v.status === 'Available');
  const onDutyDrivers = drivers.filter((d) => d.status === 'OnDuty');
  const isLicenseExpired = (d: Driver) => new Date(d.licenseExpiry) < new Date();
  const validDrivers = onDutyDrivers.filter((d) => !isLicenseExpired(d));

  const validateForm = (): string => {
    const v = vehicles.find((x) => x.id === form.vehicleId);
    const d = drivers.find((x) => x.id === form.driverId);
    const weight = Number(form.cargoWeight);
    if (!form.vehicleId) return 'Select a vehicle.';
    if (!form.driverId) return 'Select a driver.';
    if (!v) return 'Selected vehicle not found.';
    if (v.status !== 'Available') return 'Selected vehicle is not available.';
    if (!d) return 'Selected driver not found.';
    if (d.status !== 'OnDuty') return 'Selected driver is not on duty.';
    if (isLicenseExpired(d)) return 'Selected driver license has expired.';
    if (!Number.isFinite(weight) || weight <= 0) return 'Cargo weight must be a positive number.';
    if (weight > v.maxCapacity) return `Cargo weight (${weight}) exceeds vehicle max capacity (${v.maxCapacity}).`;
    if (!form.origin.trim()) return 'Origin is required.';
    if (!form.destination.trim()) return 'Destination is required.';
    return '';
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError('');
    setRuleError('');
    const err = validateForm();
    if (err) {
      setRuleError(err);
      return;
    }
    try {
      await api.post('/trips', {
        vehicleId: form.vehicleId,
        driverId: form.driverId,
        cargoWeight: Number(form.cargoWeight),
        origin: form.origin.trim(),
        destination: form.destination.trim(),
      });
      setForm({ vehicleId: '', driverId: '', cargoWeight: '', origin: '', destination: '' });
      setFormOpen(false);
      loadTrips();
      loadVehicles();
      loadDrivers();
    } catch (err: unknown) {
      const msg = err && typeof err === 'object' && 'response' in err && typeof (err as { response?: { data?: { error?: string } } }).response?.data?.error === 'string'
        ? (err as { response: { data: { error: string } } }).response.data.error
        : 'Failed to create trip';
      setSubmitError(msg);
    }
  };

  const handleDispatch = async (id: string) => {
    setSubmitError('');
    try {
      await api.post(`/trips/${id}/dispatch`);
      loadTrips();
      loadVehicles();
      loadDrivers();
    } catch (err: unknown) {
      const msg = err && typeof err === 'object' && 'response' in err && typeof (err as { response?: { data?: { error?: string } } }).response?.data?.error === 'string'
        ? (err as { response: { data: { error: string } } }).response.data.error
        : 'Dispatch failed';
      setSubmitError(msg);
    }
  };

  const handleComplete = async (id: string) => {
    const endOdometer = Number(completeEndOdo);
    if (!Number.isFinite(endOdometer) || endOdometer < 0) {
      setSubmitError('Enter a valid end odometer reading.');
      return;
    }
    setSubmitError('');
    try {
      await api.post(`/trips/${id}/complete`, { endOdometer });
      setCompletingId(null);
      setCompleteEndOdo('');
      loadTrips();
      loadVehicles();
      loadDrivers();
    } catch (err: unknown) {
      const msg = err && typeof err === 'object' && 'response' in err && typeof (err as { response?: { data?: { error?: string } } }).response?.data?.error === 'string'
        ? (err as { response: { data: { error: string } } }).response.data.error
        : 'Complete failed';
      setSubmitError(msg);
    }
  };

  const handleCancel = async (id: string) => {
    setSubmitError('');
    try {
      await api.post(`/trips/${id}/cancel`);
      loadTrips();
      loadVehicles();
      loadDrivers();
    } catch (err: unknown) {
      const msg = err && typeof err === 'object' && 'response' in err && typeof (err as { response?: { data?: { error?: string } } }).response?.data?.error === 'string'
        ? (err as { response: { data: { error: string } } }).response.data.error
        : 'Cancel failed';
      setSubmitError(msg);
    }
  };

  return (
    <div>
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Trips</h1>
          <p className="mt-1 text-sm text-muted-foreground">Create and manage trip dispatches</p>
        </div>
        {canDispatch && (
          <Button onClick={() => { setFormOpen(true); setRuleError(''); setSubmitError(''); }}>
            New trip
          </Button>
        )}
      </div>
      {submitError && (
        <div className="mb-6 rounded-lg border border-destructive/20 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {submitError}
        </div>
      )}
      {formOpen && canDispatch && (
        <Card className="mb-6">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Create trip (dispatcher)</CardTitle>
            <Button variant="ghost" size="sm" onClick={() => setFormOpen(false)}>Close</Button>
          </CardHeader>
          <CardContent>
            {ruleError && <p className="mb-4 rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">{ruleError}</p>}
            <form onSubmit={handleCreate} className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>Vehicle (available only)</Label>
                <Select value={form.vehicleId} onChange={(e) => setForm((f) => ({ ...f, vehicleId: e.target.value }))}>
                  <option value="">Select vehicle</option>
                  {availableVehicles.map((v) => (
                    <option key={v.id} value={v.id}>{v.name} – {v.licensePlate} (max {v.maxCapacity} kg)</option>
                  ))}
                  {availableVehicles.length === 0 && <option value="" disabled>No available vehicles</option>}
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Driver (on duty, valid license)</Label>
                <Select value={form.driverId} onChange={(e) => setForm((f) => ({ ...f, driverId: e.target.value }))}>
                  <option value="">Select driver</option>
                  {validDrivers.map((d) => (
                    <option key={d.id} value={d.id}>{d.name} ({d.licenseType})</option>
                  ))}
                  {validDrivers.length === 0 && <option value="" disabled>No on-duty drivers with valid license</option>}
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Cargo weight (kg)</Label>
                <Input
                  type="number"
                  step="0.01"
                  min="0"
                  value={form.cargoWeight}
                  onChange={(e) => setForm((f) => ({ ...f, cargoWeight: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label>Origin</Label>
                <Input value={form.origin} onChange={(e) => setForm((f) => ({ ...f, origin: e.target.value }))} />
              </div>
              <div className="space-y-2 sm:col-span-2">
                <Label>Destination</Label>
                <Input value={form.destination} onChange={(e) => setForm((f) => ({ ...f, destination: e.target.value }))} />
              </div>
              <Button type="submit">Create draft</Button>
            </form>
          </CardContent>
        </Card>
      )}
      <Card>
        <CardHeader className="flex flex-row flex-wrap items-center gap-4">
          <CardTitle className="text-lg">Trips</CardTitle>
          <Select className="w-40" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
            <option value="">All statuses</option>
            <option value="Draft">Draft</option>
            <option value="Dispatched">Dispatched</option>
            <option value="Completed">Completed</option>
            <option value="Cancelled">Cancelled</option>
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
                    <th className="pb-3 text-left font-medium text-muted-foreground">Origin → Dest.</th>
                    <th className="pb-3 text-left font-medium text-muted-foreground">Vehicle</th>
                    <th className="pb-3 text-left font-medium text-muted-foreground">Driver</th>
                    <th className="pb-3 text-left font-medium text-muted-foreground">Cargo</th>
                    <th className="pb-3 text-left font-medium text-muted-foreground">Status</th>
                    {canDispatch && <th className="pb-3 text-left font-medium text-muted-foreground">Dispatch / Complete</th>}
                  </tr>
                </thead>
                <tbody>
                  {trips.map((t) => (
                    <tr key={t.id} className="border-b border-border/50 last:border-0">
                      <td className="py-3 font-medium">{t.origin} → {t.destination}</td>
                      <td className="py-3">{t.vehicle?.name ?? t.vehicleId}</td>
                      <td className="py-3">{t.driver?.name ?? t.driverId}</td>
                      <td className="py-3">{t.cargoWeight}</td>
                      <td className="py-3"><StatusPill status={t.status} /></td>
                      {canDispatch && (
                        <td className="py-3">
                          <div className="flex flex-wrap gap-2">
                            {t.status === 'Draft' && <Button size="sm" onClick={() => handleDispatch(t.id)}>Dispatch</Button>}
                            {t.status === 'Dispatched' && (
                              completingId === t.id ? (
                                <span className="flex items-center gap-2">
                                  <Input
                                    type="number"
                                    placeholder="End km"
                                    className="h-8 w-24"
                                    value={completeEndOdo}
                                    onChange={(e) => setCompleteEndOdo(e.target.value)}
                                  />
                                  <Button size="sm" onClick={() => handleComplete(t.id)}>Confirm</Button>
                                  <Button size="sm" variant="ghost" onClick={() => { setCompletingId(null); setCompleteEndOdo(''); }}>Cancel</Button>
                                </span>
                              ) : (
                                <Button size="sm" variant="outline" onClick={() => setCompletingId(t.id)}>Complete</Button>
                              )
                            )}
                            {(t.status === 'Draft' || t.status === 'Dispatched') && (
                              <Button size="sm" variant="destructive" onClick={() => handleCancel(t.id)}>Cancel</Button>
                            )}
                          </div>
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
              {trips.length === 0 && <p className="py-12 text-center text-muted-foreground">No trips found.</p>}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
