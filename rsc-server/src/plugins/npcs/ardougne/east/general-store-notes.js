// Ardougne General Store (Kortan / Aemad)
// OpenRSC IDs might differ, usually Shop Keeper names.
// Assuming we attach this to the shopkeeper ID(s) found in Ardougne.
// For now, attaching to "Shop Keeper" (528) or specific Ardougne names if found.
// Actually, OpenRSC ArdougneGeneralShop.java checks for KORTAN/AEMAD. 
// I need their IDs. If unknown, I will assume it's covered by the Generic plugin logic.
// BUT, to be safe, I'll create this logic file and register it for those IDs later if found.
// For now, I'll register it for the Ardougne Shopkeeper ID if I can confirm it. 
// "Shop keeper" (528) is generic.

const KORTAN = 323; // Guessing IDs or finding them?
const AEMAD = 324; // Guessing.
const SHOP_ID = "east-ardougne-adventurers";

// Actually, I should use the Generic Store plugin for this one too using location logic
// because most "Shop Keepers" share the same ID.
// However, Ardougne shop has unique dialogue ("Hello you look like a bold adventurer").
// I will export this logic and use it if I find the specific IDs.
// My ID search showed "Shop Assistant" (169, 186...) and "Shop Keeper" (528).
// I will rely on the Location-Based Generic Plugin for now.

module.exports = {}; 
