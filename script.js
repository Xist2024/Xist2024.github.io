/**
 * Xist2024 个人主页脚本
 * 版本: v1.7 (新增格言模块)
 * 核心功能:
 * 1. 动态时钟与网站运行时间
 * 2. 可复用的顶部通知框 (Toast)
 * 3. 剪贴板复制功能
 * 4. 弹窗小工具框架 (计算器, 搜索引擎)
 * 5. 内置歌单、带音量控制的稳定音乐播放器
 * 6. 每日格言随机显示
 *
 * 由网页匠神 (xAI) 为 Xist2024 定制
 * 最后更新日期: 2025-07-11
 */

// --- 页面全局初始化与时钟 ---

// 设置网站建立的精确时间
const websiteStartTime = new Date(2025, 6, 9, 1, 22, 0);

function updateClockAndUptime() {
    const now = new Date();
    // 使用 padStart 确保时间数字总是两位数
    let hours = now.getHours().toString().padStart(2, '0');
    let minutes = now.getMinutes().toString().padStart(2, '0');
    let seconds = now.getSeconds().toString().padStart(2, '0');
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
    if (years > 0) uptimeString += `${years} 年 `;
    uptimeString += `${days} 天 ${hoursUptime} 小时 ${minutesUptime} 分 ${secondsUptime} 秒`;
    document.getElementById('uptime').textContent = uptimeString;
}

// --- 通用工具函数 ---

let toastTimeout;
function showToast(message, duration = 2000) {
    const toast = document.getElementById('toast-notification');
    if (!toast) {
        console.error("网页匠神提示：HTML中缺少 id='toast-notification' 的元素！");
        return;
    }
    clearTimeout(toastTimeout);
    toast.textContent = message;
    toast.classList.remove('show');
    setTimeout(() => { toast.classList.add('show'); }, 10);
    toastTimeout = setTimeout(() => { toast.classList.remove('show'); }, duration);
}

async function copyToClipboard(content, itemType) {
    if (navigator.clipboard && window.isSecureContext) {
        try {
            await navigator.clipboard.writeText(content);
            showToast(`${itemType} 已成功复制！`);
        } catch (err) {
            console.error('复制失败: ', err);
            showToast(`复制失败，浏览器可能不支持。`, 3000);
        }
    } else {
        const textArea = document.createElement("textarea");
        textArea.value = content;
        textArea.style.position = "fixed";
        textArea.style.left = "-9999px";
        document.body.appendChild(textArea);
        textArea.select();
        try {
            document.execCommand('copy');
            showToast(`${itemType} 已成功复制！`);
        } catch (err) {
            console.error('备用复制方法失败: ', err);
            showToast(`复制失败，请尝试手动复制。`, 3000);
        }
        document.body.removeChild(textArea);
    }
}

// --- 弹窗小工具框架 ---

const popupContainer = document.getElementById('popup-container');
let currentKeyListener = null;

function createPopup(title, contentHtml, specificClass = '') {
    if (currentKeyListener) {
        document.removeEventListener('keydown', currentKeyListener);
        currentKeyListener = null;
    }
    popupContainer.innerHTML = '';
    const popupCard = document.createElement('div');
    popupCard.className = 'popup-card ' + specificClass;
    popupCard.innerHTML = `
        <button class="close-button" onclick="closePopup()"></button>
        <h2>${title}</h2>
        <div>${contentHtml}</div>
    `;
    popupContainer.appendChild(popupCard);
    popupContainer.classList.add('show');
}

function closePopup() {
    popupContainer.classList.remove('show');
    if (currentKeyListener) {
        document.removeEventListener('keydown', currentKeyListener);
        currentKeyListener = null;
    }
    setTimeout(() => { popupContainer.innerHTML = ''; }, 300);
}

// --- 小工具定义 ---

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
    currentKeyListener = (e) => {
        if (e.key === 'Enter') performSearch();
        if (e.key === 'Escape') closePopup();
    };
    document.addEventListener('keydown', currentKeyListener);
    searchInput.focus();
}

function setupCalculator() {
    const calculatorHtml = `
        <div id="calculator-inner-content">
            <div class="calculator">
                <div id="calculator-display">0</div>
                <button class="calc-button clear-button" data-value="C">C</button><button class="calc-button function-button" data-value="(">(</button><button class="calc-button function-button" data-value=")">)</button><button class="calc-button operator" data-value="/">÷</button>
                <button class="calc-button" data-value="7">7</button><button class="calc-button" data-value="8">8</button><button class="calc-button" data-value="9">9</button><button class="calc-button operator" data-value="*">×</button>
                <button class="calc-button" data-value="4">4</button><button class="calc-button" data-value="5">5</button><button class="calc-button" data-value="6">6</button><button class="calc-button operator" data-value="-">-</button>
                <button class="calc-button" data-value="1">1</button><button class="calc-button" data-value="2">2</button><button class="calc-button" data-value="3">3</button><button class="calc-button operator" data-value="+">+</button>
                <button class="calc-button function-button" data-value="%">%</button><button class="calc-button" data-value="0">0</button><button class="calc-button" data-value=".">.</button><button class="calc-button equals-button" data-value="=">=</button>
            </div>
        </div>
    `;
    createPopup('计算器', calculatorHtml, 'calculator-popup');
    const calculatorContent = document.querySelector('.popup-card.calculator-popup .calculator');
    if (!calculatorContent) return;
    const display = calculatorContent.querySelector('#calculator-display');
    let currentExpression = '';
    let lastIsEquals = false;
    calculatorContent.addEventListener('click', (e) => {
        if (e.target.matches('.calc-button')) {
            handleInput(e.target.dataset.value);
        }
    });
    currentKeyListener = (e) => {
        e.preventDefault();
        let key = e.key;
        if (key === 'Enter') key = '=';
        if (key === 'Backspace') key = 'C';
        if (key === ',') key = '.';
        const button = calculatorContent.querySelector(`.calc-button[data-value="${key}"]`);
        if (button) {
            handleInput(key);
            button.style.transform = 'scale(0.95)';
            setTimeout(() => button.style.transform = '', 100);
        } else if (e.key === 'Escape') {
            closePopup();
        }
    };
    document.addEventListener('keydown', currentKeyListener);
    function handleInput(value) {
        const isOperator = ['+', '-', '*', '/'].includes(value);
        if (value === 'C') { currentExpression = ''; display.textContent = '0'; lastIsEquals = false; return; }
        if (value === '=') {
            if (currentExpression === '' || ['+', '-', '*', '/', '.'].includes(currentExpression.slice(-1))) return;
            try {
                let evalExpression = currentExpression.replace(/%/g, '/100');
                let result = new Function('return ' + evalExpression)();
                if (!isFinite(result)) throw new Error("Result is not finite");
                result = parseFloat(result.toFixed(10));
                display.textContent = result;
                currentExpression = String(result);
                lastIsEquals = true;
            } catch (error) { display.textContent = 'Error'; currentExpression = ''; lastIsEquals = false; console.error("计算错误:", error); }
            return;
        }
        if (lastIsEquals && !isOperator && value !== '.') { currentExpression = ''; }
        lastIsEquals = false;
        if (display.textContent === '0' && !isOperator && value !== '.') { currentExpression = value; }
        else if (display.textContent === 'Error') { currentExpression = value; }
        else {
            if (isOperator && ['+', '-', '*', '/'].includes(currentExpression.slice(-1))) { currentExpression = currentExpression.slice(0, -1) + value; }
            else { currentExpression += value; }
        }
        display.textContent = currentExpression.replace(/\*/g, '×').replace(/\//g, '÷');
    }
}


// --- v1.6 音乐播放器逻辑 (带音量控制，终极稳定版) ---
document.addEventListener('DOMContentLoaded', () => {

    // 内置歌单，确保100%可靠加载
    const songList = [
        "Croatian_Rhapsody.m4a",
        "Fish_in_the_pool.m4a",
        "Journey.m4a",
        "My_soul.m4a",
        "Time_to_love.m4a",
        "Nocturne5.m4a"
    ];

    // 将所有DOM元素获取集中在一起，方便管理
    const audioPlayer = document.getElementById('audio-player');
    const songTitle = document.getElementById('song-title');
    const playPauseBtn = document.getElementById('play-pause-btn');
    const nextBtn = document.getElementById('next-btn');
    const progressBarContainer = document.getElementById('progress-bar-container');
    const progressBar = document.getElementById('progress-bar');
    const timeDisplay = document.getElementById('time-display');
    const volumeIcon = document.getElementById('volume-icon');
    const volumeSlider = document.getElementById('volume-slider');

    // 播放器状态变量
    let currentSongIndex = -1;
    let isPlaying = false;
    let isAudioUnlocked = false;

    // 初始化函数
    function initializePlayer() {
        if (songList.length === 0) {
            songTitle.textContent = "歌曲列表为空";
            return;
        }
        setupPlayerEvents();
        loadInitialSong();
        // 设置初始音量
        audioPlayer.volume = volumeSlider.value;
        updateVolumeIcon();
    }

    // 事件绑定函数
    function setupPlayerEvents() {
        playPauseBtn.addEventListener('click', playPauseToggle);
        nextBtn.addEventListener('click', () => playNextSong(true));
        audioPlayer.addEventListener('timeupdate', updateProgress);
        audioPlayer.addEventListener('ended', () => playNextSong(true));
        progressBarContainer.addEventListener('click', setProgress);
        volumeSlider.addEventListener('input', handleVolumeChange);
        volumeIcon.addEventListener('click', toggleMute);
    }

    function loadInitialSong() {
        playNextSong(false); // 页面加载，只加载，不播放
    }

    // 音频上下文与解锁
    function unlockAudioContext() {
        if (isAudioUnlocked) return;
        // 这是解决“没声音”最可靠的方式
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        if (audioContext.state === 'suspended') {
            audioContext.resume();
        }
        // 将audio元素连接到扬声器
        const source = audioContext.createMediaElementSource(audioPlayer);
        source.connect(audioContext.destination);
        isAudioUnlocked = true;
        console.log("音频上下文已成功激活并连接！");
    }

    // 核心播放逻辑
    function playSong() {
        unlockAudioContext(); // 每次播放前都确保上下文已激活
        isPlaying = true;
        playPauseBtn.classList.add('playing');
        const playPromise = audioPlayer.play();
        if (playPromise !== undefined) {
            playPromise.catch(error => {
                console.error("播放失败:", error);
                pauseSong();
            });
        }
    }

    function pauseSong() {
        isPlaying = false;
        playPauseBtn.classList.remove('playing');
        audioPlayer.pause();
    }

    function playPauseToggle() {
        if (isPlaying) {
            pauseSong();
        } else {
            playSong();
        }
    }

    function loadSong(songIndex) {
        currentSongIndex = songIndex;
        const songFileName = songList[songIndex];
        songTitle.textContent = songFileName.replace(/\.m4a$/, '');
        // 关键改动：将 'audio/' 前缀移除
        audioPlayer.src = songFileName;
        audioPlayer.addEventListener('loadedmetadata', updateProgress, { once: true });
    }

    function playNextSong(shouldPlay = false) {
        if (songList.length === 0) return;
        let newIndex;
        if (songList.length <= 1) {
            newIndex = 0;
        } else {
            do {
                newIndex = Math.floor(Math.random() * songList.length);
            } while (newIndex === currentSongIndex);
        }
        loadSong(newIndex);
        if (shouldPlay) {
            playSong();
        }
    }

    // 进度与时间格式化
    function formatTime(seconds) {
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }

    function updateProgress() {
        if (audioPlayer.duration) {
            const progressPercent = (audioPlayer.currentTime / audioPlayer.duration) * 100;
            progressBar.style.width = `${progressPercent}%`;
            timeDisplay.textContent = `${formatTime(audioPlayer.currentTime)} / ${formatTime(audioPlayer.duration)}`;
        }
    }

    function setProgress(e) {
        const width = progressBarContainer.clientWidth;
        const clickX = e.offsetX;
        const duration = audioPlayer.duration;
        if (duration) {
            audioPlayer.currentTime = (clickX / width) * duration;
        }
    }

    // 音量控制逻辑
    function handleVolumeChange() {
        audioPlayer.volume = this.value;
        if (audioPlayer.muted) {
            audioPlayer.muted = false;
        }
        updateVolumeIcon();
    }

    function toggleMute() {
        audioPlayer.muted = !audioPlayer.muted;
        updateVolumeIcon();
    }

    function updateVolumeIcon() {
        if (audioPlayer.muted || audioPlayer.volume === 0) {
            volumeIcon.textContent = '🔇';
            // 如果是因为音量为0而静音，则同步滑块位置
            if(!audioPlayer.muted) volumeSlider.value = 0;
        } else if (audioPlayer.volume < 0.5) {
            volumeIcon.textContent = '🔉';
        } else {
            volumeIcon.textContent = '🔊';
        }
        // 如果取消静音且音量为0，则恢复一个默认音量
        if (!audioPlayer.muted && audioPlayer.volume === 0) {
            audioPlayer.volume = 0.5;
            volumeSlider.value = 0.5;
            volumeIcon.textContent = '🔉';
        }
    }

    // 启动播放器
    initializePlayer();
});


// --- 新增：v1.7 格言逻辑 ---
async function loadAndDisplayMotto() {
    const mottoDisplay = document.getElementById('motto-display');
    try {
        const response = await fetch('mottos.txt');
        if (!response.ok) {
            throw new Error('网络响应错误');
        }
        const text = await response.text();
        const mottos = text.split('\n').filter(m => m.trim() !== ''); // 按行分割并过滤空行
        if (mottos.length > 0) {
            const randomIndex = Math.floor(Math.random() * mottos.length);
            mottoDisplay.textContent = mottos[randomIndex];
        } else {
            mottoDisplay.textContent = '暂无格言。';
        }
    } catch (error) {
        console.error('加载格言失败:', error);
        mottoDisplay.textContent = '无法加载格言，请检查网络或文件。';
    }
}


// --- 页面全局心跳 ---

// 每1秒更新一次时钟和运行时间
setInterval(updateClockAndUptime, 1000);

// 页面加载时立即更新一次，避免初始空白
document.addEventListener('DOMContentLoaded', () => {
    updateClockAndUptime();
    loadAndDisplayMotto(); // 同时加载格言
});




// ==================================================================
// --- 丝滑鼠标跟随动效代码 开始 ---
// (粘贴到 navigation.js 文件末尾)
// ==================================================================

// --- 配置参数 ---
const TRAIL_LENGTH = 14; // 尾巴的点的数量
const EASE_FACTOR = 0.45; // 缓动系数，值越小，延迟感越强，尾巴越长
const HUE_START = 900;   // 颜色变化的起始 HSL 色相值

// --- 全局变量 ---
const dots = []; // 存储所有点的数组
const mouse = { x: window.innerWidth / 2, y: window.innerHeight / 2 }; // 鼠标坐标，初始在屏幕中心

// --- 初始化 ---
// 创建指定数量的 DOM 元素（点），并初始化它们在数组中的状态
for (let i = 0; i < TRAIL_LENGTH; i++) {
    const dotElement = document.createElement('div');
    dotElement.classList.add('trail-dot');
    document.body.appendChild(dotElement);

    dots.push({
        element: dotElement,
        x: mouse.x,
        y: mouse.y,
    });
}

// --- 事件监听 ---
// 监听鼠标移动事件，更新鼠标坐标
window.addEventListener('mousemove', (event) => {
    mouse.x = event.clientX;
    mouse.y = event.clientY;
});

// --- 动画循环 ---
function animate() {
    // 定义前一个点的位置，第一个点（索引为0）的目标是鼠标的当前位置
    let prevX = mouse.x;
    let prevY = mouse.y;

    // 遍历所有的点
    dots.forEach((dot, index) => {
        // 使用线性插值（Lerping）计算当前点的新位置
        dot.x += (prevX - dot.x) * EASE_FACTOR;
        dot.y += (prevY - dot.y) * EASE_FACTOR;

        // 计算当前点的大小和不透明度
        const scale = (TRAIL_LENGTH - index) / TRAIL_LENGTH;
        const opacity = scale * 0.8 + 0.1; // 保证最末尾的点也有一点点可见

        // 更新 DOM 元素的样式
        dot.element.style.transform = `translate(${dot.x}px, ${dot.y}px) scale(${scale})`;
        dot.element.style.opacity = opacity;
        
        // HSL 颜色模型 (色相, 饱和度, 亮度)
        // 我们通过改变色相（Hue）来创建彩虹色的效果
        const hue = (HUE_START + index * 5) % 360;
        dot.element.style.backgroundColor = `hsl(${hue}, 80%, 60%)`;

        // 更新“前一个点”的位置，为下一次循环做准备
        prevX = dot.x;
        prevY = dot.y;
    });

    // 请求下一帧动画，形成无限循环
    requestAnimationFrame(animate);
}

// --- 启动动画 ---
animate();

// --- 丝滑鼠标跟随动效代码 结束 ---
