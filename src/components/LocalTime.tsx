'use client';

import { useState, useEffect } from 'react';

interface LocalTimeProps {
  centralHHMM: string; // "HH:MM" in America/Chicago timezone
  className?: string;
}

function centralToLocal(hhmm: string): string {
  const [h, m] = hhmm.split(':').map(Number);
  const now = new Date();

  // Use noon UTC as a DST-safe reference to get Chicago's current UTC offset
  const noonUTC = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(), 12, 0, 0));
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: 'America/Chicago', hour: 'numeric', minute: '2-digit', hour12: false,
  }).formatToParts(noonUTC);

  const chicagoH = parseInt(parts.find(p => p.type === 'hour')?.value ?? '12');
  const chicagoM = parseInt(parts.find(p => p.type === 'minute')?.value ?? '0');

  // How many minutes Chicago is behind UTC (CDT = 300, CST = 360)
  const offsetMins = 12 * 60 - (chicagoH * 60 + chicagoM);

  // Build the scheduled moment in UTC — Date.UTC handles minute overflow correctly
  const scheduled = new Date(Date.UTC(
    now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(),
    0, h * 60 + m + offsetMins,
  ));

  return scheduled.toLocaleTimeString('en-US', {
    hour: 'numeric', minute: '2-digit', hour12: true, timeZoneName: 'short',
  });
}

export default function LocalTime({ centralHHMM, className }: LocalTimeProps) {
  const [time, setTime] = useState<string | null>(null);

  useEffect(() => {
    setTime(centralToLocal(centralHHMM));
  }, [centralHHMM]);

  // Render placeholder until client hydrates to avoid mismatch
  if (time === null) return <span className={className}>--:--</span>;
  return <span className={className}>{time}</span>;
}
