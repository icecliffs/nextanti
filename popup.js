'use strict';
document.addEventListener(
    'DOMContentLoaded',
    async () => {
        const interceptCount =
            document.getElementById(
                'interceptCount'
            );
        const mainSwitch =
            document.getElementById(
                'mainSwitch'
            );
        const fingerprintSwitch =
            document.getElementById(
                'fingerprintSwitch'
            );
        const webrtcSwitch =
            document.getElementById(
                'webrtcSwitch'
            );
        const clearDataBtn =
            document.getElementById(
                'clearDataBtn'
            );
        const reloadBtn =
            document.getElementById(
                'reloadBtn'
            );
        async function initialize() {
            try {
                const data =
                    await chrome.storage.local.get([
                        'blockCount',
                        'isEnabled',
                        'fingerprintEnabled',
                        'webrtcEnabled'
                    ]);
                interceptCount.textContent =
                    data.blockCount || 0;
                mainSwitch.checked =
                    data.isEnabled !== false;
                fingerprintSwitch.checked =
                    data.fingerprintEnabled !== false;
                webrtcSwitch.checked =
                    data.webrtcEnabled !== false;
            } catch (e) {
                console.error(
                    '[NextAnti]',
                    e
                );
            }
        }
        await initialize();
        mainSwitch.addEventListener(
            'change',
            async () => {
                const enabled =
                    mainSwitch.checked;
                await chrome.storage.local.set({
                    isEnabled: enabled
                });
                console.log(
                    '[NextAnti] Main switch:',
                    enabled
                );
                notify(
                    enabled
                        ? 'NextAnti 已启用'
                        : 'NextAnti 已关闭'
                );
            }
        );
        fingerprintSwitch.addEventListener(
            'change',
            async () => {
                const enabled =
                    fingerprintSwitch.checked;
                await chrome.storage.local.set({
                    fingerprintEnabled:
                        enabled
                });
                console.log(
                    '[NextAnti] Fingerprint:',
                    enabled
                );
                notify(
                    enabled
                        ? '指纹混淆已启用'
                        : '指纹混淆已关闭'
                );
            }
        );
        // ====================================
        // WebRTC 开关
        // ====================================
        webrtcSwitch.addEventListener(
            'change',
            async () => {
                const enabled =
                    webrtcSwitch.checked;
                await chrome.storage.local.set({
                    webrtcEnabled:
                        enabled
                });
                console.log(
                    '[NextAnti] WebRTC:',
                    enabled
                );
                notify(
                    enabled
                        ? 'WebRTC 防泄漏已启用'
                        : 'WebRTC 防泄漏已关闭'
                );
            }
        );
        // ====================================
        // 清除站点数据
        // ====================================
        clearDataBtn.addEventListener(
            'click',
            async () => {
                const confirmed =
                    confirm(
                        '确定清除当前网站所有缓存、Cookie 与本地存储数据？'
                    );
                if (!confirmed) {
                    return;
                }
                try {
                    const tabs =
                        await chrome.tabs.query({
                            active: true,
                            currentWindow: true
                        });
                    const tab = tabs[0];
                    if (!tab?.url) {
                        notify(
                            '无法获取当前页面'
                        );
                        return;
                    }
                    chrome.runtime.sendMessage(
                        {
                            action:
                                'clearSiteData',
                            tabUrl: tab.url
                        },
                        (response) => {
                            if (
                                response &&
                                response.status ===
                                    'success'
                            ) {
                                notify(
                                    '站点数据清除成功'
                                );
                                window.close();
                            } else {
                                notify(
                                    '清除失败'
                                );
                            }
                        }
                    );
                } catch (e) {
                    console.error(e);
                    notify(
                        '清除失败'
                    );
                }
            }
        );
        // ====================================
        // 重新加载页面
        // ====================================
        reloadBtn.addEventListener(
            'click',
            async () => {
                try {
                    const tabs =
                        await chrome.tabs.query({
                            active: true,
                            currentWindow: true
                        });
                    const tab = tabs[0];
                    if (tab?.id) {
                        await chrome.tabs.reload(
                            tab.id
                        );
                        notify(
                            '页面已重新加载'
                        );
                    }
                } catch (e) {
                    console.error(e);
                    notify(
                        '刷新失败'
                    );
                }
            }
        );
        // ====================================
        // storage 实时同步
        // ====================================
        chrome.storage.onChanged.addListener(
            (
                changes,
                areaName
            ) => {
                if (
                    areaName !== 'local'
                ) {
                    return;
                }
                if (
                    changes.blockCount
                ) {
                    interceptCount.textContent =
                        changes.blockCount
                            .newValue || 0;
                }
                if (
                    changes.isEnabled
                ) {
                    mainSwitch.checked =
                        changes.isEnabled
                            .newValue;
                }
                if (
                    changes.fingerprintEnabled
                ) {
                    fingerprintSwitch.checked =
                        changes
                            .fingerprintEnabled
                            .newValue;
                }
                if (
                    changes.webrtcEnabled
                ) {
                    webrtcSwitch.checked =
                        changes
                            .webrtcEnabled
                            .newValue;
                }
            }
        );
        // ====================================
        // 通知
        // ====================================
        function notify(message) {
            console.log(
                '[NextAnti]',
                message
            );
        }
    }
);