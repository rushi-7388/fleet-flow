'use client';

import { useEffect, useState } from 'react';
import { api, type Driver } from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { StatusPill } from '@/components/StatusPill';
import { AlertTriangle } from 'lucide-react';

export default function DriversPage() {
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');

  useEffect(() => {
    const params = statusFilter ? `?status=${statusFilter}` : '';
    api.get<Driver[]>(`/drivers${params}`).then((r) => setDrivers(r.data)).finally(() => setLoading(false));
  }, [statusFilter]);

  const isExpired = (dateStr: string) => new Date(dateStr) < new Date();

  return (
    <div>
      <h1 className="mb-6 text-2xl font-semibold">Drivers</h1>
      <Card>
        <CardHeader className="flex flex-row flex-wrap items-center gap-4">
          <CardTitle className="text-lg">Profiles</CardTitle>
          <select
            className="h-10 rounded-md border border-input bg-background px-3 text-sm"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="">All statuses</option>
            <option value="OnDuty">On Duty</option>
            <option value="OffDuty">Off Duty</option>
            <option value="OnTrip">On Trip</option>
            <option value="Suspended">Suspended</option>
          </select>
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
                    <th className="pb-3 text-left font-medium">License</th>
                    <th className="pb-3 text-left font-medium">Expiry</th>
                    <th className="pb-3 text-left font-medium">Safety</th>
                    <th className="pb-3 text-left font-medium">Status</th>
                    <th className="pb-3 text-left font-medium">Alert</th>
                  </tr>
                </thead>
                <tbody>
                  {drivers.map((d) => {
                    const expired = isExpired(d.licenseExpiry);
                    return (
                      <tr key={d.id} className="border-b last:border-0">
                        <td className="py-3">{d.name}</td>
                        <td className="py-3">{d.licenseType}</td>
                        <td className="py-3">{new Date(d.licenseExpiry).toLocaleDateString()}</td>
                        <td className="py-3">{d.safetyScore}</td>
                        <td className="py-3"><StatusPill status={d.status} /></td>
                        <td className="py-3">
                          {expired && (
                            <span className="inline-flex items-center gap-1 rounded bg-destructive/15 px-2 py-0.5 text-xs text-destructive">
                              <AlertTriangle className="h-3 w-3" /> License expired
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
              {drivers.length === 0 && <p className="py-4 text-center text-muted-foreground">No drivers found.</p>}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
