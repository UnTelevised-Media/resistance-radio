import Link from 'next/link';
import type { Metadata } from 'next';
import LocalTime from '@/components/LocalTime';

export const metadata: Metadata = {
  title: 'Schedule — Resistance Radio',
  description: 'Resistance Radio broadcast schedule.',
};

const SHOWS = [
  {
    centralTime: '06:00',
    label: 'MORNING RESISTANCE',
    color: 'border-phosphor text-phosphor',
    desc: null,
  },
  {
    centralTime: '14:00',
    label: 'BURNING EMPIRE',
    color: 'border-gold text-gold',
    desc: '30-minute high-intensity workout mix with warm-up and cool-down.',
    live: true,
  },
  {
    centralTime: '18:00',
    label: 'SOUND SYSTEM',
    color: 'border-cyan text-cyan',
    desc: null,
  },
  {
    centralTime: '21:00',
    label: 'LATE NIGHT LIBERATION',
    color: 'border-alert text-alert',
    desc: null,
  },
] satisfies { centralTime: string; label: string; color: string; desc: string | null; live?: boolean }[];

export default function SchedulePage() {
  return (
    <main className="flex-1 flex flex-col items-center justify-center px-6 py-24 min-h-[60vh]">
      <div className="text-center max-w-xl w-full">

        <div className="inline-block border-2 border-cyan px-6 py-2 mb-8">
          <p className="terminal-text text-xs text-cyan tracking-widest">
            TRANSMISSION LOG
          </p>
        </div>

        <h1 className="display-text text-5xl md:text-7xl phosphor-glow-cyan mb-4">
          SCHEDULE
        </h1>

        <div className="flex items-center justify-center gap-4 mb-10">
          <div className="h-px w-16 bg-cyan/50" />
          <p className="mono-text text-xs text-muted tracking-widest">ALL TIMES IN YOUR LOCAL TIMEZONE</p>
          <div className="h-px w-16 bg-cyan/50" />
        </div>

        <div className="space-y-3 mb-10 text-left">
          {SHOWS.map(({ centralTime, label, color, desc, live }) => {
            const [borderColor, textColor] = color.split(' ');
            return (
              <div key={centralTime} className={`terminal-panel border-l-4 ${borderColor} pl-4 py-4 flex items-start justify-between gap-4`}>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <p className={`display-text text-xl ${textColor}`}>
                      <LocalTime centralHHMM={centralTime} />
                    </p>
                    {live && (
                      <span className="mono-text text-[9px] text-gold border border-gold/40 px-1.5 py-0.5 tracking-widest">
                        ON AIR
                      </span>
                    )}
                  </div>
                  <p className="terminal-text text-foreground text-xs tracking-wide">{label}</p>
                  {desc && (
                    <p className="mono-text text-muted/60 text-[10px] mt-1 leading-relaxed">{desc}</p>
                  )}
                  {!desc && (
                    <p className="mono-text text-muted/30 text-[10px] mt-1">Programming coming soon</p>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        <Link
          href="/"
          className="inline-flex items-center gap-2 px-6 py-2.5 border border-phosphor/40 text-phosphor
            mono-text text-xs tracking-widest uppercase hover:bg-phosphor/10 hover:border-phosphor
            transition-all duration-200"
        >
          ← BACK TO BROADCAST
        </Link>

      </div>
    </main>
  );
}
