import { createClient } from '@supabase/supabase-js';
import type { NextApiRequest, NextApiResponse } from 'next';

// Fallback types
export interface Event {
    id: string;
    name: string;
    date: string;
    format: string;
    type: string;
    decks: any[];
}

const BASE_URL = 'https://www.mtgo.com';

// Helper to save to Supabase
async function saveToSupabase(events: Event[]) {
    try {
        const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
        const key = process.env.SUPABASE_SERVICE_KEY;

        if (!url || !key) {
            console.warn('Supabase credentials missing. Skipping save.');
            return;
        }

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

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    try {
        console.log('Fetching latest events from MTGO (Pages Router)...');

        // Fetch from MTGO
        const response = await fetch(`${BASE_URL}/decklists`);
        if (!response.ok) {
            throw new Error(`MTGO responded with ${response.status}`);
        }

        const html = await response.text();
        const events: Event[] = [];

        // Regex parsing
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

        // Save to DB (Fire & Forget not idiomatic in serverless functions without wait, but we'll await it slightly or let it float)
        // In Serverless, we MUST await before response closes usually, or it freezes.
        await saveToSupabase(events);

        // Vercel Caching
        res.setHeader('Cache-Control', 'public, s-maxage=3600, stale-while-revalidate=86400');
        res.status(200).json(events);

    } catch (error) {
        console.error('API Error:', error);
        res.status(500).json({ error: 'Failed to fetch events' });
    }
}
