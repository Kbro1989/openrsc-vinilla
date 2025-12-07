const esbuild = require('esbuild');

esbuild.build({
    entryPoints: ['./index.js'],
    bundle: true,
    outfile: './dist/worker.js',
    format: 'esm',
    platform: 'neutral', // Cloudflare Workers runtime
    target: 'es2021',
    // Externalize Node.js built-ins that won't work in Workers
    external: ['fs', 'path', 'net', 'tls', 'crypto', 'stream', 'buffer', 'url', 'events'],
    minify: false, // Set to true for production
    sourcemap: true,
    logLevel: 'info',
    // Define globals for browser-like environment
    define: {
        'process.browser': 'true',
        'process.env.NODE_ENV': '"production"'
    },
    loader: {
        '.jag': 'binary',
        '.mem': 'binary'
    }
}).then(() => {
    console.log('✅ Durable Object Worker bundled successfully');
}).catch((error) => {
    console.error('❌ Build failed:', error);
    process.exit(1);
});
