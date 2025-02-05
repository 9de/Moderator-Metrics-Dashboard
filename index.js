// Global variables
let bansChart = null;
let mutesChart = null;
let trendChart = null;
let currentSort = { field: 'total', ascending: false };
let moderatorData = null;
let currentTheme = localStorage.getItem('theme') || 'light';

// Cache DOM elements
const elements = {
    jsonInput: document.getElementById('jsonInput'),
    errorElement: document.getElementById('error'),
    moderatorList: document.getElementById('moderatorList'),
    loadingSpinner: document.querySelector('.loading-spinner'),
    apiButton: document.querySelector('.api-button'),
    lastUpdate: document.getElementById('lastUpdate')
};

// Chart configuration
const chartConfig = {
    colors: {
        bans: {
            primary: 'rgba(79, 70, 229, 1)',
            secondary: 'rgba(79, 70, 229, 0.8)',
            background: 'rgba(79, 70, 229, 0.1)'
        },
        mutes: {
            primary: 'rgba(239, 68, 68, 1)',
            secondary: 'rgba(239, 68, 68, 0.8)',
            background: 'rgba(239, 68, 68, 0.1)'
        }
    }
};

// Utility Functions
function formatNumber(num) {
    return new Intl.NumberFormat().format(num);
}

function formatDate(date) {
    return new Date(date).toLocaleString();
}

function showError(message) {
    elements.errorElement.textContent = `❌ ${message}`;
    elements.errorElement.style.display = 'block';
}

function hideError() {
    elements.errorElement.style.display = 'none';
}

function updateLastUpdate() {
    elements.lastUpdate.textContent = formatDate(new Date());
    localStorage.setItem('lastUpdate', new Date().toISOString());
}

// Navigation Functions
function showPage(pageId) {
    document.querySelectorAll('.page').forEach(page => {
        page.classList.remove('active');
    });
    document.querySelectorAll('.nav-item').forEach(tab => {
        tab.classList.remove('active');
    });
    
    document.getElementById(pageId).classList.add('active');
    document.querySelector(`.nav-item[onclick="showPage('${pageId}')"]`).classList.add('active');
}

// Theme Functions
function toggleTheme() {
    currentTheme = currentTheme === 'light' ? 'dark' : 'light';
    document.documentElement.setAttribute('data-theme', currentTheme);
    localStorage.setItem('theme', currentTheme);
    
    const themeIcon = document.querySelector('.theme-toggle i');
    themeIcon.className = currentTheme === 'dark' ? 'fas fa-sun' : 'fas fa-moon';
    
    if (moderatorData) {
        refreshAllCharts(moderatorData);
    }
}

function getThemeColors() {
    const isDark = currentTheme === 'dark';
    return {
        text: isDark ? '#e5e7eb' : '#111827',
        grid: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.05)'
    };
}

// Data Processing Functions
function calculateModeratorStats(data, period) {
    let totalBans = 0;
    let totalMutes = 0;

    if (data.bans && data.bans[period]) {
        totalBans = data.bans[period]
            .filter(user => user.username !== 'Watchdog')
            .reduce((sum, user) => sum + user.score, 0);
    }

    if (data.mutes && data.mutes[period]) {
        totalMutes = data.mutes[period]
            .filter(user => user.username !== 'Watchdog')
            .reduce((sum, user) => sum + user.score, 0);
    }

    return { bans: totalBans, mutes: totalMutes };
}

function updateAllStats(data) {
    const watchdogStats = data.AntiCheat;
    const alltimeModStats = calculateModeratorStats(data, 'alltime');
    const monthlyModStats = calculateModeratorStats(data, 'monthly');
    const weeklyModStats = calculateModeratorStats(data, 'weekly');

    // Update all-time stats
    document.getElementById('watchdogBansAlltime').textContent = formatNumber(watchdogStats.bans.alltime.score);
    document.getElementById('watchdogMutesAlltime').textContent = formatNumber(watchdogStats.mutes.alltime.score);
    document.getElementById('moderatorBansAlltime').textContent = formatNumber(alltimeModStats.bans);
    document.getElementById('moderatorMutesAlltime').textContent = formatNumber(alltimeModStats.mutes);
    document.getElementById('totalBansAlltime').textContent = 
        formatNumber(watchdogStats.bans.alltime.score + alltimeModStats.bans);
    document.getElementById('totalMutesAlltime').textContent = 
        formatNumber(watchdogStats.mutes.alltime.score + alltimeModStats.mutes);

    // Update monthly stats
    document.getElementById('totalBansMonthly').textContent = 
        formatNumber(watchdogStats.bans.monthly.score + monthlyModStats.bans);
    document.getElementById('totalMutesMonthly').textContent = 
        formatNumber(watchdogStats.mutes.monthly.score + monthlyModStats.mutes);
    document.getElementById('totalActionsMonthly').textContent = 
        formatNumber(watchdogStats.bans.monthly.score + monthlyModStats.bans +
                    watchdogStats.mutes.monthly.score + monthlyModStats.mutes);

    // Update weekly stats
    document.getElementById('totalBansWeekly').textContent = 
        formatNumber(watchdogStats.bans.weekly.score + weeklyModStats.bans);
    document.getElementById('totalMutesWeekly').textContent = 
        formatNumber(watchdogStats.mutes.weekly.score + weeklyModStats.mutes);
    document.getElementById('totalActionsWeekly').textContent = 
        formatNumber(watchdogStats.bans.weekly.score + weeklyModStats.bans +
                    watchdogStats.mutes.weekly.score + weeklyModStats.mutes);
}

// Chart Creation Functions
function createBansChart(data) {
    const themeColors = getThemeColors();
    const top5Bans = data.bans.alltime
        .filter(user => user.username !== 'Watchdog')
        .slice(0, 5);

    const ctx = document.getElementById('bansChart').getContext('2d');
    
    if (bansChart) {
        bansChart.destroy();
    }

    bansChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: top5Bans.map(user => user.username),
            datasets: [{
                label: 'Ban Score',
                data: top5Bans.map(user => user.score),
                backgroundColor: chartConfig.colors.bans.secondary,
                borderColor: chartConfig.colors.bans.primary,
                borderWidth: 1,
                borderRadius: 8
            }]
        },
        options: getChartOptions('bar', themeColors)
    });
}

function createMutesChart(data) {
    const themeColors = getThemeColors();
    const top5Mutes = data.mutes.alltime
        .filter(user => user.username !== 'Watchdog')
        .slice(0, 5);

    const ctx = document.getElementById('mutesChart').getContext('2d');
    
    if (mutesChart) {
        mutesChart.destroy();
    }

    mutesChart = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: top5Mutes.map(user => user.username),
            datasets: [{
                data: top5Mutes.map(user => user.score),
                backgroundColor: [
                    chartConfig.colors.mutes.primary,
                    chartConfig.colors.mutes.secondary,
                    'rgba(55, 48, 163, 0.8)',
                    'rgba(99, 102, 241, 0.8)',
                    'rgba(67, 56, 202, 0.8)'
                ],
                borderWidth: 2,
                borderColor: '#ffffff'
            }]
        },
        options: getChartOptions('doughnut', themeColors)
    });
}

function createTrendChart(data) {
    const themeColors = getThemeColors();
    const actionType = document.getElementById('trendActionFilter').value;
    const timeframe = document.getElementById('trendTimeFilter').value;
    const timeframedData = getTimeframedData(data, timeframe);

    let datasets = [];
    if (actionType === 'all' || actionType === 'bans') {
        // Add moderator bans dataset
        datasets.push({
            label: 'Moderator Bans',
            data: timeframedData.bans.map(user => user.score),
            borderColor: chartConfig.colors.bans.primary,
            backgroundColor: chartConfig.colors.bans.background,
            tension: 0.4,
            fill: true,
            order: 1
        });
        
        // Add Watchdog bans as a separate point
        datasets.push({
            label: 'Watchdog Bans',
            data: Array(timeframedData.labels.length - 1).fill(null).concat([timeframedData.watchdogBans]),
            borderColor: 'rgba(255, 99, 132, 1)',
            backgroundColor: 'rgba(255, 99, 132, 0.2)',
            tension: 0,
            pointRadius: 6,
            order: 0
        });
    }

    if (actionType === 'all' || actionType === 'mutes') {
        // Add moderator mutes dataset
        datasets.push({
            label: 'Moderator Mutes',
            data: timeframedData.mutes.map(user => user.score),
            borderColor: chartConfig.colors.mutes.primary,
            backgroundColor: chartConfig.colors.mutes.background,
            tension: 0.4,
            fill: true,
            order: 2
        });
        
        // Add Watchdog mutes as a separate point
        datasets.push({
            label: 'Watchdog Mutes',
            data: Array(timeframedData.labels.length - 1).fill(null).concat([timeframedData.watchdogMutes]),
            borderColor: 'rgba(75, 192, 192, 1)',
            backgroundColor: 'rgba(75, 192, 192, 0.2)',
            tension: 0,
            pointRadius: 6,
            order: 0
        });
    }

    const ctx = document.getElementById('trendChart').getContext('2d');
    
    if (trendChart) {
        trendChart.destroy();
    }

    trendChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: [...timeframedData.labels, 'Watchdog'],
            datasets: datasets
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            interaction: {
                intersect: false,
                mode: 'index'
            },
            plugins: {
                legend: {
                    position: 'top',
                    labels: {
                        color: themeColors.text,
                        usePointStyle: true,
                        padding: 20
                    }
                },
                tooltip: {
                    mode: 'index',
                    intersect: false,
                    callbacks: {
                        label: function(context) {
                            return `${context.dataset.label}: ${formatNumber(context.raw || 0)}`;
                        }
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    grid: {
                        color: themeColors.grid
                    },
                    ticks: {
                        color: themeColors.text,
                        font: { size: 12 },
                        callback: value => formatNumber(value)
                    }
                },
                x: {
                    grid: { display: false },
                    ticks: {
                        color: themeColors.text,
                        font: { size: 12 },
                        maxRotation: 45,
                        minRotation: 45
                    }
                }
            }
        }
    });
}

// Chart Helper Functions
function getChartOptions(type, colors) {
    const baseOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                labels: {
                    color: colors.text,
                    font: { size: 12 }
                }
            }
        }
    };

    switch (type) {
        case 'bar':
            return {
                ...baseOptions,
                plugins: {
                    legend: { display: false }
                },
                scales: getScaleOptions(colors)
            };
        case 'doughnut':
            return {
                ...baseOptions,
                plugins: {
                    legend: {
                        position: 'right',
                        labels: {
                            padding: 20,
                            usePointStyle: true
                        }
                    }
                },
                cutout: '60%'
            };
        case 'line':
            return {
                ...baseOptions,
                plugins: {
                    tooltip: {
                        mode: 'index',
                        intersect: false
                    }
                },
                scales: getScaleOptions(colors),
                interaction: {
                    intersect: false,
                    mode: 'nearest'
                }
            };
    }
}

function getScaleOptions(colors) {
    return {
        y: {
            beginAtZero: true,
            grid: { color: colors.grid },
            ticks: {
                color: colors.text,
                font: { size: 12 },
                callback: value => formatNumber(value)
            }
        },
        x: {
            grid: { display: false },
            ticks: {
                color: colors.text,
                font: { size: 12 }
            }
        }
    };
}

// Moderator Table Functions
function createModeratorEntry(moderator) {
    return `
        <tr>
            <td>
                <div class="moderator-name-cell">
                    <img src="https://mc-heads.net/avatar/${moderator.username}/32" 
                         alt="${moderator.username}'s skin"
                         class="moderator-avatar-small">
                    <span>${moderator.username}</span>
                </div>
            </td>
            <td>${formatNumber(moderator.bans)}</td>
            <td>${formatNumber(moderator.mutes)}</td>
            <td>${formatNumber(moderator.total)}</td>
        </tr>
    `;
}

function sortModerators(field) {
    const headers = document.querySelectorAll('.sort-indicator');
    headers.forEach(header => header.classList.remove('asc'));
    
    if (currentSort.field === field) {
        currentSort.ascending = !currentSort.ascending;
        if (currentSort.ascending) {
            document.querySelector(`th[onclick="sortModerators('${field}')"]`).classList.add('asc');
        }
    } else {
        currentSort.field = field;
        currentSort.ascending = false;
    }
    
    applyFilters();
}

function getModeratorsData(data, timePeriod) {
    const moderatorStats = new Map();
    
    // Process bans - exclude Watchdog
    if (data.bans && data.bans[timePeriod]) {
        data.bans[timePeriod]
            .filter(user => user.username !== 'Watchdog')
            .forEach(user => {
                if (!moderatorStats.has(user.username)) {
                    moderatorStats.set(user.username, { bans: 0, mutes: 0 });
                }
                moderatorStats.get(user.username).bans = user.score;
            });
    }
    
    // Process mutes - exclude Watchdog
    if (data.mutes && data.mutes[timePeriod]) {
        data.mutes[timePeriod]
            .filter(user => user.username !== 'Watchdog')
            .forEach(user => {
                if (!moderatorStats.has(user.username)) {
                    moderatorStats.set(user.username, { bans: 0, mutes: 0 });
                }
                moderatorStats.get(user.username).mutes = user.score;
            });
    }

    return Array.from(moderatorStats.entries())
        .map(([username, stats]) => ({
            username,
            bans: stats.bans,
            mutes: stats.mutes,
            total: stats.bans + stats.mutes
        }));
}

// Filter and Sort Functions
function applyFilters() {
    if (!moderatorData) return;

    const timePeriod = document.getElementById('timeFilter').value;
    const type = document.getElementById('typeFilter').value;
    const search = document.getElementById('searchFilter').value.toLowerCase();

    let moderators = getModeratorsData(moderatorData, timePeriod);

    if (search) {
        moderators = moderators.filter(mod => 
            mod.username.toLowerCase().includes(search)
        );
    }

    if (type === 'bans') {
        moderators = moderators.filter(mod => mod.bans > 0);
    } else if (type === 'mutes') {
        moderators = moderators.filter(mod => mod.mutes > 0);
    }

    moderators.sort((a, b) => {
        let compareValue;
        if (currentSort.field === 'username') {
            compareValue = a.username.localeCompare(b.username);
        } else if (currentSort.field === 'total') {
            compareValue = b.total - a.total;
        } else {
            compareValue = b[currentSort.field] - a[currentSort.field];
        }
        return currentSort.ascending ? -compareValue : compareValue;
    });

    elements.moderatorList.innerHTML = moderators
        .map(mod => createModeratorEntry(mod))
        .join('');
}

// Data Management Functions
function loadData() {
    try {
        const data = JSON.parse(elements.jsonInput.value);
        hideError();
        
        moderatorData = data;
        refreshAllCharts(data);
        updateLastUpdate();
        
        // Save to localStorage for persistence
        localStorage.setItem('moderatorData', JSON.stringify(data));
    } catch (error) {
        showError('Invalid JSON format. Please check your input and try again.');
    }
}

function refreshAllCharts(data) {
    updateAllStats(data);
    createBansChart(data);
    createMutesChart(data);
    createTrendChart(data);
    applyFilters();
}

function clearData() {
    elements.jsonInput.value = '';
    moderatorData = null;
    elements.moderatorList.innerHTML = '';
    hideError();
    localStorage.removeItem('moderatorData');
    elements.lastUpdate.textContent = 'Never';
}

// API Integration
async function fetchFromApi() {
    elements.loadingSpinner.classList.add('active');
    elements.apiButton.disabled = true;
    
    try {
        const apiEndpoint = localStorage.getItem('apiEndpoint') || 'YOUR_API_ENDPOINT';
        const apiKey = localStorage.getItem('apiKey');
        
        const response = await fetch(apiEndpoint+`?key=${apiKey}`);

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        elements.jsonInput.value = JSON.stringify(data, null, 2);
        moderatorData = data;
        
        refreshAllCharts(data);
        updateLastUpdate();
        hideError();
        
        // Save to localStorage
        localStorage.setItem('moderatorData', JSON.stringify(data));
    } catch (error) {
        showError(`Error fetching data: ${error.message}`);
    } finally {
        elements.loadingSpinner.classList.remove('active');
        elements.apiButton.disabled = false;
    }
}

// Settings Management
function saveSettings() {
    const apiEndpoint = document.getElementById('apiEndpoint').value;
    const apiKey = document.getElementById('apiKey').value;
    
    localStorage.setItem('apiEndpoint', apiEndpoint);
    localStorage.setItem('apiKey', apiKey);
    
    showNotification('Settings saved successfully!');
}

function loadSettings() {
    const apiEndpoint = localStorage.getItem('apiEndpoint');
    const apiKey = localStorage.getItem('apiKey');
    
    if (apiEndpoint) {
        document.getElementById('apiEndpoint').value = apiEndpoint;
    }
    if (apiKey) {
        document.getElementById('apiKey').value = apiKey;
    }
}

// Data Export
function exportData() {
    if (!moderatorData) {
        showError('No data available to export');
        return;
    }

    const exportTypes = {
        json: () => ({
            data: JSON.stringify(moderatorData, null, 2),
            type: 'application/json',
            extension: 'json'
        }),
        csv: () => ({
            data: convertToCSV(moderatorData),
            type: 'text/csv',
            extension: 'csv'
        })
    };

    try {
        const { data, type, extension } = exportTypes.json();
        const blob = new Blob([data], { type });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        
        a.href = url;
        a.download = `moderation_stats_${new Date().toISOString().split('T')[0]}.${extension}`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
    } catch (error) {
        showError('Error exporting data');
    }
}

function convertToCSV(data) {
    // Implementation for CSV conversion if needed
    return '';
}

// Notification System
function showNotification(message, type = 'success') {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;
    
    document.body.appendChild(notification);
    setTimeout(() => {
        notification.classList.add('show');
        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => {
                document.body.removeChild(notification);
            }, 300);
        }, 3000);
    }, 100);
}

function getTimeframedData(data, timeframe) {
    // Get top 10 moderators for the selected timeframe
    const getTop10Mods = (data, type) => {
        if (!data[type] || !data[type][timeframe]) return [];
        return data[type][timeframe]
            .filter(user => user.username !== 'Watchdog')
            .sort((a, b) => b.score - a.score)
            .slice(0, 10);
    };

    const top10Bans = getTop10Mods(data, 'bans');
    const top10Mutes = getTop10Mods(data, 'mutes');
    const watchdogStats = data.AntiCheat;

    return {
        bans: top10Bans,
        mutes: top10Mutes,
        watchdogBans: watchdogStats.bans[timeframe].score,
        watchdogMutes: watchdogStats.mutes[timeframe].score,
        labels: top10Bans.map(user => user.username)
    };
}

// Initialization
function initializeDashboard() {
    // Set theme
    document.documentElement.setAttribute('data-theme', currentTheme);
    const themeIcon = document.querySelector('.theme-toggle i');
    themeIcon.className = currentTheme === 'dark' ? 'fas fa-sun' : 'fas fa-moon';

    // Load settings
    loadSettings();

    // Try to load saved data
    const savedData = localStorage.getItem('moderatorData');
    const lastUpdateTime = localStorage.getItem('lastUpdate');

    if (savedData) {
        try {
            moderatorData = JSON.parse(savedData);
            elements.jsonInput.value = JSON.stringify(moderatorData, null, 2);
            refreshAllCharts(moderatorData);
            elements.lastUpdate.textContent = lastUpdateTime ? formatDate(new Date(lastUpdateTime)) : 'Never';
        } catch (error) {
            console.error('Error loading saved data:', error);
            localStorage.removeItem('moderatorData');
        }
    }

    // Add event listeners for chart resizing
    window.addEventListener('resize', debounce(() => {
        if (moderatorData) {
            refreshAllCharts(moderatorData);
        }
    }, 250));
}

// Utility function for debouncing
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Initialize the dashboard when the DOM is loaded
document.addEventListener('DOMContentLoaded', initializeDashboard);