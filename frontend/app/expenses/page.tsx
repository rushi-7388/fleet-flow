'use client';

import { useEffect, useState } from 'react';
import { api, type Vehicle, type Trip, type Expense, type FuelLog, type MaintenanceLog } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select } from '@/components/ui/select';
import { Plus, Fuel, Wrench, Receipt } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';

const EXPENSE_TYPES = ['Fuel', 'Maintenance', 'Toll', 'Repair', 'Other'] as const;

export default function ExpensesPage() {
  const canEdit = useAuthStore((s) => s.hasRole('ADMIN', 'MANAGER'));
  const [fuel, setFuel] = useState<FuelLog[]>([]);
  const [maintenance, setMaintenance] = useState<MaintenanceLog[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [trips, setTrips] = useState<Trip[]>([]);
  const [loading, setLoading] = useState(true);
  const [showFuelForm, setShowFuelForm] = useState(false);
  const [showExpenseForm, setShowExpenseForm] = useState(false);
  const [fuelForm, setFuelForm] = useState({ vehicleId: '', liters: '', cost: '', date: new Date().toISOString().split('T')[0] });
  const [expenseForm, setExpenseForm] = useState({
    vehicleId: '',
    tripId: '',
    expenseType: 'Other' as string,
    amount: '',
    date: new Date().toISOString().split('T')[0],
    description: '',
  });
  const [fuelError, setFuelError] = useState('');
  const [expenseError, setExpenseError] = useState('');

  const load = () => {
    Promise.all([
      api.get<FuelLog[]>('/fuel-logs'),
      api.get<MaintenanceLog[]>('/maintenance-logs'),
      api.get<Expense[]>('/expenses'),
    ]).then(([f, m, e]) => {
      setFuel(f.data);
      setMaintenance(m.data);
      setExpenses(e.data);
    }).finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, []);

  useEffect(() => {
    api.get<Vehicle[]>('/vehicles').then((r) => setVehicles(r.data));
    api.get<Trip[]>('/trips').then((r) => setTrips(r.data));
  }, []);

  const handleAddFuel = async (e: React.FormEvent) => {
    e.preventDefault();
    setFuelError('');
    try {
      await api.post('/fuel-logs', {
        vehicleId: fuelForm.vehicleId,
        liters: Number(fuelForm.liters),
        cost: Number(fuelForm.cost),
        date: fuelForm.date,
      });
      setFuelForm({ vehicleId: '', liters: '', cost: '', date: new Date().toISOString().split('T')[0] });
      setShowFuelForm(false);
      load();
    } catch (err: unknown) {
      const res = (err as { response?: { data?: { error?: string } } })?.response;
      setFuelError(res?.data?.error || 'Failed to add fuel log');
    }
  };

  const handleAddExpense = async (e: React.FormEvent) => {
    e.preventDefault();
    setExpenseError('');
    try {
      await api.post('/expenses', {
        vehicleId: expenseForm.vehicleId,
        tripId: expenseForm.tripId || undefined,
        expenseType: expenseForm.expenseType,
        amount: Number(expenseForm.amount),
        date: expenseForm.date,
        description: expenseForm.description || undefined,
      });
      setExpenseForm({
        vehicleId: '',
        tripId: '',
        expenseType: 'Other',
        amount: '',
        date: new Date().toISOString().split('T')[0],
        description: '',
      });
      setShowExpenseForm(false);
      load();
    } catch (err: unknown) {
      const res = (err as { response?: { data?: { error?: string } } })?.response;
      setExpenseError(res?.data?.error || 'Failed to add expense');
    }
  };

  const totalFuel = fuel.reduce((s, x) => s + x.cost, 0);
  const totalMaintenance = maintenance.reduce((s, x) => s + x.cost, 0);
  const totalExpenses = expenses.reduce((s, x) => s + x.amount, 0);
  const totalOperational = totalFuel + totalMaintenance + totalExpenses;

  return (
    <div>
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Expenses</h1>
          <p className="mt-1 text-sm text-muted-foreground">Track fuel, maintenance, and operational costs</p>
        </div>
        {canEdit && (
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => { setShowFuelForm(!showFuelForm); setFuelError(''); }}>
              <Fuel className="mr-2 h-4 w-4" /> Log fuel
            </Button>
            <Button onClick={() => { setShowExpenseForm(!showExpenseForm); setExpenseError(''); }}>
              <Plus className="mr-2 h-4 w-4" /> Log expense
            </Button>
          </div>
        )}
      </div>

      {showExpenseForm && canEdit && (
        <Card className="mb-6">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Log expense (trip optional)</CardTitle>
            <Button variant="ghost" size="sm" onClick={() => setShowExpenseForm(false)}>Cancel</Button>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleAddExpense} className="grid gap-4 sm:grid-cols-2">
              {expenseError && <p className="rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive sm:col-span-2">{expenseError}</p>}
              <div className="space-y-2">
                <Label>Vehicle</Label>
                <Select value={expenseForm.vehicleId} onChange={(e) => setExpenseForm((f) => ({ ...f, vehicleId: e.target.value }))} required>
                  <option value="">Select vehicle</option>
                  {vehicles.map((v) => (
                    <option key={v.id} value={v.id}>{v.name} ({v.licensePlate})</option>
                  ))}
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Trip (optional)</Label>
                <Select value={expenseForm.tripId} onChange={(e) => setExpenseForm((f) => ({ ...f, tripId: e.target.value }))}>
                  <option value="">—</option>
                  {trips.filter((t) => t.status === 'Completed' || t.status === 'Dispatched').map((t) => (
                    <option key={t.id} value={t.id}>{t.origin} → {t.destination}</option>
                  ))}
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Expense type</Label>
                <Select value={expenseForm.expenseType} onChange={(e) => setExpenseForm((f) => ({ ...f, expenseType: e.target.value }))}>
                  {EXPENSE_TYPES.map((t) => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Amount</Label>
                <Input type="number" min="0" step="0.01" value={expenseForm.amount} onChange={(e) => setExpenseForm((f) => ({ ...f, amount: e.target.value }))} required />
              </div>
              <div className="space-y-2">
                <Label>Date</Label>
                <Input type="date" value={expenseForm.date} onChange={(e) => setExpenseForm((f) => ({ ...f, date: e.target.value }))} required />
              </div>
              <div className="space-y-2 sm:col-span-2">
                <Label>Description (optional)</Label>
                <Input value={expenseForm.description} onChange={(e) => setExpenseForm((f) => ({ ...f, description: e.target.value }))} placeholder="e.g. Highway toll" />
              </div>
              <div className="sm:col-span-2">
                <Button type="submit">Log expense</Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {showFuelForm && canEdit && (
        <Card className="mb-6">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Add fuel log</CardTitle>
            <Button variant="ghost" size="sm" onClick={() => setShowFuelForm(false)}>Cancel</Button>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleAddFuel} className="grid gap-4 sm:grid-cols-2">
              {fuelError && <p className="rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive sm:col-span-2">{fuelError}</p>}
              <div className="space-y-2">
                <Label>Vehicle</Label>
                <Select value={fuelForm.vehicleId} onChange={(e) => setFuelForm((f) => ({ ...f, vehicleId: e.target.value }))} required>
                  <option value="">Select vehicle</option>
                  {vehicles.map((v) => (
                    <option key={v.id} value={v.id}>{v.name} ({v.licensePlate})</option>
                  ))}
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Liters</Label>
                <Input type="number" min="0" step="0.01" value={fuelForm.liters} onChange={(e) => setFuelForm((f) => ({ ...f, liters: e.target.value }))} required />
              </div>
              <div className="space-y-2">
                <Label>Cost</Label>
                <Input type="number" min="0" step="0.01" value={fuelForm.cost} onChange={(e) => setFuelForm((f) => ({ ...f, cost: e.target.value }))} required />
              </div>
              <div className="space-y-2">
                <Label>Date</Label>
                <Input type="date" value={fuelForm.date} onChange={(e) => setFuelForm((f) => ({ ...f, date: e.target.value }))} required />
              </div>
              <div className="sm:col-span-2">
                <Button type="submit">Add fuel log</Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      <div className="mb-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total fuel</CardTitle>
            <div className="rounded-lg bg-amber-500/10 p-2"><Fuel className="h-5 w-5 text-amber-600" /></div>
          </CardHeader>
          <CardContent><p className="text-2xl font-bold tracking-tight">{totalFuel.toFixed(2)}</p></CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total maintenance</CardTitle>
            <div className="rounded-lg bg-violet-500/10 p-2"><Wrench className="h-5 w-5 text-violet-600" /></div>
          </CardHeader>
          <CardContent><p className="text-2xl font-bold tracking-tight">{totalMaintenance.toFixed(2)}</p></CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Other expenses</CardTitle>
            <div className="rounded-lg bg-blue-500/10 p-2"><Receipt className="h-5 w-5 text-blue-600" /></div>
          </CardHeader>
          <CardContent><p className="text-2xl font-bold tracking-tight">{totalExpenses.toFixed(2)}</p></CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total operational cost</CardTitle>
            <div className="rounded-lg bg-primary/10 p-2"><Receipt className="h-5 w-5 text-primary" /></div>
          </CardHeader>
          <CardContent><p className="text-2xl font-bold tracking-tight">{totalOperational.toFixed(2)}</p></CardContent>
        </Card>
      </div>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-lg">All expenses (unified)</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center py-12">
              <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm table-hover">
                <thead>
                  <tr className="border-b border-border/80">
                    <th className="pb-2 text-left font-medium text-muted-foreground">Expense ID</th>
                    <th className="pb-2 text-left font-medium text-muted-foreground">Vehicle ID</th>
                    <th className="pb-2 text-left font-medium text-muted-foreground">Trip ID</th>
                    <th className="pb-2 text-left font-medium text-muted-foreground">Expense type</th>
                    <th className="pb-2 text-left font-medium text-muted-foreground">Amount</th>
                    <th className="pb-2 text-left font-medium text-muted-foreground">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {expenses.map((x) => (
                    <tr key={x.id} className="border-b border-border/50 last:border-0">
                      <td className="py-2 font-mono text-xs">{x.id.slice(0, 8)}</td>
                      <td className="py-2">{x.vehicle?.name ?? x.vehicleId} ({x.vehicle?.licensePlate})</td>
                      <td className="py-2">{x.trip ? `${x.trip.origin}→${x.trip.destination}` : '—'}</td>
                      <td className="py-2">{x.expenseType}</td>
                      <td className="py-2">{x.amount}</td>
                      <td className="py-2">{new Date(x.date).toLocaleDateString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {expenses.length === 0 && <p className="py-8 text-center text-muted-foreground">No expenses logged yet. Use &quot;Log expense&quot; or &quot;Log fuel&quot;.</p>}
            </div>
          )}
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader><CardTitle className="text-lg">Fuel logs</CardTitle></CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex justify-center py-12"><div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" /></div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm table-hover">
                  <thead>
                    <tr className="border-b border-border/80">
                      <th className="pb-2 text-left font-medium text-muted-foreground">Vehicle</th>
                      <th className="pb-2 text-left font-medium text-muted-foreground">Date</th>
                      <th className="pb-2 text-left font-medium text-muted-foreground">Liters</th>
                      <th className="pb-2 text-left font-medium text-muted-foreground">Cost</th>
                    </tr>
                  </thead>
                  <tbody>
                    {fuel.map((f) => (
                      <tr key={f.id} className="border-b border-border/50 last:border-0">
                        <td className="py-2 font-medium">{f.vehicle?.name ?? f.vehicleId}</td>
                        <td className="py-2">{new Date(f.date).toLocaleDateString()}</td>
                        <td className="py-2">{f.liters}</td>
                        <td className="py-2">{f.cost}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
            {!loading && fuel.length === 0 && <p className="py-8 text-center text-muted-foreground">No fuel logs.</p>}
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle className="text-lg">Maintenance logs</CardTitle></CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex justify-center py-12"><div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" /></div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm table-hover">
                  <thead>
                    <tr className="border-b border-border/80">
                      <th className="pb-2 text-left font-medium text-muted-foreground">Vehicle</th>
                      <th className="pb-2 text-left font-medium text-muted-foreground">Date</th>
                      <th className="pb-2 text-left font-medium text-muted-foreground">Description</th>
                      <th className="pb-2 text-left font-medium text-muted-foreground">Cost</th>
                    </tr>
                  </thead>
                  <tbody>
                    {maintenance.map((m) => (
                      <tr key={m.id} className="border-b border-border/50 last:border-0">
                        <td className="py-2 font-medium">{m.vehicle?.name ?? m.vehicleId}</td>
                        <td className="py-2">{new Date(m.date).toLocaleDateString()}</td>
                        <td className="py-2">{m.description}</td>
                        <td className="py-2">{m.cost}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
            {!loading && maintenance.length === 0 && <p className="py-8 text-center text-muted-foreground">No maintenance logs.</p>}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
