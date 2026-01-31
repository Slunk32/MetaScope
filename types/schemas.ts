import { z } from 'zod';

// Safe Date Validator
// Accepts "2026-01-30" or "2026-01-301283" (strips suffix) -> Returns valid ISO Date or fallback
const SafeDateSchema = z.string().transform((val) => {
    try {
        if (!val) return '';
        const clean = val.match(/^\d{4}-\d{2}-\d{2}/);
        const target = clean ? clean[0] : val;
        const d = new Date(target);
        return isNaN(d.getTime()) ? '' : target; // Normalized to YYYY-MM-DD
    } catch {
        return '';
    }
});

export const CardSchema = z.object({
    name: z.string(),
    quantity: z.number().optional().default(1),
    group: z.string().optional()
});

export const DeckSchema = z.object({
    id: z.string().or(z.number()).transform(v => String(v)), // Handle potential number IDs
    player: z.string().default('Unknown'),
    result: z.string().default(''),
    anchorUri: z.string().optional(),
    mainboard: z.array(CardSchema).default([]),
    sideboard: z.array(CardSchema).default([]),
    archetype: z.string().optional().default('Unknown')
});

export const EventSchema = z.object({
    id: z.string(),
    name: z.string().default('Unknown Event'),
    date: SafeDateSchema,
    format: z.string().default('Unknown'),
    type: z.string().default('Event'),
    decks: z.array(DeckSchema).default([])
});

export type SafeEvent = z.infer<typeof EventSchema>;
export type SafeDeck = z.infer<typeof DeckSchema>;
