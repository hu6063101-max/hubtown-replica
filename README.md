# HUBTOWN 官网复刻（学习练习版）

高保真复刻 [hubtown.co.in](https://hubtown.co.in/) 的**外观与交互**，仅供学习练习，非官方、勿商用。

## 🎯 这是什么

用 **原生 HTML/CSS/JS + GSAP 动画库** 还原了原站的核心体验：

- **加载页**：HUBTOWN 字标逐字揭示 + 0→100% 进度（含后台标签页卡顿的安全兜底）
- **自定义光标**：淡蓝小方块跟随鼠标，悬停可点元素时放大
- **平滑滚动**：Lenis 惯性滚动，还原丝滑手感
- **开场统计区**：四大区域项目数（09 / 12 / 18 / 06）滚动进入时 count-up
- **6 大滚动叙事板块**：Future / Innovation / Collaboration / Excellence / Purpose / Legacy
  每段钉住（sticky pin），随滚动进度播放「文字入场 → 停留 → 出场」+ 背景视差
- **Sound Off 轮播**：Prev / Next + 圆点指示
- **WhatsApp 浮窗**：右下角「Chat with us」
- **完全响应式**：桌面横向导航，移动端全屏汉堡菜单

## 🎨 还原依据（提取自原站）

| 项 | 值 |
|----|----|
| 主背景 | `#020a19`（深海军蓝） |
| 主文字/强调 | `#d5e0ff`（淡蓝紫，原站称 off-blue） |
| 辅助蓝 | `#052261` / `#3b82f6` |
| 显示字体 | **Grotesk**（Light / Regular / Bold） |
| 等宽/UI 字体 | **Commit Mono**（Regular / Bold） |
| 技术栈（原站） | Nuxt.js + Sanity CMS + Theatre.js + WebGL |

> 字体文件位于 `fonts/`，均下载自原站，仅供本地学习使用。

## ▶️ 如何运行

因为用了真实字体文件（受浏览器跨域/`file://` 限制），**需要起一个本地服务器**，不能直接双击打开。

```bash
# 方式一：Python（电脑已装）
cd replica
python -m http.server 5050
# 浏览器打开 http://localhost:5050

# 方式二：Node
npx serve replica
```

## 🗂️ 目录结构

```
replica/
├── index.html          # 页面结构
├── css/style.css       # 全部样式（含真实配色、字体、响应式）
├── js/main.js          # 全部交互（GSAP 时间线驱动，含中文注释）
├── fonts/              # 原站真实字体
└── _reference/         # 抓取的原站源码，仅供对照参考（非运行所需）
```

## ✏️ 如何改成你自己的

1. **换文案**：直接改 `index.html` 里的标题、段落、统计数字。
2. **换配色**：改 `css/style.css` 顶部 `:root` 里的 CSS 变量即可全局换肤。
3. **换背景图**：目前每个板块背景用品牌色 + 蓝图网格**生成**（见 `[data-visual]`）。
   想换成真实图片，把对应 `[data-visual="xxx"]` 的 `background` 改成 `url(你的图.jpg)` 即可。
4. **改动画**：所有动画在 `js/main.js`，按板块分了注释段落（加载页 / 光标 / 叙事板块 / 轮播…）。

## ⚠️ 与原站的差异（诚实说明）

- 原站的**电影级背景动画**用 WebGL + Theatre.js 实现（3D 序列动画），本复刻用
  GSAP + CSS 渐变/视差**近似还原其神韵**，不是逐帧 1:1。
- 原站的项目图片、Logo、文案均受版权保护，本项目用占位/生成视觉替代，**请勿直接商用**。
- 后端数据（项目列表、地图等）为前端静态占位。

---
🤖 本项目由 Claude Code 协助完成 · 仅供学习
