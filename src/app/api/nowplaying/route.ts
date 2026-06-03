import { NextResponse } from 'next/server';

const AZURACAST_API = 'https://dj.untelevised.live/api/nowplaying/resistance_radio';

export interface TrackSong {
  artist: string;
  title: string;
  text: string;
  art: string;
}

export interface NowPlayingData {
  nowPlaying: {
    song: TrackSong;
    elapsed: number;
    remaining: number;
    duration: number;
    playedAt: number;
  };
  history: Array<{
    song: TrackSong;
    playedAt: number;
    duration: number;
  }>;
  isOnline: boolean;
  listeners: number;
}

interface AzuraCastSong {
  artist: string;
  title: string;
  text: string;
  art: string;
}

interface AzuraCastHistoryItem {
  song: AzuraCastSong;
  played_at: number;
  duration: number;
}

export async function GET() {
  try {
    const response = await fetch(AZURACAST_API, {
      cache: 'no-store',
    });

    if (!response.ok) {
      return NextResponse.json({ error: 'Failed to fetch metadata' }, { status: 502 });
    }

    const data = await response.json();

    const result: NowPlayingData = {
      nowPlaying: {
        song: {
          artist: data.now_playing.song.artist,
          title: data.now_playing.song.title,
          text: data.now_playing.song.text,
          art: data.now_playing.song.art,
        },
        elapsed: data.now_playing.elapsed,
        remaining: data.now_playing.remaining,
        duration: data.now_playing.duration,
        playedAt: data.now_playing.played_at,
      },
      history: (data.song_history as AzuraCastHistoryItem[]).slice(0, 10).map((item) => ({
        song: {
          artist: item.song.artist,
          title: item.song.title,
          text: item.song.text,
          art: item.song.art,
        },
        playedAt: item.played_at,
        duration: item.duration,
      })),
      isOnline: data.is_online,
      listeners: data.listeners.total,
    };

    return NextResponse.json(result, {
      headers: {
        'Cache-Control': 'public, s-maxage=15, stale-while-revalidate=30',
      },
    });
  } catch (error) {
    console.error('Error fetching nowplaying data:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
