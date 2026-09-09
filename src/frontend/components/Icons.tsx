type P = { className?: string };

const S = (p: P & { d?: string; children?: React.ReactNode }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} className={p.className} aria-hidden>
    {p.d ? <path d={p.d} strokeLinecap="square" /> : p.children}
  </svg>
);

export const IUpload = (p: P) => <S {...p} d="M12 16V4m0 0L7 9m5-5l5 5M4 20h16" />;
export const IDownload = (p: P) => <S {...p} d="M12 4v12m0 0l-5-5m5 5l5-5M4 20h16" />;
export const ILink = (p: P) => (
  <S {...p}>
    <path d="M10 14a5 5 0 0 0 7 0l3-3a5 5 0 0 0-7-7l-1.5 1.5" strokeLinecap="square" />
    <path d="M14 10a5 5 0 0 0-7 0l-3 3a5 5 0 0 0 7 7l1.5-1.5" strokeLinecap="square" />
  </S>
);
export const IFile = (p: P) => <S {...p} d="M6 2h8l4 4v16H6zM14 2v4h4" />;
export const IFolder = (p: P) => <S {...p} d="M3 6h6l2 2h10v12H3z" />;
export const ISettings = (p: P) => (
  <S {...p}>
    <circle cx="12" cy="12" r="3" />
    <path d="M12 2v3m0 14v3M2 12h3m14 0h3M5 5l2 2m10 10l2 2M19 5l-2 2M7 17l-2 2" strokeLinecap="square" />
  </S>
);
export const IUser = (p: P) => (
  <S {...p}>
    <circle cx="12" cy="8" r="4" />
    <path d="M4 21c0-4 4-6 8-6s8 2 8 6" strokeLinecap="square" />
  </S>
);
export const IDevices = (p: P) => (
  <S {...p}>
    <rect x="2" y="4" width="13" height="10" />
    <rect x="17" y="9" width="5" height="11" />
    <path d="M6 18h6" strokeLinecap="square" />
  </S>
);
export const IShare = (p: P) => (
  <S {...p}>
    <circle cx="6" cy="12" r="2.5" />
    <circle cx="18" cy="6" r="2.5" />
    <circle cx="18" cy="18" r="2.5" />
    <path d="M8.2 10.8l7.6-3.6M8.2 13.2l7.6 3.6" strokeLinecap="square" />
  </S>
);
export const ITrash = (p: P) => <S {...p} d="M4 7h16M9 7V4h6v3m-9 0l1 14h10l1-14" />;
export const ICopy = (p: P) => (
  <S {...p}>
    <rect x="9" y="9" width="12" height="12" />
    <path d="M5 15V3h12" strokeLinecap="square" />
  </S>
);
export const IPause = (p: P) => <S {...p} d="M9 4v16M15 4v16" />;
export const IPlay = (p: P) => <S {...p} d="M7 4l13 8-13 8z" />;
export const IArrow = (p: P) => <S {...p} d="M3 12h18m0 0l-6-6m6 6l-6 6" />;
export const ICheck = (p: P) => <S {...p} d="M4 12l5 5L20 6" />;
export const IX = (p: P) => <S {...p} d="M6 6l12 12M18 6L6 18" />;
export const IBurger = (p: P) => <S {...p} d="M3 6h18M3 12h18M3 18h18" />;
