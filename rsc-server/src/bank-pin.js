/**
 * Bank PIN System for RSC-Cloudflare
 * 
 * Provides bank security:
 * - Set 4-digit PIN
 * - Verify PIN before bank access
 * - Remove PIN
 * - 3 failed attempts = lockout
 */

// Bank PIN commands for command.js integration
function handleBankPinCommand(player, command, args) {
    const subCommand = args[0]?.toLowerCase();

    switch (subCommand) {
        case 'set': {
            const pin = args[1];
            if (!pin || !/^\d{4}$/.test(pin)) {
                player.message('Usage: ::bankpin set <4 digits>');
                player.message('Example: ::bankpin set 1234');
                return true;
            }
            if (player.cache.bankPin) {
                player.message('You already have a bank PIN set');
                player.message('Use ::bankpin remove to remove it first');
                return true;
            }

            player.cache.bankPin = pin;
            player.cache.bankPinAttempts = 0;
            player.message('Bank PIN set successfully!');
            player.message('Remember your PIN: ' + pin);
            return true;
        }

        case 'remove': {
            if (!player.cache.bankPin) {
                player.message('You do not have a bank PIN set');
                return true;
            }

            const currentPin = args[1];
            if (!currentPin) {
                player.message('Usage: ::bankpin remove <your PIN>');
                return true;
            }

            if (currentPin !== player.cache.bankPin) {
                player.message('Incorrect PIN');
                return true;
            }

            delete player.cache.bankPin;
            delete player.cache.bankPinAttempts;
            delete player.cache.bankPinVerified;
            player.message('Bank PIN removed successfully');
            return true;
        }

        case 'status': {
            if (player.cache.bankPin) {
                player.message('You have a bank PIN set');
                if (player.cache.bankPinVerified) {
                    player.message('PIN is currently verified for this session');
                }
            } else {
                player.message('You do not have a bank PIN set');
                player.message('Use ::bankpin set <4 digits> to set one');
            }
            return true;
        }

        default:
            player.message('Bank PIN commands:');
            player.message('::bankpin set <4 digits> - Set your PIN');
            player.message('::bankpin remove <PIN> - Remove your PIN');
            player.message('::bankpin status - Check PIN status');
            return true;
    }
}

// Verify PIN before bank access
function verifyBankPin(player, enteredPin) {
    if (!player.cache.bankPin) {
        return true; // No PIN set, allow access
    }

    if (player.cache.bankPinVerified) {
        return true; // Already verified this session
    }

    if (player.cache.bankPinLocked) {
        const lockTime = player.cache.bankPinLockTime || 0;
        const elapsed = Date.now() - lockTime;
        if (elapsed < 5 * 60 * 1000) { // 5 minute lockout
            const remaining = Math.ceil((5 * 60 * 1000 - elapsed) / 1000);
            player.message(`Bank locked. Try again in ${remaining} seconds`);
            return false;
        } else {
            // Lockout expired
            delete player.cache.bankPinLocked;
            delete player.cache.bankPinLockTime;
            player.cache.bankPinAttempts = 0;
        }
    }

    if (enteredPin === player.cache.bankPin) {
        player.cache.bankPinVerified = true;
        player.cache.bankPinAttempts = 0;
        player.message('PIN verified');
        return true;
    } else {
        player.cache.bankPinAttempts = (player.cache.bankPinAttempts || 0) + 1;
        const remaining = 3 - player.cache.bankPinAttempts;

        if (remaining <= 0) {
            player.cache.bankPinLocked = true;
            player.cache.bankPinLockTime = Date.now();
            player.message('Too many failed attempts!');
            player.message('Bank locked for 5 minutes');
            return false;
        }

        player.message(`Incorrect PIN. ${remaining} attempts remaining`);
        return false;
    }
}

// Check if bank access requires PIN
function requiresBankPin(player) {
    return player.cache.bankPin && !player.cache.bankPinVerified;
}

// Reset PIN verification on logout
function onLogout(player) {
    delete player.cache.bankPinVerified;
}

module.exports = {
    handleBankPinCommand,
    verifyBankPin,
    requiresBankPin,
    onLogout
};
