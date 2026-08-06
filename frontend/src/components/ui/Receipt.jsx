import { createPortal } from 'react-dom';
import { X, Printer, Download, Copy, CheckCircle, XCircle, Clock, Wifi, Phone, Zap, Tv, GraduationCap } from 'lucide-react';
import { format } from 'date-fns';
import { Capacitor } from '@capacitor/core';
import { Directory, Encoding, Filesystem } from '@capacitor/filesystem';
import { Share } from '@capacitor/share';
import toast from 'react-hot-toast';
import BrandedLoader from './BrandedLoader';

const SERVICE = {
  data:        { label: 'Data Purchase',    Icon: Wifi,          color: '#14b8a6',  bg: 'rgba(20,184,166,0.12)'  },
  airtime:     { label: 'Airtime Purchase', Icon: Phone,         color: '#34d399',  bg: 'rgba(52,211,153,0.12)'  },
  electricity: { label: 'Electricity Bill', Icon: Zap,           color: '#fbbf24',  bg: 'rgba(251,191,36,0.12)'  },
  cable:       { label: 'Cable TV',         Icon: Tv,            color: '#a78bfa',  bg: 'rgba(167,139,250,0.12)' },
  education:   { label: 'Exam PIN',         Icon: GraduationCap, color: '#f87171',  bg: 'rgba(248,113,113,0.12)' },
};

function buildRows(data) {
  const customerRows = [
    data.customer && ['Customer', data.customer],
    data.customerEmail && ['Customer Email', data.customerEmail],
  ].filter(Boolean);
  if (data.type === 'data') {
    return [
      ...customerRows,
      data.network     && ['Network',   data.network],
      data.phone       && ['Phone',     data.phone],
      data.dataSize    && ['Data Size', data.dataSize],
      data.planName    && ['Plan',      data.planName],
      data.validity    && ['Validity',  data.validity],
      data.dataType    && ['Type',      data.dataType],
    ].filter(Boolean);
  }
  if (data.type === 'airtime') {
    return [
      ...customerRows,
      data.network && ['Network', data.network],
      data.phone   && ['Phone',   data.phone],
    ].filter(Boolean);
  }
  if (data.type === 'electricity') {
    return [
      ...customerRows,
      data.provider     && ['Provider',    data.provider],
      data.meterNumber  && ['Meter No.',   data.meterNumber],
      data.meterType    && ['Meter Type',  data.meterType.charAt(0).toUpperCase() + data.meterType.slice(1)],
      data.customerName && ['Customer',    data.customerName],
      data.units        && ['Units',       data.units],
    ].filter(Boolean);
  }
  if (data.type === 'cable') {
    return [
      ...customerRows,
      data.provider       && ['Provider',   data.provider],
      data.smartCardNumber && ['Smart Card', data.smartCardNumber],
      data.customerName   && ['Customer',   data.customerName],
      data.packageName    && ['Package',    data.packageName],
    ].filter(Boolean);
  }
  if (data.type === 'education') {
    return [
      ...customerRows,
      data.examType && ['Exam Type', data.examType],
      data.quantity && ['Quantity',  `${data.quantity} PIN${data.quantity > 1 ? 's' : ''}`],
    ].filter(Boolean);
  }
  return [
    ...customerRows,
    data.description && ['Details', data.description],
  ].filter(Boolean);
}

function printReceipt(data) {
  const svc = SERVICE[data.type] || { label: (data.type || 'Transaction').replace(/_/g, ' '), color: '#0f766e' };
  const dateStr = data.date ? format(new Date(data.date), 'MMM dd, yyyy · h:mm a') : '—';
  const rows = buildRows(data);

  const rowsHTML = rows.map(([label, value]) => `
    <tr>
      <td style="padding:8px 0;color:#6b7280;font-size:12px;border-bottom:1px solid #f3f4f6;width:42%">${label}</td>
      <td style="padding:8px 0;font-size:12px;font-weight:600;color:#111827;text-align:right;border-bottom:1px solid #f3f4f6">${value}</td>
    </tr>`).join('');

  const tokenHTML = data.token ? `
    <div style="margin:16px 0;text-align:center">
      <p style="font-size:10px;color:#9ca3af;text-transform:uppercase;letter-spacing:0.1em;font-weight:700;margin-bottom:8px">Electricity Token</p>
      <div style="background:#f0fdf4;border:2px solid #bbf7d0;border-radius:10px;padding:14px">
        <p style="font-size:22px;font-weight:900;color:#059669;letter-spacing:0.15em;font-family:monospace;margin:0">${data.token}</p>
        ${data.units ? `<p style="font-size:11px;color:#6b7280;margin:5px 0 0">${data.units} units</p>` : ''}
      </div>
    </div>` : '';

  const pinsHTML = data.pins?.length ? `
    <div style="margin:16px 0">
      <p style="font-size:10px;color:#9ca3af;text-transform:uppercase;letter-spacing:0.1em;font-weight:700;margin-bottom:8px">Exam PINs</p>
      ${data.pins.map((p, i) => `
        <div style="background:#f9fafb;border:1px solid #e5e7eb;border-radius:8px;padding:10px 12px;margin-bottom:6px;display:flex;justify-content:space-between;align-items:center">
          <div>
            <p style="font-size:10px;color:#9ca3af;margin:0 0 2px">Serial: ${p.serial || '—'}</p>
            <p style="font-size:16px;font-weight:900;color:#059669;letter-spacing:0.1em;font-family:monospace;margin:0">${p.pin}</p>
          </div>
          <span style="font-size:11px;color:#9ca3af;font-weight:600">PIN ${i + 1}</span>
        </div>`).join('')}
    </div>` : '';

  const statusIcon = data.status === 'success'
    ? `<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#059669" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>`
    : data.status === 'failed'
    ? `<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#dc2626" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>`
    : `<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#d97706" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>`;

  const statusBg    = data.status === 'success' ? '#d1fae5' : data.status === 'failed' ? '#fee2e2' : '#fef3c7';
  const statusLabel = data.status === 'success' ? 'Payment Successful' : data.status === 'failed' ? 'Transaction Failed' : 'Processing';

  const html = `<!DOCTYPE html><html><head><meta charset="UTF-8"><title>Receipt · ${data.reference || 'BORHS Data'}</title>
<style>*{box-sizing:border-box;margin:0;padding:0}body{font-family:Nunito,-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;background:#f1f5f9;display:flex;justify-content:center;padding:32px 16px;min-height:100vh}@media print{body{background:white;padding:0}.receipt{box-shadow:none!important}}</style>
</head><body>
<div class="receipt" style="background:white;border-radius:16px;box-shadow:0 4px 32px rgba(0,0,0,0.12);width:100%;max-width:400px;overflow:hidden">
  <div style="background:linear-gradient(135deg,#0f766e,#0d9488);padding:22px 24px;text-align:center">
    <img src="/logo-mark.png" alt="" style="display:block;width:42px;height:42px;object-fit:contain;margin:0 auto 8px;background:white;border-radius:12px;padding:5px" />
    <p style="font-size:22px;font-weight:900;color:white;letter-spacing:-0.02em;margin-bottom:2px">BORHS</p>
    <p style="font-size:10px;color:rgba(255,255,255,0.65);text-transform:uppercase;letter-spacing:0.12em">Official Receipt</p>
  </div>
  <div style="padding:22px 24px;text-align:center;border-bottom:1px solid #f3f4f6">
    <div style="width:54px;height:54px;background:${statusBg};border-radius:50%;display:flex;align-items:center;justify-content:center;margin:0 auto 10px">${statusIcon}</div>
    <p style="font-size:17px;font-weight:800;color:#111827;margin-bottom:3px">${statusLabel}</p>
    <p style="font-size:12px;color:#9ca3af">${svc.label}</p>
  </div>
  <div style="padding:18px 24px;text-align:center;background:#f9fafb;border-bottom:1px solid #f3f4f6">
    <p style="font-size:10px;color:#9ca3af;text-transform:uppercase;letter-spacing:0.1em;font-weight:700;margin-bottom:4px">Amount Paid</p>
    <p style="font-size:38px;font-weight:900;color:#111827">₦${(data.amount || 0).toLocaleString()}</p>
  </div>
  ${rows.length ? `<div style="padding:14px 24px"><table style="width:100%;border-collapse:collapse">${rowsHTML}</table></div>` : ''}
  ${tokenHTML || pinsHTML ? `<div style="padding:0 24px 12px">${tokenHTML}${pinsHTML}</div>` : ''}
  <div style="padding:14px 24px;background:#f9fafb;border-top:1px solid #f3f4f6">
    <div style="display:flex;justify-content:space-between;margin-bottom:5px">
      <span style="font-size:10px;color:#9ca3af;text-transform:uppercase;letter-spacing:0.1em;font-weight:700">Reference</span>
      <span style="font-size:11px;font-weight:700;color:#374151;font-family:monospace">${data.reference || '—'}</span>
    </div>
    <div style="display:flex;justify-content:space-between">
      <span style="font-size:10px;color:#9ca3af;text-transform:uppercase;letter-spacing:0.1em;font-weight:700">Date & Time</span>
      <span style="font-size:11px;color:#6b7280">${dateStr}</span>
    </div>
  </div>
  <div style="padding:12px 24px;text-align:center;border-top:1px solid #f3f4f6">
    <p style="font-size:10px;color:#9ca3af">Powered by <strong style="color:#0f766e">BORHS</strong> · Fast, secure bill payments</p>
  </div>
</div>
<script>window.onload=function(){window.print();}</script>
</body></html>`;

  const win = window.open('', '_blank', 'width=480,height=700');
  if (!win) { toast.error('Pop-up blocked — please allow pop-ups to print.'); return; }
  win.document.write(html);
  win.document.close();
}

function buildDownloadReceipt(data) {
  const rows = buildRows(data)
    .map(([label, value]) => `<tr><td>${label}</td><td>${value}</td></tr>`)
    .join('');
  const date = data.date ? format(new Date(data.date), 'MMM dd, yyyy · h:mm a') : '—';
  return `<!doctype html>
<html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width">
<title>BORHS Receipt ${data.reference || ''}</title>
<style>
*{box-sizing:border-box}body{margin:0;padding:24px 16px;background:#f8fafc;color:#111827;font-family:Nunito,system-ui,sans-serif}
.receipt{max-width:420px;margin:auto;background:#fff;border-radius:24px;overflow:hidden;box-shadow:0 12px 36px rgba(15,23,42,.12)}
.brand{padding:24px;text-align:center;color:#fff;background:linear-gradient(135deg,#0f766e,#0d9488)}
.brand h1{font-size:22px;margin:0 0 2px}.brand p{font-size:10px;letter-spacing:.12em;margin:0;opacity:.75}
.status{text-align:center;padding:22px 24px 10px}.status h2{font-size:18px;margin:0 0 5px;color:#059669}.status p{font-size:12px;color:#6b7280;margin:0}
.amount{margin:12px 24px 18px;padding:18px;text-align:center;border-radius:18px;background:#f0fdfa;border:1px solid #ccfbf1}.amount small{display:block;color:#6b7280;font-weight:700;letter-spacing:.08em}.amount strong{display:block;color:#0f766e;font-size:34px;margin-top:4px}
table{width:calc(100% - 48px);margin:0 24px 18px;border-collapse:collapse}td{padding:10px 0;border-bottom:1px solid #e5e7eb;font-size:12px}td:first-child{color:#6b7280}td:last-child{text-align:right;font-weight:700}
.meta{margin:0 24px 24px;padding:14px;border-radius:16px;background:#f1f5f9;font-size:11px;color:#6b7280}.meta div{display:flex;justify-content:space-between;gap:12px;margin:4px 0}.meta strong{color:#374151;word-break:break-all}
.foot{text-align:center;padding:14px;border-top:1px solid #e5e7eb;color:#9ca3af;font-size:10px}
</style></head><body><main class="receipt">
<header class="brand"><h1>BORHS</h1><p>OFFICIAL RECEIPT</p></header>
<section class="status"><h2>${data.status === 'success' ? 'Payment Successful' : data.status === 'failed' ? 'Transaction Failed' : 'Processing'}</h2><p>${SERVICE[data.type]?.label || 'Transaction'}</p></section>
<section class="amount"><small>AMOUNT PAID</small><strong>₦${Number(data.amount || 0).toLocaleString()}</strong></section>
${rows ? `<table>${rows}</table>` : ''}
<section class="meta"><div><span>Reference</span><strong>${data.reference || '—'}</strong></div><div><span>Date & Time</span><strong>${date}</strong></div></section>
<footer class="foot">Powered by BORHS · Fast, secure bill payments</footer>
</main></body></html>`;
}

async function downloadReceipt(data) {
  const html = buildDownloadReceipt(data);
  const safeReference = String(data.reference || Date.now()).replace(/[^a-z0-9_-]/gi, '-');
  const fileName = `BORHS-Receipt-${safeReference}.html`;

  try {
    if (Capacitor.isNativePlatform()) {
      const result = await Filesystem.writeFile({
        path: fileName,
        data: html,
        directory: Directory.Cache,
        encoding: Encoding.UTF8,
      });
      await Share.share({
        title: 'BORHS Transaction Receipt',
        text: `Receipt ${data.reference || ''}`.trim(),
        url: result.uri,
        dialogTitle: 'Save or share receipt',
      });
      return;
    }

    const url = URL.createObjectURL(new Blob([html], { type: 'text/html;charset=utf-8' }));
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = fileName;
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    URL.revokeObjectURL(url);
    toast.success('Receipt downloaded');
  } catch (error) {
    if (error?.message?.toLowerCase().includes('cancel')) return;
    toast.error('Could not download receipt');
  }
}

function Row({ label, value }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 10, padding: '9px 0', borderBottom: '1px solid var(--ds-stroke)' }}>
      <span style={{ fontSize: 11, color: 'var(--ds-text-tertiary)', flexShrink: 0 }}>{label}</span>
      <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--ds-text)', textAlign: 'right', wordBreak: 'break-word' }}>{value}</span>
    </div>
  );
}

export default function Receipt({ data, onClose }) {
  if (!data) return null;

  const svc = SERVICE[data.type] || { label: (data.type || 'Transaction').replace(/_/g, ' '), Icon: Wifi, color: '#14b8a6', bg: 'rgba(20,184,166,0.12)' };
  const { Icon } = svc;
  const rows = buildRows(data);
  const dateStr = data.date ? format(new Date(data.date), 'MMM dd, yyyy · h:mm a') : '—';

  const statusConfig = {
    success: { Icon: CheckCircle, color: '#10b981', bg: 'rgba(16,185,129,0.12)', label: 'Payment Successful' },
    failed:  { Icon: XCircle,     color: '#ef4444', bg: 'rgba(239,68,68,0.12)',   label: 'Transaction Failed' },
    pending: { Icon: Clock,       color: '#f59e0b', bg: 'rgba(245,158,11,0.12)', label: 'Processing' },
  }[data.status] || { Icon: Clock, color: '#f59e0b', bg: 'rgba(245,158,11,0.12)', label: 'Pending' };

  const StatusIcon = statusConfig.Icon;

  return createPortal(
    <div
      style={{ position: 'fixed', inset: 0, zIndex: 9999, background: 'var(--ds-overlay)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px' }}
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{ background: 'var(--ds-surface)', border: '1px solid var(--ds-stroke)', borderRadius: 'var(--ds-radius-sheet)', width: '100%', maxWidth: 400, maxHeight: '90vh', overflowY: 'auto', boxShadow: 'var(--ds-shadow-float)' }}
        className="animate-slide-up"
      >
        {/* Header bar */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 20px 0' }}>
          <span style={{ fontSize: 11, fontWeight: 800, color: 'var(--ds-text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Transaction receipt</span>
          <button onClick={onClose} aria-label="Close receipt" style={{ width: 32, height: 32, borderRadius: 12, background: 'var(--ds-surface-subtle)', border: '1px solid var(--ds-stroke)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: 'var(--ds-text-secondary)' }}>
            <X size={14} />
          </button>
        </div>

        {/* Brand strip */}
        <div style={{ margin: '14px 20px 0', background: 'linear-gradient(135deg,#0f766e,#0d9488)', borderRadius: 20, padding: '14px 16px', textAlign: 'center', boxShadow: '0 10px 24px rgba(15,118,110,0.2)' }}>
          <img src="/logo-mark.png" alt="" style={{ width: 38, height: 38, objectFit: 'contain', background: '#fff', borderRadius: 12, padding: 4, margin: '0 auto 7px' }} />
          <p style={{ fontWeight: 900, fontSize: 17, color: '#fff', letterSpacing: '-0.02em' }}>BORHS</p>
          <p style={{ fontSize: 10, color: 'rgba(255,255,255,0.72)', textTransform: 'uppercase', letterSpacing: '0.1em', marginTop: 1 }}>Official Receipt</p>
        </div>

        {/* Status + Service */}
        <div style={{ padding: '16px 20px 0', textAlign: 'center' }}>
          <div style={{ width: 52, height: 52, borderRadius: '50%', background: statusConfig.bg, border: `1px solid ${statusConfig.color}30`, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 10px' }}>
            <StatusIcon size={24} style={{ color: statusConfig.color }} />
          </div>
          <p style={{ fontSize: 16, fontWeight: 800, color: 'var(--ds-text)', marginBottom: 4 }}>{statusConfig.label}</p>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 5, background: svc.bg, border: `1px solid ${svc.color}30`, borderRadius: 20, padding: '3px 10px' }}>
            <Icon size={11} style={{ color: svc.color }} />
            <span style={{ fontSize: 11, fontWeight: 600, color: svc.color }}>{svc.label}</span>
          </div>
        </div>

        {/* Amount */}
        <div style={{ margin: '16px 20px', background: 'var(--ds-info-soft)', border: '1px solid rgba(20,184,166,0.22)', borderRadius: 20, padding: '16px', textAlign: 'center' }}>
          <p style={{ fontSize: 10, color: 'var(--ds-text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 800, marginBottom: 4 }}>Amount Paid</p>
          <p style={{ fontSize: 32, fontWeight: 900, color: 'var(--ds-brand-700)' }}>₦{(data.amount || 0).toLocaleString()}</p>
        </div>

        {/* Details rows */}
        {rows.length > 0 && (
          <div style={{ margin: '0 20px 16px', background: 'var(--ds-surface-subtle)', border: '1px solid var(--ds-stroke)', borderRadius: 20, padding: '4px 14px' }}>
            {rows.map(([label, value]) => <Row key={label} label={label} value={value} />)}
          </div>
        )}

        {/* Electricity token */}
        {data.token && (
          <div style={{ margin: '0 20px 16px', background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.2)', borderRadius: 12, padding: '14px', textAlign: 'center' }}>
            <p style={{ fontSize: 10, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 700, marginBottom: 8 }}>Electricity Token</p>
            <p style={{ fontSize: 22, fontWeight: 900, color: '#10b981', letterSpacing: '0.12em', fontFamily: 'monospace', marginBottom: data.units ? 4 : 0 }}>{data.token}</p>
            {data.units && <p style={{ fontSize: 11, color: '#64748b' }}>{data.units} units</p>}
            <button
              onClick={() => { navigator.clipboard.writeText(data.token); toast.success('Token copied!'); }}
              style={{ marginTop: 10, display: 'inline-flex', alignItems: 'center', gap: 5, background: 'rgba(16,185,129,0.12)', border: '1px solid rgba(16,185,129,0.2)', borderRadius: 8, padding: '5px 12px', color: '#10b981', fontSize: 11, fontWeight: 600, cursor: 'pointer' }}
            >
              <Copy size={11} /> Copy Token
            </button>
          </div>
        )}

        {/* Exam PINs */}
        {data.pins?.length > 0 && (
          <div style={{ margin: '0 20px 16px' }}>
            <p style={{ fontSize: 10, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 700, marginBottom: 8 }}>Exam PINs</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {data.pins.map((pin, i) => (
                <div key={i} style={{ background: 'var(--ds-surface-subtle)', border: '1px solid var(--ds-stroke)', borderRadius: 16, padding: '10px 14px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div>
                    <p style={{ fontSize: 10, color: '#64748b', marginBottom: 2 }}>Serial: {pin.serial || '—'}</p>
                    <p style={{ fontSize: 16, fontWeight: 900, color: '#10b981', letterSpacing: '0.08em', fontFamily: 'monospace' }}>{pin.pin}</p>
                  </div>
                  <button
                    onClick={() => { navigator.clipboard.writeText(pin.pin); toast.success('PIN copied!'); }}
                    style={{ background: 'rgba(51,65,85,0.5)', border: 'none', borderRadius: 7, padding: '5px 9px', color: '#94a3b8', fontSize: 11, display: 'flex', alignItems: 'center', gap: 4, cursor: 'pointer' }}
                  >
                    <Copy size={10} /> Copy
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Reference + date */}
        <div style={{ margin: '0 20px 16px', background: 'var(--ds-surface-subtle)', border: '1px solid var(--ds-stroke)', borderRadius: 20, padding: '12px 14px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
            <span style={{ fontSize: 10, color: '#64748b', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em' }}>Reference</span>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{ fontSize: 11, fontWeight: 700, color: '#94a3b8', fontFamily: 'monospace' }}>{data.reference || '—'}</span>
              {data.reference && (
                <button onClick={() => { navigator.clipboard.writeText(data.reference); toast.success('Copied!'); }} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b', display: 'flex' }}>
                  <Copy size={11} />
                </button>
              )}
            </div>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: 10, color: '#64748b', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em' }}>Date & Time</span>
            <span style={{ fontSize: 11, color: '#64748b' }}>{dateStr}</span>
          </div>
        </div>

        {/* Actions */}
        <div style={{ padding: '0 20px 20px', display: 'flex', gap: 8 }}>
          <button
            onClick={onClose}
            style={{ flex: 1, minHeight: 44, padding: '10px', borderRadius: 16, background: 'var(--ds-surface-subtle)', border: '1px solid var(--ds-stroke)', color: 'var(--ds-text-secondary)', fontSize: 13, fontWeight: 700, cursor: 'pointer' }}
          >
            Close
          </button>
          <button
            onClick={() => downloadReceipt(data)}
            style={{ flex: 1.5, minHeight: 44, padding: '10px', borderRadius: 16, background: 'var(--ds-info-soft)', border: '1px solid rgba(20,184,166,0.22)', color: 'var(--ds-brand-700)', fontSize: 13, fontWeight: 800, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}
          >
            <Download size={14} /> Download
          </button>
          <button
            onClick={() => printReceipt(data)}
            style={{ flex: 1.5, minHeight: 44, padding: '10px', borderRadius: 16, background: 'linear-gradient(135deg,#0f766e,#0d9488)', border: 'none', color: 'white', fontSize: 13, fontWeight: 800, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7, boxShadow: '0 8px 18px rgba(15,118,110,0.2)' }}
          >
            <Printer size={14} /> Print
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}

export function PurchaseLoader({ visible, type = 'data' }) {
  if (!visible) return null;
  const svc = SERVICE[type] || SERVICE.data;
  return createPortal(
    <BrandedLoader
      overlay
      title={`Processing ${svc.label}`}
      message="Confirming your request securely. Please keep this screen open."
      icon={svc.Icon}
      iconColor={svc.color}
    />,
    document.body
  );
}

export function LegacyPurchaseLoader({ visible, type = 'data' }) {
  if (!visible) return null;
  const svc = SERVICE[type] || SERVICE.data;
  const { Icon } = svc;

  return createPortal(
    <div style={{
      position: 'fixed', inset: 0, zIndex: 9990,
      background: 'rgba(2,6,23,0.88)',
      backdropFilter: 'blur(8px)',
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 24,
    }}>
      {/* Spinning rings */}
      <div style={{ position: 'relative', width: 100, height: 100 }}>
        {/* Outer ring — slow */}
        <div style={{
          position: 'absolute', inset: 0, borderRadius: '50%',
          border: '3px solid rgba(37,99,235,0.15)',
          borderTopColor: '#2563eb',
          animation: 'spin 1.1s linear infinite',
        }} />
        {/* Middle ring — medium, reverse */}
        <div style={{
          position: 'absolute', inset: 10, borderRadius: '50%',
          border: '2.5px solid rgba(37,99,235,0.1)',
          borderTopColor: svc.color,
          animation: 'spin 0.75s linear infinite reverse',
        }} />
        {/* Inner ring — fast */}
        <div style={{
          position: 'absolute', inset: 20, borderRadius: '50%',
          border: '2px solid rgba(37,99,235,0.08)',
          borderTopColor: 'rgba(37,99,235,0.45)',
          animation: 'spin 0.5s linear infinite',
        }} />
        {/* Icon center */}
        <div style={{
          position: 'absolute', inset: 30, borderRadius: '50%',
          background: svc.bg,
          border: `1px solid ${svc.color}30`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <Icon size={18} style={{ color: svc.color }} />
        </div>
      </div>

      {/* Text */}
      <div style={{ textAlign: 'center' }}>
        <p style={{ fontSize: 17, fontWeight: 800, color: '#f1f5f9', marginBottom: 6 }}>Processing…</p>
        <p style={{ fontSize: 12, color: '#64748b' }}>Please wait, do not close this page</p>
      </div>

      {/* Animated dots */}
      <div style={{ display: 'flex', gap: 6 }}>
        {[0, 1, 2].map((i) => (
          <div key={i} style={{
            width: 7, height: 7, borderRadius: '50%',
            background: '#2563eb',
            animation: `pulse 1.2s ease-in-out ${i * 0.2}s infinite`,
          }} />
        ))}
      </div>

      <style>{`
        @keyframes pulse {
          0%, 80%, 100% { opacity: 0.2; transform: scale(0.8); }
          40% { opacity: 1; transform: scale(1); }
        }
      `}</style>
    </div>,
    document.body
  );
}
