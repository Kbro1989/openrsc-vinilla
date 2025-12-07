// Try to use global fetch (Node 18+), otherwise require node-fetch
const fetch = global.fetch || require('node-fetch');

const BASE_URL = process.env.BASE_URL || 'http://localhost:8788';
const TEST_USER = `testuser_${Date.now()}`;
const TEST_PASS = 'password123';

async function runCheck() {
    console.log(`Starting Login Pipeline Check against ${BASE_URL}`);
    console.log(`Test User: ${TEST_USER}`);

    // 1. Register
    console.log('\n--- Step 1: Registration ---');
    try {
        const regRes = await fetch(`${BASE_URL}/api/player/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                username: TEST_USER,
                password: TEST_PASS,
                email: 'test@example.com'
            })
        });

        if (regRes.status === 200) {
            console.log('✅ Registration Successful');
        } else {
            console.error(`❌ Registration Failed: ${regRes.status} ${regRes.statusText}`);
            const text = await regRes.text();
            console.error('Response:', text);
            return;
        }
    } catch (e) {
        console.error('❌ Registration Error:', e.message);
        return;
    }

    // 2. Login (Initial)
    console.log('\n--- Step 2: Initial Login ---');
    let player;
    try {
        const loginRes = await fetch(`${BASE_URL}/api/player/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                username: TEST_USER,
                password: TEST_PASS
            })
        });

        if (loginRes.status === 200) {
            const data = await loginRes.json();
            if (data.success) {
                console.log('✅ Login Successful');
                player = data.player;
                console.log('Player ID:', player.id);
            } else {
                console.error('❌ Login Failed (Logic):', data);
                return;
            }
        } else {
            console.error(`❌ Login Failed: ${loginRes.status}`);
            return;
        }
    } catch (e) {
        console.error('❌ Login Error:', e.message);
        return;
    }

    // 3. Modify & Save (Persistence)
    console.log('\n--- Step 3: Persistence (Save) ---');
    try {
        // Modify player state
        player.x = 100;
        player.y = 200;
        player.fatigue = 500;

        const saveRes = await fetch(`${BASE_URL}/api/player/save`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(player)
        });

        if (saveRes.status === 200) {
            console.log('✅ Save Successful');
        } else {
            console.error(`❌ Save Failed: ${saveRes.status}`);
            return;
        }
    } catch (e) {
        console.error('❌ Save Error:', e.message);
        return;
    }

    // 4. Login Again (Verify Persistence)
    console.log('\n--- Step 4: Verify Persistence (Re-login) ---');
    try {
        const loginRes = await fetch(`${BASE_URL}/api/player/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                username: TEST_USER,
                password: TEST_PASS
            })
        });

        if (loginRes.status === 200) {
            const data = await loginRes.json();
            if (data.success) {
                const p = data.player;
                if (p.x === 100 && p.y === 200 && p.fatigue === 500) {
                    console.log('✅ Persistence Verified: Player state preserved.');
                } else {
                    console.error('❌ Persistence Failed: State mismatch.');
                    console.log('Expected: x=100, y=200, fatigue=500');
                    console.log(`Actual: x=${p.x}, y=${p.y}, fatigue=${p.fatigue}`);
                }
            } else {
                console.error('❌ Re-login Failed');
            }
        }
    } catch (e) {
        console.error('❌ Re-login Error:', e.message);
    }
}

runCheck();
