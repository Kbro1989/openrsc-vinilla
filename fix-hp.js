// Script to update your HP in KV from level 4 to level 9
async function fixHP() {
    const username = 'pick_of_gods';

    try {
        // Get current player data
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

        console.log('📊 Current HP:', player.skills.hits);

        // Update HP to level 9
        player.skills.hits.current = 9;
        player.skills.hits.experience = 737; // Level 9 XP

        // Also ensure they're members
        player.group = 1;

        // Save updated player
        const saveResponse = await fetch('http://localhost:8790/api/player/save', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(player)
        });

        if (saveResponse.ok) {
            console.log('✅ HP updated to level 9!');
            console.log('✅ Group set to 1 (Members)');
            console.log('\n📊 New HP:', player.skills.hits);
            console.log('\nLog out and back in to see the changes!');
        } else {
            console.log('❌ Failed to save');
        }
    } catch (error) {
        console.error('❌ Error:', error.message);
        console.log('\n⚠️  Make sure the server is running on port 8790');
    }
}

fixHP();
