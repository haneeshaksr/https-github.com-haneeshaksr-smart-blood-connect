import React from 'react';
import { CheckCircle2, Clock, AlertTriangle, XCircle, ShieldCheck, UserCheck } from 'lucide-react';

interface StatusBadgeProps {
  status: string;
  type?: 'request' | 'verification' | 'screening' | 'inventory';
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, type = 'request' }) => {
  const norm = status.toLowerCase();

  // Verification
  if (type === 'verification') {
    if (norm === 'verified') {
      return (
        <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-700">
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>Verified Medical Center</span>
        </span>
      );
    }
    if (norm === 'pending') {
      return (
        <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-amber-700">
          <Clock className="w-3.5 h-3.5" />
          <span>Pending Admin Verification</span>
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-rose-700">
        <XCircle className="w-3.5 h-3.5" />
        <span>Verification Rejected</span>
      </span>
    );
  }

  // Screening
  if (type === 'screening') {
    if (norm === 'screened') {
      return (
        <span className="inline-flex items-center gap-1.5 text-xs font-medium text-emerald-700">
          <UserCheck className="w-3.5 h-3.5" />
          <span>Screening Completed</span>
        </span>
      );
    }
    if (norm === 'pending_screening') {
      return (
        <span className="inline-flex items-center gap-1.5 text-xs font-medium text-amber-700">
          <Clock className="w-3.5 h-3.5" />
          <span>Pending Health Screening</span>
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1.5 text-xs font-medium text-rose-700">
        <AlertTriangle className="w-3.5 h-3.5" />
        <span>Temporarily Ineligible</span>
      </span>
    );
  }

  // Inventory
  if (type === 'inventory') {
    if (norm === 'available') {
      return (
        <span className="inline-flex items-center gap-1 text-xs font-medium text-emerald-700">
          <CheckCircle2 className="w-3 h-3" />
          <span>Available</span>
        </span>
      );
    }
    if (norm === 'low_stock') {
      return (
        <span className="inline-flex items-center gap-1 text-xs font-medium text-amber-700">
          <AlertTriangle className="w-3 h-3" />
          <span>Low Stock</span>
        </span>
      );
    }
    if (norm === 'expired') {
      return (
        <span className="inline-flex items-center gap-1 text-xs font-medium text-rose-700">
          <XCircle className="w-3 h-3" />
          <span>Expired (Unusable)</span>
        </span>
      );
    }
  }

  // Request status
  if (norm.includes('fulfilled')) {
    return (
      <span className="inline-flex items-center gap-1.5 text-xs font-medium text-emerald-700">
        <CheckCircle2 className="w-3.5 h-3.5" />
        <span>Fulfilled</span>
      </span>
    );
  }
  if (norm.includes('outreach')) {
    return (
      <span className="inline-flex items-center gap-1.5 text-xs font-medium text-indigo-700">
        <Clock className="w-3.5 h-3.5" />
        <span>Donor Outreach in Progress</span>
      </span>
    );
  }
  if (norm.includes('coordination')) {
    return (
      <span className="inline-flex items-center gap-1.5 text-xs font-medium text-blue-700">
        <Clock className="w-3.5 h-3.5" />
        <span>Appointment Coordination</span>
      </span>
    );
  }
  if (norm.includes('awaiting')) {
    return (
      <span className="inline-flex items-center gap-1.5 text-xs font-medium text-amber-700">
        <Clock className="w-3.5 h-3.5" />
        <span>Awaiting Hospital Review</span>
      </span>
    );
  }
  if (norm.includes('accepted')) {
    return (
      <span className="inline-flex items-center gap-1.5 text-xs font-medium text-teal-700">
        <CheckCircle2 className="w-3.5 h-3.5" />
        <span>Accepted by Hospital</span>
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-1 text-xs font-medium text-slate-700">
      <span>{status}</span>
    </span>
  );
};
