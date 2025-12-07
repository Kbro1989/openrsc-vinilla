const Item = require('./item');
const items = require('@2003scape/rsc-data/config/items');

class Bank {
    constructor(player, items = []) {
        this.player = player;
        this.items = items.map((item) => new Item(item));

        // Set to 1500 to accommodate all ~1200 unique items in RSC with room to spare
        this.maxItems = 1500;
    }

    open() {
        this.player.lock();
        this.player.interfaceOpen.bank = true;
        this.sendOpen();
    }

    sendOpen() {
        this.player.send({
            type: 'bankOpen',
            maxItems: this.maxItems,
            items: this.items
        });
    }

    close(send = true) {
        this.player.interfaceOpen.bank = false;
        this.player.unlock();

        if (send) {
            this.player.send({ type: 'bankClose' });
        }
    }

    getItem({ id }) {
        return this.items.find((item) => item.id === id);
    }

    deposit(id, amount) {
        if (!this.player.inventory.has(id, amount)) {
            throw new RangeError(`${this} depositing item they don't have`);
        }

        const bankItem = this.getItem({ id });

        if (this.isFull() && !bankItem) {
            this.message("You don't have room for that in your bank");
            return;
        }

        this.player.inventory.remove(id, amount);

        let index;

        if (bankItem) {
            bankItem.amount += amount;
            index = this.items.indexOf(bankItem);
        } else {
            index = this.items.push(new Item({ id, amount })) - 1;
        }

        this.update(index);
    }

    withdraw(id, amount) {
        const bankItem = this.getItem({ id });

        if (!bankItem || bankItem.amount < amount) {
            throw new RangeError(`${this} withdrawing item they don't have`);
        }

        const stackable = items[id].stackable;
        const freeSlots = 30 - this.player.inventory.items.length;
        let amountToWithdraw = amount;

        if (stackable) {
            // If stackable, we only need a slot if we don't already have the item
            if (!this.player.inventory.has(id) && freeSlots < 1) {
                this.player.message("You don't have enough room in your inventory");
                return;
            }
        } else {
            // If non-stackable, we need a slot for each item
            if (freeSlots === 0) {
                this.player.message("You don't have enough room in your inventory");
                return;
            }

            if (amountToWithdraw > freeSlots) {
                amountToWithdraw = freeSlots;
                this.player.message("Your inventory is full");
            }
        }

        this.player.inventory.add(id, amountToWithdraw);

        const index = this.items.indexOf(bankItem);

        bankItem.amount -= amountToWithdraw;

        if (bankItem.amount === 0) {
            this.items.splice(index, 1);
            this.sendOpen();
        } else {
            this.update(index);
        }
    }

    update(index) {
        const item = this.items[index];
        this.player.send({ type: 'bankUpdate', index, ...item });
    }

    has(id, amount = 1) {
        if (typeof id !== 'number') {
            amount = id.amount;
            id = id.id;
        }

        if (!this.player.world.members && items[id].members) {
            return false;
        }

        for (const item of this.items) {
            if (item.id === id && item.amount >= amount) {
                return true;
            }
        }

        return false;
    }

    isFull() {
        return this.items.length >= this.maxItems;
    }

    toJSON() {
        return this.items;
    }
}

module.exports = Bank;
