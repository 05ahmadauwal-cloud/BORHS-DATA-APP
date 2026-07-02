const NETWORKS = {
  mtn: {
    bg: '#FFCC00',
    color: '#0a0a00',
    name: 'MTN',
    weight: 900,
    size: 12,
    pill: false,
    tracking: '0.08em',
  },
  airtel: {
    bg: '#E11B22',
    color: '#ffffff',
    name: 'airtel',
    weight: 700,
    size: 11,
    pill: false,
    tracking: '0.02em',
  },
  glo: {
    bg: '#00A651',
    color: '#ffffff',
    name: 'glo',
    weight: 800,
    size: 12,
    pill: true,
    tracking: '0.06em',
    italic: true,
  },
  '9mobile': {
    bg: '#006837',
    color: '#76BC21',
    name: '9mobile',
    weight: 700,
    size: 9.5,
    pill: false,
    tracking: '0.01em',
  },
};

const SIZES = {
  xs: { h: 18, minW: 38, px: 6, scale: 0.8 },
  sm: { h: 22, minW: 48, px: 8, scale: 1 },
  md: { h: 28, minW: 62, px: 10, scale: 1.2 },
  lg: { h: 36, minW: 80, px: 14, scale: 1.5 },
};

export function NetworkLogo({ network, size = 'sm' }) {
  const n = NETWORKS[network];
  const s = SIZES[size] || SIZES.sm;
  if (!n) {
    return (
      <span className="inline-flex items-center justify-center text-xs font-bold uppercase text-dark-400"
        style={{ height: s.h, minWidth: s.minW }}>
        {network}
      </span>
    );
  }
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        height: s.h,
        minWidth: s.minW,
        paddingLeft: s.px,
        paddingRight: s.px,
        background: n.bg,
        color: n.color,
        borderRadius: n.pill ? 999 : 4,
        fontWeight: n.weight,
        fontSize: n.size * s.scale,
        fontStyle: n.italic ? 'italic' : 'normal',
        letterSpacing: n.tracking,
        fontFamily: '"Helvetica Neue", Arial, sans-serif',
        lineHeight: 1,
        flexShrink: 0,
        userSelect: 'none',
        whiteSpace: 'nowrap',
      }}
    >
      {n.name}
    </span>
  );
}

const BTN_COLORS = {
  mtn:      { border: '#e6b800', selBorder: '#FFCC00', selBg: 'rgba(255,204,0,0.12)' },
  airtel:   { border: '#c01820', selBorder: '#E11B22', selBg: 'rgba(225,27,34,0.12)' },
  glo:      { border: '#00843f', selBorder: '#00A651', selBg: 'rgba(0,166,81,0.12)' },
  '9mobile':{ border: '#004d28', selBorder: '#006837', selBg: 'rgba(118,188,33,0.12)' },
};

export function NetworkButton({ network, selected, onClick }) {
  const n = NETWORKS[network];
  const c = BTN_COLORS[network];
  if (!n) return null;

  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        padding: '12px 6px',
        borderRadius: 12,
        border: `2px solid ${selected ? c.selBorder : c.border + '55'}`,
        background: selected ? c.selBg : 'transparent',
        cursor: 'pointer',
        transition: 'all 0.15s ease',
        outline: 'none',
      }}
    >
      {/* Logo badge */}
      <span
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          height: 30,
          minWidth: 58,
          padding: '0 10px',
          background: n.bg,
          color: n.color,
          borderRadius: n.pill ? 999 : 6,
          fontWeight: n.weight,
          fontSize: n.size * 1.1,
          fontStyle: n.italic ? 'italic' : 'normal',
          letterSpacing: n.tracking,
          fontFamily: '"Helvetica Neue", Arial, sans-serif',
          lineHeight: 1,
          userSelect: 'none',
          whiteSpace: 'nowrap',
          boxShadow: selected ? `0 2px 8px ${n.bg}66` : 'none',
        }}
      >
        {n.name}
      </span>
    </button>
  );
}
