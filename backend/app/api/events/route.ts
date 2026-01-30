import { NextResponse } from 'next/server';

// Reusing types for consistency, though we might want to share types via a package later
export interface Event {
    id: string;
    name: string;
    date: string;
    format: string;
    type: string;
    decks: any[];
}

const BASE_URL = 'https://www.mtgo.com';

export async function GET() {
    try {
        console.log('Fetching latest events from MTGO (Server-Side)...');
        const response = await fetch(`${BASE_URL}/decklists`, {
            next: { revalidate: 3600 } // Cache for 1 hour (Vercel Data Cache)
        });

        if (!response.ok) {
            throw new Error(`MTGO responded with ${response.status}`);
        }

        const html = await response.text();
        const events: Event[] = [];

        // Regex parsing (Ported from Mobile App)
        const linkRegex = /<a[^>]*href="([^"]*\/decklist\/[^"]*)"[^>]*>([\s\S]*?)<\/a>/gi;

        let match;
        while ((match = linkRegex.exec(html)) !== null) {
            const href = match[1];
            const innerHtml = match[2];

            const titleMatch = /<h3[^>]*>(.*?)<\/h3>/i.exec(innerHtml);
            const title = titleMatch ? titleMatch[1].trim() : innerHtml.replace(/<[^>]+>/g, '').trim();

            const dateMatch = /<time[^>]+datetime="([^"]+)"/.exec(innerHtml);
            const date = dateMatch ? dateMatch[1] : new Date().toISOString();

            if (href && title) {
                const id = href.split('/').pop() || '';
                if (!id) continue;

                const format = title.split(' ')[0] || 'Unknown';
                const type = title.includes('Challenge') ? 'Challenge'
                    : title.includes('League') ? 'League'
                        : title.includes('Showcase') ? 'Showcase'
                            : 'Tournament';

                events.push({
                    id,
                    name: title,
                    date,
                    format,
                    type,
                    decks: [],
                });
            }
        }

        return NextResponse.json(events, {
            headers: {
                'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400',
            }
        });

    } catch (error) {
        console.error('API Error:', error);
        return NextResponse.json({ error: 'Failed to fetch events' }, { status: 500 });
    }
}
