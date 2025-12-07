// Quick script to create a test user via your local KV API
async function createUser() {
    const player = {
        username: 'pick_of_gods',
        password: '12345',
        group: 1, // Members
        x: 213,
        y: 436,
        fatigue: 0,
        combatStyle: 0,
        blockChat: 0,
        blockPrivateChat: 0,
        blockTrade: 0,
        blockDuel: 0,
        cameraAuto: 0,
        oneMouseButton: 0,
        soundOn: 1,
        hairColour: 2,
        topColour: 8,
        trouserColour: 14,
        skinColour: 0,
        headSprite: 1,
        bodySprite: 2,
        skulled: 0,
        friends: [],
        ignores: [],
        inventory: [],
        bank: [],
        questPoints: 0,
        questStages: {},
        skills: {
            attack: { current: 1, experience: 0 },
            defense: { current: 1, experience: 0 },
            strength: { current: 1, experience: 0 },
            hits: { current: 9, experience: 737 }, // Level 9 HP
            ranged: { current: 1, experience: 0 },
            prayer: { current: 1, experience: 0 },
            magic: { current: 1, experience: 0 },
            cooking: { current: 1, experience: 0 },
            woodcutting: { current: 1, experience: 0 },
            fletching: { current: 1, experience: 0 },
            fishing: { current: 1, experience: 0 },
            firemaking: { current: 1, experience: 0 },
            crafting: { current: 1, experience: 0 },
            smithing: { current: 1, experience: 0 },
            mining: { current: 1, experience: 0 },
            herblaw: { current: 1, experience: 0 },
            agility: { current: 1, experience: 0 },
            thieving: { current: 1, experience: 0 }
        },
        cache: {},
        loginIP: null,
        world: 0,
        id: Math.floor(Math.random() * 1000000)
    };

    try {
        const response = await fetch('http://localhost:8790/api/player/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(player)
        });

        const result = await response.json();
        console.log('Result:', result);

        if (response.ok) {
            console.log('\n✅ User created!');
            console.log('Username: pick_of_gods');
            console.log('Password: 12345');
            console.log('Group: 1 (Members)');
            console.log('HP: Level 9');
        } else {
            console.log('\n❌ Failed:', result);
        }
    } catch (error) {
        console.error('Error:', error.message);
    }
}

createUser();
