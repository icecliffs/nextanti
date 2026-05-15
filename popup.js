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
        const autoCleanSwitch =
            document.getElementById(
                'autoCleanSwitch'
            );
        const clearDataBtn =
            document.getElementById(
                'clearDataBtn'
            );
        const reloadBtn =
            document.getElementById(
                'reloadBtn'
            );
        const engineBadge =
            document.getElementById(
                'engineBadge'
            );
        const engineBadgeText =
            document.getElementById(
                'engineBadgeText'
            );
        async function getActiveTab() {
            const tabs =
                await chrome.tabs.query({
                    active: true,
                    currentWindow: true
                });
            return tabs[0];
        }
        async function refreshCurrentSiteCount() {
            try {
                const tab =
                    await getActiveTab();
                if (!tab?.url) {
                    interceptCount.textContent =
                        '0';
                    return;
                }
                const response =
                    await chrome.runtime.sendMessage(
                        {
                            action:
                                'getSiteBlockCount',
                            siteUrl: tab.url
                        }
                    );
                const count =
                    response?.status === 'ok'
                        ? response.count || 0
                        : 0;
                interceptCount.textContent =
                    String(count);
            } catch (e) {
                interceptCount.textContent = '0';
            }
        }
        function syncEngineBadge(enabled) {
            if (!engineBadge) {
                return;
            }
            if (engineBadgeText) {
                engineBadgeText.textContent =
                    enabled
                ? 'ACTIVE'
                : 'OFF';
            }
            engineBadge.style.color = enabled
                ? 'var(--success)'
                : 'var(--warning)';
            engineBadge.style.background = enabled
                ? 'rgba(34,197,94,0.12)'
                : 'rgba(245,158,11,0.12)';
            engineBadge.style.borderColor = enabled
                ? 'rgba(34,197,94,0.3)'
                : 'rgba(245,158,11,0.35)';
        }
        async function initialize() {
            try {
                const data =
                    await chrome.storage.local.get([
                        'isEnabled',
                        'fingerprintEnabled',
                        'webrtcEnabled',
                        'autoCleanPrevDomain'
                    ]);
                await refreshCurrentSiteCount();
                mainSwitch.checked =
                    data.isEnabled !== false;
                syncEngineBadge(
                    data.isEnabled !== false
                );
                fingerprintSwitch.checked =
                    data.fingerprintEnabled !== false;
                webrtcSwitch.checked =
                    data.webrtcEnabled !== false;
                autoCleanSwitch.checked =
                    data.autoCleanPrevDomain !==
                    false;
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
                syncEngineBadge(enabled);
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
        autoCleanSwitch.addEventListener(
            'change',
            async () => {
                const enabled =
                    autoCleanSwitch.checked;
                await chrome.storage.local.set({
                    autoCleanPrevDomain:
                        enabled
                });
                console.log(
                    '[NextAnti] Auto clean previous domain:',
                    enabled
                );
                notify(
                    enabled
                        ? '切换主域自动清理已启用'
                        : '切换主域自动清理已关闭'
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
                                interceptCount.textContent =
                                    '0';
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
                    changes.isEnabled
                ) {
                    mainSwitch.checked =
                        changes.isEnabled
                            .newValue;
                    syncEngineBadge(
                        changes.isEnabled.newValue
                    );
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
                if (
                    changes.autoCleanPrevDomain
                ) {
                    autoCleanSwitch.checked =
                        changes
                            .autoCleanPrevDomain
                            .newValue;
                }
                if (
                    changes.siteBlockStats
                ) {
                    refreshCurrentSiteCount();
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