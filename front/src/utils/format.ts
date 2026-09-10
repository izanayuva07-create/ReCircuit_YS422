import type { ItemCondition, WasteCategory } from '../types';

export const formatCurrency = (value: number): string =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(value);

export const formatDate = (value: string, includeTime = false): string => {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'Not scheduled';
  return date.toLocaleString('en-IN', includeTime
    ? { dateStyle: 'medium', timeStyle: 'short' }
    : { dateStyle: 'medium' });
};

export const formatRelativeTime = (value: string): string => {
  const timestamp = new Date(value).getTime();
  if (Number.isNaN(timestamp)) return '';
  const seconds = Math.round((timestamp - Date.now()) / 1000);
  const absolute = Math.abs(seconds);
  const formatter = new Intl.RelativeTimeFormat('en', { numeric: 'auto' });
  if (absolute < 60) return formatter.format(seconds, 'second');
  if (absolute < 3600) return formatter.format(Math.round(seconds / 60), 'minute');
  if (absolute < 86400) return formatter.format(Math.round(seconds / 3600), 'hour');
  if (absolute < 2_592_000) return formatter.format(Math.round(seconds / 86400), 'day');
  return formatDate(value);
};

export const categoryLabels: Record<WasteCategory, string> = {
  mobile: 'Mobile phone',
  laptop: 'Laptop',
  desktop: 'Desktop',
  tablet: 'Tablet',
  battery: 'Battery',
  pcb: 'Circuit board',
  cable: 'Cables & wires',
  appliance: 'Appliance',
  tv_monitor: 'TV / monitor',
  printer: 'Printer',
  other: 'Other electronics',
};

export const conditionLabels: Record<ItemCondition, string> = {
  working: 'Working',
  partially_working: 'Partially working',
  not_working: 'Not working',
  damaged: 'Damaged',
};

export const createId = (prefix: string): string =>
  `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;
