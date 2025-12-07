/**
 * Server Health Monitor
 * 
 * Monitors the health of available game servers and handles automatic failover
 * between Fly.io (primary) and Cloudflare Workers (backup)
 */

class ServerHealthMonitor {
    constructor(options = {}) {
        this.servers = [
            {
                name: 'Fly.io Primary',
                type: 'flyio',
                url: options.flyioUrl || 'wss://rsc-game-server.fly.dev',
                port: 43594,
                priority: 1,
                healthy: true
            },
            {
                name: 'Cloudflare Backup',
                type: 'cloudflare',
                url: options.cloudflareUrl || window.location.origin + '/api/game',
                priority: 2,
                healthy: true,
                readOnly: true
            }
        ];

        this.currentServer = null;
        this.pingInterval = 5000; // 5 seconds
        this.pingTimer = null;
        this.failureCount = 0;
        this.maxFailures = 3;
        this.isMonitoring = false;

        this.listeners = {
            'server-changed': [],
            'connection-lost': [],
            'connection-restored': []
        };

        console.log('[HealthMonitor] Initialized with servers:', this.servers);
    }

    /**
     * Start health monitoring
     */
    start() {
        if (this.isMonitoring) {
            return;
        }

        this.isMonitoring = true;
        this.selectBestServer();

        // Start periodic ping
        this.pingTimer = setInterval(() => {
            this.checkHealth();
        }, this.pingInterval);

        console.log('[HealthMonitor] Started monitoring');
    }

    /**
     * Stop health monitoring
     */
    stop() {
        if (this.pingTimer) {
            clearInterval(this.pingTimer);
            this.pingTimer = null;
        }
        this.isMonitoring = false;
        console.log('[HealthMonitor] Stopped monitoring');
    }

    /**
     * Select the best available server
     */
    selectBestServer() {
        // Sort by priority (lowest first) and healthy status
        const available = this.servers
            .filter(s => s.healthy)
            .sort((a, b) => a.priority - b.priority);

        if (available.length === 0) {
            console.error('[HealthMonitor] No healthy servers available!');
            return null;
        }

        const selected = available[0];

        if (this.currentServer !== selected) {
            const previous = this.currentServer;
            this.currentServer = selected;

            console.log(`[HealthMonitor] Switched server: ${previous ? previous.name : 'none'} → ${selected.name}`);

            this.emit('server-changed', {
                previous,
                current: selected
            });
        }

        return selected;
    }

    /**
     * Check health of current server
     */
    async checkHealth() {
        if (!this.currentServer) {
            return;
        }

        try {
            const healthy = await this.pingServer(this.currentServer);

            if (healthy) {
                // Reset failure count on success
                if (this.failureCount > 0) {
                    console.log(`[HealthMonitor] ${this.currentServer.name} restored`);
                    this.emit('connection-restored', { server: this.currentServer });
                }
                this.failureCount = 0;
                this.currentServer.healthy = true;

                // Check if higher priority server is available again
                this.tryRestorePrimary();
            } else {
                this.failureCount++;
                console.warn(`[HealthMonitor] Ping failed (${this.failureCount}/${this.maxFailures})`);

                if (this.failureCount >= this.maxFailures) {
                    console.error(`[HealthMonitor] ${this.currentServer.name} is unhealthy!`);
                    this.currentServer.healthy = false;
                    this.emit('connection-lost', { server: this.currentServer });
                    this.selectBestServer();
                }
            }
        } catch (error) {
            console.error('[HealthMonitor] Health check error:', error);
        }
    }

    /**
     * Ping a server to check if it's alive
     */
    async pingServer(server) {
        // For Fly.io, ping the health endpoint
        if (server.type === 'flyio') {
            try {
                const response = await fetch(`${server.url}/health`, {
                    method: 'GET',
                    timeout: 3000
                });
                return response.ok;
            } catch (error) {
                console.warn(`[HealthMonitor] Fly.io health check failed:`, error.message);
                return false;
            }
        }

        // For Cloudflare, it's always available
        return true;
    }

    /**
     * Try to restore connection to primary server
     */
    async tryRestorePrimary() {
        const primary = this.servers.find(s => s.priority === 1);

        if (!primary || primary === this.currentServer) {
            return;
        }

        // Check if primary is healthy again
        const healthy = await this.pingServer(primary);

        if (healthy) {
            primary.healthy = true;
            console.log('[HealthMonitor] Primary server is healthy again');
            this.selectBestServer();
        }
    }

    /**
     * Get current server connection info
     */
    getCurrentServer() {
        return this.currentServer;
    }

    /**
     * Get connection URL for current server
     */
    getConnectionUrl() {
        if (!this.currentServer) {
            return null;
        }

        if (this.currentServer.type === 'flyio') {
            return `${this.currentServer.url}:${this.currentServer.port}`;
        }

        return this.currentServer.url;
    }

    /**
     * Check if current server is read-only
     */
    isReadOnly() {
        return this.currentServer && this.currentServer.readOnly;
    }

    /**
     * Event listener
     */
    on(event, callback) {
        if (this.listeners[event]) {
            this.listeners[event].push(callback);
        }
    }

    /**
     * Emit event
     */
    emit(event, data) {
        if (this.listeners[event]) {
            this.listeners[event].forEach(callback => callback(data));
        }
    }
}

module.exports = ServerHealthMonitor;
