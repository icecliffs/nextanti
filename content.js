(function () {
    'use strict';
    if (window.__NEXTANTI_CONTENT_LOADED__) {
        return;
    }
    window.__NEXTANTI_CONTENT_LOADED__ = true;
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
            script.type =
                'text/javascript';
            script.async = false;
            script.onload = function () {
                log('inject.js loaded.');
                this.remove();
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
                warn(
                    '页面触发 copy 事件'
                );
            },
            true
        );
        document.addEventListener(
            'paste',
            () => {
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
        log(
            'Content script initialized.'
        );
        injectScript();
        detectHoneypotFeatures();
        detectObfuscatedScripts();
        monitorDynamicScripts();
        monitorClipboard();
        monitorStorageAccess();
        detectHiddenIframes();
        monitorEvalUsage();
        monitorFetchRequests();
        monitorXHR();
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
                sendBlock(
                    data.url
                );
            }
            if (
                data.type ===
                'NEXTANTI_ALERT'
            ) {
                sendAlert(
                    data.message
                );
            }
        }
    );
    if (
        document.readyState ===
        'loading'
    ) {
        document.addEventListener(
            'DOMContentLoaded',
            init
        );
    } else {
        init();
    }
})();