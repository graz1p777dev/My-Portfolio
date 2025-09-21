import { NextResponse } from 'next/server';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const u = searchParams.get('u');
    if (!u) {
      return NextResponse.json({ error: 'Missing u' }, { status: 400 });
    }
    // Ходим на публичный Codewars API
    const r = await fetch(`https://www.codewars.com/api/v1/users/${encodeURIComponent(u)}`, {
      // без кэша — чтобы сразу видеть апдейты; можно поставить 'force-cache' и revalidate заголовки
      cache: 'no-store',
      headers: { Accept: 'application/json' },
    });
    if (!r.ok) {
      return NextResponse.json({ error: `Codewars ${r.status}` }, { status: r.status });
    }
    const data = await r.json();

    // Можно чуть подсобрать полезные поля
    return NextResponse.json(
      {
        username: data.username,
        name: data.name,
        honor: data.honor,
        clan: data.clan,
        leaderboardPosition: data.leaderboardPosition,
        ranks: data.ranks,
        codeChallenges: data.codeChallenges, // {totalAuthored, totalCompleted}
      },
      {
        // мягкий CDN-кэш 5 минут (если нужно)
        // headers: { 'Cache-Control': 's-maxage=300, stale-while-revalidate=600' }
      }
    );
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
