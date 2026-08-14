import React from 'react';

export const PolicyIcon = ({ name, className = "w-5 h-5", ...rest }) => {
  const paths = {
    pin: (<><path d="M12 21s7-6.1 7-11.5A7 7 0 0 0 5 9.5C5 14.9 12 21 12 21Z" /><circle cx="12" cy="9.5" r="2.3" /></>),
    globe: (<><circle cx="12" cy="12" r="9" /><path d="M3 12h18M12 3c2.6 2.6 4 5.8 4 9s-1.4 6.4-4 9c-2.6-2.6-4-5.8-4-9s1.4-6.4 4-9Z" /></>),
    tag: (<><path d="M20.6 12.6 12.7 20.5a2 2 0 0 1-2.8 0L3.5 14.1a2 2 0 0 1 0-2.8L11.4 3.5H18a2.6 2.6 0 0 1 2.6 2.6v6.5Z" /><circle cx="15.5" cy="8.5" r="1.2" /></>),
    shield: (<><path d="M12 3 4.5 6v6c0 4.6 3.2 7.9 7.5 9 4.3-1.1 7.5-4.4 7.5-9V6L12 3Z" /><path d="M9 12.2 11.2 14.4 15.4 10" /></>),
    clock: (<><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3.5 2" /></>),
    alert: (<><path d="M12 3 21.5 19.5H2.5L12 3Z" /><path d="M12 9.8v4.2M12 16.9v.1" /></>),
    address: (<><path d="M4 6.5h16M4 12h16M4 17.5h10" /></>),
    box: (<><path d="M3.5 7.5 12 3l8.5 4.5V16.5L12 21l-8.5-4.5V7.5Z" /><path d="M3.5 7.5 12 12l8.5-4.5M12 12v9" /></>),
    x: (<><circle cx="12" cy="12" r="9" /><path d="m9 9 6 6M15 9l-6 6" /></>),
    mail: (<><rect x="3.5" y="5.5" width="17" height="13" rx="2" /><path d="m4.5 7 7.5 6 7.5-6" /></>),
    crown: (<><path d="M4 18h16M4.5 18 3 8l4.5 3.2L12 6l4.5 5.2L21 8l-1.5 10" /></>),
    document: (<><path d="M7 3h7l5 5v13H7V3Z" /><path d="M14 3v5h5M9 12h6M9 16h6" /></>),
    users: (<><circle cx="9" cy="8" r="3" /><path d="M3 20c0-3.3 2.7-6 6-6s6 2.7 6 6" /><circle cx="17" cy="9" r="2.5" /><path d="M21 20c0-2.6-1.8-4.8-4.2-5.5" /></>),
    copyright: (<><circle cx="12" cy="12" r="9" /><path d="M14.5 9.7a3 3 0 1 0 0 4.6" /></>),
    card: (<><rect x="3" y="6" width="18" height="12" rx="2" /><path d="M3 10h18M7 15h4" /></>),
    shieldOff: (<><path d="M12 3 4.5 6v6c0 4.6 3.2 7.9 7.5 9 4.3-1.1 7.5-4.4 7.5-9V6L12 3Z" /><path d="M9.5 9.5 14.5 14.5M14.5 9.5 9.5 14.5" /></>),
    droplet: (<><path d="M12 3c3.5 4 6 7.4 6 10.5A6 6 0 0 1 6 13.5C6 10.4 8.5 7 12 3Z" /></>),
    eye: (<><path d="M2 12s3.5-6.5 10-6.5S22 12 22 12s-3.5 6.5-10 6.5S2 12 2 12Z" /><circle cx="12" cy="12" r="3" /></>),
    xCircle: (<><circle cx="12" cy="12" r="9" /><path d="m9 9 6 6M15 9l-6 6" /></>),
    refresh: (<><path d="M3 12a9 9 0 0 1 15.5-6.3L21 8M21 3v5h-5" /><path d="M21 12a9 9 0 0 1-15.5 6.3L3 16M3 21v-5h5" /></>),
    ban: (<><circle cx="12" cy="12" r="9" /><path d="M6.2 6.2l11.6 11.6" /></>),
    swap: (<><path d="M4 7h13l-3-3M20 17H7l3 3" /></>),
  };
  return paths[name] ? (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={className} {...rest}>
      {paths[name]}
    </svg>
  ) : null;
};
