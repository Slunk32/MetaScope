export type ArchetypeRule = {
    name: string;
    format: string; // e.g. "Standard", "Modern", "Legacy", "Pioneer"
    mustContain: string[]; // Deck MUST have ALL of these cards
    oneOf?: string[];      // Deck MUST have at least ONE of these cards
    exclude?: string[];    // Deck MUST NOT have any of these cards
};

const STANDARD_RULES: ArchetypeRule[] = [
    // --- 3-Color / Specific Decks ---
    {
        name: "Jeskai Control",
        format: "Standard",
        mustContain: ["Day of Judgment", "Jeskai Revelation", "No More Lies", "Lightning Helix"]
    },
    {
        name: "Jeskai Control",
        format: "Standard",
        mustContain: ["Day of Judgment", "No More Lies", "Lightning Helix"]
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
        mustContain: ["Awaken the Honored Dead", "Bloom Tender", "Ardyn, the Usurper"],
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
        mustContain: ["Kaito, Bane of Nightmares", "Watery Grave", "Cecil, Dark Knight"]
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
        name: "Mono-Green Landfall",
        format: "Standard",
        mustContain: ["Mightform Harmonizer", "Earthbender Ascension", "Bristly Bill, Spine Sower", "Ba Sing Se", "Sapling Nursery"]
    },
    {
        name: "Selesnya Landfall",
        format: "Standard",
        mustContain: ["Earthbender Ascension", "Sazh's Chocobo", "Bristly Bill, Spine Sower", "Rest in Peace", "Escape Tunnel"]
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
    },
    {
        name: "Selesnya Landfall",
        format: "Standard",
        mustContain: ["Nature's Rhythm", "Enduring Innocence", "Clarion Conqueror", "Hushwood Verge"]
    },
    {
        name: "Boros Control",
        format: "Standard",
        mustContain: ["Elspeth: Storm Slayer", "Chandra, Spark Hunter", "Lightning Helix", "Day of Judgment"]
    },
    {
        name: "Temur Elementals",
        format: "Standard",
        mustContain: ["Vibrance", "Deceit", "Ashling's Command", "Wistfulness", "Roaming Throne"]
    },
    {
        name: "Sultai Reanimator",
        format: "Standard",
        mustContain: ["Deceit", "Wistfulness"],
        oneOf: ["Superior Spider-Man", "Kavaero, Mind-Bitten", "Overlord of the Balemurk", "Awaken the Honored Dead"]
    }
];

const MODERN_RULES: ArchetypeRule[] = [
    {
        name: "Boros Energy",
        format: "Modern",
        mustContain: ["Phlage, Titan of Fire's Fury", "Goblin Bombardment", "Ajani, Nacatl Pariah", "Ocelot Pride"]
    },
    {
        name: "Ruby Storm",
        format: "Modern",
        mustContain: ["Ral, Monsoon Mage", "Ruby Medallion", "Past in Flames"]
    },
    {
        name: "Eldrazi Tron",
        format: "Modern",
        mustContain: ["Devourer of Destiny", "Urza's Mine", "Urza's Power Plant", "Urza's Tower", "Expedition Map", "Karn, the Great Creator", "Ugin, Eye of the Storms"]
    },
    {
        name: "Izzet Affinity",
        format: "Modern",
        mustContain: ["Weapons Manufacturing", "Pinnacle Emissary", "Kappa Cannoneer"]
    },
    {
        name: "Jeskai Blink",
        format: "Modern",
        mustContain: ["Quantum Riddler", "Solitude", "Ephemerate", "Phlage, Titan of Fire's Fury", "Phelia, Exuberant Shepherd"]
    },
    {
        name: "Domain Zoo",
        format: "Modern",
        mustContain: ["Territorial Kavu", "Leyline of the Guildpact", "Tribal Flames"]
    },
    {
        name: "Amulet Titan",
        format: "Modern",
        mustContain: ["Primeval Titan", "Amulet of Vigor", "Summoner's Pact", "Arboreal Grazer"]
    },
    {
        name: "Neobrand",
        format: "Modern",
        mustContain: ["Neoform", "Eldritch Evolution"]
    },
    {
        name: "Goryo's Vengeance",
        format: "Modern",
        mustContain: ["Atraxa, Grand Unifier", "Goryo's Vengeance", "Psychic Frog"]
    },
    {
        name: "Belcher",
        format: "Modern",
        mustContain: ["Goblin Charbelcher", "Disrupting Shoal", "Suppression Ray"]
    },
    {
        name: "Yawgmoth",
        format: "Modern",
        mustContain: ["Yawgmoth, Thran Physician", "Young Wolf", "Green Sun's Zenith"]
    },
    {
        name: "Living End",
        format: "Modern",
        mustContain: ["Living End"]
    },
    {
        name: "Gruul Eldrazi",
        format: "Modern",
        mustContain: ["Talisman of Impulse", "Emrakul, the Promised End", "Sowing Mycospawn", "Kozilek's Return"]
    },
    {
        name: "Dimir Midrange",
        format: "Modern",
        mustContain: ["Orcish Bowmasters", "Wan Shi Tong, Librarian", "Subtlety", "Fatal Push"]
    },
    {
        name: "Grixis Reanimator",
        format: "Modern",
        mustContain: ["Gran-Gran", "Persist", "Archon of Cruelty", "Abhorrent Oculus"]
    },
    {
        name: "Basking Broodscale Combo",
        format: "Modern",
        mustContain: ["Blade of the Bloodchief", "Basking Broodscale"]
    },
    {
        name: "Temur Prowess",
        format: "Modern",
        mustContain: ["Monastery Swiftspear", "Mutagenic Growth", "Lightning Bolt", "Slickshot Show-Off", "Cori-Steel Cutter"]
    },
    {
        name: "Rakdos Discard",
        format: "Modern",
        mustContain: ["Nethergoyf", "Faithless Looting", "Hollow One", "Burning Inquiry"]
    },
    {
        name: "Izzet Steel-Cutter",
        format: "Modern",
        mustContain: ["Cori-Steel Cutter", "Flame of Anor", "Tamiyo, Inquisitive Student", "Urza's Saga"]
    },
    {
        name: "Through the Breach",
        format: "Modern",
        mustContain: ["Through the Breach"]
    },
    {
        name: "Simic Midrange",
        format: "Modern",
        mustContain: ["Birthing Ritual", "Shardless Agent", "Flare of Denial", "Ice-Fang Coatl"]
    },
    {
        name: "Sultai Midrange",
        format: "Modern",
        mustContain: ["Birthing Ritual", "Shardless Agent", "Flare of Denial", "Ice-Fang Coatl", "Culling Ritual"]
    },
    {
        name: "Song of Creation",
        format: "Modern",
        mustContain: ["Song of Creation"]
    },
    {
        name: "Jeskai Control",
        format: "Modern",
        mustContain: ["Teferi, Time Raveler", "Solitude", "Counterspell", "Galvanic Discharge"]
    },
    // --- New Additions ---
    {
        name: "Mill",
        format: "Modern",
        mustContain: ["Hedron Crab", "Ruin Crab", "Archive Trap"]
    },
    {
        name: "Hardened Scales",
        format: "Modern",
        mustContain: ["Hardened Scales"]
    },
    {
        name: "Esper Blink",
        format: "Modern",
        mustContain: ["Ephemerate", "Overlord of the Balemurk", "Quantum Riddler"]
    },
    {
        name: "Mono-Black Midrange",
        format: "Modern",
        mustContain: ["Ifnir Deadlands", "Thoughtseize", "Urza's Saga", "Urborg, Tomb of Yawgmoth"]
    },
    {
        name: "Hammer Time",
        format: "Modern",
        mustContain: ["Sigarda's Aid", "Colossus Hammer"]
    },
    {
        name: "4c Omnath",
        format: "Modern",
        mustContain: ["Wrenn and Six", "Omnath, Locus of Creation", "Phlage, Titan of Fire's Fury", "Leyline Binding"]
    },
    {
        name: "Merfolk",
        format: "Modern",
        mustContain: ["Cavern of Souls", "Aether Vial", "Master of the Pearl Trident"]
    },
    {
        name: "Dimir Midrange",
        format: "Modern",
        mustContain: ["Tamiyo, Inquisitive Student", "Quantum Riddler", "Psychic Frog", "Counterspell", "Thoughtseize"]
    }
];

export const RULES: ArchetypeRule[] = [
    ...STANDARD_RULES,
    ...MODERN_RULES
];
