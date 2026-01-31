export type ArchetypeRule = {
    name: string;
    format: string; // e.g. "Standard", "Modern", "Legacy", "Pioneer"
    mustContain: string[]; // Deck MUST have ALL of these cards
    oneOf?: string[];      // Deck MUST have at least ONE of these cards
    exclude?: string[];    // Deck MUST NOT have any of these cards
};

export const RULES: ArchetypeRule[] = [
    // --- 3-Color / Specific Decks ---
    {
        name: "Jeskai Control",
        format: "Standard",
        mustContain: ["Day of Judgment", "Jeskai Revelation", "No More Lies", "Steam Vents", "Hallowed Fountain"]
    },
    {
        name: "Jeskai Elementals",
        format: "Standard",
        mustContain: ["Deceit", "Beza, the Bounding Spring", "Cavern of Souls"],
        oneOf: ["Ashling, Rekindled", "Ashling, Rekindled // Ashling, Rimebound"] // Handling split card variations
    },
    {
        name: "Grixis Elementals",
        format: "Standard",
        mustContain: ["Deceit", "Not Dead After All", "Watery Grave", "Cavern of Souls", "Sunderflock"]
    },
    {
        name: "Sultai Reanimator",
        format: "Standard",
        mustContain: ["Bringer of the Last Gift", "Overlord of the Balemurk", "Formidable Speaker"],
        // MTGO sometimes uses "Kavaero, Mind-Bitten" instead of Universe Beyond names?
        oneOf: ["Superior Spider-Man", "Kavaero, Mind-Bitten"]
    },
    {
        name: "Five-Color Rhythm",
        format: "Standard",
        mustContain: ["Nature's Rhythm", "Temple Garden", "Shimmerwilds Growth"]
    },
    {
        name: "Bant Airbending",
        format: "Standard",
        mustContain: ["Airbender Ascension", "Aang, Swift Savior", "Appa, Steadfast Guardian"]
    },
    {
        name: "Temur Harmonizer",
        format: "Standard",
        mustContain: ["Earthbender Ascension", "Mightform Harmonizer"]
    },

    // --- 2-Color / Focused Decks ---
    {
        name: "Boros Dragons",
        format: "Standard",
        mustContain: ["Sacred Foundry", "Sarkhan, Dragon Ascendant", "Nova Hellkite"]
    },
    {
        name: "Dimir Excruciator",
        format: "Standard",
        mustContain: ["Superior Spider-Man", "Watery Grave", "Doomsday Excruciator"]
    },
    {
        name: "Dimir Control",
        format: "Standard",
        mustContain: ["Deadly Cover-Up", "Watery Grave", "Essence Scatter", "Stock Up"]
    },
    {
        name: "Azorius Control",
        format: "Standard",
        mustContain: ["Day of Judgment", "Hallowed Fountain", "No More Lies"]
    },
    {
        name: "Izzet Spellementals",
        format: "Standard",
        mustContain: ["Steam Vents", "Eddymurk Crab"],
        oneOf: ["Hearth Elemental", "Hearth Elemental // Stoke Genius"]
    },
    {
        name: "Izzet Lessons",
        format: "Standard",
        mustContain: ["Gran-Gran", "Monument to Endurance", "Combustion Technique"]
    },
    {
        name: "Gruul Landfall",
        format: "Standard",
        mustContain: ["Stomping Ground", "Escape Tunnel", "Icetill Explorer", "Llanowar Elves"]
    },
    {
        name: "Simic Rhythm",
        format: "Standard",
        mustContain: ["Badgermole Cub", "Nature's Rhythm", "Ouroboroid", "Breeding Pool"]
    },

    // --- Mono Color ---
    {
        name: "Mono-Red Leyline Aggro",
        format: "Standard",
        mustContain: ["Leyline of Resonance", "Fire Nation Palace", "Hired Claw"]
    }
];
