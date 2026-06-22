(function () {
    'use strict';
    if (window.__NEXTANTI_CONTENT_LOADED__) {
        return;
    }
    window.__NEXTANTI_CONTENT_LOADED__ = true;
    const runtimeConfig = {
        isEnabled: true,
        fingerprintEnabled: true,
        webrtcEnabled: true,
        allowlist: []
    };
    let hasInjected = false;
    let hasMonitors = false;
    function applyConfigFromStorage(data) {
        runtimeConfig.isEnabled =
            data?.isEnabled !== false;
        runtimeConfig.fingerprintEnabled =
            data?.fingerprintEnabled !== false;
        runtimeConfig.webrtcEnabled =
            data?.webrtcEnabled !== false;
        runtimeConfig.allowlist =
            data?.allowlist || [];
    }
    function postConfigUpdate() {
        window.postMessage(
            {
                type: 'NEXTANTI_CONFIG_UPDATE',
                config: {
                    isEnabled: runtimeConfig.isEnabled,
                    fingerprintEnabled: runtimeConfig.fingerprintEnabled,
                    webrtcEnabled: runtimeConfig.webrtcEnabled,
                    allowlist: runtimeConfig.allowlist
                }
            },
            '*'
        );
    }
    async function loadConfig() {
        try {
            const data =
                await chrome.storage.local.get([
                    'isEnabled',
                    'fingerprintEnabled',
                    'webrtcEnabled',
                    'allowlist'
                ]);
            applyConfigFromStorage(data);
        } catch (e) {
            error('Load config failed:', e);
        }
    }
    function isAllowlisted() {
        try {
            const hostname = location.hostname.toLowerCase();
            const list = runtimeConfig.allowlist;
            if (!hostname || !list || !list.length) {
                return false;
            }
            return list.some(entry =>
                hostname.endsWith(entry.toLowerCase())
            );
        } catch (e) {
            return false;
        }
    }
    function log(...args) {
        console.log(
            '%c[NextAnti]',
            'color:#fff;background:#E74C3C;padding:2px 4px;border-radius:2px;',
            ...args
        );
    }
    function warn(...args) {
        console.warn(
            '%c[NextAnti]',
            'color:#fff;background:#F39C12;padding:2px 4px;border-radius:2px;',
            ...args
        );
    }
    function error(...args) {
        console.error(
            '%c[NextAnti]',
            'color:#fff;background:#C0392B;padding:2px 4px;border-radius:2px;',
            ...args
        );
    }
    function sendAlert(message) {
        try {
            chrome.runtime.sendMessage({
                action: 'alert',
                message
            });
        } catch (e) {
            error('Send alert failed:', e);
        }
    }
    function sendBlock(url) {
        try {
            chrome.runtime.sendMessage({
                action: 'blockDetected',
                url
            });
        } catch (e) {
            error('Send block failed:', e);
        }
    }
    function injectScript() {
        try {
            const script =
                document.createElement('script');
            script.src =
                chrome.runtime.getURL(
                    'inject.js'
                );
            script.dataset.nextantiConfig =
                JSON.stringify({
                    isEnabled: runtimeConfig.isEnabled,
                    fingerprintEnabled: runtimeConfig.fingerprintEnabled,
                    webrtcEnabled: runtimeConfig.webrtcEnabled,
                    allowlist: runtimeConfig.allowlist
                });
            script.type =
                'text/javascript';
            script.async = false;
            script.onload = function () {
                log('inject.js loaded.');
                this.remove();
                postConfigUpdate();
            };
            (
                document.head ||
                document.documentElement
            ).appendChild(script);
        } catch (e) {
            error(
                'Inject failed:',
                e
            );
        }
    }
    function detectHoneypotFeatures() {
        if (isAllowlisted() || !runtimeConfig.isEnabled) {
            return;
        }
        try {
            const html =
                document.documentElement
                    .innerHTML
                    .toLowerCase();
            const features = [
                {
                    name: 'HFish',
                    signs: [
                        'hfish',
                        'x_hfish',
                        'hfish.js'
                    ]
                },
                {
                    name: 'BeEF',
                    signs: [
                        'hook.js',
                        'beef.net'
                    ]
                },
                {
                    name: 'OpenCanary',
                    signs: [
                        'canary',
                        'canarytoken'
                    ]
                },
                {
                    name: 'FingerprintJS',
                    signs: [
                        'fingerprintjs',
                        'fingerprint2'
                    ]
                },
                {
                    name:
                        'Browser Fingerprint',
                    signs: [
                        'canvas fingerprint',
                        'audio fingerprint',
                        'webgl fingerprint'
                    ]
                }
            ];
            for (const feature of features) {
                for (const sign of feature.signs) {
                    if (
                        html.includes(sign)
                    ) {
                        sendAlert(
                            `检测到疑似蜜罐/指纹特征: ${feature.name}`
                        );
                        warn(
                            'Detected feature:',
                            feature.name
                        );
                        return;
                    }
                }
            }
        } catch (e) {
            error(
                'Feature detect failed:',
                e
            );
        }
    }
    function detectObfuscatedScripts() {
        if (isAllowlisted() || !runtimeConfig.isEnabled) {
            return;
        }
        try {
            const scripts =
                document.querySelectorAll(
                    'script'
                );
            for (const script of scripts) {
                const code =
                    script.innerText || '';
                if (
                    /_0x[a-f0-9]{4,}/i.test(code) ||
                    code.includes(
                        'eval(function(p,a,c,k,e,d)'
                    )
                ) {
                    sendAlert(
                        '检测到高度混淆 JavaScript'
                    );
                    warn(
                        'Obfuscated JS detected.'
                    );
                    return;
                }
            }
        } catch (e) {
            error(
                'Obfuscation detect failed:',
                e
            );
        }
    }
    function monitorDynamicScripts() {
        try {
            const observer =
                new MutationObserver(
                    (mutations) => {
                        for (const mutation of mutations) {
                            for (
                                const node of mutation.addedNodes
                            ) {
                                if (
                                    !node ||
                                    node.tagName !== 'SCRIPT'
                                ) {
                                    continue;
                                }
                                const src =
                                    node.src || '';
                                if (src) {
                                    warn(
                                        'Dynamic script:',
                                        src
                                    );
                                }
                                const lower =
                                    src.toLowerCase();
                                if (
                                    isAllowlisted() ||
                                    !runtimeConfig.isEnabled
                                ) {
                                    continue;
                                }
                                if (
                                    lower.includes(
                                        'fingerprint'
                                    ) ||
                                    lower.includes(
                                        'analytics'
                                    ) ||
                                    lower.includes(
                                        'tracker'
                                    ) ||
                                    lower.includes(
                                        'clarity'
                                    ) ||
                                    lower.includes(
                                        'hotjar'
                                    )
                                ) {
                                    sendAlert(
                                        `发现可疑动态脚本: ${src}`
                                    );
                                    sendBlock(src);
                                }
                            }
                        }
                    }
                );
            observer.observe(
                document,
                {
                    childList: true,
                    subtree: true
                }
            );
        } catch (e) {
            error(
                'MutationObserver failed:',
                e
            );
        }
    }
    function monitorClipboard() {
        document.addEventListener(
            'copy',
            () => {
                if (
                    isAllowlisted() ||
                    !runtimeConfig.isEnabled
                ) {
                    return;
                }
                warn(
                    '页面触发 copy 事件'
                );
            },
            true
        );
        document.addEventListener(
            'paste',
            () => {
                if (
                    isAllowlisted() ||
                    !runtimeConfig.isEnabled
                ) {
                    return;
                }
                warn(
                    '页面监听 paste 事件'
                );
                sendAlert(
                    '页面正在监听粘贴内容'
                );
            },
            true
        );
    }
    function monitorStorageAccess() {
        try {
            const originalLocalSet =
                localStorage.setItem;
            localStorage.setItem =
                function (
                    key,
                    value
                ) {
                    if (
                        isAllowlisted() ||
                        !runtimeConfig.isEnabled
                    ) {
                        return originalLocalSet.apply(
                            this,
                            arguments
                        );
                    }
                    warn(
                        'localStorage.setItem:',
                        key
                    );
                    return originalLocalSet.apply(
                        this,
                        arguments
                    );
                };
            const originalSessionSet =
                sessionStorage.setItem;
            sessionStorage.setItem =
                function (
                    key,
                    value
                ) {
                    if (
                        isAllowlisted() ||
                        !runtimeConfig.isEnabled
                    ) {
                        return originalSessionSet.apply(
                            this,
                            arguments
                        );
                    }
                    warn(
                        'sessionStorage.setItem:',
                        key
                    );
                    return originalSessionSet.apply(
                        this,
                        arguments
                    );
                };
        } catch (e) {
            error(
                'Storage monitor failed:',
                e
            );
        }
    }
    function detectHiddenIframes() {
        if (isAllowlisted() || !runtimeConfig.isEnabled) {
            return;
        }
        try {
            const iframes =
                document.querySelectorAll(
                    'iframe'
                );
            for (const iframe of iframes) {
                const style =
                    window.getComputedStyle(
                        iframe
                    );
                if (
                    style.display === 'none' ||
                    style.visibility === 'hidden' ||
                    iframe.width === '0' ||
                    iframe.height === '0'
                ) {
                    warn(
                        'Hidden iframe detected:',
                        iframe.src
                    );
                    if (iframe.src) {
                        sendBlock(
                            iframe.src
                        );
                    }
                }
            }
        } catch (e) {
            error(
                'Iframe detect failed:',
                e
            );
        }
    }
    function monitorEvalUsage() {
        try {
            const originalEval =
                window.eval;
            window.eval =
                function () {
                    if (
                        isAllowlisted() ||
                        !runtimeConfig.isEnabled
                    ) {
                        return originalEval.apply(
                            this,
                            arguments
                        );
                    }
                    warn(
                        'eval execution detected.'
                    );
                    sendAlert(
                        '页面调用 eval'
                    );
                    return originalEval.apply(
                        this,
                        arguments
                    );
                };
        } catch (e) {
            error(
                'Eval monitor failed:',
                e
            );
        }
    }
    function monitorFetchRequests() {
        try {
            const originalFetch =
                window.fetch;
            window.fetch =
                async function (
                    ...args
                ) {
                    try {
                        if (
                            isAllowlisted() ||
                            !runtimeConfig.isEnabled
                        ) {
                            return originalFetch.apply(
                                this,
                                args
                            );
                        }
                        const url =
                            args[0];
                        if (
                            typeof url === 'string'
                        ) {
                            const lower =
                                url.toLowerCase();
                            if (
                                lower.includes(
                                    'fingerprint'
                                ) ||
                                lower.includes(
                                    'analytics'
                                ) ||
                                lower.includes(
                                    'tracker'
                                )
                            ) {
                                warn(
                                    'Suspicious fetch:',
                                    url
                                );
                                sendBlock(
                                    url
                                );
                            }
                        }
                    } catch (e) {}
                    return originalFetch.apply(
                        this,
                        args
                    );
                };
        } catch (e) {
            error(
                'Fetch monitor failed:',
                e
            );
        }
    }
    function monitorXHR() {
        try {
            const originalOpen =
                XMLHttpRequest.prototype.open;
            XMLHttpRequest.prototype.open =
                function (
                    method,
                    url
                ) {
                    try {
                        if (
                            isAllowlisted() ||
                            !runtimeConfig.isEnabled
                        ) {
                            return originalOpen.apply(
                                this,
                                arguments
                            );
                        }
                        if (
                            typeof url === 'string'
                        ) {
                            const lower =
                                url.toLowerCase();
                            if (
                                lower.includes(
                                    'fingerprint'
                                ) ||
                                lower.includes(
                                    'analytics'
                                ) ||
                                lower.includes(
                                    'tracker'
                                )
                            ) {
                                warn(
                                    'Suspicious XHR:',
                                    url
                                );
                                sendBlock(
                                    url
                                );
                            }
                        }
                    } catch (e) {}
                    return originalOpen.apply(
                        this,
                        arguments
                    );
                };
        } catch (e) {
            error(
                'XHR monitor failed:',
                e
            );
        }
    }
    function init() {
        if (!hasInjected) {
            log(
                'Content script initialized.'
            );
            injectScript();
            hasInjected = true;
        }
        if (!runtimeConfig.isEnabled) {
            log(
                'Protection disabled by main switch.'
            );
            return;
        }
        if (hasMonitors) {
            return;
        }
        detectHoneypotFeatures();
        detectObfuscatedScripts();
        monitorDynamicScripts();
        monitorClipboard();
        monitorStorageAccess();
        detectHiddenIframes();
        monitorEvalUsage();
        monitorFetchRequests();
        monitorXHR();
        hasMonitors = true;
    }
    window.addEventListener(
        'message',
        (event) => {
            if (
                event.source !== window
            ) {
                return;
            }
            const data =
                event.data;
            if (!data) {
                return;
            }
            if (
                data.type ===
                'NEXTANTI_BLOCK'
            ) {
                if (!isAllowlisted()) {
                    sendBlock(
                        data.url
                    );
                }
            }
            if (
                data.type ===
                'NEXTANTI_ALERT'
            ) {
                if (!isAllowlisted()) {
                    sendAlert(
                        data.message
                    );
                }
            }
        }
    );
    chrome.storage.onChanged.addListener(
        (changes, areaName) => {
            if (
                areaName !== 'local'
            ) {
                return;
            }
            if (
                changes.isEnabled
            ) {
                runtimeConfig.isEnabled =
                    changes.isEnabled.newValue !==
                    false;
            }
            if (
                changes.fingerprintEnabled
            ) {
                runtimeConfig.fingerprintEnabled =
                    changes.fingerprintEnabled
                        .newValue !== false;
            }
            if (
                changes.webrtcEnabled
            ) {
                runtimeConfig.webrtcEnabled =
                    changes.webrtcEnabled.newValue !==
                    false;
            }
            if (
                changes.allowlist
            ) {
                runtimeConfig.allowlist =
                    changes.allowlist.newValue || [];
            }
            postConfigUpdate();
            if (
                runtimeConfig.isEnabled &&
                !hasMonitors
            ) {
                init();
            }
        }
    );
    async function bootstrap() {
        let domReady = document.readyState !== 'loading';
        if (!domReady) {
            document.addEventListener('DOMContentLoaded', () => { domReady = true; });
        }
        await loadConfig();
        if (domReady || document.readyState !== 'loading') {
            init();
        } else {
            document.addEventListener('DOMContentLoaded', init);
        }
    }
    bootstrap();
})();