'use strict';
const TAB_COUNTER = {};
const SITE_BLOCK_STATS = {};
let siteStatsLoaded = false;
let persistStatsTimer = null;
const SITE_UA_STATE = {};
const TAB_LAST_MAIN_DOMAIN = {};
const MAIN_DOMAIN_ORIGINS = {};
const UA_RULE_ID_BASE = 10000;
const UA_RULE_ID_LIMIT = 3000;
const UA_RESOURCE_TYPES = [
    'main_frame',
    'sub_frame',
    'script',
    'stylesheet',
    'image',
    'font',
    'xmlhttprequest',
    'ping',
    'media',
    'websocket',
    'other'
];
const UA_POOL = [
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/74.0.3729.169 Safari/537.36',
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/77.0.3865.120 Safari/537.36',
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/77.0.3865.90 Safari/537.36',
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:69.0) Gecko/20100101 Firefox/69.0',
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_14_6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/77.0.3865.90 Safari/537.36',
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/78.0.3904.70 Safari/537.36',
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/13.0.2 Safari/605.1.15',
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:70.0) Gecko/20100101 Firefox/70.0',
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_14_6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/77.0.3865.120 Safari/537.36',
    'Mozilla/5.0 (Windows NT 6.1; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/77.0.3865.120 Safari/537.36',
    'Mozilla/5.0 (Windows NT 6.1; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/77.0.3865.90 Safari/537.36',
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/70.0.3538.102 Safari/537.36 Edge/18.18362',
    'Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:69.0) Gecko/20100101 Firefox/69.0',
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/76.0.3809.100 Safari/537.36',
    'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/77.0.3865.90 Safari/537.36',
    'Mozilla/5.0 (Windows NT 10.0; rv:68.0) Gecko/20100101 Firefox/68.0',
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_14_6) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/13.0.1 Safari/605.1.15',
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_14_6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/78.0.3904.70 Safari/537.36',
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/76.0.3809.132 Safari/537.36 OPR/63.0.3368.107',
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10.14; rv:69.0) Gecko/20100101 Firefox/69.0',
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_14_6) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/13.0.2 Safari/605.1.15',
    'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/77.0.3865.120 Safari/537.36',
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/64.0.3282.140 Safari/537.36 Edge/18.17763',
    'Mozilla/5.0 (Windows NT 6.1; Win64; x64; rv:69.0) Gecko/20100101 Firefox/69.0',
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_14_5) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/77.0.3865.90 Safari/537.36',
    'Mozilla/5.0 (Windows NT 10.0; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/76.0.3809.132 YaBrowser/19.9.3.314 Yowser/2.5 Safari/537.36',
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_0) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/77.0.3865.90 Safari/537.36',
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/76.0.3809.132 Safari/537.36',
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/78.0.3904.87 Safari/537.36',
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_13_6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/77.0.3865.120 Safari/537.36',
    'Mozilla/5.0 (Windows NT 10.0; WOW64; Trident/7.0; rv:11.0) like Gecko',
    'Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:70.0) Gecko/20100101 Firefox/70.0',
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_13_6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/77.0.3865.90 Safari/537.36',
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_14_5) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/12.1.1 Safari/605.1.15',
    'Mozilla/5.0 (Windows NT 6.1; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/78.0.3904.70 Safari/537.36',
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_14_6) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/12.1.2 Safari/605.1.15',
    'Mozilla/5.0 (Windows NT 6.3; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/77.0.3865.120 Safari/537.36',
    'Mozilla/5.0 (X11; Linux x86_64; rv:69.0) Gecko/20100101 Firefox/69.0',
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/13.0.1 Safari/605.1.15',
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_0) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/78.0.3904.70 Safari/537.36',
    'Mozilla/5.0 (Windows NT 6.1; Win64; x64; rv:70.0) Gecko/20100101 Firefox/70.0',
    'Mozilla/5.0 (Windows NT 6.1; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/77.0.3865.120 Safari/537.36',
    'Mozilla/5.0 (Windows NT 6.1; WOW64; Trident/7.0; rv:11.0) like Gecko',
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_13_6) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/13.0.2 Safari/605.1.15',
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_14_5) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/77.0.3865.120 Safari/537.36',
    'Mozilla/5.0 (Windows NT 6.1; rv:69.0) Gecko/20100101 Firefox/69.0',
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_12_6) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/12.1.2 Safari/605.1.15',
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:69.0) Gecko/20100101 Firefox/69.0',
    'Mozilla/5.0 (Windows NT 6.3; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/77.0.3865.90 Safari/537.36',
    'Mozilla/5.0 (X11; Linux x86_64; rv:60.0) Gecko/20100101 Firefox/60.0',
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10.14; rv:70.0) Gecko/20100101 Firefox/70.0',
    'Mozilla/5.0 (Linux; U; Android 4.3; en-us; SM-N900T Build/JSS15J) AppleWebKit/534.30 (KHTML, like Gecko) Version/4.0 Mobile Safari/534.30',
    'Mozilla/5.0 (Windows NT 10.0; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/75.0.3770.100 Safari/537.36',
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:68.0) Gecko/20100101 Firefox/68.0',
    'Mozilla/5.0 (Windows NT 10.0; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/77.0.3865.90 Safari/537.36',
    'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/72.0.3626.109 Safari/537.36',
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/64.0.3282.140 Safari/537.36 Edge/17.17134',
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_13_6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/78.0.3904.70 Safari/537.36',
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:70.0) Gecko/20100101 Firefox/70.0',
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_14_6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/76.0.3809.132 Safari/537.36',
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/75.0.3770.142 Safari/537.36',
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/77.0.3865.75 Safari/537.36',
    'Mozilla/5.0 (Windows NT 6.1; rv:60.0) Gecko/20100101 Firefox/60.0',
    'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/76.0.3809.100 Safari/537.36',
    'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Ubuntu Chromium/77.0.3865.90 Chrome/77.0.3865.90 Safari/537.36',
    'Mozilla/5.0 (Windows NT 6.1) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/77.0.3865.120 Safari/537.36',
    'Mozilla/5.0 (Windows NT 6.3; Win64; x64; rv:69.0) Gecko/20100101 Firefox/69.0',
    'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/78.0.3904.70 Safari/537.36',
    'Mozilla/5.0 (X11; Linux x86_64; rv:70.0) Gecko/20100101 Firefox/70.0',
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_12_6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/77.0.3865.90 Safari/537.36',
    'Mozilla/5.0 (Windows NT 5.1; rv:52.0) Gecko/20100101 Firefox/52.0',
    'Mozilla/5.0 (Windows NT 6.1) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/77.0.3865.90 Safari/537.36',
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_13_6) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/13.0.1 Safari/605.1.15',
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_1) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/13.0.3 Safari/605.1.15',
    'Mozilla/5.0 (Windows NT 6.1; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/76.0.3809.132 Safari/537.36 OPR/63.0.3368.107',
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10.13; rv:69.0) Gecko/20100101 Firefox/69.0',
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:71.0) Gecko/20100101 Firefox/71.0',
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:56.0) Gecko/20100101 Firefox/56.0 Waterfox/56.2.14',
    'Mozilla/5.0 (Windows NT 6.1; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/76.0.3809.100 Safari/537.36',
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/76.0.3809.87 Safari/537.36',
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/77.0.3835.0 Safari/537.36',
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_0) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/77.0.3865.120 Safari/537.36',
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.36',
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:53.0) Gecko/20100101 Firefox/53.0',
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/51.0.2704.79 Safari/537.36 Edge/14.14393',
    'Mozilla/4.0 (compatible; MSIE 6.0; Windows NT 5.1; SV1)',
    'Mozilla/5.0 (compatible, MSIE 11, Windows NT 6.3; Trident/7.0; rv:11.0) like Gecko',
    'Mozilla/5.0 (iPad; CPU OS 8_4_1 like Mac OS X) AppleWebKit/600.1.4 (KHTML, like Gecko) Version/8.0 Mobile/12H321 Safari/600.1.4',
    'Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)',
    'Mozilla/5.0 (Linux; Android 6.0.1; SAMSUNG SM-G570Y Build/MMB29K) AppleWebKit/537.36 (KHTML, like Gecko) SamsungBrowser/4.0 Chrome/44.0.2403.133 Mobile Safari/537.36',
    'Mozilla/4.0 (compatible; MSIE 6.0; Windows NT 5.1; FSL 7.0.5.01003)',
    'Mozilla/5.0 (Windows NT 6.1; WOW64; rv:12.0) Gecko/20100101 Firefox/12.0',
    'Mozilla/5.0 (X11; U; Linux x86_64; de; rv:1.9.2.8) Gecko/20100723 Ubuntu/10.04 (lucid) Firefox/3.6.8',
    'Mozilla/4.0 (compatible; MSIE 7.0; Windows NT 5.1; Trident/4.0; .NET CLR 2.0.50727; .NET CLR 3.0.4506.2152; .NET CLR 3.5.30729)',
    'Mozilla/4.0 (compatible; MSIE 6.0; MSIE 5.5; Windows NT 5.0) Opera 7.02 Bork-edition [en]',
    'Mozilla/5.0 (Windows NT 6.0) AppleWebKit/535.1 (KHTML, like Gecko) Chrome/13.0.782.112 Safari/535.1',
    'Mozilla/5.0 (Windows NT 5.1; rv:13.0) Gecko/20100101 Firefox/13.0.1',
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/136.0.0.0 Safari/537.36',
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 14_5) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/136.0.0.0 Safari/537.36',
    'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/135.0.0.0 Safari/537.36',
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:137.0) Gecko/20100101 Firefox/137.0',
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 14.5; rv:137.0) Gecko/20100101 Firefox/137.0'
];
const BLOCK_RULES = [
    {
        id: 1,
        host: 'api.m.jd.com'
    },
    {
        id: 2,
        host: 'hm.baidu.com'
    },
    {
        id: 3,
        host: 'google-analytics.com'
    },
    {
        id: 4,
        host: 'googletagmanager.com'
    },
    {
        id: 5,
        host: 'fingerprintjs'
    },
    {
        id: 6,
        host: 'cnzz.com'
    },
    {
        id: 7,
        host: 'growingio.com'
    },
    {
        id: 8,
        host: 'clarity.ms'
    },
    {
        id: 9,
        host: 'hotjar.com'
    },
    {
        id: 10,
        host: 'doubleclick.net'
    }
];
async function initializeRules(
    isEnabled = true
) {
    try {
        const oldRules =
            await chrome.declarativeNetRequest
                .getDynamicRules();
        const oldRuleIds =
            oldRules.map(
                rule => rule.id
            );
        if (
            oldRuleIds.length > 0
        ) {
            await chrome.declarativeNetRequest
                .updateDynamicRules({
                    removeRuleIds:
                        oldRuleIds
                });
        }
        if (!isEnabled) {
            console.log(
                '[NextAnti] Main switch off, dynamic rules cleared.'
            );
            return;
        }
        const dynamicRules =
            BLOCK_RULES.map(rule => {
                return {
                    id: rule.id,
                    priority: 1,
                    action: {
                        type: 'block'
                    },
                    condition: {
                        urlFilter:
                            rule.host,
                        resourceTypes: [
                            'script',
                            'xmlhttprequest',
                            'sub_frame',
                            'image',
                            'ping',
                            'media',
                            'font',
                            'websocket',
                            'other'
                        ]
                    }
                };
            });
        await chrome.declarativeNetRequest
            .updateDynamicRules({
                addRules:
                    dynamicRules
            });
        console.log(
            '[NextAnti] Dynamic rules initialized.'
        );
    } catch (err) {
        console.error(
            '[NextAnti] Rule initialization failed:',
            err
        );
    }
}
async function syncRulesWithSwitch() {
    try {
        const config =
            await chrome.storage.local.get(
                'isEnabled'
            );
        await initializeRules(
            config.isEnabled !== false
        );
    } catch (e) {
        console.error(
            '[NextAnti] Sync rules failed:',
            e
        );
    }
}
function getHostnameFromUrl(url) {
    try {
        return new URL(url).hostname.toLowerCase();
    } catch (e) {
        return '';
    }
}
function isIPv4Address(hostname) {
    return (
        /^\d{1,3}(\.\d{1,3}){3}$/.test(
            hostname
        )
    );
}
function getMainDomain(hostname) {
    if (!hostname) {
        return '';
    }
    if (
        hostname === 'localhost' ||
        isIPv4Address(hostname)
    ) {
        return hostname;
    }
    const parts = hostname
        .split('.')
        .filter(Boolean);
    if (parts.length <= 2) {
        return hostname;
    }
    return parts.slice(-2).join('.');
}
function rememberMainDomainOrigin(url) {
    if (!isWebUrl(url)) {
        return '';
    }
    try {
        const parsedUrl = new URL(url);
        const hostname =
            parsedUrl.hostname.toLowerCase();
        const mainDomain =
            getMainDomain(hostname);
        if (!mainDomain) {
            return '';
        }
        if (!MAIN_DOMAIN_ORIGINS[mainDomain]) {
            MAIN_DOMAIN_ORIGINS[mainDomain] = {};
        }
        MAIN_DOMAIN_ORIGINS[mainDomain][
            parsedUrl.origin
        ] = true;
        return mainDomain;
    } catch (e) {
        return '';
    }
}
async function clearMainDomainData(mainDomain) {
    if (!mainDomain) {
        return;
    }
    try {
        const originMap =
            MAIN_DOMAIN_ORIGINS[mainDomain] || {};
        const origins = Object.keys(originMap);
        if (origins.length > 0) {
            await chrome.browsingData.remove(
                {
                    origins
                },
                {
                    cache: true,
                    cookies: true,
                    localStorage: true,
                    indexedDB: true,
                    serviceWorkers: true,
                    cacheStorage: true,
                    fileSystems: true,
                    webSQL: true
                }
            );
        }
        if (
            chrome.cookies &&
            chrome.cookies.getAll &&
            chrome.cookies.remove
        ) {
            const cookies =
                await chrome.cookies.getAll({
                    domain: mainDomain
                });
            await Promise.all(
                cookies.map(cookie => {
                    const cookieDomain =
                        cookie.domain.replace(
                            /^\./,
                            ''
                        );
                    const cookieUrl = `${
                        cookie.secure
                            ? 'https'
                            : 'http'
                    }://${cookieDomain}${
                        cookie.path
                    }`;
                    return chrome.cookies.remove(
                        {
                            url: cookieUrl,
                            name: cookie.name,
                            storeId:
                                cookie.storeId
                        }
                    );
                })
            );
        }
        delete MAIN_DOMAIN_ORIGINS[mainDomain];
        console.log(
            '[NextAnti] Cleared previous main domain:',
            mainDomain
        );
    } catch (e) {
        console.error(
            '[NextAnti] Clear main domain data failed:',
            mainDomain,
            e
        );
    }
}
async function maybeAutoCleanPreviousMainDomain(
    tabId,
    url
) {
    if (
        tabId === undefined ||
        tabId === null ||
        tabId === -1
    ) {
        return;
    }
    const currentMainDomain =
        rememberMainDomainOrigin(url);
    if (!currentMainDomain) {
        return;
    }
    const previousMainDomain =
        TAB_LAST_MAIN_DOMAIN[tabId];
    TAB_LAST_MAIN_DOMAIN[tabId] =
        currentMainDomain;
    if (
        !previousMainDomain ||
        previousMainDomain ===
            currentMainDomain
    ) {
        return;
    }
    const config =
        await chrome.storage.local.get([
            'isEnabled',
            'autoCleanPrevDomain'
        ]);
    if (
        config.isEnabled === false ||
        config.autoCleanPrevDomain === false
    ) {
        return;
    }
    await clearMainDomainData(
        previousMainDomain
    );
}
function isWebUrl(url) {
    return (
        typeof url === 'string' &&
        /^https?:\/\//i.test(url)
    );
}
function pickRandomUA(exceptUA = '') {
    if (UA_POOL.length === 0) {
        return '';
    }
    if (UA_POOL.length === 1) {
        return UA_POOL[0];
    }
    let picked =
        UA_POOL[
            Math.floor(
                Math.random() * UA_POOL.length
            )
        ];
    if (picked === exceptUA) {
        picked =
            UA_POOL[
                (UA_POOL.indexOf(picked) + 1) %
                    UA_POOL.length
            ];
    }
    return picked;
}
function isPrivateOrReservedIPv4(
    first,
    second
) {
    if (
        first === 0 ||
        first === 10 ||
        first === 127
    ) {
        return true;
    }
    if (first === 169 && second === 254) {
        return true;
    }
    if (
        first === 172 &&
        second >= 16 &&
        second <= 31
    ) {
        return true;
    }
    if (first === 192 && second === 168) {
        return true;
    }
    if (
        first === 100 &&
        second >= 64 &&
        second <= 127
    ) {
        return true;
    }
    return false;
}
function generateRandomForwardedForIp() {
    while (true) {
        const first =
            Math.floor(Math.random() * 223) + 1;
        const second = Math.floor(
            Math.random() * 256
        );
        if (
            isPrivateOrReservedIPv4(
                first,
                second
            )
        ) {
            continue;
        }
        const third = Math.floor(
            Math.random() * 256
        );
        const fourth = Math.floor(
            Math.random() * 256
        );
        return `${first}.${second}.${third}.${fourth}`;
    }
}
function hashCode(input) {
    let hash = 0;
    for (let i = 0; i < input.length; i++) {
        hash =
            (hash * 31 + input.charCodeAt(i)) |
            0;
    }
    return Math.abs(hash);
}
function getRuleIdForSite(site) {
    const hash = hashCode(site);
    return (
        UA_RULE_ID_BASE +
        (hash % UA_RULE_ID_LIMIT)
    );
}
async function upsertSiteUARule(
    site,
    ua,
    forwardedFor
) {
    if (!site || !ua || !forwardedFor) {
        return;
    }
    const ruleId = getRuleIdForSite(site);
    const existingSite =
        Object.keys(SITE_UA_STATE).find(
            key =>
                SITE_UA_STATE[key].ruleId ===
                    ruleId && key !== site
        );
    const removeRuleIds = new Set([
        ruleId
    ]);
    if (existingSite) {
        removeRuleIds.add(
            SITE_UA_STATE[existingSite]
                .ruleId
        );
        delete SITE_UA_STATE[existingSite];
    }
    await chrome.declarativeNetRequest.updateSessionRules(
        {
            removeRuleIds: Array.from(
                removeRuleIds
            ),
            addRules: [
                {
                    id: ruleId,
                    priority: 2,
                    action: {
                        type: 'modifyHeaders',
                        requestHeaders: [
                            {
                                header:
                                    'User-Agent',
                                operation: 'set',
                                value: ua
                            },
                            {
                                header:
                                    'X-Forwarded-For',
                                operation: 'set',
                                value: forwardedFor
                            }
                        ]
                    },
                    condition: {
                        requestDomains: [site],
                        resourceTypes:
                            UA_RESOURCE_TYPES
                    }
                }
            ]
        }
    );
    SITE_UA_STATE[site] = {
        ruleId,
        ua,
        forwardedFor,
        updatedAt: Date.now()
    };
}
async function rotateSiteUA(url) {
    if (!isWebUrl(url)) {
        return;
    }
    const site =
        getHostnameFromUrl(url);
    if (!site) {
        return;
    }
    const oldUA =
        SITE_UA_STATE[site]?.ua || '';
    const ua = pickRandomUA(oldUA);
    const forwardedFor =
        generateRandomForwardedForIp();
    await upsertSiteUARule(
        site,
        ua,
        forwardedFor
    );
    console.log(
        '[NextAnti] UA rotated:',
        site,
        ua,
        'X-Forwarded-For:',
        forwardedFor
    );
}
async function clearAllSiteUARules() {
    try {
        const rules =
            await chrome.declarativeNetRequest.getSessionRules();
        const removeRuleIds = rules
            .map(rule => rule.id)
            .filter(
                id =>
                    id >= UA_RULE_ID_BASE &&
                    id <
                        UA_RULE_ID_BASE +
                            UA_RULE_ID_LIMIT
            );
        if (removeRuleIds.length > 0) {
            await chrome.declarativeNetRequest.updateSessionRules(
                {
                    removeRuleIds
                }
            );
        }
        for (const key of Object.keys(
            SITE_UA_STATE
        )) {
            delete SITE_UA_STATE[key];
        }
    } catch (e) {
        console.error(
            '[NextAnti] Clear UA rules failed:',
            e
        );
    }
}
async function ensureSiteStatsLoaded() {
    if (siteStatsLoaded) {
        return;
    }
    try {
        const data =
            await chrome.storage.local.get(
                'siteBlockStats'
            );
        const stats =
            data.siteBlockStats || {};
        for (const [site, count] of Object.entries(
            stats
        )) {
            const safeCount =
                Number(count) || 0;
            if (safeCount > 0) {
                SITE_BLOCK_STATS[site] =
                    safeCount;
            }
        }
        siteStatsLoaded = true;
    } catch (e) {
        console.error(
            '[NextAnti] Load site stats failed:',
            e
        );
    }
}
function persistSiteStats() {
    if (persistStatsTimer) {
        clearTimeout(persistStatsTimer);
    }
    persistStatsTimer = setTimeout(
        async () => {
            try {
                await chrome.storage.local.set({
                    siteBlockStats:
                        SITE_BLOCK_STATS
                });
            } catch (e) {
                console.error(
                    '[NextAnti] Persist site stats failed:',
                    e
                );
            }
        },
        150
    );
}
async function increaseSiteBlockCount(
    tabId,
    pageUrl
) {
    await ensureSiteStatsLoaded();
    let site = getHostnameFromUrl(pageUrl);
    if (
        !site &&
        tabId !== undefined &&
        tabId !== null &&
        tabId !== -1
    ) {
        try {
            const tab =
                await chrome.tabs.get(tabId);
            site = getHostnameFromUrl(
                tab?.url
            );
        } catch (e) {}
    }
    if (!site) {
        return;
    }
    SITE_BLOCK_STATS[site] =
        (SITE_BLOCK_STATS[site] || 0) + 1;
    persistSiteStats();
}
chrome.runtime.onInstalled.addListener(
    async () => {
        console.log(
            '[NextAnti] Installed.'
        );
        const existingConfig =
            await chrome.storage.local.get([
                'isEnabled',
                'fingerprintEnabled',
                'webrtcEnabled',
                'autoCleanPrevDomain'
            ]);
        const nextConfig = {
            isEnabled:
                existingConfig.isEnabled !== false,
            fingerprintEnabled:
                existingConfig.fingerprintEnabled !==
                false,
            webrtcEnabled:
                existingConfig.webrtcEnabled !== false,
            autoCleanPrevDomain:
                existingConfig.autoCleanPrevDomain !==
                false
        };
        await chrome.storage.local.set(
            nextConfig
        );
        await clearAllSiteUARules();
        await ensureSiteStatsLoaded();
        await initializeRules(
            nextConfig.isEnabled
        );
    }
);
chrome.runtime.onStartup.addListener(
    async () => {
        console.log(
            '[NextAnti] Startup.'
        );
        await clearAllSiteUARules();
        await ensureSiteStatsLoaded();
        await syncRulesWithSwitch();
    }
);
chrome.storage.onChanged.addListener(
    async (changes, areaName) => {
        if (
            areaName !== 'local' ||
            !changes.isEnabled
        ) {
            return;
        }
        await initializeRules(
            changes.isEnabled.newValue !== false
        );
    }
);
async function updateBadge(tabId) {
    try {
        const count =
            TAB_COUNTER[tabId] || 0;
        if (count > 0) {
            await chrome.action
                .setBadgeText({
                    tabId,
                    text: String(count)
                });
            await chrome.action
                .setBadgeBackgroundColor({
                    tabId,
                    color: '#E74C3C'
                });
        } else {
            await chrome.action
                .setBadgeText({
                    tabId,
                    text: ''
                });
        }
    } catch (e) {
        console.error(
            '[NextAnti] Badge update failed:',
            e
        );
    }
}
async function handleBlock(
    url,
    tabId,
    pageUrl
) {
    try {
        if (
            tabId &&
            tabId !== -1
        ) {
            TAB_COUNTER[tabId] =
                (TAB_COUNTER[tabId] || 0) + 1;
            await updateBadge(tabId);
        }
        await increaseSiteBlockCount(
            tabId,
            pageUrl
        );
        let hostname = url;
        try {
            hostname =
                new URL(url).hostname;
        } catch (e) {}
        chrome.notifications.create({
            type: 'basic',
            iconUrl:
                'icons/icon128.png',
            title:
                'NextAnti 已拦截',
            message:
                hostname
        });
        console.warn(
            '[NextAnti] Blocked:',
            url
        );
    } catch (e) {
        console.error(
            '[NextAnti] Handle block failed:',
            e
        );
    }
}
if (
    chrome.declarativeNetRequest &&
    chrome.declarativeNetRequest
        .onRuleMatchedDebug
) {
    chrome.declarativeNetRequest
        .onRuleMatchedDebug
        .addListener(
            async (info) => {
                try {
                    await handleBlock(
                        info.request.url,
                        info.request.tabId,
                        info.request.initiator
                    );
                } catch (e) {
                    console.error(
                        '[NextAnti] Debug listener error:',
                        e
                    );
                }
            }
        );
}
chrome.runtime.onMessage.addListener(
    (
        message,
        sender,
        sendResponse
    ) => {
        if (
            message.action ===
            'clearSiteData'
        ) {
            (async () => {
                try {
                    const url =
                        new URL(
                            message.tabUrl
                        );
                    await chrome.browsingData
                        .remove(
                            {
                                origins: [
                                    url.origin
                                ]
                            },
                            {
                                cache: true,
                                cookies: true,
                                localStorage: true,
                                indexedDB: true,
                                serviceWorkers: true,
                                cacheStorage: true,
                                fileSystems: true,
                                webSQL: true
                            }
                        );
                    if (
                        sender.tab?.id
                    ) {
                        TAB_COUNTER[
                            sender.tab.id
                        ] = 0;
                        await updateBadge(
                            sender.tab.id
                        );
                    }
                    sendResponse({
                        status:
                            'success'
                    });
                } catch (err) {
                    sendResponse({
                        status:
                            'error',
                        message:
                            err.message
                    });
                }
            })();
            return true;
        }
        if (
            message.action ===
            'blockDetected'
        ) {
            (async () => {
                try {
                    await handleBlock(
                        message.url,
                        sender.tab?.id,
                        sender.tab?.url
                    );
                    sendResponse({
                        status: 'ok'
                    });
                } catch (e) {
                    sendResponse({
                        status: 'error'
                    });
                }
            })();
            return true;
        }
        if (
            message.action ===
            'alert'
        ) {
            chrome.notifications.create({
                type: 'basic',
                iconUrl:
                    'icons/icon128.png',
                title:
                    'NextAnti 告警',
                message:
                    message.message
            });
            sendResponse({
                status:
                    'received'
            });
            return true;
        }
        if (
            message.action ===
            'getSiteBlockCount'
        ) {
            (async () => {
                await ensureSiteStatsLoaded();
                const site =
                    getHostnameFromUrl(
                        message.siteUrl
                    );
                sendResponse({
                    status: 'ok',
                    site,
                    count:
                        site && SITE_BLOCK_STATS[site]
                            ? SITE_BLOCK_STATS[site]
                            : 0
                });
            })();
            return true;
        }
    }
);
ensureSiteStatsLoaded();
if (
    chrome.webNavigation &&
    chrome.webNavigation
        .onBeforeNavigate
) {
    chrome.webNavigation
        .onBeforeNavigate
        .addListener(
            async (details) => {
                if (
                    details.frameId !== 0
                ) {
                    return;
                }
                await maybeAutoCleanPreviousMainDomain(
                    details.tabId,
                    details.url
                );
                await rotateSiteUA(
                    details.url
                );
            }
        );
}
chrome.tabs.onActivated.addListener(
    async (activeInfo) => {
        await updateBadge(
            activeInfo.tabId
        );
    }
);
chrome.tabs.onUpdated.addListener(
    async (
        tabId,
        changeInfo
    ) => {
        if (
            changeInfo.status ===
            'loading'
        ) {
            TAB_COUNTER[tabId] = 0;
            await updateBadge(
                tabId
            );
        }
    }
);
chrome.tabs.onRemoved.addListener(
    async (tabId) => {
        delete TAB_COUNTER[tabId];
        delete TAB_LAST_MAIN_DOMAIN[tabId];
        await chrome.action
            .setBadgeText({
                tabId,
                text: ''
            });
    }
);
if (
    chrome.webNavigation &&
    chrome.webNavigation
        .onErrorOccurred
) {
    chrome.webNavigation
        .onErrorOccurred
        .addListener(
            (details) => {
                if (
                    details.error &&
                    details.error.includes(
                        'ERR_BLOCKED_BY_CLIENT'
                    )
                ) {
                    console.warn(
                        '[NextAnti] Browser blocked request:',
                        details.url
                    );
                }
            }
        );
}
setInterval(() => {
    console.log(
        '[NextAnti] Running.'
    );
}, 1000 * 60 * 5);