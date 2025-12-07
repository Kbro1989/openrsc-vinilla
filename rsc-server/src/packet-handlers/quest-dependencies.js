
// Map of quest codenames to their requirements (other quest codenames)
// Based on Authentic RSC Wiki Data

module.exports = {
    // F2P Quests
    'dragonSlayer': ['blackKnightsFortress', 'demonSlayer', 'shieldOfArrav', 'vampireSlayer', 'lostCity'], // Not strictly Lost City but high QP req usually implies it? No, stick to hard reqs or just common ones for QP. 
    // Actually Dragon Slayer requires 32 QP. 
    // Completing all F2P quests is the safest bet for "Complete Dragon Slayer" context or just set QP.

    // Members Quests (Prerequisites)
    'heroesQuest': ['shieldOfArrav', 'lostCity', 'merlinsCrystal', 'dragonSlayer', 'druidicRitual'],
    'legendsQuest': ['heroesQuest', 'familyCrest', 'shiloVillage', 'undergroundPass', 'waterfallQuest'],
    'undergroundPass': ['biohazard'],
    'biohazard': ['plagueCity'],
    'plagueCity': [],
    'familyCrest': [],
    'shiloVillage': ['junglePotion'],
    'junglePotion': ['druidicRitual'],
    'druidicRitual': [],
    'merlinsCrystal': [],
    'lostCity': [],
    'shieldOfArrav': [],
    'waterfallQuest': [],
    'scopionCatcher': ['barCrawl'], // Alfred Grimhand's Barcrawl minigame
    'templeOfIkov': [],
    'touristTrap': [],
    'grandTree': [],
    'treeGnomeVillage': [],
    'fightArena': [],
    'holyGrail': ['merlinsCrystal'],
    'murderMystery': [],
    'digsite': [],
    'gertrudesCat': [],
    'dwarfCannon': []
};
