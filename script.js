// 设置网站建立的精确时间 (2025年7月9日 1:22:00)
const websiteStartTime = new Date(2025, 6, 9, 1, 22, 0);

function updateClockAndUptime() {
    const now = new Date();
    let hours = now.getHours();
    let minutes = now.getMinutes();
    let seconds = now.getSeconds();
    hours = hours < 10 ? '0' + hours : hours;
    minutes = minutes < 10 ? '0' + minutes : minutes;
    seconds = seconds < 10 ? '0' + seconds : seconds;
    document.getElementById('current-time').textContent = `${hours}:${minutes}:${seconds}`;

    const options = { year: 'numeric', month: 'long', day: 'numeric', weekday: 'long' };
    document.getElementById('current-date').textContent = now.toLocaleDateString('zh-CN', options);

    const diff = now.getTime() - websiteStartTime.getTime();
    if (diff < 0) {
        document.getElementById('uptime').textContent = "网站尚未开始运行...";
        return;
    }

    const totalSeconds = Math.floor(diff / 1000);
    const years = Math.floor(totalSeconds / (365.25 * 24 * 60 * 60));
    const days = Math.floor((totalSeconds % (365.25 * 24 * 60 * 60)) / (24 * 60 * 60));
    const hoursUptime = Math.floor((totalSeconds % (24 * 60 * 60)) / (60 * 60));
    const minutesUptime = Math.floor((totalSeconds % (60 * 60)) / 60);
    const secondsUptime = totalSeconds % 60;

    let uptimeString = '';
    if (years > 0) {
        uptimeString += `${years} 年 `;
    }
    uptimeString += `${days} 天 ${hoursUptime} 小时 ${minutesUptime} 分 ${secondsUptime} 秒`;
    document.getElementById('uptime').textContent = uptimeString;
}

async function copyToClipboard(content, itemType) {
    try {
        await navigator.clipboard.writeText(content);
        alert(`${itemType} 已复制到剪贴板: ${content}`);
    } catch (err) {
        console.error('复制失败: ', err);
        alert(`复制 ${itemType} 失败。请手动复制: ${content}`);
    }
}

// --- 弹窗相关逻辑 ---
const popupContainer = document.getElementById('popup-container');
let currentKeyListener = null; // 用于存储当前活动的键盘监听器

// 创建通用弹窗函数
function createPopup(title, contentHtml, specificClass = '') {
    // 在打开新弹窗前，移除旧的键盘监听器
    if (currentKeyListener) {
        document.removeEventListener('keydown', currentKeyListener);
        currentKeyListener = null;
    }

    popupContainer.innerHTML = ''; // 清空现有弹窗内容
    const popupCard = document.createElement('div');
    popupCard.className = 'popup-card ' + specificClass; // 允许添加特定类

    const closeButton = document.createElement('button');
    closeButton.className = 'close-button';
    closeButton.onclick = closePopup;

    const popupTitle = document.createElement('h2');
    popupTitle.textContent = title;

    const popupContent = document.createElement('div');
    popupContent.innerHTML = contentHtml;
    popupContent.style.textAlign = 'center'; // 确保内容居中，如果需要

    popupCard.appendChild(closeButton);
    popupCard.appendChild(popupTitle);
    popupCard.appendChild(popupContent);
    popupContainer.appendChild(popupCard);
    popupContainer.classList.add('show');
}

// 关闭弹窗函数
function closePopup() {
    popupContainer.classList.remove('show');
    // 移除当前活动的键盘监听器
    if (currentKeyListener) {
        document.removeEventListener('keydown', currentKeyListener);
        currentKeyListener = null;
    }
    // 清空内容，防止下次打开时闪烁旧内容
    setTimeout(() => { popupContainer.innerHTML = ''; }, 300); // 等待动画结束
}

// --- 搜索引擎弹窗逻辑 ---
function setupSearchEngine() {
    const searchHtml = `
        <div class="search-popup-content">
            <input type="text" id="search-input" placeholder="输入搜索内容..." autofocus>
            <button id="search-button">搜索</button>
        </div>
    `;
    createPopup('必应搜索', searchHtml);

    const searchInput = document.getElementById('search-input');
    const searchButton = document.getElementById('search-button');

    const performSearch = () => {
        const query = searchInput.value.trim();
        if (query) {
            window.open(`https://www.bing.com/search?q=${encodeURIComponent(query)}`, '_blank');
            closePopup();
        }
    };

    searchButton.addEventListener('click', performSearch);
    // 为搜索框添加键盘事件监听器
    currentKeyListener = (e) => {
        if (e.key === 'Enter') {
            performSearch();
        }
    };
    document.addEventListener('keydown', currentKeyListener);

    // 聚焦输入框
    searchInput.focus();
}


// --- 计算器逻辑 ---
function setupCalculator() {
    const calculatorHtml = `
        <div id="calculator-inner-content">
            <div class="calculator">
                <div id="calculator-display">0</div>

                <button class="calc-button clear-button" data-value="C">C</button>
                <button class="calc-button function-button" data-value="(">(</button>
                <button class="calc-button function-button" data-value="%)">%</button>
                <button class="calc-button operator" data-value="/">&divide;</button>

                <button class="calc-button" data-value="7">7</button>
                <button class="calc-button" data-value="8">8</button>
                <button class="calc-button" data-value="9">9</button>
                <button class="calc-button operator" data-value="*">&times;</button>

                <button class="calc-button" data-value="4">4</button>
                <button class="calc-button" data-value="5">5</button>
                <button class="calc-button" data-value="6">6</button>
                <button class="calc-button operator" data-value="-">-</button>

                <button class="calc-button" data-value="1">1</button>
                <button class="calc-button" data-value="2">2</button>
                <button class="calc-button" data-value="3">3</button>
                <button class="calc-button operator" data-value="+">+</button>

                <button class="calc-button function-button" data-value="+/-">+/-</button>
                <button class="calc-button" data-value="0">0</button>
                <button class="calc-button" data-value=".">.</button>
                <button class="calc-button equals-button" data-value="=">=</button>
            </div>
        </div>
    `;
    // 给弹窗添加一个特定的类，方便后续选择内部元素
    createPopup('计算器', calculatorHtml, 'calculator-popup');

    // 确保在DOM中找到计算器元素
    const calculatorContent = document.querySelector('.popup-card.calculator-popup .calculator');
    if (!calculatorContent) {
        console.error("Calculator content not found after creating popup.");
        return; // 如果没找到，就停止执行
    }

    const display = calculatorContent.querySelector('#calculator-display');
    let currentExpression = ''; // 用于存储完整的表达式
    let lastIsOperator = false; // 判断上一个输入是否为操作符
    let lastIsEquals = false; // 判断上一个是否是等号

    // 键盘事件监听器，用于计算器
    currentKeyListener = (e) => {
        const key = e.key;
        let buttonValue = '';

        if (key >= '0' && key <= '9') {
            buttonValue = key;
        } else if (key === '.') {
            buttonValue = '.';
        } else if (key === '+') {
            buttonValue = '+';
        } else if (key === '-') {
            buttonValue = '-';
        } else if (key === '*') {
            buttonValue = '*';
        } else if (key === '/') {
            buttonValue = '/';
        } else if (key === 'Enter') {
            buttonValue = '=';
            e.preventDefault(); // 防止回车键触发其他默认行为，如表单提交
        } else if (key === 'Backspace') {
            // 实现退格键功能
            if (currentExpression.length > 0) {
                currentExpression = currentExpression.slice(0, -1);
                display.textContent = currentExpression || '0';
                lastIsOperator = ['+', '-', '*', '/'].includes(currentExpression.slice(-1));
                lastIsEquals = false;
            }
            e.preventDefault();
            return;
        } else if (key === 'Escape') {
            closePopup(); // Esc键关闭弹窗
            return;
        } else if (key.toLowerCase() === 'c') {
            buttonValue = 'C';
        }


        // 模拟点击对应的按钮
        if (buttonValue) {
            const simulatedButton = calculatorContent.querySelector(`.calc-button[data-value="${buttonValue}"]`);
            if (simulatedButton) {
                simulatedButton.click();
            }
        }
    };
    document.addEventListener('keydown', currentKeyListener);

    calculatorContent.querySelectorAll('.calc-button').forEach(button => {
        button.addEventListener('click', () => {
            const value = button.dataset.value;

            if (value === 'C') {
                currentExpression = '';
                display.textContent = '0';
                lastIsOperator = false;
                lastIsEquals = false;
                return;
            }

            if (value === '=') {
                try {
                    // 检查表达式是否为空或者以运算符结尾
                    if (currentExpression === '' || lastIsOperator) {
                        display.textContent = 'Error';
                        currentExpression = '';
                        return;
                    }

                    let result = eval(currentExpression.replace(/×/g, '*').replace(/÷/g, '/'));
                    if (result % 1 !== 0) {
                        result = parseFloat(result.toFixed(8));
                    }
                    display.textContent = result;
                    currentExpression = String(result);
                    lastIsEquals = true;
                } catch (e) {
                    display.textContent = 'Error';
                    currentExpression = '';
                }
                lastIsOperator = false;
                return;
            }

            if (['+', '-', '*', '/'].includes(value)) {
                if (lastIsOperator && currentExpression.length > 0) {
                    currentExpression = currentExpression.slice(0, -1) + value;
                } else if (currentExpression === '' && value === '-') {
                    currentExpression += value; // 允许以负号开始
                } else if (currentExpression !== '' || display.textContent !== '0') {
                    currentExpression += value;
                } else if (currentExpression === '' && display.textContent === '0' && value === '-') {
                    currentExpression = value; // 允许从0开始的负数
                }
                lastIsOperator = true;
                lastIsEquals = false;
            } else if (value === '+/-') {
                if (currentExpression !== '' && display.textContent !== 'Error') {
                    let parts = currentExpression.split(/([\+\-\*\/])/);
                    let lastPart = parts.pop();
                    let num = parseFloat(lastPart);
                    if (!isNaN(num)) {
                        const newNum = -num;
                        currentExpression = parts.join('') + String(newNum);
                        display.textContent = newNum;
                    }
                } else if (currentExpression === '') { // 如果是0，直接变-0
                     currentExpression = '-0';
                     display.textContent = '-0';
                }
                lastIsOperator = false;
                lastIsEquals = false;
            } else if (value === '%') {
                if (currentExpression !== '' && display.textContent !== 'Error') {
                    let parts = currentExpression.split(/([\+\-\*\/])/);
                    let lastPart = parts.pop();
                    let num = parseFloat(lastPart);
                    if (!isNaN(num)) {
                        const newNum = num / 100;
                        currentExpression = parts.join('') + String(newNum);
                        display.textContent = newNum;
                    }
                }
                lastIsOperator = false;
                lastIsEquals = false;
            } else if (value === '(' || value === ')') {
                 currentExpression += value;
                 lastIsOperator = false;
                 lastIsEquals = false;
            } else if (value === '.') {
                const lastPart = currentExpression.split(/[\+\-\*\/()]/).pop(); // 分割时也考虑括号
                if (lastPart.includes('.')) {
                    return;
                }
                if (lastIsOperator || lastIsEquals || currentExpression === '' || currentExpression.endsWith('(')) {
                     currentExpression += '0.';
                } else {
                    currentExpression += '.';
                }
                lastIsOperator = false;
                lastIsEquals = false;
            } else { // 数字
                if (lastIsEquals) {
                    currentExpression = value;
                } else if (lastIsOperator) {
                    currentExpression += value;
                } else {
                    if (display.textContent === '0' && currentExpression === '0' && value !== '.') { // 防止多个0
                        currentExpression = value;
                    } else {
                        currentExpression += value;
                    }
                }
                lastIsOperator = false;
                lastIsEquals = false;
            }

            // 更新显示屏内容
            // 显示当前输入或表达式的最后部分
            const displayableExpression = currentExpression.replace(/\*/g, '×').replace(/\//g, '÷');
            display.textContent = displayableExpression || '0';
        });
    });
}

// 每1秒更新一次时钟和运行时间
setInterval(updateClockAndUptime, 1000);

// 页面加载时立即更新一次，避免初始空白
updateClockAndUptime();
