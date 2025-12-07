/**
 * Clan System for RSC-Cloudflare
 * 
 * Provides clan functionality similar to OpenRSC:
 * - Create clan
 * - Invite members
 * - Kick members
 * - Clan chat
 * - Clan ranks (leader, officer, member)
 */

// Clan storage (in-memory, should be persisted to player data)
const clans = new Map();

class Clan {
    constructor(name, leader) {
        this.name = name;
        this.leader = leader;
        this.officers = new Set();
        this.members = new Set([leader]);
        this.invites = new Set();
        this.createdAt = Date.now();
    }

    isLeader(username) {
        return this.leader === username.toLowerCase();
    }

    isOfficer(username) {
        return this.officers.has(username.toLowerCase());
    }

    isMember(username) {
        return this.members.has(username.toLowerCase());
    }

    canInvite(username) {
        return this.isLeader(username) || this.isOfficer(username);
    }

    canKick(username) {
        return this.isLeader(username) || this.isOfficer(username);
    }

    addMember(username) {
        this.members.add(username.toLowerCase());
        this.invites.delete(username.toLowerCase());
    }

    removeMember(username) {
        this.members.delete(username.toLowerCase());
        this.officers.delete(username.toLowerCase());
    }

    promoteToOfficer(username) {
        if (this.isMember(username)) {
            this.officers.add(username.toLowerCase());
            return true;
        }
        return false;
    }

    demoteFromOfficer(username) {
        this.officers.delete(username.toLowerCase());
    }
}

// Get player's clan
function getPlayerClan(player) {
    const username = player.username.toLowerCase();
    for (const [name, clan] of clans) {
        if (clan.isMember(username)) {
            return clan;
        }
    }
    return null;
}

// Get clan by name
function getClanByName(name) {
    return clans.get(name.toLowerCase());
}

// Handle clan commands
function handleClanCommand(player, command, args) {
    const subCommand = args[0]?.toLowerCase();

    switch (subCommand) {
        case 'create': {
            const clanName = args.slice(1).join(' ');
            if (!clanName) {
                player.message('Usage: ::clan create <name>');
                return true;
            }
            if (clanName.length < 3 || clanName.length > 20) {
                player.message('Clan name must be 3-20 characters');
                return true;
            }
            if (getPlayerClan(player)) {
                player.message('You are already in a clan');
                return true;
            }
            if (getClanByName(clanName)) {
                player.message('A clan with that name already exists');
                return true;
            }

            const clan = new Clan(clanName, player.username.toLowerCase());
            clans.set(clanName.toLowerCase(), clan);
            player.cache.clan = clanName.toLowerCase();
            player.message(`Created clan: ${clanName}`);
            player.message('You are now the clan leader');
            return true;
        }

        case 'invite': {
            const targetName = args[1];
            if (!targetName) {
                player.message('Usage: ::clan invite <player>');
                return true;
            }
            const clan = getPlayerClan(player);
            if (!clan) {
                player.message('You are not in a clan');
                return true;
            }
            if (!clan.canInvite(player.username)) {
                player.message('You do not have permission to invite');
                return true;
            }

            const target = player.world.getPlayerByUsername(targetName);
            if (!target) {
                player.message('Player not found');
                return true;
            }
            if (getPlayerClan(target)) {
                player.message('That player is already in a clan');
                return true;
            }

            clan.invites.add(targetName.toLowerCase());
            target.cache.clanInvite = clan.name;
            player.message(`Invited ${targetName} to the clan`);
            target.message(`${player.username} has invited you to join ${clan.name}`);
            target.message('Type ::clan accept to join');
            return true;
        }

        case 'accept': {
            const inviteName = player.cache.clanInvite;
            if (!inviteName) {
                player.message('You have no pending clan invites');
                return true;
            }
            const clan = getClanByName(inviteName);
            if (!clan) {
                player.message('That clan no longer exists');
                delete player.cache.clanInvite;
                return true;
            }

            clan.addMember(player.username);
            player.cache.clan = clan.name.toLowerCase();
            delete player.cache.clanInvite;
            player.message(`You have joined ${clan.name}`);

            // Notify clan members
            for (const memberName of clan.members) {
                const member = player.world.getPlayerByUsername(memberName);
                if (member && member !== player) {
                    member.message(`${player.username} has joined the clan`);
                }
            }
            return true;
        }

        case 'leave': {
            const clan = getPlayerClan(player);
            if (!clan) {
                player.message('You are not in a clan');
                return true;
            }
            if (clan.isLeader(player.username)) {
                player.message('Clan leaders cannot leave. Transfer leadership first or disband.');
                return true;
            }

            clan.removeMember(player.username);
            delete player.cache.clan;
            player.message('You have left the clan');

            // Notify clan members
            for (const memberName of clan.members) {
                const member = player.world.getPlayerByUsername(memberName);
                if (member) {
                    member.message(`${player.username} has left the clan`);
                }
            }
            return true;
        }

        case 'kick': {
            const targetName = args[1];
            if (!targetName) {
                player.message('Usage: ::clan kick <player>');
                return true;
            }
            const clan = getPlayerClan(player);
            if (!clan) {
                player.message('You are not in a clan');
                return true;
            }
            if (!clan.canKick(player.username)) {
                player.message('You do not have permission to kick');
                return true;
            }
            if (clan.isLeader(targetName)) {
                player.message('You cannot kick the clan leader');
                return true;
            }
            if (!clan.isMember(targetName)) {
                player.message('That player is not in your clan');
                return true;
            }

            clan.removeMember(targetName);
            player.message(`Kicked ${targetName} from the clan`);

            const target = player.world.getPlayerByUsername(targetName);
            if (target) {
                delete target.cache.clan;
                target.message('You have been kicked from the clan');
            }
            return true;
        }

        case 'info': {
            const clan = getPlayerClan(player);
            if (!clan) {
                player.message('You are not in a clan');
                return true;
            }
            player.message(`=== ${clan.name} ===`);
            player.message(`Leader: ${clan.leader}`);
            player.message(`Officers: ${Array.from(clan.officers).join(', ') || 'None'}`);
            player.message(`Members: ${clan.members.size}`);
            return true;
        }

        case 'disband': {
            const clan = getPlayerClan(player);
            if (!clan) {
                player.message('You are not in a clan');
                return true;
            }
            if (!clan.isLeader(player.username)) {
                player.message('Only the clan leader can disband');
                return true;
            }

            // Notify all members
            for (const memberName of clan.members) {
                const member = player.world.getPlayerByUsername(memberName);
                if (member) {
                    delete member.cache.clan;
                    member.message('The clan has been disbanded');
                }
            }

            clans.delete(clan.name.toLowerCase());
            player.message('Clan disbanded');
            return true;
        }

        default:
            player.message('Clan commands: create, invite, accept, leave, kick, info, disband');
            return true;
    }
}

// Clan chat command
function handleClanChat(player, args) {
    const clan = getPlayerClan(player);
    if (!clan) {
        player.message('You are not in a clan');
        return true;
    }

    const message = args.join(' ');
    if (!message) {
        player.message('Usage: ::c <message>');
        return true;
    }

    // Send to all online clan members
    for (const memberName of clan.members) {
        const member = player.world.getPlayerByUsername(memberName);
        if (member) {
            member.message(`[Clan] ${player.username}: ${message}`);
        }
    }
    return true;
}

module.exports = {
    Clan,
    clans,
    getPlayerClan,
    getClanByName,
    handleClanCommand,
    handleClanChat
};
