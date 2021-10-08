// #DEPENDENCIES
const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
puppeteer.use(StealthPlugin());
const AdblockerPlugin = require('puppeteer-extra-plugin-adblocker');
puppeteer.use(AdblockerPlugin());
const fs = require('fs-extra');
const path = require('path');
const readlineSync = require('readline-sync');

// #CUSTOM MODULES
const config = require('./custom_modules/config.js');
const devices = require('./custom_modules/devicehelper.js');
const helper = require('./custom_modules/helper.js');
const logger = require('./custom_modules/logger.js');

// #FUNCTIONS
const createfolders = (urlroot) => {
    //empty all previous screenshots
    fs.emptyDirSync(path.resolve(__dirname, `./screens`));

    //create folders for domain
    const foldertypes = ["mobile", "tablet", "laptop", "largescreens"];
    for (let i = 0, l = foldertypes.length; i < l; i++) {
        fs.ensureDirSync(path.resolve(__dirname, `./screens/${urlroot}/${foldertypes[i]}`));
    }
}

const isURL = (string) => {
    let url;
    // check length
    if (string.length < 14) {
        return false;
    }

    const invalidPatterns = ["//.", "..", "\n", "\r", "\t", "--"];
    // invalid patterns
    if (invalidPatterns.some(
            pattern => string.indexOf(pattern) !== -1,
        )) {
        return false;
    }

    // check protocol
    if (!(string.indexOf("https://") === 0 || string.indexOf("http://") === 0)) {
        return false;
    }

    try {
        url = new URL(string);
    } catch (e) {
        // invalid url
        return false;
    }


    // All Good
    return true;
};


// #MAIN WORKER
const nodeWorker = async() => {
    console.clear();

    // Init UI
    logger.error(`Screenshoot tool by @Dusan96.\nPress any key to continue...\n`);
    readlineSync.question('', { hideEchoBack: true, mask: '' });
    console.clear();

    // Ask for URL
    console.log(`Input url of webiste eg:\n
    https://www.blic.rs\n
    https://www.alo.rs\n`);

    var targetUrl = readlineSync.question(`\n[input]: `);

    if (isURL(targetUrl)) {
        targetUrl.trim();
    } else {
        console.clear();
        logger.error(`Invalid Input URL.`);
        return false;
    }

    console.clear();
    console.log(`URL typed:`);
    logger.info(targetUrl);
    await helper.sleep(10);
    console.clear();

    const browser = await puppeteer.launch(config.puppeter);
    let pages = await browser.pages();
    const page = pages[0];

    // Headless puppeter.headles = true detection
    // # https://arh.antoinevastel.com/bots/areyouheadless
    // # https://intoli.com/blog/not-possible-to-block-chrome-headless/chrome-headless-test.html

    await page.evaluateOnNewDocument(helper.headlessdetect);
    await page.setCacheEnabled(false);
    const client = await page.target().createCDPSession();

    // # Local functions scope
    const createScreenShot = (data) => {
        return new Promise(async function(resolve) {
            // # Clear Cookies and Cashe before new Screenshot
            await client.send('Network.clearBrowserCookies');
            await client.send('Network.clearBrowserCache');
            await client.send('Network.setCacheDisabled', {
                cacheDisabled: true,
            });
            try {
                var full = false;
                if (typeof data.full != null && data.full === true) {
                    full = true;
                }
                if (typeof data.emulate != null && data.emulate != null) {
                    await page.emulate(data.emulate);
                } else if (typeof data.resolution == "string") {
                    let x = 1280;
                    let y = 800;

                    let res = data.resolution.trim();
                    res = data.resolution.split(`x`);

                    x = parseInt(res[0]);
                    y = parseInt(res[1]);

                    await page.setViewport({ width: x, height: y });
                } else {
                    console.log(`No viewport data specified.`);
                    resolve(false);
                    return;
                }
                if (typeof data.url == "string") {
                    await page.goto(data.url, { waitUntil: 'networkidle2' });
                } else {
                    console.log(`No url specified.`);
                    resolve(false);
                    return;
                }

                // using .webp which has best encoding besides .avif  Support for it addeed a few days
                // ago OCT.2021
                if (typeof data.path == "string") {
                    await page.screenshot({
                        path: data.path,
                        fullPage: full,
                    });
                    let message = `Screenshot `;
                    if (typeof data.emulate != null && data.emulate != null) {
                        message = message + `device :[${data.emulate.name}] type:[${data.type}] res:[${data.resolution}] created.`;
                    } else {
                        message = message + `type:[${data.type}] res:[${data.resolution}] created.`;
                    }
                    logger.warn(message);
                    resolve(true);
                    return;
                } else {
                    console.log(`No path specified.`);
                    resolve(false);
                    return;
                }

            } catch (e) {
                console.log(e);
                resolve(false);
                console.log(`There was an error while creating screenshot.`);
                return;
            }
        });

    }





    // tried forEach, fallback on for loop

    console.clear();
    var urlroot = new URL(targetUrl).host;
    createfolders(urlroot);
    for (let i = 0, l = devices.devices.length; i < l; i++) {
        var putanja = path.resolve(__dirname, `.\\screens\\${urlroot}\\${devices.devices[i].type.toLowerCase().trim()}`);
        putanja = putanja + `\\${urlroot}.${devices.devices[i].resolution}.webp`;

        await createScreenShot({
            path: putanja,
            resolution: devices.devices[i].resolution,
            emulate: devices.devices[i].realProps,
            type: devices.devices[i].type,
            url: targetUrl
        });

        await helper.sleep(5); // 5 sec
    }
    try {
        await page.close();
        await browser.close();
    } catch (e) {
        //sometimes close browser too when no tabs left
    }
    console.clear();
    logger.info(`All Jobs Completed. Script Done.`);

}

nodeWorker();