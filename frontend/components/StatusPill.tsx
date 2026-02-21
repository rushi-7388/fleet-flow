import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

const statusVariant: Record<string, 'default' | 'secondary' | 'destructive' | 'outline' | 'success' | 'warning'> = {
  Available: 'success',
  OnTrip: 'default',
  InShop: 'warning',
  Retired: 'secondary',
  OnDuty: 'success',
  OffDuty: 'secondary',
  Suspended: 'destructive',
  Draft: 'secondary',
  Dispatched: 'default',
  Completed: 'success',
  Cancelled: 'destructive',
};

export function StatusPill({ status, className }: { status: string; className?: string }) {
  const variant = statusVariant[status] ?? 'outline';
  return (
    <Badge variant={variant} className={cn('capitalize', className)}>
      {status.replace(/([A-Z])/g, ' $1').trim()}
    </Badge>
  );
}
