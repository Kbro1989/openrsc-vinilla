async function spawnKit() {
    const username = 'testuser';

    try {
        // Load player
        const getResponse = await fetch(`http://localhost:8790/api/player/load`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username })
        });

        if (!getResponse.ok) {
            console.log('❌ Failed to load player');
            return;
        }

        const { player } = await getResponse.json();

        // Add Items
        // 165: Unid Guam, 464: Vial of Water, 270: Eye of Newt
        // 273: Limpwurt Root, 220: Red Spiders' Eggs, 10: Coins
        const items = [
            { id: 165, amount: 10 },
            { id: 464, amount: 10 },
            { id: 270, amount: 10 },
            { id: 273, amount: 10 },
            { id: 220, amount: 10 },
            { id: 10, amount: 1000 }
        ];

        items.forEach(item => {
            player.inventory.items.push(item);
        });

        // Set Herblaw Level to 3 (to clean Guams)
        player.skills.herblaw.current = 3;
        player.skills.herblaw.experience = 175;

        // Save
        const saveResponse = await fetch('http://localhost:8790/api/player/save', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(player)
        });

        if (saveResponse.ok) {
            console.log('✅ Herblaw Kit Spawned for testuser!');
            console.log('✅ Added: 10 Unid Guams, 10 Vials of Water, 10 Eyes of Newt, 10 Limpwurts, 10 Spider Eggs, 1000 Coins');
            console.log('✅ Set Herblaw Level to 3');
            console.log('👉 Log out and back in to see items!');
        } else {
            console.log('❌ Failed to save');
        }
    } catch (error) {
        console.error('❌ Error:', error.message);
    }
}

spawnKit();
