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

        // Fire and forget save to DB
        // We don't await this because we don't want to slow down the user response
        saveToSupabase(events);

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

// Helper to save to Supabase (Fire and Forget)
async function saveToSupabase(events: Event[]) {
    try {
        const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
        const key = process.env.SUPABASE_SERVICE_KEY; // Use Secret Key for writing

        if (!url || !key) {
            console.warn('Supabase credentials missing. Skipping save.');
            return;
        }

        const { createClient } = await import('@supabase/supabase-js');
        const supabase = createClient(url, key);

        const { error } = await supabase
            .from('events')
            .upsert(
                events.map(e => ({
                    id: e.id,
                    name: e.name,
                    date: e.date,
                    format: e.format,
                    type: e.type,
                    raw_data: e
                })),
                { onConflict: 'id' }
            );

        if (error) console.error('Supabase Upsert Error:', error);
        else console.log(`Saved ${events.length} events to Supabase.`);

    } catch (err) {
        console.error('Supabase Save Exception:', err);
    }
}
