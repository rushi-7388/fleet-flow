'use client';

import { useEffect, useState } from 'react';
import { api, type MaintenanceLog } from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';

export default function MaintenancePage() {
  const [logs, setLogs] = useState<MaintenanceLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [vehicleId, setVehicleId] = useState('');

  useEffect(() => {
    const q = vehicleId ? `?vehicleId=${vehicleId}` : '';
    api.get<MaintenanceLog[]>(`/maintenance-logs${q}`).then((r) => setLogs(r.data)).finally(() => setLoading(false));
  }, [vehicleId]);

  return (
    <div>
      <h1 className="mb-6 text-2xl font-semibold">Maintenance</h1>
      <Card>
        <CardHeader className="flex flex-row flex-wrap items-center gap-4">
          <CardTitle className="text-lg">Maintenance logs</CardTitle>
          <Input
            placeholder="Filter by vehicle ID"
            className="w-48"
            value={vehicleId}
            onChange={(e) => setVehicleId(e.target.value)}
          />
        </CardHeader>
        <CardContent>
          {loading ? (
            <p className="text-muted-foreground">Loading...</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="pb-3 text-left font-medium">Vehicle</th>
                    <th className="pb-3 text-left font-medium">Date</th>
                    <th className="pb-3 text-left font-medium">Description</th>
                    <th className="pb-3 text-left font-medium">Cost</th>
                  </tr>
                </thead>
                <tbody>
                  {logs.map((log) => (
                    <tr key={log.id} className="border-b last:border-0">
                      <td className="py-3">{log.vehicle?.name ?? log.vehicleId} ({log.vehicle?.licensePlate})</td>
                      <td className="py-3">{new Date(log.date).toLocaleDateString()}</td>
                      <td className="py-3">{log.description}</td>
                      <td className="py-3">{log.cost}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {logs.length === 0 && <p className="py-4 text-center text-muted-foreground">No maintenance logs.</p>}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
