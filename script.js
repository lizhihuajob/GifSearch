const DEFAULT_API_KEY = 'dc6zaTOxFJmzC';
const BASE_URL = 'https://api.giphy.com/v1';
const LIMIT = 20;

let API_KEY = DEFAULT_API_KEY;
let currentOffset = 0;
let currentQuery = '';
let isLoading = false;
let totalCount = 0;
let isSearchMode = false;

const searchInput = document.getElementById('searchInput');
const searchButton = document.getElementById('searchButton');
const trendingButton = document.getElementById('trendingButton');
const gifGrid = document.getElementById('gifGrid');
const loading = document.getElementById('loading');
const loadMoreContainer = document.getElementById('loadMoreContainer');
const loadMoreButton = document.getElementById('loadMoreButton');
const noResults = document.getElementById('noResults');
const errorMessage = document.getElementById('errorMessage');
const resultsInfo = document.getElementById('resultsInfo');
const modal = document.getElementById('modal');
const modalImage = document.getElementById('modalImage');
const modalTitle = document.getElementById('modalTitle');
const modalLink = document.getElementById('modalLink');
const closeModal = document.querySelector('.close');

document.addEventListener('DOMContentLoaded', () => {
    initializeApiKey();
    loadTrendingGifs();
    setupEventListeners();
});

function initializeApiKey() {
    const storedKey = localStorage.getItem('giphy_api_key');
    if (storedKey && storedKey.trim()) {
        API_KEY = storedKey.trim();
    }
}

function showApiKeyHelp() {
    const helpMessage = document.createElement('div');
    helpMessage.className = 'api-key-help';
    helpMessage.innerHTML = `
        <div class="api-key-help-content">
            <h3>需要配置 API Key</h3>
            <p>检测到 Giphy API 请求失败。这可能是因为默认的测试 API Key 已失效。</p>
            <p>请按以下步骤获取您自己的 API Key：</p>
            <ol>
                <li>访问 <a href="https://developers.giphy.com/" target="_blank">Giphy Developers</a> 网站</li>
                <li>注册账号并登录</li>
                <li>点击 "Create an API Key" 创建应用</li>
                <li>选择 "API" 选项（非 SDK）</li>
                <li>填写应用信息后即可获得 API Key</li>
                <li>将 API Key 输入下方输入框</li>
            </ol>
            <div class="api-key-input-section">
                <input type="text" id="apiKeyInput" placeholder="输入您的 Giphy API Key" />
                <button id="saveApiKeyButton">保存</button>
            </div>
            <p class="note">注意：免费的 Beta Key 每小时限制 100 次 API 调用。</p>
        </div>
    `;
    
    helpMessage.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background-color: rgba(0, 0, 0, 0.9);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 2000;
        padding: 20px;
    `;
    
    const style = document.createElement('style');
    style.textContent = `
        .api-key-help-content {
            background-color: white;
            padding: 30px;
            border-radius: 12px;
            max-width: 600px;
            width: 100%;
            max-height: 90vh;
            overflow-y: auto;
        }
        .api-key-help-content h3 {
            color: #667eea;
            margin-bottom: 15px;
            font-size: 1.5rem;
        }
        .api-key-help-content p {
            color: #333;
            margin-bottom: 15px;
            line-height: 1.6;
        }
        .api-key-help-content ol {
            margin: 20px 0;
            padding-left: 25px;
        }
        .api-key-help-content li {
            margin-bottom: 10px;
            color: #333;
        }
        .api-key-help-content a {
            color: #667eea;
            text-decoration: none;
        }
        .api-key-help-content a:hover {
            text-decoration: underline;
        }
        .api-key-input-section {
            display: flex;
            gap: 10px;
            margin: 20px 0;
        }
        .api-key-input-section input {
            flex: 1;
            padding: 12px 15px;
            border: 2px solid #ddd;
            border-radius: 8px;
            font-size: 1rem;
        }
        .api-key-input-section input:focus {
            border-color: #667eea;
            outline: none;
        }
        .api-key-input-section button {
            padding: 12px 25px;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            border: none;
            border-radius: 8px;
            cursor: pointer;
            font-weight: 600;
            transition: all 0.3s ease;
        }
        .api-key-input-section button:hover {
            transform: translateY(-2px);
            box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
        }
        .api-key-help-content .note {
            font-size: 0.9rem;
            color: #666;
            font-style: italic;
        }
    `;
    
    document.head.appendChild(style);
    document.body.appendChild(helpMessage);
    
    const apiKeyInput = document.getElementById('apiKeyInput');
    const saveButton = document.getElementById('saveApiKeyButton');
    
    saveButton.addEventListener('click', () => {
        const key = apiKeyInput.value.trim();
        if (key) {
            localStorage.setItem('giphy_api_key', key);
            API_KEY = key;
            helpMessage.remove();
            loadTrendingGifs();
        }
    });
    
    apiKeyInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            saveButton.click();
        }
    });
}

function setupEventListeners() {
    searchButton.addEventListener('click', handleSearch);
    searchInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            handleSearch();
        }
    });
    
    trendingButton.addEventListener('click', () => {
        searchInput.value = '';
        loadTrendingGifs();
    });
    
    loadMoreButton.addEventListener('click', loadMoreGifs);
    
    closeModal.addEventListener('click', () => {
        modal.style.display = 'none';
    });
    
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.style.display = 'none';
        }
    });
    
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && modal.style.display === 'flex') {
            modal.style.display = 'none';
        }
    });
}

function showLoading(show) {
    loading.style.display = show ? 'flex' : 'none';
}

function showError(show, message = null) {
    errorMessage.style.display = show ? 'block' : 'none';
    if (message) {
        errorMessage.innerHTML = `<p>${message}</p>`;
    }
}

function showNoResults(show) {
    noResults.style.display = show ? 'block' : 'none';
}

function showLoadMoreButton(show) {
    loadMoreContainer.style.display = show ? 'block' : 'none';
}

function clearGifGrid() {
    gifGrid.innerHTML = '';
}

function createGifCard(gif) {
    const card = document.createElement('div');
    card.className = 'gif-item';
    
    const image = document.createElement('img');
    image.src = gif.images.fixed_width.url;
    image.alt = gif.title || 'GIF';
    image.loading = 'lazy';
    
    const info = document.createElement('div');
    info.className = 'gif-info';
    
    const title = document.createElement('h3');
    title.textContent = gif.title || '无标题';
    
    const user = document.createElement('p');
    user.className = 'user';
    user.textContent = gif.username ? `by ${gif.username}` : '';
    
    info.appendChild(title);
    if (gif.username) {
        info.appendChild(user);
    }
    
    card.appendChild(image);
    card.appendChild(info);
    
    card.addEventListener('click', () => {
        openModal(gif);
    });
    
    return card;
}

function renderGifs(gifs) {
    gifs.forEach(gif => {
        const card = createGifCard(gif);
        gifGrid.appendChild(card);
    });
}

function updateResultsInfo(start, end, total, isSearch = false, query = '') {
    if (total === 0) {
        resultsInfo.textContent = '';
        return;
    }
    
    if (isSearch && query) {
        resultsInfo.textContent = `搜索 "${query}"：显示 ${start + 1}-${Math.min(end, total)} 个结果（共 ${total} 个）`;
    } else {
        resultsInfo.textContent = `热门 GIF：显示 ${start + 1}-${Math.min(end, total)} 个结果`;
    }
}

async function fetchTrendingGifs(offset = 0) {
    const url = `${BASE_URL}/gifs/trending?api_key=${API_KEY}&limit=${LIMIT}&offset=${offset}&rating=g`;
    const response = await fetch(url);
    
    if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    return response.json();
}

async function fetchSearchGifs(query, offset = 0) {
    const url = `${BASE_URL}/gifs/search?api_key=${API_KEY}&q=${encodeURIComponent(query)}&limit=${LIMIT}&offset=${offset}&rating=g&lang=zh`;
    const response = await fetch(url);
    
    if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    return response.json();
}

async function loadTrendingGifs() {
    if (isLoading) return;
    
    isLoading = true;
    isSearchMode = false;
    currentQuery = '';
    currentOffset = 0;
    totalCount = 0;
    
    clearGifGrid();
    showLoading(true);
    showError(false);
    showNoResults(false);
    showLoadMoreButton(false);
    resultsInfo.textContent = '';
    
    try {
        const data = await fetchTrendingGifs();
        totalCount = data.pagination.total_count;
        
        if (data.data && data.data.length > 0) {
            renderGifs(data.data);
            currentOffset += LIMIT;
            updateResultsInfo(0, data.data.length, totalCount);
            
            if (currentOffset < totalCount) {
                showLoadMoreButton(true);
            }
        } else {
            showNoResults(true);
        }
    } catch (error) {
        console.error('Error loading trending GIFs:', error);
        if (error.message.includes('403')) {
            showError(true, 'API Key 无效或已过期，请配置您自己的 Giphy API Key');
            setTimeout(() => {
                showApiKeyHelp();
            }, 1000);
        } else {
            showError(true, '加载失败，请稍后重试');
        }
    } finally {
        showLoading(false);
        isLoading = false;
    }
}

async function handleSearch() {
    const query = searchInput.value.trim();
    
    if (!query) {
        loadTrendingGifs();
        return;
    }
    
    if (isLoading) return;
    
    isLoading = true;
    isSearchMode = true;
    currentQuery = query;
    currentOffset = 0;
    totalCount = 0;
    
    clearGifGrid();
    showLoading(true);
    showError(false);
    showNoResults(false);
    showLoadMoreButton(false);
    resultsInfo.textContent = '';
    
    try {
        const data = await fetchSearchGifs(query);
        totalCount = data.pagination.total_count;
        
        if (data.data && data.data.length > 0) {
            renderGifs(data.data);
            currentOffset += LIMIT;
            updateResultsInfo(0, data.data.length, totalCount, true, query);
            
            if (currentOffset < totalCount) {
                showLoadMoreButton(true);
            }
        } else {
            showNoResults(true);
        }
    } catch (error) {
        console.error('Error searching GIFs:', error);
        if (error.message.includes('403')) {
            showError(true, 'API Key 无效或已过期，请配置您自己的 Giphy API Key');
            setTimeout(() => {
                showApiKeyHelp();
            }, 1000);
        } else {
            showError(true, '搜索失败，请稍后重试');
        }
    } finally {
        showLoading(false);
        isLoading = false;
    }
}

async function loadMoreGifs() {
    if (isLoading || currentOffset >= totalCount) return;
    
    isLoading = true;
    showLoading(true);
    
    try {
        const data = isSearchMode 
            ? await fetchSearchGifs(currentQuery, currentOffset)
            : await fetchTrendingGifs(currentOffset);
        
        if (data.data && data.data.length > 0) {
            renderGifs(data.data);
            const previousOffset = currentOffset;
            currentOffset += LIMIT;
            updateResultsInfo(
                previousOffset, 
                previousOffset + data.data.length, 
                totalCount, 
                isSearchMode, 
                currentQuery
            );
            
            if (currentOffset >= totalCount) {
                showLoadMoreButton(false);
            }
        }
    } catch (error) {
        console.error('Error loading more GIFs:', error);
        if (error.message.includes('403')) {
            showError(true, 'API Key 无效或已过期，请配置您自己的 Giphy API Key');
            setTimeout(() => {
                showApiKeyHelp();
            }, 1000);
        } else {
            showError(true, '加载更多失败，请稍后重试');
        }
    } finally {
        showLoading(false);
        isLoading = false;
    }
}

function openModal(gif) {
    modalImage.src = gif.images.original.url;
    modalTitle.textContent = gif.title || '无标题';
    modalLink.href = gif.url;
    modal.style.display = 'flex';
}
