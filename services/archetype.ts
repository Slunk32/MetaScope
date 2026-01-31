import { Deck } from '@/types';
import { RULES } from './archetype-rules';

export const ArchetypeService = {
    classify(deck: Deck, format: string): string {
        // Create a Set of all card names (main + side) for O(1) lookup
        const deckCards = new Set<string>();
        deck.mainboard.forEach(c => deckCards.add(c.name));
        deck.sideboard.forEach(c => deckCards.add(c.name));

        // Filter rules by format (case-insensitive)
        const formatRules = RULES.filter(r => r.format.toLowerCase() === format.toLowerCase());

        for (const rule of formatRules) {
            // 1. Check Exclusion (Fail fast)
            if (rule.exclude && rule.exclude.some(card => deckCards.has(card))) {
                continue;
            }

            // 2. Check "Must Contain" (All required)
            // We use a looser check: does the deck contain this card name, 
            // OR does the deck contain a split card starting with this name?
            const hasAllRequired = rule.mustContain.every(reqCard => {
                if (deckCards.has(reqCard)) return true;
                // Double check for split cards (e.g. rule "Fire" matches deck "Fire // Ice")
                for (const deckCard of deckCards) {
                    if (deckCard.startsWith(reqCard + ' //')) return true;
                }
                return false;
            });

            if (!hasAllRequired) {
                continue;
            }

            // 3. Check "One Of" (At least one required, if defined)
            if (rule.oneOf && rule.oneOf.length > 0) {
                const hasOneOf = rule.oneOf.some(reqCard => {
                    if (deckCards.has(reqCard)) return true;
                    for (const deckCard of deckCards) {
                        if (deckCard.startsWith(reqCard + ' //')) return true;
                    }
                    return false;
                });

                if (!hasOneOf) {
                    continue;
                }
            }

            // Match found!
            return rule.name;
        }

        return 'Unknown';
    }
};
