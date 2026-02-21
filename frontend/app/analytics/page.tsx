'use client';

import { useEffect, useState } from 'react';
import { api, type MonthlySummary, type DashboardKpis } from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
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

type TimeRange = '7' | '30' | '90' | 'custom';

function getRange(range: TimeRange, customStart?: string, customEnd?: string): { start: Date; end: Date } {
  const end = new Date();
  const start = new Date();
  if (range === '7') start.setDate(start.getDate() - 7);
  else if (range === '30') start.setDate(start.getDate() - 30);
  else if (range === '90') start.setDate(start.getDate() - 90);
  else if (range === 'custom' && customStart && customEnd) {
    start.setTime(new Date(customStart).getTime());
    end.setTime(new Date(customEnd).getTime());
    return { start, end };
  } else start.setDate(start.getDate() - 30);
  return { start, end };
}

export default function AnalyticsPage() {
  const [timeRange, setTimeRange] = useState<TimeRange>('30');
  const [customStart, setCustomStart] = useState('');
  const [customEnd, setCustomEnd] = useState('');
  const [kpis, setKpis] = useState<DashboardKpis | null>(null);
  const [monthly, setMonthly] = useState<MonthlySummary[]>([]);
  const [fuelTrend, setFuelTrend] = useState<{ month: string; kmPerL: number }[]>([]);
  const [topCosts, setTopCosts] = useState<{ label: string; value: number }[]>([]);
  const [summary, setSummary] = useState<{ metric: string; value: string; dateGenerated: string }[]>([]);
  const [loading, setLoading] = useState(true);

  const { start, end } = getRange(timeRange, customStart, customEnd);
  const startStr = start.toISOString().split('T')[0];
  const endStr = end.toISOString().split('T')[0];

  useEffect(() => {
    Promise.all([
      api.get<DashboardKpis>('/analytics/kpis'),
      api.get<MonthlySummary[]>('/analytics/monthly-summaries'),
    ]).then(([k, m]) => {
      setKpis(k.data);
      setMonthly(m.data);
    }).finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    const params = `?start=${startStr}&end=${endStr}`;
    Promise.all([
      api.get<{ month: string; kmPerL: number }[]>(`/analytics/fuel-efficiency-trend${params}`),
      api.get<{ label: string; value: number }[]>(`/analytics/top-operational-costs${params}&limit=5`),
      api.get<{ metric: string; value: string; dateGenerated: string }[]>(`/analytics/operational-summary${params}`),
    ]).then(([t, c, s]) => {
      setFuelTrend(t.data);
      setTopCosts(c.data);
      setSummary(s.data);
    }).catch(() => {
      setFuelTrend([]);
      setTopCosts([]);
      setSummary([]);
    });
  }, [startStr, endStr]);

  const chartData = monthly.map((m) => ({
    name: m.month,
    revenue: m.revenue,
    fuelCost: m.fuelCost,
    maintenanceCost: m.maintenanceCost,
    trips: m.tripsCount,
  }));

  return (
    <div>
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Analytics</h1>
          <p className="mt-1 text-sm text-muted-foreground">Revenue, costs, and trip trends</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-sm text-muted-foreground">Time range:</span>
          <Button variant={timeRange === '7' ? 'default' : 'outline'} size="sm" onClick={() => setTimeRange('7')}>Past 7 Days</Button>
          <Button variant={timeRange === '30' ? 'default' : 'outline'} size="sm" onClick={() => setTimeRange('30')}>Past 30 Days</Button>
          <Button variant={timeRange === '90' ? 'default' : 'outline'} size="sm" onClick={() => setTimeRange('90')}>Past 90 Days</Button>
          <Button variant={timeRange === 'custom' ? 'default' : 'outline'} size="sm" onClick={() => setTimeRange('custom')}>Custom</Button>
          {timeRange === 'custom' && (
            <>
              <input type="date" className="h-9 rounded-lg border border-input px-2 text-sm" value={customStart} onChange={(e) => setCustomStart(e.target.value)} />
              <span className="text-muted-foreground">to</span>
              <input type="date" className="h-9 rounded-lg border border-input px-2 text-sm" value={customEnd} onChange={(e) => setCustomEnd(e.target.value)} />
            </>
          )}
        </div>
      </div>
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        </div>
      ) : (
        <>
          <div className="mb-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Active Fleet</CardTitle>
              </CardHeader>
              <CardContent><span className="text-2xl font-bold tracking-tight">{kpis?.activeFleet ?? 0}</span></CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Maintenance Alerts</CardTitle>
              </CardHeader>
              <CardContent><span className="text-2xl font-bold tracking-tight">{kpis?.maintenanceAlerts ?? 0}</span></CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Utilization Rate</CardTitle>
              </CardHeader>
              <CardContent><span className="text-2xl font-bold tracking-tight">{kpis?.utilizationRate ?? 0}%</span></CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Pending Cargo</CardTitle>
              </CardHeader>
              <CardContent><span className="text-2xl font-bold tracking-tight">{kpis?.pendingCargo ?? 0}</span></CardContent>
            </Card>
          </div>

          <div className="mb-6 grid gap-6 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Fuel efficiency trend (km/L)</CardTitle>
                <CardDescription className="text-muted-foreground">Fleet fuel efficiency by period</CardDescription>
              </CardHeader>
              <CardContent>
                {fuelTrend.length === 0 ? (
                  <p className="py-12 text-center text-muted-foreground">No fuel/distance data for this range.</p>
                ) : (
                  <div className="h-[280px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={fuelTrend}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="month" fontSize={12} />
                        <YAxis fontSize={12} />
                        <Tooltip />
                        <Line type="monotone" dataKey="kmPerL" stroke="hsl(var(--primary))" name="km/L" strokeWidth={2} />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                )}
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Top 5 operational costs</CardTitle>
                <CardDescription className="text-muted-foreground">By category for selected period</CardDescription>
              </CardHeader>
              <CardContent>
                {topCosts.length === 0 ? (
                  <p className="py-12 text-center text-muted-foreground">No cost data for this range.</p>
                ) : (
                  <div className="h-[280px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={topCosts} layout="vertical" margin={{ left: 60 }}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis type="number" fontSize={12} />
                        <YAxis type="category" dataKey="label" fontSize={12} width={80} />
                        <Tooltip />
                        <Bar dataKey="value" fill="hsl(var(--primary))" name="Cost" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Operational summary report</CardTitle>
              <CardDescription className="text-muted-foreground">Metric, value, date generated</CardDescription>
            </CardHeader>
            <CardContent>
              {summary.length === 0 ? (
                <p className="py-8 text-center text-muted-foreground">No summary for this range.</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm table-hover">
                    <thead>
                      <tr className="border-b border-border/80">
                        <th className="pb-2 text-left font-medium text-muted-foreground">Metric</th>
                        <th className="pb-2 text-left font-medium text-muted-foreground">Value</th>
                        <th className="pb-2 text-left font-medium text-muted-foreground">Date generated</th>
                      </tr>
                    </thead>
                    <tbody>
                      {summary.map((row, i) => (
                        <tr key={i} className="border-b border-border/50 last:border-0">
                          <td className="py-2 font-medium">{row.metric}</td>
                          <td className="py-2">{row.value}</td>
                          <td className="py-2 text-muted-foreground">{row.dateGenerated}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Monthly revenue & costs</CardTitle>
              <CardDescription className="text-muted-foreground">Revenue, fuel cost, maintenance cost, trip count</CardDescription>
            </CardHeader>
            <CardContent>
              {chartData.length === 0 ? (
                <p className="py-12 text-center text-muted-foreground">No monthly data yet.</p>
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
          <Card>
            <CardHeader>
              <CardTitle>Trips per month</CardTitle>
            </CardHeader>
            <CardContent>
              {chartData.length === 0 ? (
                <p className="py-12 text-center text-muted-foreground">No data.</p>
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
