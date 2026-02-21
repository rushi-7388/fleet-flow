'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';

interface FuelLog {
  id: string;
  vehicleId: string;
  liters: number;
  cost: number;
  date: string;
  vehicle?: { name: string; licensePlate: string };
}

interface MaintenanceLog {
  id: string;
  vehicleId: string;
  description: string;
  cost: number;
  date: string;
  vehicle?: { name: string; licensePlate: string };
}

export default function ExpensesPage() {
  const [fuel, setFuel] = useState<FuelLog[]>([]);
  const [maintenance, setMaintenance] = useState<MaintenanceLog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get<FuelLog[]>('/fuel-logs'),
      api.get<MaintenanceLog[]>('/maintenance-logs'),
    ]).then(([f, m]) => {
      setFuel(f.data);
      setMaintenance(m.data);
    }).finally(() => setLoading(false));
  }, []);

  const totalFuel = fuel.reduce((s, x) => s + x.cost, 0);
  const totalMaintenance = maintenance.reduce((s, x) => s + x.cost, 0);

  return (
    <div>
      <h1 className="mb-6 text-2xl font-semibold">Expenses</h1>
      <div className="mb-6 grid gap-4 md:grid-cols-2">
        <div className="rounded-lg border bg-card p-4">
          <h2 className="font-medium text-muted-foreground">Total fuel cost</h2>
          <p className="text-2xl font-bold">{totalFuel.toFixed(2)}</p>
        </div>
        <div className="rounded-lg border bg-card p-4">
          <h2 className="font-medium text-muted-foreground">Total maintenance cost</h2>
          <p className="text-2xl font-bold">{totalMaintenance.toFixed(2)}</p>
        </div>
      </div>
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-lg border bg-card">
          <div className="border-b p-4 font-medium">Fuel logs</div>
          <div className="overflow-x-auto p-4">
            {loading ? <p className="text-muted-foreground">Loading...</p> : (
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="pb-2 text-left font-medium">Vehicle</th>
                    <th className="pb-2 text-left font-medium">Date</th>
                    <th className="pb-2 text-left font-medium">Liters</th>
                    <th className="pb-2 text-left font-medium">Cost</th>
                  </tr>
                </thead>
                <tbody>
                  {fuel.map((f) => (
                    <tr key={f.id} className="border-b last:border-0">
                      <td className="py-2">{f.vehicle?.name ?? f.vehicleId}</td>
                      <td className="py-2">{new Date(f.date).toLocaleDateString()}</td>
                      <td className="py-2">{f.liters}</td>
                      <td className="py-2">{f.cost}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
            {!loading && fuel.length === 0 && <p className="text-muted-foreground">No fuel logs.</p>}
          </div>
        </div>
        <div className="rounded-lg border bg-card">
          <div className="border-b p-4 font-medium">Maintenance logs</div>
          <div className="overflow-x-auto p-4">
            {loading ? <p className="text-muted-foreground">Loading...</p> : (
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="pb-2 text-left font-medium">Vehicle</th>
                    <th className="pb-2 text-left font-medium">Date</th>
                    <th className="pb-2 text-left font-medium">Description</th>
                    <th className="pb-2 text-left font-medium">Cost</th>
                  </tr>
                </thead>
                <tbody>
                  {maintenance.map((m) => (
                    <tr key={m.id} className="border-b last:border-0">
                      <td className="py-2">{m.vehicle?.name ?? m.vehicleId}</td>
                      <td className="py-2">{new Date(m.date).toLocaleDateString()}</td>
                      <td className="py-2">{m.description}</td>
                      <td className="py-2">{m.cost}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
            {!loading && maintenance.length === 0 && <p className="text-muted-foreground">No maintenance logs.</p>}
          </div>
        </div>
      </div>
    </div>
  );
}
