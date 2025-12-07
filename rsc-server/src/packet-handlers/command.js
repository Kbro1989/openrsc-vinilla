// :: commands

const NPC = require('../model/npc');
const items = require('@2003scape/rsc-data/config/items');
const quests = require('@2003scape/rsc-data/quests');
const regions = require('@2003scape/rsc-data/regions');
const { levelToExperience } = require('../skills');
const { handleClanCommand, handleClanChat } = require('../clan-system');
const { handleBankPinCommand } = require('../bank-pin');
const { handlePartyCommand, handlePartyChat } = require('../party-system');
const { handleBarCrawlCommand } = require('../plugins/minigames/bar-crawl');
const { handleMageArenaCommand } = require('../plugins/minigames/mage-arena');

async function command({ player }, { command, args }) {
    /*if (!player.isAdministrator()) {
        return;
    }*/

    const { world } = player;

    // Handle clan commands
    if (command === 'clan') {
        handleClanCommand(player, command, args);
        return;
    }
    if (command === 'c' || command === 'clanchat') {
        handleClanChat(player, args);
        return;
    }
    if (command === 'bankpin') {
        handleBankPinCommand(player, command, args);
        return;
    }
    if (command === 'party') {
        handlePartyCommand(player, command, args);
        return;
    }
    if (command === 'p' || command === 'partychat') {
        handlePartyChat(player, args);
        return;
    }
    if (command === 'barcrawl') {
        handleBarCrawlCommand(player, args);
        return;
    }
    if (command === 'magearena') {
        handleMageArenaCommand(player, args);
        return;
    }

    switch (command) {
        case 'setqp':
            if (!args[0] || Number.isNaN(+args[0])) {
                player.message('invalid argument');
                break;
            }

            player.questPoints = +args[0];
            break;
        case 'kick': {
            if (!args[0]) {
                player.message('invalid player');
                break;
            }

            const playerKicked = world.getPlayerByUsername(args[0]);

            if (!playerKicked) {
                player.message('no such player: ' + args[0]);
                break;
            }

            await playerKicked.logout();
            player.message('kicked player: ' + args[0]);
            break;
        }
        case 'appearance':
            player.sendAppearance();
            break;
        case 'step': {
            const deltaX = +args[0];
            const deltaY = +args[1];

            player.message(player.canWalk(deltaX, deltaY).toString());
            player.walkTo(deltaX, deltaY);
            break;
        }
        case 'npc': {
            const npc = new NPC(world, {
                id: +args[0],
                x: player.x,
                y: player.y,
                minX: player.x - 4,
                maxX: player.x + 4,
                minY: player.y - 4,
                maxY: player.y + 4
            });

            delete npc.respawn;

            world.addEntity('npcs', npc);
            break;
        }
        case 'face':
            player.faceDirection(+args[0], +args[1]);
            break;
        case 'item':
            player.inventory.add(+args[0], +args[1] || 1);
            break;
        case 'sound':
            player.sendSound(args[0]);
            break;
        case 'bubble':
            player.sendBubble(+args[0]);
            break;
        case 'addexp':
            player.addExperience(args[0], +args[1] * 4, false);
            break;
        case 'clearentities':
            player.localEntities.clear();
            break;
        case 'coords':
            player.message(
                `${player.x}, ${player.y}, facing=${player.direction}`
            );
            break;
        case 'teleport':
            if (Number.isNaN(+args[0])) {
                const { spawnX, spawnY } = regions[args[0]];

                if (spawnX && spawnY) {
                    player.teleport(spawnX, spawnY, true);
                }

                break;
            }

            player.teleport(+args[0], +args[1], true);
            break;
        case 'ask': {
            const choice = await player.ask(
                ['hey?', 'sup?', 'more', 'test', 'again'],
                true
            );

            player.message('you chose ', choice);
            break;
        }
        case 'say':
            await player.say(...args);
            break;
        case 'dmg':
            player.damage(+args[0]);
            break;
        case 'shop':
            player.openShop(args[0]);
            break;
        case 'give': {
            const other = world.getPlayerByUsername(args[0]);

            if (other) {
                other.inventory.add(+args[1], +args[2] || 1);
                other.message(`${player.username} gave you an item`);
                player.message(`gave ${args[0]} item ${args[1]}`);
            } else {
                player.message(`unable to find player ${args[0]}`);
            }
            break;
        }
        case 'bank':
            player.bank.open();
            break;
        case 'fatigue':
            player.fatigue = 75000;
            player.sendFatigue();
            break;
        case 'chaseobj':
            await player.chase(world.gameObjects.getByID(+args[0]), false);
            break;
        case 'gotoentity': {
            const entities = world[args[0]];
            const entity = entities.getByID(+args[1]);

            if (entity) {
                player.teleport(entity.x, entity.y, true);
            }

            break;
        }
        case 'setquest': {
            let questID;

            if (Number.isNaN(+args[0])) {
                questID = quests
                    .map((name) => name.toLowerCase())
                    .indexOf(args[0].toLowerCase());
            } else {
                questID = +args[0];
            }

            if (questID > -1) {
                player.questStages[quests[questID]] = +args[1];
            }

            break;
        }
        case 'setcache':
            player.cache[args[0]] = JSON.parse(args[1]);
            break;
        case 'droprandom': {
            for (let i = 0; i < +args[0]; i += 1) {
                const randomID = Math.floor(Math.random() * 1290);
                const item = items[randomID];

                if (item.members) {
                    continue;
                }

                if (item.stackable) {
                    world.addPlayerDrop(player, {
                        id: randomID,
                        amount: Math.floor(Math.random() * 10000)
                    });
                } else {
                    world.addPlayerDrop(player, { id: randomID });
                }
            }
            break;
        }
        case 'goto': {
            const otherPlayer = world.getPlayerByUsername(args[0]);
            player.teleport(otherPlayer.x, otherPlayer.y);
            break;
        }
        case 'clearinventory': {
            player.inventory.items = [];
            player.inventory.sendAll();
            break;
        }
        case 'npcchase': {
            const npc = Array.from(player.localEntities.known.npcs).find(
                (npc) => {
                    return npc.id === +args[0];
                }
            );

            if (npc) {
                await npc.attack(player);
            }

            break;
        }
        case 'npccoords':
            player.message(world.npcs.getAtPoint(+args[0], +args[1]).length);
            break;
        // === NEW COMMANDS ===
        case 'online': {
            const playerCount = world.players.size;
            player.message(`Players online: ${playerCount}`);
            break;
        }
        case 'summon': {
            if (!args[0]) {
                player.message('Usage: ::summon <username>');
                break;
            }
            const targetPlayer = world.getPlayerByUsername(args[0]);
            if (targetPlayer) {
                targetPlayer.teleport(player.x, player.y, true);
                player.message(`Summoned ${args[0]} to your location`);
                targetPlayer.message(`You have been summoned by ${player.username}`);
            } else {
                player.message(`Player not found: ${args[0]}`);
            }
            break;
        }
        case 'set': {
            if (!args[0] || !args[1]) {
                player.message('Usage: ::set <skill> <level>');
                break;
            }
            const skillNames = ['attack', 'defense', 'strength', 'hits', 'ranged',
                'prayer', 'magic', 'cooking', 'woodcutting', 'fletching',
                'fishing', 'firemaking', 'crafting', 'smithing', 'mining',
                'herblaw', 'agility', 'thieving'];
            const skillIndex = skillNames.indexOf(args[0].toLowerCase());
            if (skillIndex === -1) {
                player.message(`Unknown skill: ${args[0]}`);
                break;
            }
            const level = Math.min(99, Math.max(1, +args[1]));
            const skillName = Object.keys(player.skills)[skillIndex];
            player.skills[skillName].current = level;
            player.skills[skillName].base = level;
            player.skills[skillName].experience = levelToExperience(level);
            player.sendStats();
            player.message(`Set ${args[0]} to level ${level}`);
            break;
        }
        case 'commands':
        case 'help': {
            try {
                const mainChoice = await player.ask([
                    'Spawn Items >>',
                    '::coords - Show location',
                    '::teleport <x> <y>',
                    '::set <skill> <lvl>',
                    '::heal - Restore HP',
                    '::save - Save char',
                    '[Close]'
                ]);

                if (mainChoice === 0) {
                    const catChoice = await player.ask([
                        'Consumables >>',
                        'Armour >>',
                        'Weapons >>',
                        'Rares >>',
                        'Resources >>',
                        '[Back]'
                    ]);

                    let itemsToShow = [];

                    if (catChoice === 0) {
                        const consumeChoice = await player.ask(['Food >>', 'Potions >>', 'Drinks >>', '[Back]']);
                        if (consumeChoice === 0) {
                            itemsToShow = [
                                { id: 546, name: 'Lobster' }, { id: 373, name: 'Swordfish' },
                                { id: 370, name: 'Shark' }, { id: 325, name: 'Meat Pizza' }
                            ];
                        } else if (consumeChoice === 1) {
                            itemsToShow = [
                                { id: 221, name: 'Str Pot (4)' }, { id: 474, name: 'Atk Pot (3)' },
                                { id: 480, name: 'Def Pot (3)' }, { id: 486, name: 'Super Atk (3)' },
                                { id: 483, name: 'Prayer Pot (3)' }
                            ];
                        } else if (consumeChoice === 2) {
                            itemsToShow = [
                                { id: 142, name: 'Beer' }, { id: 193, name: 'Wine' },
                                { id: 830, name: 'Grog' }, { id: 739, name: 'Dragon Bitter' }
                            ];
                        }
                    } else if (catChoice === 1) {
                        const armorChoice = await player.ask(['Helmets >>', 'Bodies >>', 'Legs >>', 'Shields >>', '[Back]']);
                        if (armorChoice === 0) {
                            itemsToShow = [
                                { id: 112, name: 'Bronze Med' }, { id: 104, name: 'Steel Med' },
                                { id: 116, name: 'Addy Med' }, { id: 120, name: 'Rune Med' },
                                { id: 795, name: 'Dragon Med' }
                            ];
                        } else if (armorChoice === 1) {
                            itemsToShow = [
                                { id: 8, name: 'Bronze Plate' }, { id: 86, name: 'Steel Plate' },
                                { id: 84, name: 'Addy Plate' }, { id: 401, name: 'Rune Plate' },
                                { id: 1278, name: 'Dragon Plate' }
                            ];
                        } else if (armorChoice === 2) {
                            itemsToShow = [
                                { id: 206, name: 'Bronze Legs' }, { id: 121, name: 'Steel Legs' },
                                { id: 125, name: 'Addy Legs' }, { id: 402, name: 'Rune Legs' },
                                { id: 1279, name: 'Dragon Legs' }
                            ];
                        } else if (armorChoice === 3) {
                            itemsToShow = [
                                { id: 4, name: 'Wooden Shield' }, { id: 48, name: 'Steel Kite' },
                                { id: 56, name: 'Addy Kite' }, { id: 403, name: 'Rune Kite' },
                                { id: 1276, name: 'Dragon Sq' }
                            ];
                        }
                    } else if (catChoice === 2) {
                        const weaponChoice = await player.ask(['Swords >>', '2H Swords >>', 'Battleaxes >>', 'Bows >>', '[Back]']);
                        if (weaponChoice === 0) {
                            itemsToShow = [
                                { id: 70, name: 'Bronze Sword' }, { id: 60, name: 'Steel Sword' },
                                { id: 68, name: 'Addy Sword' }, { id: 396, name: 'Rune Sword' },
                                { id: 593, name: 'Dragon Sword' }
                            ];
                        } else if (weaponChoice === 1) {
                            itemsToShow = [
                                { id: 76, name: 'Bronze 2H' }, { id: 77, name: 'Steel 2H' },
                                { id: 79, name: 'Addy 2H' }, { id: 398, name: 'Rune 2H' }
                            ];
                        } else if (weaponChoice === 2) {
                            itemsToShow = [
                                { id: 12, name: 'Bronze Baxe' }, { id: 89, name: 'Steel Baxe' },
                                { id: 97, name: 'Addy Baxe' }, { id: 405, name: 'Rune Baxe' },
                                { id: 594, name: 'Dragon Baxe' }
                            ];
                        } else if (weaponChoice === 3) {
                            itemsToShow = [
                                { id: 188, name: 'Shortbow' }, { id: 189, name: 'Longbow' },
                                { id: 654, name: 'Yew Short' }, { id: 655, name: 'Yew Long' },
                                { id: 656, name: 'Magic Short' }, { id: 657, name: 'Magic Long' }
                            ];
                        }
                    } else if (catChoice === 3) {
                        const rareChoice = await player.ask(['Partyhats >>', 'H\'ween Masks >>', 'Other Rares >>', '[Back]']);
                        if (rareChoice === 0) {
                            itemsToShow = [
                                { id: 576, name: 'Red Phat' }, { id: 577, name: 'Yellow Phat' },
                                { id: 578, name: 'Blue Phat' }, { id: 579, name: 'Green Phat' },
                                { id: 580, name: 'Purple Phat' }, { id: 581, name: 'White Phat' }
                            ];
                        } else if (rareChoice === 1) {
                            itemsToShow = [
                                { id: 828, name: 'Red Mask' }, { id: 829, name: 'Blue Mask' },
                                { id: 831, name: 'Green Mask' }
                            ];
                        } else if (rareChoice === 2) {
                            itemsToShow = [
                                { id: 575, name: 'Xmas Cracker' }, { id: 422, name: 'Disk of Return' },
                                { id: 1289, name: 'Scythe' }, { id: 971, name: 'Bunny Ears' },
                                { id: 677, name: 'Easter Egg' }, { id: 1315, name: 'Santa Hat' }
                            ];
                        }
                    } else if (catChoice === 4) {
                        const resChoice = await player.ask(['Ores & Bars >>', 'Logs >>', 'Runes >>', 'Coins >>', '[Back]']);
                        if (resChoice === 0) {
                            itemsToShow = [
                                { id: 150, name: 'Copper Ore' }, { id: 153, name: 'Coal' },
                                { id: 409, name: 'Runite Ore' }, { id: 408, name: 'Runite Bar' }
                            ];
                        } else if (resChoice === 1) {
                            itemsToShow = [
                                { id: 14, name: 'Logs' }, { id: 633, name: 'Willow' },
                                { id: 635, name: 'Yew Logs' }, { id: 636, name: 'Magic Logs' }
                            ];
                        } else if (resChoice === 2) {
                            itemsToShow = [
                                { id: 31, name: 'Air (1000)', amount: 1000 },
                                { id: 38, name: 'Chaos (500)', amount: 500 },
                                { id: 42, name: 'Death (500)', amount: 500 },
                                { id: 825, name: 'Blood (500)', amount: 500 }
                            ];
                        } else if (resChoice === 3) {
                            const coinChoice = await player.ask(['1,000', '10,000', '100,000', '1,000,000', '[Back]']);
                            const amounts = [1000, 10000, 100000, 1000000];
                            if (coinChoice < 4) {
                                player.inventory.add(10, amounts[coinChoice]);
                                player.message(`Added ${amounts[coinChoice].toLocaleString()} coins`);
                            }
                        }
                    }

                    if (itemsToShow.length > 0) {
                        const itemNames = itemsToShow.map(i => i.name);
                        itemNames.push('[Back]');
                        const itemChoice = await player.ask(itemNames);
                        if (itemChoice < itemsToShow.length) {
                            const item = itemsToShow[itemChoice];
                            player.inventory.add(item.id, item.amount || 1);
                            player.message(`Added ${item.amount || 1}x ${item.name}`);
                        }
                    }
                } else if (mainChoice === 1) {
                    player.message(`Location: ${player.x}, ${player.y}`);
                } else if (mainChoice === 4) {
                    player.skills.hits.current = player.skills.hits.base;
                    player.sendStats();
                    player.message('You have been healed');
                } else if (mainChoice === 5) {
                    await player.save();
                    player.message('Player data saved');
                }
            } catch (e) { }
            break;
        }
        case 'gang': {
            if (player.cache.phoenixGang) {
                player.message('You are a member of the Phoenix Gang');
            } else if (player.cache.blackArmGang) {
                player.message('You are a member of the Black Arm Gang');
            } else {
                player.message('You are not in a gang yet');
            }
            break;
        }
        case 'heal': {
            player.skills.hits.current = player.skills.hits.base;
            player.sendStats();
            player.message('You have been healed');
            break;
        }
        case 'kill': {
            if (!args[0]) {
                player.message('Usage: ::kill <username>');
                break;
            }
            const victim = world.getPlayerByUsername(args[0]);
            if (victim) {
                victim.damage(victim.skills.hits.current);
                player.message(`Killed ${args[0]}`);
            } else {
                player.message(`Player not found: ${args[0]}`);
            }
            break;
        }
        case 'broadcast': {
            if (!args.length) {
                player.message('Usage: ::broadcast <message>');
                break;
            }
            const broadcastMsg = args.join(' ');
            for (const p of world.players.values()) {
                p.message(`[BROADCAST] ${broadcastMsg}`);
            }
            break;
        }
        case 'save': {
            await player.save();
            player.message('Player data saved');
            break;
        }
    }
}

module.exports = { command };
