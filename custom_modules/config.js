module.exports = {
    puppeter: {
        headless: true,
        ignoreHTTPSErrors: true,
        args: [
            "--disable-notifications",
            '--disable-background-timer-throttling',
            '--disable-backgrounding-occluded-windows',
            '--disable-renderer-backgrounding',
            '--disable-features=site-per-process',
            '--disable-web-security',
            '--ignore-certificate-errors',
            '--disable-infobars',
            '--allow-insecure-localhost',
            '--disable-device-discovery-notifications',
            '--allow-file-access-from-files',
            '--media-cache-size=0',
            '--disk-cache-size=0',
            '--aggressive-cache-discard',
            '--disable-cache',
            '--disable-application-cache',
            '--disable-offline-load-stale-cache',
            '--disable-gpu-shader-disk-cache',
            '--no-sandbox',
            '--disable-setuid-sandbox',
            '--disable-dev-shm-usage',
            `--disable-accelerated-2d-canvas`,
            '--no-first-run',
            '--no-zygote',
            /*'--single-process', LINUX ONLY*/
            '--disable-gpu',
            '--mute-audio',
            '--proxy-server="direct://"',
            '--proxy-bypass-list=*',
            '--js-flags="--max-old-space-size=1024"',
            '--disable-web-security',
            '--allow-file-access-from-files',
            '--disable-site-isolation-trials',
            '--allow-file-access',
            '--allow-cross-origin-auth-prompt'
        ]
    }
}