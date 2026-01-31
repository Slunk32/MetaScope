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
        mustContain: ["Bringer of the Last Gift", "Overlord of the Balemurk", "Formidable Speaker", "Ardyn, the Usurper"],
        // MTGO sometimes uses "Kavaero, Mind-Bitten" instead of Universe Beyond names?
        oneOf: ["Superior Spider-Man", "Kavaero, Mind-Bitten"]
    },
    {
        name: "Sultai Reanimator",
        format: "Standard",
        mustContain: ["Bringer of the Last Gift", "Awaken the Honored Dead", "Formidable Speaker", "Ardyn, the Usurper"],
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
        name: "Boros Aggro",
        format: "Standard",
        mustContain: ["Inspiring Vantage", "Boros Charm", "Nova Hellkite"]
    },
    {
        name: "Boros Aggro",
        format: "Standard",
        mustContain: ["Burst Lightning", "Shock", "Nova Hellkite", "Boros Charm"]
    },
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
        name: "Izzet Lessons",
        format: "Standard",
        mustContain: ["Gran-Gran", "Cori-Steel Cuter", "Stormchaser's Talent", "Divide by Zero"]
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
    },

    // --- New Additions ---
    {
        name: "Boros Aggro",
        format: "Standard",
        mustContain: ["Hexing Squelcher", "Inspiring Vantage", "Catharsis", "Warleader's Call"]
    },
    {
        name: "Azorius Tempo",
        format: "Standard",
        mustContain: ["Aven Interrupter", "Voice of Victory", "Aang, Swift Savior"]
    },
    {
        name: "Azorius Midrange",
        format: "Standard",
        mustContain: ["Aven Interrupter", "Empyrean Eagle", "Air Nomad Legacy", "Sunpearl Kirin"]
    },
    {
        name: "Dimir Midrange",
        format: "Standard",
        mustContain: ["Kaito, Bane of Nightmares", "Watery Grave", "Deep-Cavern Bat", "Tishana's Tidebinder", "Cecil, Dark Knight"]
    },
    {
        name: "Esper Self-Bounce",
        format: "Standard",
        mustContain: ["Nurturing Pixie", "Sunpearl Kirin", "Godless Shrine", "Hallowed Fountain", "Grim Bauble"]
    },
    {
        name: "Mono-Red Aggro",
        format: "Standard",
        mustContain: ["Rockface Village", "Burst Lightning", "Razorkin Needlehead", "Soulstone Sanctuary"]
    },
    {
        name: "Mono-Red Aggro",
        format: "Standard",
        mustContain: ["Burst Lightning", "Lightning Strike", "Hired Claw", "Razorkin Needlehead", "Fanatical Firebrand"]
    },
    {
        name: "Mono-Red Aggro",
        format: "Standard",
        mustContain: ["Rockface Village", "Burnout Bashtronaut", "Burst Lightning", "Razorkin Needlehead", "Howlsquad Heavy"]
    },
    {
        name: "Omniscience",
        format: "Standard",
        mustContain: ["Omniscience", "Marang River Regent", "Roiling Dragonstorm"]
    },
    {
        name: "Selesnya Landfall",
        format: "Standard",
        mustContain: ["Earthbender Ascension", "Icetill Explorer", "Sazh's Chocobo", "Bristly Bill, Spine Sower", "Escape Tunnel"]
    },
    {
        name: "Grixis Reanimator",
        format: "Standard",
        mustContain: ["Overlord of the Balemurk", "Deceit", "Ill-Timed Explosion", "Watery Grave", "Steam Vents"]
    },
    {
        name: "Golgari Midrange",
        format: "Standard",
        mustContain: ["Unholy Annex // Ritual Chamber", "Sentinel of the Nameless City", "Overgrown Tomb", "Badgermole Cub", "Deep-Cavern Bat"]
    },
    {
        name: "Allies",
        format: "Standard",
        mustContain: ["Cavern of Souls", "Jasmine Dragon Tea Shop", "South Pole Voyager", "Great Divide Guide"]
    },
    {
        name: "Rakdos Goblins",
        format: "Standard",
        mustContain: ["Blood Crypt", "Cavern of Souls", "Krenko, Mob Boss", "Boggart Cursecrafter"]
    }
];
