'use client';

import Image from "next/image";
import Link from "next/link";
import { useRef, useState, useEffect } from "react";
import SecureAudioPlayer, { type SecureAudioPlayerHandle } from "@/components/secureplayer";
import Socials from "@/components/Socials";
import LocalTime from "@/components/LocalTime";
import type { NowPlayingData } from "@/app/api/nowplaying/route";

function formatDuration(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = Math.round(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

function formatTimeAgo(timestamp: number): string {
  const seconds = Math.floor(Date.now() / 1000 - timestamp);
  if (seconds < 60) return `${seconds}s ago`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  return `${hours}h ago`;
}

export default function Home() {
  const playerRef = useRef<SecureAudioPlayerHandle>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioData, setAudioData] = useState<Uint8Array>(new Uint8Array(128));
  const [error, setError] = useState<string | null>(null);
  const [nowPlayingData, setNowPlayingData] = useState<NowPlayingData | null>(null);
  const [localElapsed, setLocalElapsed] = useState(0);

  // Poll nowplaying API every 15 seconds
  useEffect(() => {
    const fetchNowPlaying = async () => {
      try {
        const res = await fetch('/api/nowplaying');
        if (res.ok) {
          const data: NowPlayingData = await res.json();
          setNowPlayingData(data);
          setLocalElapsed(data.nowPlaying.elapsed);
        }
      } catch {
        // Silent fail — metadata fetch should not interrupt playback
      }
    };

    fetchNowPlaying();
    const interval = setInterval(fetchNowPlaying, 15000);
    return () => clearInterval(interval);
  }, []);

  // Tick elapsed time locally between polls for smooth progress
  useEffect(() => {
    if (!nowPlayingData) return;
    const ticker = setInterval(() => {
      setLocalElapsed(prev =>
        Math.min(prev + 1, nowPlayingData.nowPlaying.duration)
      );
    }, 1000);
    return () => clearInterval(ticker);
  }, [nowPlayingData]);

  return (
    <>
      {/* CRT Screen Effects Layer */}
      <div className="noise-overlay"></div>
      <div className="signal-dropout"></div>
      <div className="signal-dropout"></div>
      <div className="signal-dropout"></div>

      {/* Giant Anarchist Ⓐ Background SVG */}
      <div className="anarchist-bg" aria-hidden="true">
        <Image
          src="/anarchist-a.svg"
          alt=""
          fill
          priority
          draggable={false}
          style={{ objectFit: 'contain' }}
        />
      </div>

      {/* HUD Corner Brackets */}
      <div className="hud-corner top-left">⌜</div>
      <div className="hud-corner top-right">⌝</div>
      <div className="hud-corner bottom-left">⌞</div>
      <div className="hud-corner bottom-right">⌟</div>

      {/* Main Content */}
      <div className="relative z-10 min-h-screen flex flex-col">

        {/* Broadcast Status Bar */}
        <div className="fixed top-6 left-1/2 transform -translate-x-1/2 z-50">
          <div className="broadcast-status">
            ⚠ UNAUTHORIZED BROADCAST ⚠
          </div>
        </div>

        {/* Signal Readout */}
        <div className="fixed top-20 right-8 z-40 text-right">
          <div className="signal-readout">SIGNAL: 314.7 MHz</div>
          <div className="signal-readout opacity-80">
            {nowPlayingData
              ? `LISTENERS: ${nowPlayingData.listeners}`
              : 'UPTIME: 04:17:33'}
          </div>
          <div className="signal-readout opacity-60">ENCRYPT: AES-256</div>
        </div>

        {/* Main Terminal */}
        <main className="flex-1 flex flex-col justify-center px-6 py-20">
          <div className="w-full max-w-300 mx-auto">

            {/* Station Identity — full width, centered */}
            <div className="text-center mb-12">
              <div className="inline-block border-2 border-phosphor px-6 py-2 mb-6">
                <p className="terminal-text text-xs phosphor-glow tracking-widest">
                  PIRATE TRANSMISSION DETECTED
                </p>
              </div>

              <h1 className="text-4xl sm:text-6xl md:text-9xl display-text phosphor-glow leading-none mb-4 jitter-anim">
                RESISTANCE
              </h1>

              <div className="flex items-center justify-center gap-4 mb-6">
                <div className="h-0.5 w-20 bg-phosphor shadow-[0_0_10px_var(--accent2-400)]"></div>
                <p className="text-3xl display-text phosphor-glow-cyan">RADIO</p>
                <div className="h-0.5 w-20 bg-phosphor shadow-[0_0_10px_var(--accent2-400)]"></div>
              </div>

              <p className="terminal-text text-muted text-sm tracking-wider">
                RESISTANCE THROUGH SOUND
              </p>
            </div>

            {/* Sidebar + Player — sidebar is absolutely pinned to player height */}
            <div className="relative flex flex-col lg:block mb-8">

              {/* Recently Played Sidebar — absolute on desktop so player drives height */}
              <aside className="w-full order-last lg:absolute lg:left-0 lg:top-0 lg:w-72 lg:h-full">
                <div className="terminal-panel border-2 border-phosphor/40 p-4 lg:h-full flex flex-col">

                  {/* Sidebar header */}
                  <div className="flex items-center gap-2 mb-4 pb-3 border-b border-phosphor/30">
                    <span className="mono-text text-phosphor text-xs tracking-widest">
                      <span className="text-cyan">{'// '}</span>RECENTLY PLAYED
                    </span>
                  </div>

                  {/* Current track */}
                  {nowPlayingData ? (
                    <div className="mb-4 pb-4 border-b border-phosphor/20">
                      <div className="flex items-center gap-1.5 mb-2">
                        <div className={`w-1.5 h-1.5 rounded-full shrink-0 ${isPlaying ? 'bg-alert animate-pulse' : 'bg-phosphor/50'}`}></div>
                        <span className="mono-text text-[10px] tracking-widest text-muted uppercase">
                          {isPlaying ? 'NOW PLAYING' : 'ON AIR'}
                        </span>
                      </div>
                      <div className="flex gap-3">
                        <div className="w-10 h-10 shrink-0 border border-phosphor/20 overflow-hidden bg-dark-800/80">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={nowPlayingData.nowPlaying.song.art}
                            alt=""
                            className="w-full h-full object-cover opacity-80"
                            onError={(e) => { e.currentTarget.style.display = 'none'; }}
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="terminal-text text-foreground text-xs leading-tight truncate">
                            {nowPlayingData.nowPlaying.song.title || nowPlayingData.nowPlaying.song.text}
                          </p>
                          <p className="mono-text text-phosphor text-[10px] truncate">
                            {nowPlayingData.nowPlaying.song.artist}
                          </p>
                          <div className="mt-1.5">
                            <div className="h-px bg-phosphor/20 w-full">
                              <div
                                className="h-full bg-phosphor/70 transition-all duration-1000"
                                style={{ width: `${Math.min(100, (localElapsed / nowPlayingData.nowPlaying.duration) * 100)}%` }}
                              />
                            </div>
                            <div className="flex justify-between mt-0.5">
                              <span className="mono-text text-[9px] text-muted/60">{formatDuration(localElapsed)}</span>
                              <span className="mono-text text-[9px] text-muted/60">{formatDuration(nowPlayingData.nowPlaying.duration)}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="mb-4 pb-4 border-b border-phosphor/20">
                      <p className="mono-text text-muted/50 text-[10px] tracking-wider text-center py-2">
                        LOADING...
                      </p>
                    </div>
                  )}

                  {/* Track history */}
                  <div className="flex-1 min-h-0 overflow-y-auto space-y-3 pr-1">
                    {nowPlayingData?.history.length ? (
                      nowPlayingData.history.map((item, i) => (
                        <div key={i} className="flex gap-2.5 opacity-70 hover:opacity-90 transition-opacity">
                          <div className="w-8 h-8 shrink-0 border border-phosphor/10 overflow-hidden bg-dark-800/60">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                              src={item.song.art}
                              alt=""
                              className="w-full h-full object-cover"
                              onError={(e) => { e.currentTarget.style.display = 'none'; }}
                            />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="terminal-text text-foreground text-[10px] leading-tight truncate">
                              {item.song.title || item.song.text}
                            </p>
                            <p className="mono-text text-muted text-[9px] truncate">{item.song.artist}</p>
                            <p className="mono-text text-muted/50 text-[9px]">{formatTimeAgo(item.playedAt)}</p>
                          </div>
                        </div>
                      ))
                    ) : nowPlayingData ? (
                      <p className="mono-text text-muted/50 text-[10px] tracking-wider text-center py-2">
                        NO HISTORY
                      </p>
                    ) : null}
                  </div>

                  {/* Listener count */}
                  {nowPlayingData && (
                    <div className="mt-4 pt-3 border-t border-phosphor/20 text-center">
                      <p className="mono-text text-[10px] text-muted/60 tracking-wider">
                        <span className="text-phosphor">{nowPlayingData.listeners}</span>
                        {' '}LISTENER{nowPlayingData.listeners !== 1 ? 'S' : ''} ONLINE
                      </p>
                    </div>
                  )}

                </div>
              </aside>

              {/* Player column — in normal flow, sets the container height */}
              <div className="lg:ml-78">

                {/* RADIO PLAYER - HERO ELEMENT */}
                <div className="terminal-panel border-4 border-phosphor p-8 md:p-12 hover:border-phosphor-bright transition-all">

                  {/* Player Header */}
                  <div className="flex items-center justify-between mb-8 pb-6 border-b border-phosphor/30">
                    <div>
                      <h2 className="display-text text-2xl phosphor-glow mb-1">LIVE STREAM</h2>
                      <p className="mono-text text-xs text-muted">PLAYER_v2.4.7</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-3 h-3 bg-alert rounded-full animate-pulse shadow-[0_0_15px_var(--ruby-400)]"></div>
                      <span className="terminal-text phosphor-glow-alert text-xs uppercase tracking-widest">
                        ON AIR
                      </span>
                    </div>
                  </div>

                  {/* Secure Audio Player */}
                  <SecureAudioPlayer
                    ref={playerRef}
                    stationId="1"
                    isActive={true}
                    isPoweredOn={isPlaying}
                    directStream={true}
                    onPlay={() => setError(null)}
                    onError={(errorMsg) => {
                      setError(errorMsg);
                      setIsPlaying(false);
                    }}
                    onAudioData={setAudioData}
                  />

                  {/* Player Controls */}
                  <div className="bg-dark-900/80 border-2 border-phosphor/30 p-8 mb-8">
                    <div className="flex flex-wrap items-center justify-center gap-6">

                      {/* Play/Pause Button */}
                      <button
                        onClick={() => {
                          if (isPlaying) {
                            playerRef.current?.pause();
                            setIsPlaying(false);
                          } else {
                            if (!playerRef.current) {
                              setError('Audio player not initialized');
                              return;
                            }
                            playerRef.current.play();
                            setIsPlaying(true);
                          }
                        }}
                        className="group relative"
                      >
                        <div className={`
                          w-24 h-24 border-4
                          ${isPlaying ? 'border-alert bg-alert/10' : 'border-phosphor bg-phosphor/10'}
                          hover:bg-phosphor/20 transition-all duration-300
                          flex items-center justify-center
                          ${isPlaying ? 'shadow-[0_0_30px_var(--ruby-400)]' : 'shadow-[0_0_30px_var(--accent2-400)]'}
                        `}>
                          {isPlaying ? (
                            <div className="flex gap-2">
                              <div className="w-2 h-8 bg-alert"></div>
                              <div className="w-2 h-8 bg-alert"></div>
                            </div>
                          ) : (
                            <div className="w-0 h-0 border-l-16 border-l-phosphor border-y-12 border-y-transparent ml-1"></div>
                          )}
                        </div>
                        <p className={`
                          mono-text text-xs mt-3 uppercase tracking-widest text-center
                          ${isPlaying ? 'text-alert' : 'text-phosphor'}
                        `}>
                          {isPlaying ? 'PAUSE' : 'PLAY'}
                        </p>
                      </button>

                      {/* Audio Visualizer — full row on mobile, flex-1 inline on md+ */}
                      <div className="w-full md:flex-1 md:w-auto flex items-end justify-center gap-1 h-24 bg-dark-800/50 border border-phosphor/20 px-3 overflow-hidden">
                        {Array.from(audioData).slice(0, 32).map((value, i) => {
                          const scaled = Math.min(255, value * 0.5);
                          const height = isPlaying
                            ? Math.max(4, (scaled / 255) * 100)
                            : 6 + (i % 4) * 1.5;
                          return (
                            <div
                              key={i}
                              className="w-1.5 shrink-0 bg-phosphor"
                              style={{
                                height: `${height}%`,
                                opacity: isPlaying ? (0.5 + (scaled / 255) * 0.5) : 0.28,
                                boxShadow: isPlaying && scaled > 60
                                  ? `0 0 ${Math.min(8, scaled / 32)}px var(--accent2-400)`
                                  : 'none',
                                transition: 'height 120ms ease-out, opacity 120ms ease-out'
                              }}
                            />
                          );
                        })}
                      </div>

                      {/* Status Indicator */}
                      <div className="text-center">
                        <div className={`
                          w-4 h-4 rounded-full mb-2
                          ${isPlaying ? 'bg-alert animate-pulse shadow-[0_0_15px_var(--ruby-400)]' : 'bg-muted/30'}
                        `}></div>
                        <p className="mono-text text-xs text-muted uppercase tracking-widest">
                          {isPlaying ? 'LIVE' : 'IDLE'}
                        </p>
                      </div>

                    </div>

                    {/* Now Playing Info */}
                    {!error && (
                      <div className="mt-6 pt-6 border-t border-phosphor/20 text-center">
                        <p className="terminal-text text-phosphor text-sm mb-2 tracking-widest">
                          NOW BROADCASTING
                        </p>
                        {nowPlayingData ? (
                          <>
                            <p className={`display-text text-xl leading-tight mb-0.5 transition-opacity ${isPlaying ? 'text-foreground' : 'text-foreground/70'}`}>
                              {nowPlayingData.nowPlaying.song.title || nowPlayingData.nowPlaying.song.text}
                            </p>
                            <p className="mono-text text-phosphor text-xs tracking-wider mb-3">
                              {nowPlayingData.nowPlaying.song.artist}
                            </p>
                            <div className="max-w-xs mx-auto">
                              <div className="h-0.5 bg-phosphor/20 w-full">
                                <div
                                  className="h-full bg-phosphor transition-all duration-1000"
                                  style={{ width: `${Math.min(100, (localElapsed / nowPlayingData.nowPlaying.duration) * 100)}%` }}
                                />
                              </div>
                              <div className="flex justify-between mt-1">
                                <span className="mono-text text-muted text-[10px]">{formatDuration(localElapsed)}</span>
                                <span className="mono-text text-muted text-[10px]">{formatDuration(nowPlayingData.nowPlaying.duration)}</span>
                              </div>
                            </div>
                          </>
                        ) : (
                          <p className="mono-text text-muted text-xs">
                            FREQUENCY: 314.7 MHz • RESISTANCE RADIO
                          </p>
                        )}
                      </div>
                    )}

                    {/* Error Display */}
                    {error && (
                      <div className="mt-6 pt-6 border-t border-alert/30 text-center">
                        <p className="terminal-text text-alert text-sm mb-1 phosphor-glow-alert">
                          ⚠ STREAM ERROR
                        </p>
                        <p className="mono-text text-muted text-xs">
                          {error}
                        </p>
                        <button
                          onClick={() => {
                            setError(null);
                            setIsPlaying(false);
                          }}
                          className="mt-3 px-4 py-2 border border-phosphor/30 text-phosphor hover:bg-phosphor/10 mono-text text-xs transition-all"
                        >
                          DISMISS
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Player Technical Info */}
                  <div className="grid grid-cols-3 gap-3 text-center">
                    <div className="bg-dark-800/50 border border-phosphor/20 p-3">
                      <p className="mono-text text-phosphor text-[10px] mb-1 tracking-widest">BITRATE</p>
                      <p className="terminal-text text-foreground text-sm">192kbps</p>
                    </div>
                    <div className="bg-dark-800/50 border border-phosphor/20 p-3">
                      <p className="mono-text text-phosphor text-[10px] mb-1 tracking-widest">FORMAT</p>
                      <p className="terminal-text text-foreground text-sm">AAC</p>
                    </div>
                    <div className="bg-dark-800/50 border border-phosphor/20 p-3">
                      <p className="mono-text text-phosphor text-[10px] mb-1 tracking-widest">LATENCY</p>
                      <p className="terminal-text text-foreground text-sm">~2.3s</p>
                    </div>
                  </div>
                </div>

              </div>{/* end player column */}
            </div>{/* end sidebar+player row */}

            {/* Quick Schedule — full width below player row */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
              {([
                { centralTime: '06:00', label: 'MORNING RESISTANCE',    border: 'border-phosphor', color: 'text-phosphor', desc: undefined },
                { centralTime: '14:00', label: 'BURNING EMPIRE',        border: 'border-gold',     color: 'text-gold',     desc: '30 MIN • WORKOUT MIX' },
                { centralTime: '18:00', label: 'SOUND SYSTEM',          border: 'border-cyan',     color: 'text-cyan',     desc: undefined },
                { centralTime: '21:00', label: 'LATE NIGHT LIBERATION', border: 'border-alert',    color: 'text-alert',    desc: undefined },
              ] satisfies { centralTime: string; label: string; border: string; color: string; desc?: string }[]).map(({ centralTime, label, border, color, desc }) => (
                <div key={centralTime} className={`terminal-panel border-l-4 ${border} pl-4 py-3`}>
                  <LocalTime centralHHMM={centralTime} className={`display-text ${color} text-lg`} />
                  <p className="terminal-text text-foreground text-[10px] whitespace-nowrap">{label}</p>
                  {desc && <p className="mono-text text-muted/60 text-[9px] mt-0.5">{desc}</p>}
                </div>
              ))}
            </div>

            {/* Mission — full width below schedule */}
            <div className="text-center">
              <p className="terminal-text text-muted text-sm leading-relaxed">
                Independent community radio broadcasting truth and resistance.
                <strong className="text-phosphor"> No corporate sponsors. No censorship.</strong>
                {' '}Supported entirely by the community we serve.
              </p>
            </div>

          </div>
        </main>

        {/* Footer */}
        <footer className="border-t border-phosphor/30 py-8 px-6">
          <div className="max-w-2xl mx-auto space-y-6 text-center">

            {/* Support CTA */}
            <div className="terminal-panel border border-alert/30 p-5 flex flex-col items-center gap-4">
              <div>
                <p className="display-text text-alert phosphor-glow-alert text-sm mb-1">KEEP THE SIGNAL ALIVE</p>
                <p className="mono-text text-muted text-xs leading-relaxed">
                  Independent. Ad-free. No corporate sponsors.{' '}
                  Funded entirely by the community we serve.
                </p>
              </div>
              <Link
                href="https://untelevised.media/support"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-6 py-2.5 bg-alert/10 border-2 border-alert/60
                  text-alert mono-text text-xs tracking-widest uppercase hover:bg-alert/20 hover:border-alert
                  transition-all duration-200 shadow-[0_0_15px_rgba(255,23,68,0.2)]"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-alert animate-pulse" />
                SUPPORT THE STATION ↗
              </Link>
            </div>

            {/* Social icons */}
            <div className="flex justify-center">
              <Socials />
            </div>

            {/* Bottom row */}
            <div className="flex flex-col items-center gap-3 pt-4 border-t border-phosphor/10">
              <div className="flex items-center gap-3">
                <div className="w-1.5 h-1.5 bg-phosphor rounded-full animate-pulse"></div>
                <span className="display-text text-lg phosphor-glow">RESISTANCE RADIO</span>
                <span className="mono-text text-muted text-xs">
                  <span className="text-cyan">{'//'}</span> {new Date().getFullYear()}
                </span>
              </div>

              <div className="flex items-center gap-4 mono-text text-xs text-muted">
                <span>Independent</span>
                <span className="opacity-30">•</span>
                <span>Non-profit</span>
                <span className="opacity-30">•</span>
                <span>Ad-free</span>
              </div>

              <p className="mono-text text-[10px] text-muted/50 tracking-wider">
                [ THE REVOLUTION WILL NOT BE TELEVISED ]
              </p>
            </div>

          </div>
        </footer>

      </div>
    </>
  );
}
