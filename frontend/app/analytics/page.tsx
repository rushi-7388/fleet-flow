'use client';

import { useEffect, useState } from 'react';
import { api, type MonthlySummary, type DashboardKpis } from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  Legend,
} from 'recharts';

export default function AnalyticsPage() {
  const [kpis, setKpis] = useState<DashboardKpis | null>(null);
  const [monthly, setMonthly] = useState<MonthlySummary[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get<DashboardKpis>('/analytics/kpis'),
      api.get<MonthlySummary[]>('/analytics/monthly-summaries'),
    ]).then(([k, m]) => {
      setKpis(k.data);
      setMonthly(m.data);
    }).finally(() => setLoading(false));
  }, []);

  const chartData = monthly.map((m) => ({
    name: m.month,
    revenue: m.revenue,
    fuelCost: m.fuelCost,
    maintenanceCost: m.maintenanceCost,
    trips: m.tripsCount,
  }));

  return (
    <div>
      <h1 className="mb-6 text-2xl font-semibold">Analytics</h1>
      {loading ? (
        <p className="text-muted-foreground">Loading...</p>
      ) : (
        <>
          <div className="mb-6 grid gap-4 md:grid-cols-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Active Fleet</CardTitle>
              </CardHeader>
              <CardContent><span className="text-2xl font-bold">{kpis?.activeFleet ?? 0}</span></CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Maintenance Alerts</CardTitle>
              </CardHeader>
              <CardContent><span className="text-2xl font-bold">{kpis?.maintenanceAlerts ?? 0}</span></CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Utilization Rate</CardTitle>
              </CardHeader>
              <CardContent><span className="text-2xl font-bold">{kpis?.utilizationRate ?? 0}%</span></CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Pending Cargo</CardTitle>
              </CardHeader>
              <CardContent><span className="text-2xl font-bold">{kpis?.pendingCargo ?? 0}</span></CardContent>
            </Card>
          </div>
          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Monthly revenue & costs</CardTitle>
              <CardDescription className="text-muted-foreground">Recharts – revenue, fuel cost, maintenance cost, trip count</CardDescription>
            </CardHeader>
            <CardContent>
              {chartData.length === 0 ? (
                <p className="text-muted-foreground">No monthly data yet.</p>
              ) : (
                <div className="h-[350px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" fontSize={12} />
                      <YAxis fontSize={12} />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="revenue" fill="hsl(var(--primary))" name="Revenue" />
                      <Bar dataKey="fuelCost" fill="#f59e0b" name="Fuel cost" />
                      <Bar dataKey="maintenanceCost" fill="#ef4444" name="Maintenance cost" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              )}
            </CardContent>
          </Card>
          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Trips per month</CardTitle>
            </CardHeader>
            <CardContent>
              {chartData.length === 0 ? (
                <p className="text-muted-foreground">No data.</p>
              ) : (
                <div className="h-[280px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" fontSize={12} />
                      <YAxis fontSize={12} />
                      <Tooltip />
                      <Line type="monotone" dataKey="trips" stroke="hsl(var(--primary))" name="Trips" strokeWidth={2} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              )}
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
