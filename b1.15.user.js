// ==UserScript==
// @name         Cppu选课助手
// @namespace    http://tampermonkey.net/
// @version      b1.16
// @description  cppu选课助手（支持 WebVPN：webvpn.cppu.edu.cn）
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
            user-select: text;
            -webkit-user-select: text;
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

        /* 收藏与筛选面板样式 */
        .setting-item textarea, .setting-item select {
            width: 100%;
            padding: 8px;
            border: 1px solid #ddd;
            border-radius: 4px;
            font-size: 13px;
            background: white;
            box-sizing: border-box;
            pointer-events: auto !important;
            resize: vertical;
            user-select: text;
            -webkit-user-select: text;
        }

        .filter-hint {
            font-size: 11px;
            color: #888;
            margin-top: 3px;
            line-height: 1.4;
        }

        .filter-summary {
            padding: 6px 8px;
            background: #f0f7ff;
            border: 1px solid #d6e9ff;
            border-radius: 4px;
            font-size: 12px;
            color: #2c3e50;
            margin-top: 8px;
        }

        /* 开始抢课前筛选确认弹窗 */
        #filter-confirm-modal {
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

        .filter-confirm-content {
            background: white;
            border-radius: 10px;
            width: 460px;
            max-width: 92%;
            padding: 25px;
            box-shadow: 0 5px 15px rgba(0,0,0,0.3);
        }

        .filter-confirm-title {
            font-size: 20px;
            font-weight: bold;
            color: #c0392b;
            text-align: center;
            margin-bottom: 12px;
        }

        .filter-confirm-body {
            font-size: 14px;
            line-height: 1.7;
            color: #333;
        }

        .filter-confirm-item {
            margin: 12px 0;
            padding: 10px 12px;
            background: #f8f9fa;
            border: 1px solid #e9ecef;
            border-radius: 6px;
        }

        .filter-confirm-item label {
            display: flex;
            align-items: flex-start;
            gap: 8px;
            cursor: pointer;
            font-weight: 500;
            color: #2c3e50;
        }

        .filter-confirm-item input[type=checkbox] {
            margin-top: 3px;
            width: 16px;
            height: 16px;
            cursor: pointer;
        }

        .filter-confirm-note {
            font-size: 12px;
            color: #856404;
            background: #fff3cd;
            border: 1px solid #ffeeba;
            border-radius: 4px;
            padding: 8px;
            margin: 10px 0;
        }

        .filter-confirm-buttons {
            display: flex;
            justify-content: center;
            gap: 15px;
            margin-top: 20px;
        }
    `);

    // 显示免责声明弹窗
    function showDisclaimer() {
        // 检查用户是否已经确认过免责声明
        const disclaimerAccepted = GM_getValue('disclaimerAccepted', false);
        const acceptedVersion = GM_getValue('disclaimerVersion', '');
        const currentVersion = 'b1.16';

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
        // 注入页面上下文的 WebSocket/socket.io 断线监控与深度强制重连（不刷新页面）
        injectWsBridge();
        // 同时尝试在 userscript 沙箱层面做一次捕获（兼容不同环境）
        startConsoleCapture();
        // 等待3秒后检查是否自动启动
        setTimeout(() => {
            if (GM_getValue('autoSelectRunning', false)) {
                startAutoSelection({ skipConfirm: true });
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
                <span>选课助手-版本b1.16</span>
                <button class="close-btn" id="close-btn">×</button>
            </div>
            <div class="control-buttons">
                <button id="navigate-btn" class="control-btn btn-navigate">启动导航</button>
                <button id="start-btn" class="control-btn btn-start">开始选课</button>
                <button id="stop-btn" class="control-btn btn-stop">停止选课</button>
                <button id="settings-btn" class="control-btn btn-settings">设置（开发中）</button>
                <button id="filter-btn" class="control-btn btn-settings">收藏与筛选</button>
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
            <div class="settings-panel" id="filter-panel">
                <div class="setting-item">
                    <label for="filter-modules">课程模块筛选（逗号分隔，空=全部）</label>
                    <input type="text" id="filter-modules" placeholder="例如：公共线下课程,公共线上课程">
                    <div class="filter-hint">可选：公共线下课程 / 公共线上课程 / 公共体育课程 / 专业任选 / 实践技能任选 / 信息素养课程 / 专业 …（留空则不过滤模块）</div>
                </div>
                <div class="setting-item">
                    <label for="filter-attr">课程属性筛选</label>
                    <select id="filter-attr">
                        <option value="">全部</option>
                        <option value="必修课">必修课</option>
                        <option value="选修课">选修课</option>
                        <option value="课外实践必修">课外实践必修</option>
                        <option value="实践技能选修">实践技能选修</option>
                    </select>
                </div>
                <div class="setting-item">
                    <label for="filter-whitelist">白名单（每行一个 课程名/课程号/选课课号，空=不限制）</label>
                    <textarea id="filter-whitelist" rows="2" placeholder="例如：网球高级&#10;1zc1X068K"></textarea>
                    <div class="filter-hint">白名单非空时，只抢命中白名单的课程。</div>
                </div>
                <div class="setting-item">
                    <label for="filter-blacklist">黑名单（每行一个，命中则跳过）</label>
                    <textarea id="filter-blacklist" rows="2" placeholder="例如：闪光摄影&#10;羽毛球高级"></textarea>
                    <div class="filter-hint">黑名单优先于白名单：命中黑名单的课程一定不抢。</div>
                </div>
                <div class="setting-item">
                    <label for="filter-favorites">收藏课程 + 优先级（每行：课程名|优先级，数字越小越先抢）</label>
                    <textarea id="filter-favorites" rows="3" placeholder="网球高级|1&#10;羽毛球高级|2&#10;文科物理|3"></textarea>
                    <div class="filter-hint">收藏课程会排在最前面，按优先级数字从小到大抢；其余课程按原顺序。</div>
                </div>
                <button id="save-filter" class="save-settings">保存筛选</button>
                <button id="preview-btn" class="save-settings" style="background:#4a69bd;">预览命中课程（不实际选课）</button>
                <div class="filter-hint">预览会按当前筛选/黑白名单/收藏优先级列出会抢的课程和顺序，不会真的点选课。</div>
                <div class="filter-summary" id="filter-summary">筛选未启用（全部课程）</div>
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
        document.getElementById('filter-btn').addEventListener('click', toggleFilterPanel);
        document.getElementById('close-btn').addEventListener('click', closeControlPanel);
        document.getElementById('save-settings').addEventListener('click', saveSettings);
        document.getElementById('save-filter').addEventListener('click', saveFilter);
        document.getElementById('preview-btn').addEventListener('click', previewSelection);

        // 错误徽章点击切换错误详情显示
        const errorBadgeEl = document.getElementById('error-badge');
        if (errorBadgeEl) {
            errorBadgeEl.addEventListener('click', toggleErrorDetails);
        }

        // 添加拖动功能
        makeElementDraggable(controlPanel);

        // 加载保存的设置
        loadSettings();
        loadFilter();
        initCourseListRecorder();

        // 检查是否之前已启动
        if (GM_getValue('autoSelectRunning', false)) {
            startAutoSelection({ skipConfirm: true });
        }
    }

    // 使元素可拖动
    function makeElementDraggable(element) {
        let pos1 = 0, pos2 = 0, pos3 = 0, pos4 = 0;

        element.onmousedown = dragMouseDown;

        function dragMouseDown(e) {
            e = e || window.event;
            // 点在输入框/下拉框/按钮/链接上时，不启动拖动，也不阻止默认行为（否则无法输入/选择）
            const t = e.target;
            if (t && t.closest && t.closest('input, textarea, select, button, a')) {
                return;
            }
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

    // 切换收藏与筛选面板显示
    function toggleFilterPanel() {
        const panel = document.getElementById('filter-panel');
        panel.classList.toggle('active');
    }

    // 加载收藏与筛选配置
    function loadFilter() {
        document.getElementById('filter-modules').value = GM_getValue('filterModules', '');
        document.getElementById('filter-attr').value = GM_getValue('filterAttr', '');
        document.getElementById('filter-whitelist').value = GM_getValue('filterWhitelist', '');
        document.getElementById('filter-blacklist').value = GM_getValue('filterBlacklist', '');
        document.getElementById('filter-favorites').value = GM_getValue('filterFavorites', '');
        updateFilterSummary();
    }

    // 保存收藏与筛选配置
    function saveFilter() {
        GM_setValue('filterModules', document.getElementById('filter-modules').value.trim());
        GM_setValue('filterAttr', document.getElementById('filter-attr').value.trim());
        GM_setValue('filterWhitelist', document.getElementById('filter-whitelist').value.trim());
        GM_setValue('filterBlacklist', document.getElementById('filter-blacklist').value.trim());
        GM_setValue('filterFavorites', document.getElementById('filter-favorites').value.trim());
        updateFilterSummary();
        addLog('筛选配置已保存', 'success');
        toggleFilterPanel();
    }

    // 更新筛选摘要
    function updateFilterSummary() {
        const summary = document.getElementById('filter-summary');
        if (!summary) return;
        const cfg = getFilterConfig();
        const parts = [];
        if (cfg.modules.length) parts.push('模块:' + cfg.modules.join('/'));
        if (cfg.attr) parts.push('属性:' + cfg.attr);
        if (cfg.whitelist.length) parts.push('白名单' + cfg.whitelist.length + '条');
        if (cfg.blacklist.length) parts.push('黑名单' + cfg.blacklist.length + '条');
        if (cfg.favorites.length) parts.push('收藏' + cfg.favorites.length + '条');
        summary.textContent = parts.length ? '筛选已启用：' + parts.join('，') : '筛选未启用（全部课程）';
    }

    // 读取课程行某个字段的单元格文本
    function getCourseCell(row, field) {
        const cell = row.querySelector('.x-grid-cell-' + field + ' .x-grid-cell-inner');
        return cell ? cell.textContent.trim() : '';
    }

    // 获取课程网格的数据行（含余量 YL 列；排除选课任务列表行）
    function getCourseGridRows() {
        const all = document.querySelectorAll('tr.x-grid-row.x-grid-data-row');
        return Array.from(all).filter(r => r.querySelector('.x-grid-cell-YL'));
    }

    // 解析文本列表（每行一条，忽略空行与 # 注释）
    function parseLines(text) {
        return String(text || '').split('\n')
            .map(s => s.trim())
            .filter(s => s && !s.startsWith('#'));
    }

    // 解析收藏列表：每行 "名称|优先级" 或 "名称"
    function parseFavorites(text) {
        return parseLines(text).map((line, idx) => {
            const parts = line.split('|').map(s => s.trim());
            const name = parts[0];
            const priority = parseInt(parts[1], 10);
            return { name, priority: isNaN(priority) ? idx : priority };
        });
    }

    // 课程是否命中某个名称/编号（课程名、课程号、选课课号任一包含即命中）
    function courseMatchesName(info, name) {
        const n = name.toLowerCase();
        return [info.bjmc, info.kch, info.xkkh].some(v => v && v.toLowerCase().includes(n));
    }

    // 获取当前筛选配置
    function getFilterConfig() {
        return {
            modules: parseLines(document.getElementById('filter-modules').value).flatMap(s => s.split(/[,，、]/)).map(s => s.trim()).filter(Boolean),
            attr: (document.getElementById('filter-attr').value || '').trim(),
            whitelist: parseLines(document.getElementById('filter-whitelist').value),
            blacklist: parseLines(document.getElementById('filter-blacklist').value),
            favorites: parseFavorites(document.getElementById('filter-favorites').value),
            onlyAvailable: true
        };
    }

    // 判断课程是否符合筛选，返回 { pass, reason }
    function coursePassFilter(info, cfg) {
        if (cfg.blacklist.some(n => courseMatchesName(info, n))) return { pass: false, reason: '黑名单' };
        if (cfg.whitelist.length && !cfg.whitelist.some(n => courseMatchesName(info, n))) return { pass: false, reason: '不在白名单' };
        if (cfg.modules.length && !cfg.modules.includes(info.kcmk)) return { pass: false, reason: '模块不符(' + info.kcmk + ')' };
        if (cfg.attr && info.kcsx !== cfg.attr) return { pass: false, reason: '属性不符(' + info.kcsx + ')' };
        if (cfg.onlyAvailable && info.yl <= 0) return { pass: false, reason: '余量为0' };
        return { pass: true, reason: '' };
    }

    // 预览模式：按当前规则列出会抢的课程及顺序，不实际点选课
    function previewSelection() {
        const allRows = document.querySelectorAll('tr.x-grid-row.x-grid-data-row');
        const rows = Array.from(allRows).filter(r => r.querySelector('.x-grid-cell-YL'));
        if (rows.length === 0) {
            addLog('预览：未找到课程行（请先进入课程列表/计划外选课）', 'warning');
            return;
        }

        const cfg = getFilterConfig();
        // 读取 + 去重
        const seen = new Set();
        const courses = [];
        rows.forEach((row, index) => {
            const info = {
                row, index,
                bjmc: getCourseCell(row, 'BJMC'),
                kch: getCourseCell(row, 'KCH'),
                xkkh: getCourseCell(row, 'XKKH'),
                kcmk: getCourseCell(row, 'KCMK'),
                kcsx: getCourseCell(row, 'KCSX'),
                yl: parseInt(getCourseCell(row, 'YL')) || 0,
                xkzt: getCourseCell(row, 'XKZT')
            };
            const key = info.xkkh || (info.kch + '|' + info.bjmc);
            if (seen.has(key)) return;
            seen.add(key);
            const fav = cfg.favorites.find(f => courseMatchesName(info, f.name));
            info.isFav = !!fav;
            info.priority = fav ? fav.priority : 999999;
            courses.push(info);
        });

        // 预览时不强制要求有余量，只把余量作为标注
        const cfgNoYl = Object.assign({}, cfg, { onlyAvailable: false });
        const hit = [];
        for (const c of courses) {
            const r = coursePassFilter(c, cfgNoYl);
            if (r.pass) hit.push(c);
        }
        hit.sort((a, b) => a.priority - b.priority || a.index - b.index);

        const withSeat = hit.filter(c => c.yl > 0).length;
        addLog(`预览：符合筛选共 ${hit.length} 门（有座 ${withSeat} 门，无座 ${hit.length - withSeat} 门）`, 'info');
        for (const c of hit) {
            const tag = c.isFav ? '★优先' + c.priority + ' ' : '';
            const seat = c.yl > 0 ? '有座(' + c.yl + ')' : '无座';
            addLog(`${tag}${c.bjmc || c.kch}｜模块:${c.kcmk}｜属性:${c.kcsx}｜${seat}`, c.yl > 0 ? 'success' : 'warning');
        }
        updateFilterSummary();
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

    // 注入页面上下文：socket.io/WebSocket 断线监控与深度强制重连
    // 当连接断开且页面自身不重新发送时：深度重建传输层强制重连，持续重试，绝不刷新页面
    function injectWsBridge() {
        try {
            const script = document.createElement('script');
            script.type = 'text/javascript';
            script.textContent = `(function(){
                var post = function(type, text, level){ try { window.postMessage({source:'CPPU_WS_BRIDGE', type:type, text:text, level:level||'info'}, '*'); } catch(e){} };
                var STALL_GIVEUP = 15000;       // engine 已 closed 且本地不再重连 -> 快速干预
                var STALL_HUNG   = 60000;       // 连接卡在 opening / 重连中无进展 -> 慢速干预
                var RETRY_MS     = 30000;       // 强制重连的重复重试间隔
                var NOTIFY_MS    = 5*60*1000;   // 长时间未恢复时的提醒间隔
                var stallStart = {}, lastForceAt = {}, lastState = {}, lastNotifyAt = {};

                function healthList() {
                    var out = [];
                    try {
                        var io = window.io;
                        if (io && io.managers) {
                            Object.keys(io.managers).forEach(function(uri){
                                var m = io.managers[uri];
                                var h = {uri: uri, m: m, engineReady: null, reconnecting: null, socketCount: 0, allSocketsDisconnected: false};
                                try { h.engineReady = (m.engine && m.engine.readyState) ? m.engine.readyState : null; } catch(e){}
                                try { h.reconnecting = !!m.reconnecting; } catch(e){}
                                try {
                                    if (m.sockets) {
                                        var ns = Object.keys(m.sockets);
                                        h.socketCount = ns.length;
                                        if (ns.length > 0) {
                                            var anyConnected = false;
                                            ns.forEach(function(n){ try { if (m.sockets[n].connected) anyConnected = true; } catch(e){} });
                                            h.allSocketsDisconnected = !anyConnected;
                                        }
                                    }
                                } catch(e){}
                                out.push(h);
                            });
                        }
                    } catch(e){}
                    return out;
                }

                function isHealthy(h) {
                    if (h.engineReady !== 'open') return false;
                    if (h.allSocketsDisconnected) return false;
                    return true;
                }

                function forceOpen(m) {
                    // 深度重建：先销毁卡死的 transport 与 engine，再重新 open。绝不刷新页面
                    try {
                        var eng = m && m.engine;
                        if (eng && eng.transports) {
                            Object.keys(eng.transports).forEach(function(k){
                                try { var t = eng.transports[k]; if (t && t.close) t.close(); } catch(e){}
                            });
                        }
                        if (eng && eng.close) eng.close();
                    } catch(e){}
                    try { if (m.open) m.open(); } catch(e){}
                    try { if (m.reconnect) m.reconnect(); } catch(e){}
                    try {
                        var ss = m && m.sockets ? Object.keys(m.sockets) : [];
                        ss.forEach(function(ns){ try { m.sockets[ns].connect && m.sockets[ns].connect(); } catch(e){} });
                    } catch(e){}
                }

                setInterval(function(){
                    try {
                        var hs = healthList();
                        if (hs.length === 0) { return; }   // socket.io 未加载或无连接，暂不干预
                        var now = Date.now();
                        hs.forEach(function(h){
                            var uri = h.uri;
                            if (isHealthy(h)) {
                                stallStart[uri] = null; lastForceAt[uri] = null; lastNotifyAt[uri] = null;
                                if (lastState[uri] !== 'healthy') post('ws_status', 'socket.io 连接正常: ' + uri, 'success');
                                lastState[uri] = 'healthy';
                                return;
                            }
                            // 连接断开/异常
                            if (lastState[uri] !== 'unhealthy') post('ws_status', '检测到连接断开/异常: ' + uri + ' (state=' + h.engineReady + ', 重连中=' + h.reconnecting + ')', 'warning');
                            lastState[uri] = 'unhealthy';

                            if (!stallStart[uri]) stallStart[uri] = now;
                            var stallMs = (h.engineReady === 'closed' && !h.reconnecting) ? STALL_GIVEUP : STALL_HUNG;
                            var sinceStall = now - stallStart[uri];

                            // 强制重连（可重复）：卡住超过阈值后，每隔 RETRY_MS 持续深度重试，直到恢复
                            if (sinceStall >= stallMs && (lastForceAt[uri] == null || now - lastForceAt[uri] >= RETRY_MS)) {
                                lastForceAt[uri] = now;
                                post('ws_status', '本地未自动恢复，正在深度强制重连: ' + uri, 'warning');
                                forceOpen(h.m);
                            }
                            // 长时间未恢复 -> 仅提醒，绝不自动刷新页面（避免打断抢课流程）
                            if (sinceStall >= NOTIFY_MS && (lastNotifyAt[uri] == null || now - lastNotifyAt[uri] >= NOTIFY_MS)) {
                                lastNotifyAt[uri] = now;
                                post('ws_status', '连接长时间未恢复，请稍后手动刷新页面彻底重建连接（脚本不会自动刷新页面）', 'error');
                            }
                        });
                    } catch(e){ post('ws_status', 'WebSocket 监控异常: ' + (e && e.message ? e.message : e), 'error'); }
                }, 5000);

                // 轻量 WebSocket 兜底监控（仅记录连接事件，便于排查；主动干预以 socket.io 为准）
                try {
                    var NativeWS = window.WebSocket;
                    if (NativeWS && !window.__CPPU_WS_HOOKED__) {
                        window.__CPPU_WS_HOOKED__ = true;
                        var WSHook = function(url, protocols){
                            var ws = protocols ? new NativeWS(url, protocols) : new NativeWS(url);
                            ws.addEventListener('close', function(){ post('ws_status', 'WebSocket 连接关闭: ' + url, 'warning'); });
                            ws.addEventListener('error', function(){ post('ws_status', 'WebSocket 连接错误: ' + url, 'warning'); });
                            return ws;
                        };
                        WSHook.prototype = NativeWS.prototype;
                        WSHook.CONNECTING = NativeWS.CONNECTING; WSHook.OPEN = NativeWS.OPEN; WSHook.CLOSING = NativeWS.CLOSING; WSHook.CLOSED = NativeWS.CLOSED;
                        window.WebSocket = WSHook;
                    }
                } catch(e){}

                post('ws_status', 'WebSocket/socket.io 断线监控已启动（仅深度重连，不刷新页面）', 'info');
            })();`;
            document.documentElement.appendChild(script);
            script.parentNode.removeChild(script);

            // userscript 侧接收桥接消息并记录日志
            window.addEventListener('message', function(evt) {
                try {
                    const d = evt.data || {};
                    if (d && d.source === 'CPPU_WS_BRIDGE' && d.text) {
                        const level = d.level === 'error' ? 'error' : (d.level === 'warning' ? 'warning' : 'info');
                        addLog('[WS] ' + d.text, level);
                        if (d.level === 'error' && typeof GM_notification !== 'undefined') {
                            GM_notification({ title: '选课助手-连接异常', text: d.text, timeout: 5000 });
                        }
                    }
                } catch (e) {}
            }, false);

            addLog('WebSocket 断线监控已启用', 'info');
        } catch (e) {
            addLog('注入 WebSocket 监控失败: ' + (e && e.message ? e.message : e), 'error');
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

    // 开始自动选课（手动点击"开始选课"时先弹出筛选确认；自动恢复时跳过确认）
    function startAutoSelection(options) {
        if (isRunning) return;

        const skipConfirm = options && options.skipConfirm === true;
        if (!skipConfirm) {
            addLog('开始抢课前需要确认筛选状态...', 'info');
            showFilterConfirmModal(() => beginAutoSelection(), null);
            return;
        }

        addLog('自动恢复选课流程（已跳过筛选确认，如需重新确认请先停止再开始）', 'warning');
        beginAutoSelection();
    }

    // 实际启动选课流程
    function beginAutoSelection() {
        if (isRunning) return;

        isRunning = true;
        GM_setValue('autoSelectRunning', true);
        updateStatus('状态: 运行中', 'status-active');
        addLog('选课助手已启动', 'success');

        // 获取设置值（轮询间隔：默认30秒，最低5秒）
        const refreshIntervalSec = Math.max(5, parseInt(GM_getValue('refreshInterval', 30)) || 30);
        const refreshIntervalValue = refreshIntervalSec * 1000;
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

    // 开始抢课前提醒：确认已手动完成筛选（是否与必修课冲突 / 课程模块）
    function showFilterConfirmModal(onConfirm, onCancel) {
        // 若已存在则先移除
        const existing = document.getElementById('filter-confirm-modal');
        if (existing) existing.remove();

        const modal = document.createElement('div');
        modal.id = 'filter-confirm-modal';
        modal.innerHTML = `
            <div class="filter-confirm-content">
                <div class="filter-confirm-title">开始抢课前确认</div>
                <div class="filter-confirm-body">
                    <p>开始自动抢课前，请确认您已经<strong>手动完成筛选</strong>，否则可能抢到不想要的课程：</p>
                    <div class="filter-confirm-item">
                        <label><input type="checkbox" id="filter-confirm-conflict"> 我已筛选「<strong>是否与本人必修课冲突</strong>」（避免选到冲突课程）</label>
                    </div>
                    <div class="filter-confirm-item">
                        <label><input type="checkbox" id="filter-confirm-module"> 我已筛选「<strong>课程模块</strong>」（避免选到其他模块的课程）</label>
                    </div>
                    <div class="filter-confirm-note">脚本不会自动筛选，请先在页面上手动完成筛选后再开始。也可以在「收藏与筛选」面板里配置模块/属性/黑白名单筛选。</div>
                </div>
                <div class="filter-confirm-buttons">
                    <button class="disclaimer-btn btn-cancel" id="filter-confirm-cancel">取消</button>
                    <button class="disclaimer-btn btn-confirm" id="filter-confirm-ok" disabled>我已确认，开始抢课</button>
                </div>
            </div>
        `;
        document.body.appendChild(modal);

        const okBtn = document.getElementById('filter-confirm-ok');
        const conflictChk = document.getElementById('filter-confirm-conflict');
        const moduleChk = document.getElementById('filter-confirm-module');

        function updateOkState() {
            okBtn.disabled = !(conflictChk.checked && moduleChk.checked);
            okBtn.style.opacity = okBtn.disabled ? '0.5' : '1';
            okBtn.style.cursor = okBtn.disabled ? 'not-allowed' : 'pointer';
        }
        conflictChk.addEventListener('change', updateOkState);
        moduleChk.addEventListener('change', updateOkState);
        updateOkState();

        document.getElementById('filter-confirm-cancel').addEventListener('click', function() {
            modal.remove();
            addLog('已取消开始抢课（筛选确认未完成）', 'warning');
            if (onCancel) onCancel();
        });
        okBtn.addEventListener('click', function() {
            if (okBtn.disabled) return;
            modal.remove();
            addLog('已确认完成筛选，开始抢课', 'success');
            if (onConfirm) onConfirm();
        });
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

    // ===== 记住并恢复上次进入的课程列表 =====
    let lastCourseList = null; // { taskName, actionText, actionIndex }

    function loadLastCourseList() {
        try { lastCourseList = GM_getValue('lastCourseList', null); } catch (e) { lastCourseList = null; }
        return lastCourseList;
    }

    function recordCourseList(taskName, actionText, actionIndex) {
        lastCourseList = { taskName, actionText, actionIndex };
        GM_setValue('lastCourseList', lastCourseList);
        addLog(`已记录课程列表：${taskName} → ${actionText}`, 'info');
    }

    // 捕获任务列表里点击「所有选修课/计划内选课/计划外选课」的动作，记录上下文
    function initCourseListRecorder() {
        document.addEventListener('click', function(evt) {
            try {
                const el = evt.target;
                const action = el && el.closest ? el.closest('.x-action-col-text') : null;
                if (!action) return;
                const row = action.closest('tr');
                if (!row || !row.querySelector('.x-grid-cell-XKRWMC')) return; // 只在任务列表行记录
                const text = action.textContent.trim();
                if (['所有选修课', '计划内选课', '计划外选课'].indexOf(text) < 0) return;
                const taskCell = row.querySelector('.x-grid-cell-XKRWMC .x-grid-cell-inner');
                const taskName = taskCell ? taskCell.textContent.trim() : '';
                const acts = Array.from(action.parentNode.children).filter(c => c.classList && c.classList.contains('x-action-col-text'));
                const actionIndex = acts.indexOf(action);
                if (taskName) recordCourseList(taskName, text, actionIndex);
            } catch (e) {}
        }, true);
    }

    // 尝试重新进入上次进入的课程列表
    function tryReenterCourseList() {
        const last = loadLastCourseList();
        if (!last || !last.taskName) return false;
        const taskRows = Array.from(document.querySelectorAll('tr.x-grid-row.x-grid-data-row'))
            .filter(r => r.querySelector('.x-grid-cell-XKRWMC'));
        for (const row of taskRows) {
            const cell = row.querySelector('.x-grid-cell-XKRWMC .x-grid-cell-inner');
            const name = cell ? cell.textContent.trim() : '';
            if (name !== last.taskName) continue;
            let action = null;
            row.querySelectorAll('.x-action-col-text').forEach(a => {
                if (a.textContent.trim() === last.actionText) action = a;
            });
            if (!action && typeof last.actionIndex === 'number') {
                const acts = row.querySelectorAll('.x-action-col-text');
                action = acts[last.actionIndex] || null;
            }
            if (action) {
                addLog(`重新进入课程列表：${last.taskName} → ${action.textContent.trim()}`, 'info');
                action.click();
                return true;
            }
        }
        return false;
    }

    // 执行选课流程
    function executeSelectionProcess(clickDelay) {
        // 不在课程列表时，尝试恢复上次进入的课程列表
        if (getCourseGridRows().length === 0) {
            addLog('未检测到课程列表，尝试恢复上次进入的课程列表...', 'warning');
            if (tryReenterCourseList()) {
                currentProcess = setTimeout(() => executeSelectionProcess(clickDelay), 4000);
            } else {
                addLog('无法自动恢复课程列表（请手动进入一次选课列表，脚本会记住）', 'error');
            }
            return;
        }

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

    // 点击符合条件的"选课"按钮（收藏优先 + 黑白名单 + 筛选）
    async function clickAllSelectButtons(clickDelay) {
        // 只处理课程网格的行（含余量 YL 列），排除选课任务列表行
        const allRows = document.querySelectorAll('tr.x-grid-row.x-grid-data-row');
        const rows = Array.from(allRows).filter(r => r.querySelector('.x-grid-cell-YL'));

        if (rows.length === 0) {
            addLog('未找到课程行（请先进入「计划外选课」或含课程列表的页面）', 'warning');
            return;
        }

        const cfg = getFilterConfig();
        addLog(`读取到 ${rows.length} 门课程，开始按筛选规则匹配...`, 'info');

        // 解析每门课程信息（按选课课号去重，防止同一课程在两个网格中重复出现）
        const seen = new Set();
        const courses = [];
        rows.forEach((row, index) => {
            const info = {
                row,
                index,
                bjmc: getCourseCell(row, 'BJMC'),   // 听课教学班（如 网球高级）
                kch: getCourseCell(row, 'KCH'),     // 课程编号
                xkkh: getCourseCell(row, 'XKKH'),   // 选课课号
                kcmk: getCourseCell(row, 'KCMK'),   // 课程模块（公共线下课程等）
                kcsx: getCourseCell(row, 'KCSX'),   // 课程属性（选修课等）
                yl: parseInt(getCourseCell(row, 'YL')) || 0, // 余量
                xkzt: getCourseCell(row, 'XKZT'),   // 选课状态（未选/已选）
                teacher: getCourseCell(row, 'SKLSMC')
            };
            const key = info.xkkh || (info.kch + '|' + info.bjmc);
            if (seen.has(key)) return;
            seen.add(key);
            const fav = cfg.favorites.find(f => courseMatchesName(info, f.name));
            info.isFav = !!fav;
            info.priority = fav ? fav.priority : 999999;
            courses.push(info);
        });

        // 应用筛选
        const eligible = [];
        const skipped = [];
        for (const c of courses) {
            const r = coursePassFilter(c, cfg);
            if (r.pass) eligible.push(c);
            else skipped.push({ c, reason: r.reason });
        }

        updateFilterSummary();
        addLog(`筛选结果：符合条件 ${eligible.length} 门，跳过 ${skipped.length} 门`, 'info');
        for (const s of skipped) {
            const label = s.c.bjmc || s.c.kch || ('第' + (s.c.index + 1) + '门');
            addLog(`跳过 ${label}（${s.reason}）`, 'warning');
        }

        // 收藏优先（优先级数字小在前），其余保持原顺序
        eligible.sort((a, b) => a.priority - b.priority || a.index - b.index);

        if (eligible.length === 0) {
            addLog('没有符合条件的课程可抢', 'warning');
            return;
        }

        // 创建弹窗观察器 + 消息观察器
        createPopupObserver();
        createMessageObserver();

        let clickedCount = 0;
        let noButtonCount = 0;
        for (const c of eligible) {
            if (!isRunning) break;

            const label = c.bjmc || c.kch || ('第' + (c.index + 1) + '门');

            // 精确找"选课"按钮（排除"退选"）
            let selectButton = null;
            c.row.querySelectorAll('.x-action-col-text').forEach(btn => {
                if (btn.textContent.trim() === '选课') selectButton = btn;
            });

            if (!selectButton) {
                noButtonCount++;
                addLog(`${label} 未找到"选课"按钮（可能已选或该视图不能选）`, 'warning');
                continue;
            }

            addLog(`正在选择 ${label}（模块:${c.kcmk} 属性:${c.kcsx} 余量:${c.yl}${c.isFav ? ' ★收藏优先' : ''}）`, 'info');

            // 模拟点击
            selectButton.click();
            clickedCount++;

            // 高亮反馈
            selectButton.style.backgroundColor = '#4CAF50';
            selectButton.style.color = 'white';
            setTimeout(() => {
                selectButton.style.backgroundColor = '';
                selectButton.style.color = '';
            }, 500);

            // 等待选课成功消息或超时
            const messagePromise = createMessagePromise();
            try {
                addLog('等待选课成功消息...', 'info');
                updateMessageMonitor('等待选课成功消息');
                await Promise.race([
                    messagePromise,
                    new Promise(resolve => setTimeout(resolve, 10000))
                ]);
                addLog(`${label} 选课操作已完成`, 'success');
                updateMessageMonitor('已操作');
            } catch (error) {
                addLog(`${label} 选课可能未成功`, 'warning');
            }

            // 点击间隔
            await new Promise(resolve => setTimeout(resolve, clickDelay));
        }

        addLog(`本次已尝试选择 ${clickedCount} 门课程，未找到按钮 ${noButtonCount} 门`, 'success');
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
