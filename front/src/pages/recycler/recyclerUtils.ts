import type { DigitalLot, LotStatus, TraceEvent, WasteCategory } from '../../types';

export const categoryLabels: Record<WasteCategory, string> = {
  mobile: 'Mobile phones',
  laptop: 'Laptops',
  desktop: 'Desktop computers',
  tablet: 'Tablets',
  battery: 'Batteries',
  pcb: 'Circuit boards',
  cable: 'Cables & wires',
  appliance: 'Appliances',
  tv_monitor: 'TVs & monitors',
  printer: 'Printers',
  other: 'Other e-waste',
};

export const recyclerLotStatuses: LotStatus[] = [
  'sent_to_recycler',
  'accepted',
  'rejected',
  'received',
  'processed',
];

export const formatCurrency = (value: number) =>
  new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(value);

export const formatDate = (value: string) =>
  new Date(value).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });

export const formatDateTime = (value: string) =>
  new Date(value).toLocaleString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });

export const humanizeStatus = (status: LotStatus) =>
  status
    .split('_')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');

export type RecyclerLotWithDetails = DigitalLot & {
  rejectionReason?: string;
  acceptedAt?: string;
  receivedAt?: string;
  processedAt?: string;
};

export const buildLotTrace = (lot: RecyclerLotWithDetails): TraceEvent[] => {
  const accepted = ['accepted', 'received', 'processed'].includes(lot.status);
  const received = ['received', 'processed'].includes(lot.status);
  const processed = lot.status === 'processed';
  const rejected = lot.status === 'rejected';

  return [
    {
      stage: 'lot_created',
      label: 'Digital lot created',
      description: `${lot.totalQuantity} item${lot.totalQuantity === 1 ? '' : 's'} grouped by the collector`,
      timestamp: lot.createdAt,
      status: 'completed',
    },
    {
      stage: 'recycler_accepted',
      label: rejected ? 'Request declined' : 'Recycler decision',
      description: rejected
        ? lot.rejectionReason || 'This lot was not accepted for processing.'
        : accepted
          ? 'The lot was accepted for processing.'
          : 'Review the materials and accept or decline this request.',
      timestamp: accepted || rejected ? lot.acceptedAt || lot.updatedAt : undefined,
      status: accepted || rejected ? 'completed' : 'current',
    },
    {
      stage: 'recycler_received',
      label: 'Lot received at facility',
      description: 'Confirm the physical quantity and weight after arrival.',
      timestamp: received ? lot.receivedAt || lot.updatedAt : undefined,
      status: received ? 'completed' : accepted ? 'current' : 'upcoming',
    },
    {
      stage: 'recycling_completed',
      label: 'Responsible processing completed',
      description: 'Materials are processed and the recycling trail is closed.',
      timestamp: processed ? lot.processedAt || lot.updatedAt : undefined,
      status: processed ? 'completed' : received ? 'current' : 'upcoming',
    },
  ];
};

export const matchesLotSearch = (lot: DigitalLot, query: string) => {
  const normalized = query.trim().toLocaleLowerCase();
  if (!normalized) return true;

  return [
    lot.lotName,
    lot.id,
    lot.collectorId,
    lot.storageLocation,
    lot.notes,
    lot.recyclerName,
    ...lot.items.map((item) => item.itemName),
  ].some((value) => value?.toLocaleLowerCase().includes(normalized));
};

