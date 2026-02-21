'use client';

import { useEffect, useState } from 'react';
import { api, type Vehicle } from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { StatusPill } from '@/components/StatusPill';
import { Plus, Power } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';

export default function VehiclesPage() {
  const canEdit = useAuthStore((s) => s.hasRole('ADMIN', 'MANAGER', 'DISPATCHER'));
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [regionFilter, setRegionFilter] = useState('');

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

  useEffect(() => { load(); }, [statusFilter, typeFilter, regionFilter]);

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Vehicles</h1>
      </div>
      <Card>
        <CardHeader className="flex flex-row flex-wrap items-center gap-4">
          <CardTitle className="text-lg">Registry</CardTitle>
          <div className="flex flex-wrap gap-2">
            <select
              className="h-10 rounded-md border border-input bg-background px-3 text-sm"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="">All statuses</option>
              <option value="Available">Available</option>
              <option value="OnTrip">On Trip</option>
              <option value="InShop">In Shop</option>
              <option value="Retired">Retired</option>
            </select>
            <select
              className="h-10 rounded-md border border-input bg-background px-3 text-sm"
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
            >
              <option value="">All types</option>
              <option value="Truck">Truck</option>
              <option value="Van">Van</option>
              <option value="Bike">Bike</option>
            </select>
            <Input
              placeholder="Filter by region"
              className="w-40"
              value={regionFilter}
              onChange={(e) => setRegionFilter(e.target.value)}
            />
            <Button variant="outline" size="sm" onClick={load}>Refresh</Button>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p className="text-muted-foreground">Loading...</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="pb-3 text-left font-medium">Name</th>
                    <th className="pb-3 text-left font-medium">Plate</th>
                    <th className="pb-3 text-left font-medium">Type</th>
                    <th className="pb-3 text-left font-medium">Region</th>
                    <th className="pb-3 text-left font-medium">Max cap.</th>
                    <th className="pb-3 text-left font-medium">Odometer</th>
                    <th className="pb-3 text-left font-medium">Status</th>
                    {canEdit && <th className="pb-3 text-left font-medium">Actions</th>}
                  </tr>
                </thead>
                <tbody>
                  {vehicles.map((v) => (
                    <tr key={v.id} className="border-b last:border-0">
                      <td className="py-3">{v.name}</td>
                      <td className="py-3 font-mono">{v.licensePlate}</td>
                      <td className="py-3">{v.type}</td>
                      <td className="py-3">{v.region}</td>
                      <td className="py-3">{v.maxCapacity}</td>
                      <td className="py-3">{v.odometer}</td>
                      <td className="py-3"><StatusPill status={v.status} /></td>
                      {canEdit && (
                        <td className="py-3">
                          <Button
                            variant={v.status === 'Retired' ? 'default' : 'outline'}
                            size="sm"
                            onClick={() => toggleOutOfService(v)}
                            className="gap-2"
                          >
                            <Power className="h-3 w-3" />
                            {v.status === 'Retired' ? 'Activate' : 'Out of Service'}
                          </Button>
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
              {vehicles.length === 0 && <p className="py-4 text-center text-muted-foreground">No vehicles found.</p>}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
