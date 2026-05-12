const paths = {
  menu: <><path d="M3 6h14M3 10h14M3 14h14" /></>,
  close: <><path d="M5 5l10 10M15 5L5 15" /></>,
  plus: <><path d="M10 4v12M4 10h12" /></>,
  check: <><path d="M4 10.5l3.5 3.5L16 5.5" /></>,
  chevronLeft: <><path d="M12 4l-6 6 6 6" /></>,
  chevronRight: <><path d="M8 4l6 6-6 6" /></>,
  chevronDown: <><path d="M4 7l6 6 6-6" /></>,
  calendar: <>
    <rect x="3" y="4.5" width="14" height="13" rx="2" />
    <path d="M3 8h14M7 2.5v3M13 2.5v3" />
  </>,
  board: <>
    <rect x="3" y="3.5" width="4" height="13" rx="1.2" />
    <rect x="9" y="3.5" width="4" height="8" rx="1.2" />
    <rect x="15" y="3.5" width="2.5" height="6" rx="1" />
  </>,
  settings: <>
    <circle cx="10" cy="10" r="2.5" />
    <path d="M10 2v2M10 16v2M2 10h2M16 10h2M4.2 4.2l1.4 1.4M14.4 14.4l1.4 1.4M4.2 15.8l1.4-1.4M14.4 5.6l1.4-1.4" />
  </>,
  bolt: <><path d="M11 2L4 11h5l-1 7 7-9h-5l1-7z" /></>,
  moon: <><path d="M16 11.5A6 6 0 119 4a5 5 0 007 7.5z" /></>,
  palette: <>
    <path d="M10 17.5A7.5 7.5 0 1117.5 9c0 2-2 2-3.5 2-1 0-2 .7-2 2s.7 2 2 2c1 0 2 1 1.5 2-.5 1-2 1.5-5.5 1.5z" />
    <circle cx="6" cy="9" r=".8" fill="currentColor" />
    <circle cx="9" cy="5.5" r=".8" fill="currentColor" />
    <circle cx="13" cy="5.5" r=".8" fill="currentColor" />
  </>,
  eye: <>
    <path d="M2 10s3-5.5 8-5.5S18 10 18 10s-3 5.5-8 5.5S2 10 2 10z" />
    <circle cx="10" cy="10" r="2.2" />
  </>,
  trash: <>
    <path d="M4 6h12M8 6V4h4v2M6 6l.7 10a1.5 1.5 0 001.5 1.5h3.6a1.5 1.5 0 001.5-1.5L14 6" />
  </>,
  flag: <><path d="M5 3v14M5 4h9l-1.5 3L14 10H5" /></>,
  note: <>
    <path d="M5 3.5h7l3 3V16a.5.5 0 01-.5.5h-9.5A.5.5 0 014.5 16V4a.5.5 0 01.5-.5z" />
    <path d="M8 9h5M8 12h4" />
  </>,
  dot: <><circle cx="10" cy="10" r="1.6" fill="currentColor" /></>,
};

export default function Icon({ name, size = 16, stroke = 1.6, style = {} }) {
  return (
    <svg
      width={size} height={size} viewBox="0 0 20 20"
      fill="none" stroke="currentColor" strokeWidth={stroke}
      strokeLinecap="round" strokeLinejoin="round"
      style={{ flexShrink: 0, ...style }}
    >
      {paths[name]}
    </svg>
  );
}
