'use strict';
const TAB_COUNTER = {};
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
async function initializeRules() {
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
chrome.runtime.onInstalled.addListener(
    async () => {
        console.log(
            '[NextAnti] Installed.'
        );
        await initializeRules();
        await chrome.storage.local.set({
            isEnabled: true,
            fingerprintEnabled: true,
            webrtcEnabled: true
        });
    }
);
chrome.runtime.onStartup.addListener(
    async () => {
        console.log(
            '[NextAnti] Startup.'
        );
        await initializeRules();
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
    tabId
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
                        info.request.tabId
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
                        sender.tab?.id
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
    }
);
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