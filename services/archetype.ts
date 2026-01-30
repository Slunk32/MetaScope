import rulesData from '@/assets/archetypes.json';
import { Deck } from '@/types';

type Rule = {
    name: string;
    required?: string[];
    exclude?: string[];
};

type Rules = Record<string, Rule[]>;

const RULES: Rules = rulesData as Rules;

export const ArchetypeService = {
    classify(deck: Deck, format: string): string {
        const formatRules = RULES[format] || RULES['Modern']; // Default to Modern if unknown or use loop

        if (!formatRules) return 'Unknown';

        // Simplified classification: check if deck contains ALL required cards for a rule
        // We prioritize rules in order of definition (could add scoring later)

        // Create a set of card names for O(1) lookup
        const deckCards = new Set([
            ...deck.mainboard.map(c => c.name),
            ...deck.sideboard.map(c => c.name) // Some key cards might be in sideboard? Usually main.
        ]);

        for (const rule of formatRules) {
            if (rule.required) {
                const hasAll = rule.required.every(card => deckCards.has(card));
                if (hasAll) {
                    // Optional: Check exclusions
                    if (rule.exclude && rule.exclude.some(card => deckCards.has(card))) {
                        continue;
                    }
                    return rule.name;
                }
            }
        }

        return 'Other';
    }
};
