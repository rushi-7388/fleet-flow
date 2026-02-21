'use client';

import { useState } from 'react';
import { api } from '@/lib/api';
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

type Tab = 'trips' | 'expenses' | 'drivers';

function toQuery(params: Record<string, string | undefined>): string {
  const q = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => {
    if (v) q.set(k, v);
  });
  const s = q.toString();
  return s ? `?${s}` : '';
}

export default function ReportsPage() {
  const [tab, setTab] = useState<Tab>('trips');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [vehicleId, setVehicleId] = useState('');
  const [driverId, setDriverId] = useState('');
  const [downloading, setDownloading] = useState(false);
  const [error, setError] = useState('');

  async function handleDownload(format: 'csv' | 'pdf') {
    try {
      setError('');
      setDownloading(true);
      const base =
        tab === 'trips'
          ? `/reports/trips/export/${format}`
          : tab === 'expenses'
          ? `/reports/expenses/export/${format}`
          : `/reports/driver-performance/export/${format}`;

      const query = toQuery({
        startDate,
        endDate,
        vehicleId: tab !== 'drivers' ? vehicleId : undefined,
        driverId: tab !== 'expenses' ? driverId : undefined,
      });

      const url = `${base}${query}`;
      const response = await api.get(url, {
        responseType: 'blob',
      });

      const blob = new Blob([response.data], {
        type: format === 'csv' ? 'text/csv' : 'application/pdf',
      });
      const link = document.createElement('a');
      link.href = window.URL.createObjectURL(blob);
      const name =
        tab === 'trips'
          ? 'trips-report'
          : tab === 'expenses'
          ? 'expenses-report'
          : 'driver-performance';
      link.download = `${name}.${format}`;
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (e) {
      setError('Failed to generate report. Check backend and filters.');
    } finally {
      setDownloading(false);
    }
  }

  return (
    <div>
      <div className="mb-8 flex flex-col gap-2 sm:flex-row sm:items-baseline sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Reports</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Filter by date, vehicle, and driver, then download CSV or PDF exports.
          </p>
        </div>
        <div className="inline-flex rounded-lg border border-border/80 bg-card p-0.5 text-sm">
          <button
            type="button"
            onClick={() => setTab('trips')}
            className={`rounded-md px-3 py-1.5 ${
              tab === 'trips' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground'
            }`}
          >
            Trips
          </button>
          <button
            type="button"
            onClick={() => setTab('expenses')}
            className={`rounded-md px-3 py-1.5 ${
              tab === 'expenses' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground'
            }`}
          >
            Expenses
          </button>
          <button
            type="button"
            onClick={() => setTab('drivers')}
            className={`rounded-md px-3 py-1.5 ${
              tab === 'drivers' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground'
            }`}
          >
            Driver performance
          </button>
        </div>
      </div>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Filters</CardTitle>
          <CardDescription className="text-muted-foreground">
            Date range is optional but recommended. Vehicle and driver filters narrow the report.
          </CardDescription>
        </CardHeader>
        <div className="grid gap-4 border-t border-border/80 p-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="space-y-1">
            <label className="text-xs font-medium text-muted-foreground">Start date</label>
            <input
              type="date"
              className="h-9 w-full rounded-md border border-input bg-background px-2 text-sm"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-medium text-muted-foreground">End date</label>
            <input
              type="date"
              className="h-9 w-full rounded-md border border-input bg-background px-2 text-sm"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
            />
          </div>
          {tab !== 'drivers' && (
            <div className="space-y-1">
              <label className="text-xs font-medium text-muted-foreground">Vehicle ID (optional)</label>
              <input
                type="text"
                placeholder="vehicle id"
                className="h-9 w-full rounded-md border border-input bg-background px-2 text-sm"
                value={vehicleId}
                onChange={(e) => setVehicleId(e.target.value)}
              />
            </div>
          )}
          {tab !== 'expenses' && (
            <div className="space-y-1">
              <label className="text-xs font-medium text-muted-foreground">Driver ID (optional)</label>
              <input
                type="text"
                placeholder="driver id"
                className="h-9 w-full rounded-md border border-input bg-background px-2 text-sm"
                value={driverId}
                onChange={(e) => setDriverId(e.target.value)}
              />
            </div>
          )}
        </div>
      </Card>

      {error && (
        <div className="mb-4 rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {error}
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Download CSV</CardTitle>
            <CardDescription className="text-muted-foreground">
              Spreadsheet-friendly export for the current {tab} filters.
            </CardDescription>
          </CardHeader>
          <div className="border-t border-border/80 p-4">
            <Button className="w-full" disabled={downloading} onClick={() => handleDownload('csv')}>
              {downloading ? 'Preparing CSV...' : 'Download CSV'}
            </Button>
          </div>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Download PDF</CardTitle>
            <CardDescription className="text-muted-foreground">
              Printable report with the current {tab} filters.
            </CardDescription>
          </CardHeader>
          <div className="border-t border-border/80 p-4">
            <Button variant="outline" className="w-full" disabled={downloading} onClick={() => handleDownload('pdf')}>
              {downloading ? 'Preparing PDF...' : 'Download PDF'}
            </Button>
          </div>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Tips</CardTitle>
            <CardDescription className="text-muted-foreground">
              Use date filters to keep reports fast. Leave IDs empty to include all vehicles or drivers.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    </div>
  );
}
