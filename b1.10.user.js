// ==UserScript==
// @name         Cppu选课助手
// @namespace    http://tampermonkey.net/
// @version      b1.10
// @description  cppu选课助手
// @author       ljnljn
// @match        http://jw.cppu.edu.cn/*
// @match        https://jw.cppu.edu.cn/*
// @match        https://webvpn.cppu.edu.cn/*
// @match        http://webvpn.cppu.edu.cn/*
// @grant        GM_addStyle
// @grant        GM_setValue
// @grant        GM_getValue
// @grant        GM_notification
// ==/UserScript==

(function() {
    'use strict';

    // 添加全局样式 - 包含免责声明弹窗
    GM_addStyle(`
        /* 免责声明弹窗样式 */
        #disclaimer-modal {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0,0,0,0.7);
            z-index: 2147483647;
            display: flex;
            justify-content: center;
            align-items: center;
            font-family: Arial, sans-serif;
        }

        .disclaimer-content {
            background: white;
            border-radius: 10px;
            width: 500px;
            max-width: 90%;
            padding: 25px;
            box-shadow: 0 5px 15px rgba(0,0,0,0.3);
        }

        .disclaimer-header {
            font-size: 22px;
            font-weight: bold;
            color: #2c3e50;
            margin-bottom: 15px;
            text-align: center;
            border-bottom: 2px solid #eee;
            padding-bottom: 10px;
        }

        .disclaimer-body {
            font-size: 15px;
            line-height: 1.6;
            color: #333;
            margin-bottom: 20px;
            max-height: 60vh;
            overflow-y: auto;
        }

        .disclaimer-version {
            font-weight: bold;
            color: #e74c3c;
            margin: 10px 0;
        }

        .disclaimer-buttons {
            display: flex;
            justify-content: center;
            gap: 15px;
            margin-top: 20px;
        }

        .disclaimer-btn {
            padding: 10px 25px;
            border: none;
            border-radius: 5px;
            font-weight: bold;
            cursor: pointer;
            font-size: 16px;
            transition: all 0.3s;
        }

        .btn-confirm {
            background: #2ecc71;
            color: white;
        }

        .btn-confirm:hover {
            background: #27ae60;
        }

        .btn-cancel {
            background: #e74c3c;
            color: white;
        }

        .btn-cancel:hover {
            background: #c0392b;
        }

        /* 控制面板样式 */
        #police-course-control {
            position: fixed;
            top: 100px;
            right: 20px;
            background: white;
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.1);
            padding: 12px;
            z-index: 2147483646; /* 低于免责声明弹窗 */
            min-width: 260px;
            border: 1px solid #e0e0e0;
            font-family: Arial, sans-serif;
            cursor: move;
            user-select: none;
            font-size: 14px;
        }

        .control-header {
            font-size: 16px;
            font-weight: bold;
            margin-bottom: 10px;
            color: #2c3e50;
            border-bottom: 1px solid #eee;
            padding-bottom: 6px;
            cursor: default;
            display: flex;
            justify-content: space-between;
            align-items: center;
        }

        .control-buttons {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 8px;
            margin-bottom: 10px;
        }

        .control-btn {
            padding: 8px 10px;
            border: none;
            border-radius: 4px;
            font-weight: bold;
            cursor: pointer;
            transition: all 0.3s;
            font-size: 13px;
            text-align: center;
        }

        .btn-navigate {
            background: linear-gradient(135deg, #3498db, #2980b9);
            color: white;
        }

        .btn-start {
            background: linear-gradient(135deg, #2ecc71, #27ae60);
            color: white;
        }

        .btn-stop {
            background: linear-gradient(135deg, #e74c3c, #c0392b);
            color: white;
        }

        .btn-settings {
            background: linear-gradient(135deg, #9b59b6, #8e44ad);
            color: white;
        }

        .btn-navigate:hover, .btn-start:hover, .btn-stop:hover, .btn-settings:hover {
            transform: translateY(-2px);
            box-shadow: 0 2px 6px rgba(0,0,0,0.15);
        }

        .status-indicator {
            padding: 8px;
            border-radius: 4px;
            font-size: 13px;
            margin-bottom: 8px;
        }

        .status-active {
            background: #d4edda;
            color: #155724;
        }

        .status-inactive {
            background: #f8d7da;
            color: #721c24;
        }

        .log-entry {
            padding: 8px;
            background: #f8f9fa;
            border-radius: 4px;
            font-size: 12px;
            max-height: 150px;
            overflow-y: auto;
        }

        .log-success {
            color: #155724;
        }

        .log-info {
            color: #0c5460;
        }

        .log-warning {
            color: #856404;
        }

        .log-error {
            color: #721c24;
        }

        .progress-bar {
            height: 5px;
            background: #e9ecef;
            border-radius: 3px;
            margin: 8px 0;
            overflow: hidden;
        }

        .progress {
            height: 100%;
            background: linear-gradient(135deg, #4a69bd, #3a5cb5);
            width: 0%;
            transition: width 0.3s;
        }

        .close-btn {
            background: none;
            border: none;
            font-size: 16px;
            cursor: pointer;
            color: #777;
            padding: 0;
            line-height: 1;
        }

        .close-btn:hover {
            color: #e74c3c;
        }

        .settings-panel {
            display: none;
            padding: 10px;
            background: #f8f9fa;
            border-radius: 6px;
            margin-top: 10px;
            border: 1px solid #e9ecef;
        }

        .settings-panel.active {
            display: block;
        }

        .setting-item {
            margin-bottom: 10px;
        }

        .setting-item label {
            display: block;
            margin-bottom: 5px;
            font-weight: 500;
            color: #2c3e50;
            font-size: 13px;
        }

        .setting-item input {
            width: 100%;
            padding: 8px;
            border: 1px solid #ddd;
            border-radius: 4px;
            font-size: 13px;
            background: white;
            pointer-events: auto !important;
        }

        .setting-item input:focus {
            border-color: #4a69bd;
            outline: none;
            box-shadow: 0 0 0 2px rgba(74, 105, 189, 0.2);
        }

        .save-settings {
            width: 100%;
            padding: 8px;
            background: #2ecc71;
            color: white;
            border: none;
            border-radius: 4px;
            font-weight: bold;
            cursor: pointer;
            margin-top: 5px;
        }

        .message-monitor {
            padding: 8px;
            background: #e3f2fd;
            border-radius: 4px;
            margin-top: 8px;
            font-size: 12px;
        }
        /* 日志摘要与折叠样式 */
        .log-summary {
            display: flex;
            gap: 8px;
            align-items: center;
            margin-top: 8px;
        }

        .badge {
            display: inline-block;
            min-width: 28px;
            padding: 4px 8px;
            border-radius: 14px;
            background: #e74c3c;
            color: #fff;
            font-weight: bold;
            text-align: center;
            cursor: pointer;
            user-select: none;
            font-size: 12px;
        }

        #error-details {
            display: none;
            margin-top: 8px;
            max-height: 150px;
            overflow-y: auto;
            padding: 8px;
            background: #fff5f5;
            border: 1px solid #f5c6cb;
            border-radius: 4px;
        }
    `);

    // 显示免责声明弹窗
    function showDisclaimer() {
        // 检查用户是否已经确认过免责声明
        const disclaimerAccepted = GM_getValue('disclaimerAccepted', false);
        const acceptedVersion = GM_getValue('disclaimerVersion', '');
        const currentVersion = 'b1.10';

        // 如果用户已经接受过当前版本的免责声明，直接返回
        if (disclaimerAccepted && acceptedVersion === currentVersion) {
            initControlPanel();
            return;
        }

        // 创建免责声明弹窗
        const disclaimerModal = document.createElement('div');
        disclaimerModal.id = 'disclaimer-modal';
        disclaimerModal.innerHTML = `
            <div class="disclaimer-content">
                <div class="disclaimer-header">免责声明</div>
                <div class="disclaimer-body">
                    <p>欢迎使用CPPU选课助手！在使用本脚本前，请仔细阅读以下免责声明：</p>

                    <p>1. 本脚本为免费开源工具，仅供学习和研究使用，作者不对使用本脚本产生的任何后果负责。</p>

                    <p>2. 使用本脚本进行选课操作可能违反学校相关规定，请在使用前确认学校是否允许自动选课操作。</p>

                    <p>3. 作者不保证本脚本的稳定性和安全性，使用本脚本可能存在账号安全风险。</p>

                    <p>4. 使用本脚本造成的一切后果（包括但不限于账号封禁、选课失败等）由用户自行承担。</p>

                    <p>5. 本脚本不会收集或传输您的任何个人信息或账号信息。</p>

                    <p>6. 使用教程等不会提供，请自行探索，不要联系作者，谢谢！</p>

                    <a href=https://www.cnblogs.com/ljnljn#/>有非使用问题（如bug等）请点我联系作者</a>

                    <div class="disclaimer-version">当前版本: ${currentVersion}</div>

                    <p>请在使用前确认您已阅读并理解以上声明内容。</p>
                </div>
                <div class="disclaimer-buttons">
                    <button class="disclaimer-btn btn-cancel" id="disclaimer-cancel">我不同意</button>
                    <button class="disclaimer-btn btn-confirm" id="disclaimer-confirm">我同意</button>
                </div>
            </div>
        `;
        document.body.appendChild(disclaimerModal);

        // 添加事件监听
        document.getElementById('disclaimer-confirm').addEventListener('click', function() {
            // 标记用户已接受免责声明
            GM_setValue('disclaimerAccepted', true);
            GM_setValue('disclaimerVersion', currentVersion);
            disclaimerModal.remove();
            // 初始化控制面板
            initControlPanel();
        });

        document.getElementById('disclaimer-cancel').addEventListener('click', function() {
            // 关闭页面
            window.close();
            // 或者显示提示信息
            alert('您已取消使用选课助手，页面即将关闭');
            // 尝试关闭页面
            if (window.history.length > 1) {
                window.history.back();
            } else {
                window.close();
            }
        });
    }

    // 初始化控制面板
    function initControlPanel() {
        createControlPanel();
        GM_setValue('autoSelectRunning', false);
        startLogAutoClear();
        // 注入页面上下文的 console 捕获桥接
        injectConsoleBridge();
        // 同时尝试在 userscript 沙箱层面做一次捕获（兼容不同环境）
        startConsoleCapture();
        // 等待3秒后检查是否自动启动
        setTimeout(() => {
            if (GM_getValue('autoSelectRunning', false)) {
                startAutoSelection();
            } else {
                addLog('系统已就绪，点击"开始选课"按钮启动流程', 'info');
            }
        }, 3000);
    }

    // 创建控制面板
    function createControlPanel() {
        const controlPanel = document.createElement('div');
        controlPanel.id = 'police-course-control';
        controlPanel.innerHTML = `
                <div class="control-header">
                <span>选课助手-版本b1.10</span>
                <button class="close-btn" id="close-btn">×</button>
            </div>
            <div class="control-buttons">
                <button id="navigate-btn" class="control-btn btn-navigate">启动导航</button>
                <button id="start-btn" class="control-btn btn-start">开始选课</button>
                <button id="stop-btn" class="control-btn btn-stop">停止选课</button>
                <button id="settings-btn" class="control-btn btn-settings">设置（开发中）</button>
            </div>
            <div class="settings-panel" id="settings-panel">
                <div class="setting-item">
                    <label for="refresh-interval">刷新间隔 (秒)</label>
                    <input type="number" id="refresh-interval" min="5" value="30">
                </div>
                <div class="setting-item">
                    <label for="click-delay">点击间隔 (毫秒)</label>
                    <input type="number" id="click-delay" min="100" value="500">
                </div>
                <button id="save-settings" class="save-settings">保存设置</button>
            </div>
            <div id="status" class="status-indicator status-inactive">状态: 未启动</div>
            <div class="progress-bar">
                <div class="progress" id="progress-bar"></div>
            </div>
            <div class="message-monitor" id="message-monitor">消息监控</div>
            <div class="log-summary">
                <span style="font-weight:600;color:#c0392b;">错误：</span>
                <div id="error-badge" class="badge">0</div>
                <span style="color:#2c3e50;font-size:12px;">（点击展开/收起错误详情）</span>
            </div>
            <div id="error-details" class="log-entry"></div>
            <div class="log-entry" id="log-container"></div>
        `;
        document.body.appendChild(controlPanel);

        // 添加事件监听
        document.getElementById('navigate-btn').addEventListener('click', startAutoNavigation);
        document.getElementById('start-btn').addEventListener('click', startAutoSelection);
        document.getElementById('stop-btn').addEventListener('click', stopAutoSelection);
        document.getElementById('settings-btn').addEventListener('click', toggleSettingsPanel);
        document.getElementById('close-btn').addEventListener('click', closeControlPanel);
        document.getElementById('save-settings').addEventListener('click', saveSettings);

        // 错误徽章点击切换错误详情显示
        const errorBadgeEl = document.getElementById('error-badge');
        if (errorBadgeEl) {
            errorBadgeEl.addEventListener('click', toggleErrorDetails);
        }

        // 添加拖动功能
        makeElementDraggable(controlPanel);

        // 加载保存的设置
        loadSettings();

        // 检查是否之前已启动
        if (GM_getValue('autoSelectRunning', false)) {
            startAutoSelection();
        }
    }

    // 使元素可拖动
    function makeElementDraggable(element) {
        let pos1 = 0, pos2 = 0, pos3 = 0, pos4 = 0;

        element.onmousedown = dragMouseDown;

        function dragMouseDown(e) {
            e = e || window.event;
            e.preventDefault();
            // 获取鼠标位置
            pos3 = e.clientX;
            pos4 = e.clientY;
            document.onmouseup = closeDragElement;
            // 调用函数移动元素
            document.onmousemove = elementDrag;
        }

        function elementDrag(e) {
            e = e || window.event;
            e.preventDefault();
            // 计算新位置
            pos1 = pos3 - e.clientX;
            pos2 = pos4 - e.clientY;
            pos3 = e.clientX;
            pos4 = e.clientY;
            // 设置元素新位置
            element.style.top = (element.offsetTop - pos2) + "px";
            element.style.right = "auto";
            element.style.left = (element.offsetLeft - pos1) + "px";
        }

        function closeDragElement() {
            // 停止移动
            document.onmouseup = null;
            document.onmousemove = null;
        }
    }

    // 关闭控制面板
    function closeControlPanel() {
        const controlPanel = document.getElementById('police-course-control');
        if (controlPanel) {
            controlPanel.remove();
        }
    }

    // 切换设置面板显示
    function toggleSettingsPanel() {
        const settingsPanel = document.getElementById('settings-panel');
        settingsPanel.classList.toggle('active');
    }

    // 加载保存的设置
    function loadSettings() {
        const refreshInterval = GM_getValue('refreshInterval', 30);
        const clickDelay = GM_getValue('clickDelay', 500);

        document.getElementById('refresh-interval').value = refreshInterval;
        document.getElementById('click-delay').value = clickDelay;
    }

    // 保存设置
    function saveSettings() {
        const refreshInterval = parseInt(document.getElementById('refresh-interval').value);
        const clickDelay = parseInt(document.getElementById('click-delay').value);

        GM_setValue('refreshInterval', refreshInterval);
        GM_setValue('clickDelay', clickDelay);

        addLog('设置已保存', 'success');
        toggleSettingsPanel();
    }

    let isRunning = false;
    let refreshInterval = null;
    let currentProcess = null;
    let popupObserver = null;
    let messageObserver = null;
    let logClearTimer = null;
    let errorCount = 0;
    let errorDetailsVisible = false;
    // 控制台捕获状态与去重
    let consoleCaptureStarted = false;
    let originalConsoleError = null;
    let originalConsoleWarn = null;
    let lastErrorText = '';
    let lastErrorTime = 0;
    // 更新状态显示
    function startLogAutoClear() {
        // 清除现有定时器
        if (logClearTimer) {
            clearInterval(logClearTimer);
        }

        // 设置新的定时器（5分钟 = 300000毫秒）
        logClearTimer = setInterval(() => {
            clearLogContainer();
        }, 300000);

        addLog('日志自动清空已启动（每5分钟清空一次）', 'info');
    }

    // 清空日志容器
    function clearLogContainer() {
        const logContainer = document.getElementById('log-container');
        const errorDetails = document.getElementById('error-details');
        const errorBadge = document.getElementById('error-badge');
        if (logContainer) {
            // 添加清空前的提示
            addLog('日志即将自动清空...', 'info');

            // 短暂延迟后清空
            setTimeout(() => {
                logContainer.innerHTML = '';
                if (errorDetails) errorDetails.innerHTML = '';
                errorCount = 0;
                if (errorBadge) errorBadge.textContent = '0';
                addLog('日志已自动清空', 'info');
            }, 500);
        }
    }
    function updateStatus(text, className) {
        const statusEl = document.getElementById('status');
        if (statusEl) {
            statusEl.textContent = text;
            statusEl.className = `status-indicator ${className}`;
        }
    }

    // 更新进度条
    function updateProgress(percent) {
        const progressBar = document.getElementById('progress-bar');
        if (progressBar) {
            progressBar.style.width = `${percent}%`;
        }
    }

    // 更新消息监控
    function updateMessageMonitor(text) {
        const messageMonitor = document.getElementById('message-monitor');
        if (messageMonitor) {
            messageMonitor.textContent = `消息监控: ${text}`;
        }
    }

    // 添加日志
    function addLog(message, type = 'info') {
        const logContainer = document.getElementById('log-container');
        const errorDetails = document.getElementById('error-details');
        if (logContainer) {
            const timePrefix = `[${new Date().toLocaleTimeString()}] `;
            if (type === 'error') {
                // 只显示数量，错误详情放入折叠区
                errorCount++;
                const errorBadge = document.getElementById('error-badge');
                if (errorBadge) errorBadge.textContent = String(errorCount);
                if (errorDetails) {
                    const logEntry = document.createElement('div');
                    logEntry.className = `log-error`;
                    logEntry.textContent = timePrefix + message;
                    errorDetails.appendChild(logEntry);
                    // 如果详情可见则滚动到底部
                    if (errorDetailsVisible) errorDetails.scrollTop = errorDetails.scrollHeight;
                }
            } else {
                const logEntry = document.createElement('div');
                logEntry.className = `log-${type}`;
                logEntry.textContent = timePrefix + message;
                logContainer.appendChild(logEntry);

                // 自动滚动到底部
                logContainer.scrollTop = logContainer.scrollHeight;
            }
        }
    }

    // 更新错误详情显示（折叠/展开）
    function toggleErrorDetails() {
        const errorDetails = document.getElementById('error-details');
        const errorBadge = document.getElementById('error-badge');
        if (!errorDetails || !errorBadge) return;
        if (errorDetailsVisible) {
            errorDetails.style.display = 'none';
            errorDetailsVisible = false;
            errorBadge.style.background = '#e74c3c';
        } else {
            errorDetails.style.display = 'block';
            errorDetailsVisible = true;
            errorDetails.scrollTop = errorDetails.scrollHeight;
            errorBadge.style.background = '#c0392b';
        }
    }

    // 启动控制台捕获（console.error/console.warn、window.onerror、unhandledrejection）
    function startConsoleCapture() {
        if (consoleCaptureStarted) return;
        consoleCaptureStarted = true;

        try {
            if (console && console.error) {
                originalConsoleError = console.error.bind(console);
                console.error = function(...args) {
                    try { handleConsoleMessage('error', args); } catch (e) {}
                    originalConsoleError.apply(console, args);
                };
            }
            if (console && console.warn) {
                originalConsoleWarn = console.warn.bind(console);
                console.warn = function(...args) {
                    try { handleConsoleMessage('warning', args); } catch (e) {}
                    originalConsoleWarn.apply(console, args);
                };
            }
        } catch (e) {
            // 不阻塞页面
        }

        window.addEventListener('error', function(evt) {
            try {
                const msg = `${evt.message} (${evt.filename}:${evt.lineno}:${evt.colno})`;
                const stack = evt.error && evt.error.stack ? '\n' + evt.error.stack : '';
                handleConsoleMessage('error', [msg + stack]);
            } catch (e) {}
        }, true);

        window.addEventListener('unhandledrejection', function(evt) {
            try {
                let reason = evt.reason;
                let text;
                if (typeof reason === 'string') text = reason;
                else if (reason && reason.stack) text = reason.stack;
                else {
                    try { text = JSON.stringify(reason); } catch (e) { text = String(reason); }
                }
                handleConsoleMessage('error', ['UnhandledRejection: ' + text]);
            } catch (e) {}
        }, true);

        addLog('控制台错误捕获已启用', 'info');
    }

    // 将 console 消息格式化并发送到 addLog，带简单去重
    function handleConsoleMessage(type, args) {
        if (!args || args.length === 0) return;
        const parts = args.map(a => {
            if (typeof a === 'string') return a;
            try { return JSON.stringify(a); } catch (e) { return String(a); }
        });
        const text = parts.join(' ');
        const now = Date.now();
        if (text === lastErrorText && (now - lastErrorTime) < 2000) return; // 2s 内去重
        lastErrorText = text;
        lastErrorTime = now;
        addLog(text, type === 'warning' ? 'warning' : 'error');
    }

    // 注入脚本到页面上下文，拦截页面的 console.error/console.warn、window.onerror、unhandledrejection
    function injectConsoleBridge() {
        try {
            const script = document.createElement('script');
            script.type = 'text/javascript';
            script.textContent = `
                (function(){
                    try{
                        const send = (type, args) => {
                            try{
                                const parts = Array.prototype.map.call(args, a => {
                                    try { return typeof a === 'string' ? a : JSON.stringify(a); } catch(e) { return String(a); }
                                });
                                const text = parts.join(' ');
                                try { window.postMessage({ source: 'CPPU_CONSOLE_CAPTURE', type: type, text: text }, '*'); } catch(e) {}
                            }catch(e){}
                        };

                        const _console = window.console || {};
                        if (_console.error) {
                            const orig = _console.error.bind(_console);
                            _console.error = function(){ send('error', arguments); orig.apply(_console, arguments); };
                        }
                        if (_console.warn) {
                            const origW = _console.warn.bind(_console);
                            _console.warn = function(){ send('warning', arguments); origW.apply(_console, arguments); };
                        }

                        window.addEventListener('error', function(evt){
                            try{
                                const msg = evt.message + ' ('+ (evt.filename||'') + ':' + (evt.lineno||0) + ':' + (evt.colno||0) + ')';
                                const stack = evt.error && evt.error.stack ? '\n'+evt.error.stack : '';
                                send('error', [msg+stack]);
                            }catch(e){}
                        }, true);

                        window.addEventListener('unhandledrejection', function(evt){
                            try{
                                var r = evt.reason;
                                var text = (typeof r === 'string') ? r : (r && r.stack) ? r.stack : JSON.stringify(r || '');
                                send('error', ['UnhandledRejection: '+text]);
                            }catch(e){}
                        }, true);
                    }catch(e){}
                })();
            `;
            document.documentElement.appendChild(script);
            script.parentNode.removeChild(script);

            // 监听从页面通过 postMessage 发来的事件（更可靠，跨沙箱）
            window.addEventListener('message', function(evt) {
                try {
                    const d = evt.data || {};
                    if (d && d.source === 'CPPU_CONSOLE_CAPTURE' && d.text) {
                        handleConsoleMessage(d.type === 'warning' ? 'warning' : 'error', [d.text]);
                    }
                } catch (e) {}
            }, false);

            addLog('页面级控制台桥接已注入', 'info');
        } catch (e) {
            addLog('注入页面控制台桥接失败: ' + (e && e.message ? e.message : e), 'error');
        }
    }

    // 启动自动导航
    function startAutoNavigation() {
        addLog('开始自动导航到选课页面', 'info');
        updateProgress(0);

        // 步骤1: 点击"产品与功能"菜单
        setTimeout(() => {
            const productMenu = document.querySelector('.x-component.menus');
            if (productMenu) {
                addLog('找到"产品与功能"菜单，正在点击...', 'info');
                productMenu.click();
                updateProgress(33);
            } else {
                addLog('错误: 未找到"产品与功能"菜单', 'error');
            }

            // 步骤2: 点击"学生服务"
            setTimeout(() => {
                const studentService = findElementByText('span', '学生服务');
                if (studentService) {
                    addLog('找到"学生服务"菜单，正在点击...', 'info');
                    studentService.click();
                    updateProgress(66);
                } else {
                    addLog('错误: 未找到"学生服务"菜单', 'error');
                }

                // 步骤3: 点击"学生选课"
                setTimeout(() => {
                    const courseSelection = findElementByText('span', '学生选课');
                    if (courseSelection) {
                        addLog('找到"学生选课"菜单，正在点击...', 'info');
                        courseSelection.click();
                        updateProgress(100);
                        addLog('成功导航到选课页面', 'success');
                    } else {
                        addLog('错误: 未找到"学生选课"菜单', 'error');
                    }
                }, 1000);
            }, 1000);
        }, 1000);
    }

    // 根据文本内容查找元素
    function findElementByText(tagName, text) {
        const elements = document.querySelectorAll(tagName);
        for (let i = 0; i < elements.length; i++) {
            if (elements[i].textContent.trim() === text) {
                return elements[i];
            }
        }
        return null;
    }

    // 开始自动选课
    function startAutoSelection() {
        if (isRunning) return;

        isRunning = true;
        GM_setValue('autoSelectRunning', true);
        updateStatus('状态: 运行中', 'status-active');
        addLog('选课助手已启动', 'success');

        // 获取设置值
        const refreshIntervalValue = 30*1000;
        const clickDelayValue = GM_getValue('clickDelay', 500);

        // 开始选课流程
        executeSelectionProcess(clickDelayValue);

        // 设置定期刷新
        refreshInterval = setInterval(() => {
            addLog('执行定期刷新...', 'info');
            clickRefreshButton();
            setTimeout(() => {
                executeSelectionProcess(clickDelayValue);
            }, 2000);
        }, refreshIntervalValue);
    }

    // 停止自动选课
    function stopAutoSelection() {
        if (!isRunning) return;

        isRunning = false;
        GM_setValue('autoSelectRunning', false);
        clearInterval(refreshInterval);
        if (currentProcess) clearTimeout(currentProcess);
        if (popupObserver) popupObserver.disconnect();
        if (messageObserver) messageObserver.disconnect();

        updateStatus('状态: 已停止', 'status-inactive');
        addLog('选课助手已停止', 'info');
        updateProgress(0);
        updateMessageMonitor('已停止');
    }

    // 点击刷新按钮 - 使用"刷新已选"按钮
    function clickRefreshButton() {
        // 查找所有包含"刷新已选"文本的按钮
        const buttons = document.querySelectorAll('.x-btn');
        let refreshButton = null;

        buttons.forEach(button => {
            const buttonText = button.querySelector('.x-btn-inner');
            if (buttonText && buttonText.textContent.includes('刷新已选')) {
                refreshButton = button;
            }
        });

        if (refreshButton) {
            addLog('找到"刷新已选"按钮，正在点击...', 'info');
            refreshButton.click();
            addLog('已点击"刷新已选"按钮刷新课程列表', 'success');
        } else {
            addLog('错误: 未找到"刷新已选"按钮', 'error');
        }
    }

    // 执行选课流程
    function executeSelectionProcess(clickDelay) {
        // 1. 获取总课程数
        const totalCourses = getTotalCourses();
        if (!totalCourses) {
            addLog('错误: 无法获取课程总数', 'error');
            return;
        }

        addLog(`获取课程总数: ${totalCourses}门`, 'info');

        // 2. 设置每页显示数量为总课程数
        setPageSize(totalCourses);

        // 3. 等待页面刷新后执行选课操作
        currentProcess = setTimeout(() => {
            clickAllSelectButtons(clickDelay);
            currentProcess = null;
        }, 2000);
    }

    // 从工具栏获取总课程数
    function getTotalCourses() {
        const toolbarElement = document.querySelector('.x-toolbar-text.label');
        if (!toolbarElement) {
            addLog('错误: 未找到工具栏元素', 'error');
            return null;
        }

        const text = toolbarElement.textContent;
        // 匹配格式：1-331条/共331条
        const match = text.match(/共(\d+)条/);

        if (!match || !match[1]) {
            addLog('错误: 无法从工具栏文本中提取课程总数', 'error');
            return null;
        }

        return parseInt(match[1]);
    }

    // 设置每页显示数量
    function setPageSize(size) {
        const pageSizeInput = document.querySelector('input[name="pageSize"]');
        if (pageSizeInput) {
            pageSizeInput.value = size;

            // 触发change事件确保页面响应
            const event = new Event('change', { bubbles: true });
            pageSizeInput.dispatchEvent(event);

            addLog(`已设置每页显示: ${size}条`, 'info');
        } else {
            addLog('错误: 未找到分页设置输入框', 'error');
        }
    }

    // 创建消息观察器
    function createMessageObserver() {
        // 如果已有观察器，先断开
        if (messageObserver) messageObserver.disconnect();

        // 创建MutationObserver监听消息变化
        messageObserver = new MutationObserver(mutations => {
            mutations.forEach(mutation => {
                if (mutation.type === 'characterData' || mutation.type === 'childList') {
                    const messageText = mutation.target.textContent || '';
                    if (messageText.includes('选课成功')) {
                        addLog('检测到选课成功消息', 'success');
                        updateMessageMonitor('选课成功');
                        resolveMessagePromise();
                    }
                }
            });
        });

        // 开始观察消息元素
        const messageElement = document.getElementById('ext-gen3217');
        if (messageElement) {
            messageObserver.observe(messageElement, {
                characterData: true,
                childList: true,
                subtree: true
            });
            addLog('消息观察器已启动', 'info');
            updateMessageMonitor('监控中');
        } else {
            addLog('错误: 未找到消息元素', 'error');
            updateMessageMonitor('未找到消息元素');
        }
    }

    let messagePromise = null;
    let messageResolver = null;

    // 创建消息Promise
    function createMessagePromise() {
        messagePromise = new Promise(resolve => {
            messageResolver = resolve;
        });
        return messagePromise;
    }

    // 解析消息Promise
    function resolveMessagePromise() {
        if (messageResolver) {
            messageResolver();
            messageResolver = null;
            messagePromise = null;
        }
    }

    // 点击所有"选课"按钮（智能顺序选择）
    async function clickAllSelectButtons(clickDelay) {
        const rows = document.querySelectorAll('tr.x-grid-row.x-grid-data-row');
        let clickedCount = 0;
        let skippedCount = 0;

        if (rows.length === 0) {
            addLog('未找到课程行', 'warning');
            return;
        }

        addLog(`找到 ${rows.length} 门课程`, 'info');

        // 创建弹窗观察器
        createPopupObserver();

        // 创建消息观察器
        createMessageObserver();

        for (let i = 0; i < rows.length; i++) {
            if (!isRunning) break;

            const row = rows[i];

            // 检查课容量（YL列）
            const capacityCell = row.querySelector('.x-grid-cell-YL .x-grid-cell-inner');
            if (!capacityCell) {
                addLog(`警告: 第 ${i + 1} 门课程未找到课容量信息`, 'warning');
                continue;
            }

            const capacityText = capacityCell.textContent.trim();
            const capacity = parseInt(capacityText) || 0;

            // 如果课容量为0，跳过此课程
            if (capacity === 0) {
                addLog(`跳过第 ${i + 1} 门课程 (课容量为0)`, 'warning');
                skippedCount++;
                continue;
            }

            // 查找包含"选课"文本的按钮
            const buttons = row.querySelectorAll('.x-action-col-text');
            let selectButton = null;

            // 查找包含"选课"文本的按钮
            buttons.forEach(button => {
                if (button.textContent.includes('选课')) {
                    selectButton = button;
                }
            });

            if (selectButton) {
                addLog(`正在选择第 ${i + 1} 门课程 (容量: ${capacity})`, 'info');

                // 模拟点击
                selectButton.click();
                clickedCount++;

                // 模拟鼠标悬停效果
                selectButton.style.backgroundColor = '#4CAF50';
                selectButton.style.color = 'white';

                // 恢复原始样式
                setTimeout(() => {
                    selectButton.style.backgroundColor = '';
                    selectButton.style.color = '';
                }, 500);

                // 创建新的消息Promise
                const messagePromise = createMessagePromise();

                // 等待选课成功消息或超时
                try {
                    addLog('等待选课成功消息...', 'info');
                    updateMessageMonitor('等待选课成功消息');

                    // 设置超时时间（10秒）
                    await Promise.race([
                        messagePromise,
                        new Promise(resolve => setTimeout(resolve, 10000))
                    ]);

                    addLog(`第 ${i + 1} 门课程选课成功`, 'success');

                    // 等待基础延迟
                    await new Promise(resolve => setTimeout(resolve, clickDelay));
                } catch (error) {
                    addLog(`第 ${i + 1} 门课程选课可能未成功`, 'warning');
                }
            }
        }

        if (clickedCount === 0 && skippedCount === 0) {
            addLog('未找到可用的"选课"按钮', 'warning');
        } else {
            addLog(`已尝试选择 ${clickedCount} 门课程, 跳过 ${skippedCount} 门课容量为0的课程`, 'success');
        }
    }

    // 创建弹窗观察器
    function createPopupObserver() {
        // 如果已有观察器，先断开
        if (popupObserver) popupObserver.disconnect();

        // 创建MutationObserver监听DOM变化
        popupObserver = new MutationObserver(mutations => {
            mutations.forEach(mutation => {
                if (mutation.addedNodes.length) {
                    mutation.addedNodes.forEach(node => {
                        // 检查是否是确认弹窗
                        if (node.classList && node.classList.contains('jconfirm-box')) {
                            handleConfirmationPopup(node);
                        } else if (node.querySelector) {
                            const popup = node.querySelector('.jconfirm-box');
                            if (popup) {
                                handleConfirmationPopup(popup);
                            }
                        }
                    });
                }
            });
        });

        // 开始观察整个文档
        popupObserver.observe(document, {
            childList: true,
            subtree: true
        });

        addLog('弹窗观察器已启动', 'info');
    }

    // 处理确认弹窗
    function handleConfirmationPopup(popup) {
        addLog('检测到确认弹窗', 'info');

        // 查找确认按钮
        const confirmButton = popup.querySelector('.btn.btn-blue');
        if (confirmButton) {
            addLog('找到确认按钮，正在点击...', 'info');

            // 模拟点击确认按钮
            setTimeout(() => {
                confirmButton.click();
                addLog('已点击确认按钮', 'success');

                // 发送通知
                if (typeof GM_notification !== 'undefined') {
                    GM_notification({
                        title: '选课确认',
                        text: '已自动确认选课',
                        timeout: 3000
                    });
                }
            }, 1000);
        } else {
            addLog('未找到确认按钮', 'warning');
        }
    }

    // 页面加载完成后显示免责声明
    window.addEventListener('load', function() {
        showDisclaimer();
    });
})();