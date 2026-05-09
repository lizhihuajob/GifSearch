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
const clearButton = document.getElementById('clearButton');
const gifGrid = document.getElementById('gifGrid');
const loading = document.getElementById('loading');
const loadMoreContainer = document.getElementById('loadMoreContainer');
const loadMoreButton = document.getElementById('loadMoreButton');
const noResults = document.getElementById('noResults');
const errorMessage = document.getElementById('errorMessage');
const errorTitle = document.getElementById('errorTitle');
const errorText = document.getElementById('errorText');
const resultsInfo = document.getElementById('resultsInfo');
const modal = document.getElementById('modal');
const modalImage = document.getElementById('modalImage');
const modalTitle = document.getElementById('modalTitle');
const modalLink = document.getElementById('modalLink');
const modalClose = document.getElementById('modalClose');

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
    
    setTimeout(() => {
        apiKeyInput.focus();
    }, 100);
}

function setupEventListeners() {
    searchButton.addEventListener('click', handleSearch);
    searchInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            handleSearch();
        }
    });
    
    searchInput.addEventListener('input', () => {
        updateClearButton();
    });
    
    clearButton.addEventListener('click', () => {
        searchInput.value = '';
        updateClearButton();
        searchInput.focus();
    });
    
    trendingButton.addEventListener('click', () => {
        searchInput.value = '';
        updateClearButton();
        loadTrendingGifs();
    });
    
    loadMoreButton.addEventListener('click', loadMoreGifs);
    
    modalClose.addEventListener('click', () => {
        closeModal();
    });
    
    modal.addEventListener('click', (e) => {
        if (e.target.classList.contains('modal-backdrop') || e.target.classList.contains('modal')) {
            closeModal();
        }
    });
    
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && modal.style.display === 'flex') {
            closeModal();
        }
    });
}

function updateClearButton() {
    if (searchInput.value.trim().length > 0) {
        clearButton.style.display = 'flex';
    } else {
        clearButton.style.display = 'none';
    }
}

function closeModal() {
    modal.style.display = 'none';
}

function showLoading(show) {
    loading.style.display = show ? 'flex' : 'none';
}

function showError(show, title = null, message = null) {
    errorMessage.style.display = show ? 'flex' : 'none';
    if (title) {
        errorTitle.textContent = title;
    }
    if (message) {
        errorText.textContent = message;
    }
}

function showNoResults(show) {
    noResults.style.display = show ? 'flex' : 'none';
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
            showError(true, 'API Key 无效或已过期', '请配置您自己的 Giphy API Key');
            setTimeout(() => {
                showApiKeyHelp();
            }, 1000);
        } else {
            showError(true, '加载失败', '请稍后重试');
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
            showError(true, 'API Key 无效或已过期', '请配置您自己的 Giphy API Key');
            setTimeout(() => {
                showApiKeyHelp();
            }, 1000);
        } else {
            showError(true, '搜索失败', '请稍后重试');
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
            showError(true, 'API Key 无效或已过期', '请配置您自己的 Giphy API Key');
            setTimeout(() => {
                showApiKeyHelp();
            }, 1000);
        } else {
            showError(true, '加载更多失败', '请稍后重试');
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
