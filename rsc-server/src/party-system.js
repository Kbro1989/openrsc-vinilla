/**
 * Party System for RSC-Cloudflare
 * 
 * Provides group functionality:
 * - Create party
 * - Invite members
 * - Kick members  
 * - Party chat
 * - Share XP (optional)
 * - Loot sharing (optional)
 */

// Party storage (in-memory)
const parties = new Map();
let partyIdCounter = 1;

class Party {
    constructor(leader) {
        this.id = partyIdCounter++;
        this.leader = leader;
        this.members = new Set([leader]);
        this.invites = new Set();
        this.settings = {
            shareXp: false,
            shareLoot: false,
            maxSize: 5
        };
        this.createdAt = Date.now();
    }

    isLeader(username) {
        return this.leader === username.toLowerCase();
    }

    isMember(username) {
        return this.members.has(username.toLowerCase());
    }

    canInvite(username) {
        return this.isLeader(username);
    }

    isFull() {
        return this.members.size >= this.settings.maxSize;
    }

    addMember(username) {
        if (!this.isFull()) {
            this.members.add(username.toLowerCase());
            this.invites.delete(username.toLowerCase());
            return true;
        }
        return false;
    }

    removeMember(username) {
        this.members.delete(username.toLowerCase());
    }
}

// Get player's party
function getPlayerParty(player) {
    const username = player.username.toLowerCase();
    for (const [id, party] of parties) {
        if (party.isMember(username)) {
            return party;
        }
    }
    return null;
}

// Handle party commands
function handlePartyCommand(player, command, args) {
    const subCommand = args[0]?.toLowerCase();

    switch (subCommand) {
        case 'create': {
            if (getPlayerParty(player)) {
                player.message('You are already in a party');
                return true;
            }

            const party = new Party(player.username.toLowerCase());
            parties.set(party.id, party);
            player.cache.partyId = party.id;
            player.message('Party created!');
            player.message('Use ::party invite <player> to invite others');
            return true;
        }

        case 'invite': {
            const targetName = args[1];
            if (!targetName) {
                player.message('Usage: ::party invite <player>');
                return true;
            }
            const party = getPlayerParty(player);
            if (!party) {
                player.message('You are not in a party');
                return true;
            }
            if (!party.canInvite(player.username)) {
                player.message('Only the party leader can invite');
                return true;
            }
            if (party.isFull()) {
                player.message('Party is full');
                return true;
            }

            const target = player.world.getPlayerByUsername(targetName);
            if (!target) {
                player.message('Player not found');
                return true;
            }
            if (getPlayerParty(target)) {
                player.message('That player is already in a party');
                return true;
            }

            party.invites.add(targetName.toLowerCase());
            target.cache.partyInvite = party.id;
            player.message(`Invited ${targetName} to the party`);
            target.message(`${player.username} has invited you to join their party`);
            target.message('Type ::party accept to join');
            return true;
        }

        case 'accept': {
            const partyId = player.cache.partyInvite;
            if (!partyId) {
                player.message('You have no pending party invites');
                return true;
            }
            const party = parties.get(partyId);
            if (!party) {
                player.message('That party no longer exists');
                delete player.cache.partyInvite;
                return true;
            }

            if (party.addMember(player.username)) {
                player.cache.partyId = party.id;
                delete player.cache.partyInvite;
                player.message('You have joined the party');

                // Notify party members
                for (const memberName of party.members) {
                    const member = player.world.getPlayerByUsername(memberName);
                    if (member && member !== player) {
                        member.message(`${player.username} has joined the party`);
                    }
                }
            } else {
                player.message('Failed to join party (may be full)');
            }
            return true;
        }

        case 'leave': {
            const party = getPlayerParty(player);
            if (!party) {
                player.message('You are not in a party');
                return true;
            }

            if (party.isLeader(player.username)) {
                // Leader leaving disbands party
                for (const memberName of party.members) {
                    const member = player.world.getPlayerByUsername(memberName);
                    if (member) {
                        delete member.cache.partyId;
                        member.message('The party has been disbanded');
                    }
                }
                parties.delete(party.id);
            } else {
                party.removeMember(player.username);
                delete player.cache.partyId;
                player.message('You have left the party');

                // Notify remaining members
                for (const memberName of party.members) {
                    const member = player.world.getPlayerByUsername(memberName);
                    if (member) {
                        member.message(`${player.username} has left the party`);
                    }
                }
            }
            return true;
        }

        case 'kick': {
            const targetName = args[1];
            if (!targetName) {
                player.message('Usage: ::party kick <player>');
                return true;
            }
            const party = getPlayerParty(player);
            if (!party) {
                player.message('You are not in a party');
                return true;
            }
            if (!party.isLeader(player.username)) {
                player.message('Only the party leader can kick');
                return true;
            }
            if (!party.isMember(targetName)) {
                player.message('That player is not in your party');
                return true;
            }
            if (party.isLeader(targetName)) {
                player.message('You cannot kick yourself');
                return true;
            }

            party.removeMember(targetName);
            player.message(`Kicked ${targetName} from the party`);

            const target = player.world.getPlayerByUsername(targetName);
            if (target) {
                delete target.cache.partyId;
                target.message('You have been kicked from the party');
            }
            return true;
        }

        case 'info': {
            const party = getPlayerParty(player);
            if (!party) {
                player.message('You are not in a party');
                return true;
            }
            player.message(`=== Party ===`);
            player.message(`Leader: ${party.leader}`);
            player.message(`Members: ${Array.from(party.members).join(', ')}`);
            player.message(`Size: ${party.members.size}/${party.settings.maxSize}`);
            return true;
        }

        default:
            player.message('Party commands: create, invite, accept, leave, kick, info');
            return true;
    }
}

// Party chat
function handlePartyChat(player, args) {
    const party = getPlayerParty(player);
    if (!party) {
        player.message('You are not in a party');
        return true;
    }

    const message = args.join(' ');
    if (!message) {
        player.message('Usage: ::p <message>');
        return true;
    }

    // Send to all party members
    for (const memberName of party.members) {
        const member = player.world.getPlayerByUsername(memberName);
        if (member) {
            member.message(`[Party] ${player.username}: ${message}`);
        }
    }
    return true;
}

module.exports = {
    Party,
    parties,
    getPlayerParty,
    handlePartyCommand,
    handlePartyChat
};
