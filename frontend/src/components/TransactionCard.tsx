import React from 'react';
import { ArrowDownLeft, ArrowUpRight, ReceiptText } from 'lucide-react';
import type { Transaction } from '../types';
import { formatCurrency, formatDate } from '../utils/format';

interface TransactionCardProps {
  transaction: Transaction;
  compact?: boolean;
  className?: string;
}

const TransactionCard: React.FC<TransactionCardProps> = ({ transaction, compact = false, className = '' }) => {
  const incoming = transaction.type === 'earning' || transaction.role === 'source';
  const Icon = incoming ? ArrowDownLeft : ArrowUpRight;
  return (
    <article className={`card flex items-center gap-3 ${compact ? 'p-3' : 'p-4'} ${className}`}>
      <span className="grid h-10 w-10 flex-none place-items-center rounded-xl" style={{ backgroundColor: incoming ? 'var(--primary-subtle)' : '#fff7e6', color: incoming ? 'var(--primary)' : '#a3620e' }}><Icon size={18} /></span>
      <div className="min-w-0 flex-1"><div className="flex items-center gap-1.5"><ReceiptText size={12} style={{ color: 'var(--text-tertiary)' }} /><p className="truncate text-sm font-bold">{transaction.description}</p></div><p className="mt-1 text-[0.68rem]" style={{ color: 'var(--text-tertiary)' }}>{formatDate(transaction.createdAt, true)} · {transaction.id}</p></div>
      <strong className="text-sm tabular-nums" style={{ color: incoming ? 'var(--primary)' : 'var(--text-primary)' }}>{incoming ? '+' : '−'}{formatCurrency(transaction.amount)}</strong>
    </article>
  );
};

export default TransactionCard;
