class Captcha {
    constructor() {
        console.log('Captcha mock initialized');
    }

    async generate() {
        console.log('Captcha.generate() called (mock)');
        return {
            text: '00000',
            data: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==' // 1x1 transparent pixel
        };
    }

    async loadFonts() {
        console.log('Captcha.loadFonts() called (mock)');
        return Promise.resolve();
    }
}

module.exports = Captcha;
