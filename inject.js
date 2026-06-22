function reportBlock(url) {
    try {
        window.postMessage({
            type: 'NEXTANTI_BLOCK',
            url
        }, '*');
    } catch (e) {}
}
(function () {
    'use strict';
    if (window.__NEXTANTI_INJECT_LOADED__) {
        return;
    }
    window.__NEXTANTI_INJECT_LOADED__ = true;
    const runtimeConfig = {
        isEnabled: true,
        fingerprintEnabled: true,
        webrtcEnabled: true,
        allowlist: []
    };
    try {
        const rawConfig =
            document.currentScript?.dataset
                ?.nextantiConfig;
        if (rawConfig) {
            const parsedConfig =
                JSON.parse(rawConfig);
            runtimeConfig.isEnabled =
                parsedConfig.isEnabled !== false;
            runtimeConfig.fingerprintEnabled =
                parsedConfig.fingerprintEnabled !==
                false;
            runtimeConfig.webrtcEnabled =
                parsedConfig.webrtcEnabled !== false;
            runtimeConfig.allowlist =
                parsedConfig.allowlist || [];
        }
    } catch (e) {}
    const BLACKLIST = ["account.itpub.net", "accounts.ctrip.com", "ajax.58pic.com", "api.csdn.net", "api.ip.sb", "api.passport.pptv.com", "bbs.zhibo8.cc", "bit.ly", "blog.csdn.net", "blog.itpub.net", "c.v.qq.com", "chinaunix.net", "cmstool.youku.com", "comment.api.163.com", "databack.dangdang.com", "dimg01.c-ctrip.com", "down2.uc.cn", "github.com", "hd.huya.com", "home.51cto.com", "home.ctfile.com", "home.zhibo8.cc", "hudong.vip.youku.com", "i.jrj.com.cn", "iask.sina.com.cn", "itunes.apple.com", "m.ctrip.com", "m.game.weibo.cn", "mapp.jrj.com.cn", "my.zol.com.cn","passport.ctrip.com", "passport.game.renren.com", "passport.iqiyi.com", "playbill.api.mgtv.com", "renren.com", "skylink.io", "u.faloo.com", "ucenter.51cto.com", "v.huya.com", "v2.sohu.com", "vote2.pptv.com", "wap.sogou.com", "webapi.ctfile.com", "weibo.com", "www.58pic.com", "www.iqiyi.com", "www.iteye.com", "www.zbj.com", "www.cndns.com", "mozilla.github.io", "www.sitestar.cn", "api.fastadmin.net", "m.site.baidu.com", "restapi.amap.com", "login.sina.com.cn", "now.qq.com", "message.dangdang.com", "musicapi.taihe.com", "api-live.iqiyi.com", "api.m.jd.com", "tie.163.com", "pcw-api.iqiyi.com", "so.v.ifeng.com", "passport.baidu.com", "wz.cnblogs.com", "passport.cnblogs.com", "hzs14.cnzz.com", "mths.be", "validity.thatscaptaintoyou.com", "stc.iqiyipic.com", "s14.cnzz.com", "sb.scorecardresearch.com", "js.cndns.com", "datax.baidu.com", "assets.growingio.com", "www.gnu.org", "wappassalltest.baidu.com", "baike.baidu.com", "ka.sina.com.cn", "p.qiao.baidu.com", "map.baidu.com", "www.dangdang.com", "g.alicdn.com", "s.faloo.com", "msg.qy.net", "morn.cndns.com", "i.qr.weibo.cn", "github.comgithub.com", "uis.i.sohu.com", "www.tianya.cn", "passport.mop.com", "commapi.dangdang.com", "comment.money.163.com", "chaxun.1616.net", "tieba.baidu.com", "remind.hupu.com", "service.bilibili.com", "node.video.qq.com", "api.weibo.com", "www.jiyoujia.com", "zhifu.baidu.com", "m.iask.sina.com.cn", "api.m.jd.com"];
    const SUSPICIOUS_KEYWORDS = [
        'jsonp',
        'callback',
        'fingerprint',
        'canvas',
        'webgl',
        'audiocontext',
        'getclientrects',
        'enumeratedevices',
        'webrtc',
        'deviceid',
        'track',
        'analytics'
    ];
    const originalToString =
        Function.prototype.toString;
    const nativeMap = new WeakMap();
    Function.prototype.toString = function () {
        if (nativeMap.has(this)) {
            return nativeMap.get(this);
        }
        return originalToString.call(this);
    };
    function camouflage(func, name = '') {
        const nativeCode =
            `function ${name}() { [native code] }`;
        nativeMap.set(
            func,
            nativeCode
        );
        return func;
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
    function isMainEnabled() {
        if (isAllowlisted()) return false;
        return runtimeConfig.isEnabled !== false;
    }
    function isFingerprintEnabled() {
        return (
            isMainEnabled() &&
            runtimeConfig.fingerprintEnabled !==
                false
        );
    }
    function isWebRTCEnabled() {
        return (
            isMainEnabled() &&
            runtimeConfig.webrtcEnabled !== false
        );
    }
    function isBlacklisted(url) {
        try {
            if (!url) {
                return false;
            }
            return BLACKLIST.some(rule =>
                url
                    .toLowerCase()
                    .includes(rule.toLowerCase())
            );
        } catch (e) {
            return false;
        }
    }
    function isSuspicious(url) {
        try {
            if (!url) {
                return false;
            }
            return SUSPICIOUS_KEYWORDS.some(rule =>
                url
                    .toLowerCase()
                    .includes(rule.toLowerCase())
            );
        } catch (e) {
            return false;
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
    function shouldBlock(url) {
        if (isAllowlisted() || !isMainEnabled()) {
            return false;
        }
        return (
            isBlacklisted(url) ||
            isSuspicious(url)
        );
    }
    const originalCreateElement =
        Document.prototype.createElement;
    Document.prototype.createElement =
        camouflage(function () {
            const element =
                originalCreateElement.apply(
                    this,
                    arguments
                );
            try {
                const tag =
                    arguments[0]?.toLowerCase();
                if (tag === 'script') {
                    hookScriptElement(element);
                }
            } catch (e) {}
            return element;
        }, 'createElement');
    function hookScriptElement(script) {
        try {
            const originalSetAttribute =
                script.setAttribute;
            script.setAttribute =
                camouflage(function (
                    name,
                    value
                ) {
                    if (
                        name === 'src' &&
                        shouldBlock(value)
                    ) {
                        reportBlock(value);
                        warn(
                            'Blocked Script(setAttribute):',
                            value
                        );
                        throw new Error(
                            'Blocked By NextAnti'
                        );
                    }
                    return originalSetAttribute.apply(
                        this,
                        arguments
                    );
                }, 'setAttribute');
            Object.defineProperty(
                script,
                'src',
                {
                    configurable: true,
                    get() {
                        return this.getAttribute(
                            'src'
                        );
                    },
                    set(value) {
                        if (
                            shouldBlock(value)
                        ) {
                            reportBlock(value);
                            warn(
                                'Blocked Script(src):',
                                value
                            );
                            throw new Error(
                                'Blocked By NextAnti'
                            );
                        }
                        this.setAttribute(
                            'src',
                            value
                        );
                    }
                }
            );
        } catch (e) {}
    }
    const originalAppendChild =
        Node.prototype.appendChild;
    Node.prototype.appendChild =
        camouflage(function (node) {
            try {
                if (
                    node &&
                    node.tagName === 'SCRIPT'
                ) {
                    const src =
                        node.src || '';
                    if (
                        shouldBlock(src)
                    ) {
                        reportBlock(src);
                        warn(
                            'Blocked appendChild:',
                            src
                        );
                        return node;
                    }
                }
            } catch (e) {}
            return originalAppendChild.apply(
                this,
                arguments
            );
        }, 'appendChild');
    const originalInsertBefore =
        Node.prototype.insertBefore;
    Node.prototype.insertBefore =
        camouflage(function (node) {
            try {
                if (
                    node &&
                    node.tagName === 'SCRIPT'
                ) {
                    const src =
                        node.src || '';
                    if (
                        shouldBlock(src)
                    ) {
                        reportBlock(src);
                        warn(
                            'Blocked insertBefore:',
                            src
                        );
                        return node;
                    }
                }
            } catch (e) {}
            return originalInsertBefore.apply(
                this,
                arguments
            );
        }, 'insertBefore');
    const originalFetch =
        window.fetch;
    window.fetch =
        camouflage(async function (...args) {
            try {
                const url = args[0];
                if (
                    typeof url === 'string' &&
                    shouldBlock(url)
                ) {
                    reportBlock(url);
                    warn(
                        'Blocked fetch:',
                        url
                    );
                    return Promise.reject(
                        new Error(
                            'Blocked By NextAnti'
                        )
                    );
                }
            } catch (e) {}
            return originalFetch.apply(
                this,
                args
            );
        }, 'fetch');
    const originalOpen =
        XMLHttpRequest.prototype.open;
    XMLHttpRequest.prototype.open =
        camouflage(function (
            method,
            url
        ) {
            if (
                shouldBlock(url)
            ) {
                reportBlock(url);
                warn(
                    'Blocked XHR:',
                    url
                );
                throw new Error(
                    'Blocked By NextAnti'
                );
            }
            return originalOpen.apply(
                this,
                arguments
            );
        }, 'open');
    const OriginalWebSocket =
        window.WebSocket;
    window.WebSocket =
        camouflage(function (
            url,
            protocols
        ) {
            if (
                shouldBlock(url)
            ) {
                reportBlock(url);
                warn(
                    'Blocked WebSocket:',
                    url
                );
                throw new Error(
                    'Blocked By NextAnti'
                );
            }
            return new OriginalWebSocket(
                url,
                protocols
            );
        }, 'WebSocket');
    window.WebSocket.prototype =
        OriginalWebSocket.prototype;
    const originalGetImageData =
        CanvasRenderingContext2D
            .prototype
            .getImageData;
    CanvasRenderingContext2D
        .prototype
        .getImageData =
        camouflage(function () {
            if (!isFingerprintEnabled()) {
                return originalGetImageData.apply(
                    this,
                    arguments
                );
            }
            const imageData =
                originalGetImageData.apply(
                    this,
                    arguments
                );
            for (
                let i = 0;
                i < imageData.data.length;
                i += 4
            ) {
                imageData.data[i] ^= 1;
            }
            warn(
                'Canvas fingerprint attempt.'
            );
            return imageData;
        }, 'getImageData');
    if (
        window.AudioBuffer &&
        AudioBuffer.prototype.getChannelData
    ) {
        const originalGetChannelData =
            AudioBuffer.prototype
                .getChannelData;
        AudioBuffer.prototype
            .getChannelData =
            camouflage(function () {
                if (!isFingerprintEnabled()) {
                    return originalGetChannelData.apply(
                        this,
                        arguments
                    );
                }
                const data =
                    originalGetChannelData.apply(
                        this,
                        arguments
                    );
                for (
                    let i = 0;
                    i < data.length;
                    i++
                ) {
                    data[i] += (
                        Math.random() * 0.00001
                    );
                }
                warn(
                    'Audio fingerprint attempt.'
                );
                return data;
            }, 'getChannelData');
    }
    if (
        window.WebGLRenderingContext
    ) {
        const originalGetParameter =
            WebGLRenderingContext
                .prototype
                .getParameter;
        WebGLRenderingContext
            .prototype
            .getParameter =
            camouflage(function (param) {
                if (!isFingerprintEnabled()) {
                    return originalGetParameter.apply(
                        this,
                        arguments
                    );
                }
                const fakeValues = {
                    37445: 'Intel Inc.',
                    37446: 'Intel Iris OpenGL'
                };
                if (
                    fakeValues[param]
                ) {
                    warn(
                        'WebGL fingerprint attempt.'
                    );
                    return fakeValues[param];
                }
                return originalGetParameter.apply(
                    this,
                    arguments
                );
            }, 'getParameter');
    }
    if (
        navigator.mediaDevices &&
        navigator.mediaDevices.enumerateDevices
    ) {
        const originalEnumerateDevices =
            navigator.mediaDevices
                .enumerateDevices;
        navigator.mediaDevices
            .enumerateDevices =
            camouflage(async function () {
                if (!isFingerprintEnabled()) {
                    return originalEnumerateDevices.apply(
                        this,
                        arguments
                    );
                }
                warn(
                    'enumerateDevices attempt.'
                );
                return [];
            }, 'enumerateDevices');
    }
    if (
        window.RTCPeerConnection
    ) {
        const OriginalRTC =
            window.RTCPeerConnection;
        window.RTCPeerConnection =
            camouflage(function () {
                if (!isWebRTCEnabled()) {
                    return new OriginalRTC(
                        ...arguments
                    );
                }
                warn(
                    'WebRTC blocked.'
                );
                throw new Error(
                    'Blocked By NextAnti'
                );
            }, 'RTCPeerConnection');
        window.RTCPeerConnection.prototype =
            OriginalRTC.prototype;
    }
    try {
        const cookieDescriptor =
            Object.getOwnPropertyDescriptor(
                Document.prototype,
                'cookie'
            );
        Object.defineProperty(
            document,
            'cookie',
            {
                configurable: true,
                get() {
                    if (isMainEnabled()) {
                        warn(
                            'Cookie read attempt.'
                        );
                    }
                    return cookieDescriptor
                        .get
                        .call(document);
                },
                set(value) {
                    if (isMainEnabled()) {
                        warn(
                            'Cookie write attempt:',
                            value
                        );
                    }
                    return cookieDescriptor
                        .set
                        .call(
                            document,
                            value
                        );
                }
            }
        );
    } catch (e) {}
    try {
        const originalLocalSet =
            localStorage.setItem;
        localStorage.setItem =
            camouflage(function (
                key,
                value
            ) {
                if (!isMainEnabled()) {
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
            }, 'setItem');
    } catch (e) {}
    try {
        const originalSessionSet =
            sessionStorage.setItem;
        sessionStorage.setItem =
            camouflage(function (
                key,
                value
            ) {
                if (!isMainEnabled()) {
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
            }, 'setItem');
    } catch (e) {}
    const originalEval =
        window.eval;
    window.eval =
        camouflage(function (code) {
            if (isMainEnabled()) {
                warn(
                    'eval execution detected.'
                );
            }
            return originalEval.apply(
                this,
                arguments
            );
        }, 'eval');
    const OriginalFunction =
        window.Function;
    window.Function =
        camouflage(function (...args) {
            if (isMainEnabled()) {
                warn(
                    'Dynamic Function detected.'
                );
            }
            return OriginalFunction.apply(
                this,
                args
            );
        }, 'Function');
    window.Function.prototype =
        OriginalFunction.prototype;
    window.addEventListener(
        'message',
        (event) => {
            if (
                event.source !== window
            ) {
                return;
            }
            const data = event.data;
            if (
                !data ||
                data.type !==
                    'NEXTANTI_CONFIG_UPDATE'
            ) {
                return;
            }
            const config =
                data.config || {};
            runtimeConfig.isEnabled =
                config.isEnabled !== false;
            runtimeConfig.fingerprintEnabled =
                config.fingerprintEnabled !==
                false;
            runtimeConfig.webrtcEnabled =
                config.webrtcEnabled !== false;
            runtimeConfig.allowlist =
                config.allowlist || [];
            log(
                'Runtime config updated:',
                runtimeConfig
            );
        }
    );
    setInterval(() => {
        if (!isMainEnabled()) return;
        const start =
            performance.now();
        const end =
            performance.now();
        if (
            end - start > 100
        ) {
            warn(
                'DevTools debugger detected.'
            );
        }
    }, 3000);
    document.addEventListener(
        'visibilitychange',
        () => {
            if (!isMainEnabled()) return;
            warn(
                'Visibility changed:',
                document.visibilityState
            );
        }
    );
    document.addEventListener(
        'copy',
        () => {
            if (!isMainEnabled()) return;
            warn(
                'Copy event.'
            );
        },
        true
    );
    document.addEventListener(
        'paste',
        () => {
            if (!isMainEnabled()) return;
            warn(
                'Paste event.'
            );
        },
        true
    );
    log(
        'Inject script initialized.'
    );
})();