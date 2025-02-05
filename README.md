# 🛡️ Moderator Metrics Dashboard

[![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=flat&logo=javascript&logoColor=black)]()
[![Chart.js](https://img.shields.io/badge/Chart.js-FF6384?style=flat&logo=chart.js&logoColor=white)]()
[![MIT License](https://img.shields.io/badge/License-MIT-green.svg)](https://choosealicense.com/licenses/mit/)

> A powerful moderation analytics dashboard providing enhanced alternative to [BlocksMC](https://blocksmc.com)'s staff panel. Features real-time insights, performance metrics, and trend analysis.

## ⭐ Features

### 📊 Real-time Analytics
- Live action monitoring
- Historical trends
- Anti-cheat integration

### 👥 Staff Performance
- Individual metrics
- Action history
- Comparative analysis

### 🎨 Enhanced UI/UX
- Interactive charts
- Dark/light themes
- Responsive design

## ⚙️ API Integration

Endpoint Structure:
```
${YOUR_ENDPOINT}?key=${YOUR_API_KEY}
```

Expected Response:
```json
{
  "bans": {
    "alltime": [{"username": "mod1", "score": 100}],
    "monthly": [...],
    "weekly": [...]
  },
  "mutes": {...},
  "AntiCheat": {...}
}
```

## 🔧 Tech Stack
- Vanilla JavaScript
- Chart.js
- Font Awesome
- Local Storage API

## 💻 Browser Support
![Chrome](https://img.shields.io/badge/Chrome-90+-4285F4?logo=google-chrome&logoColor=white)
![Firefox](https://img.shields.io/badge/Firefox-88+-FF7139?logo=firefox&logoColor=white)
![Safari](https://img.shields.io/badge/Safari-14+-000000?logo=safari&logoColor=white)
![Edge](https://img.shields.io/badge/Edge-90+-0078D7?logo=microsoft-edge&logoColor=white)

## 📄 License
[MIT](https://choosealicense.com/licenses/mit/) © [9de](https://github.com/9de)
