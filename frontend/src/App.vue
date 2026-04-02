<template>
  <div class="min-h-screen">
    <!-- 动态背景 -->
    <div class="bg-canvas">
      <div class="bg-orb"></div>
      <div class="bg-orb"></div>
      <div class="bg-orb"></div>
    </div>
    <div class="bg-grid"></div>
    <div class="bg-noise"></div>
    
    <!-- 主内容 -->
    <div class="relative z-10">
      <router-view v-slot="{ Component }">
        <transition name="fade" mode="out-in">
          <component :is="Component" />
        </transition>
      </router-view>
    </div>
  </div>
</template>

<script setup>
// 主应用组件
</script>

<style>
/* 字体引入 */
@import url('https://fonts.googleapis.com/css2?family=Outfit:wght@200;300;400;500;600;700;800;900&family=Space+Mono:wght@400;700&display=swap');

/* 全局变量 */
:root {
  --bg-primary: #0a0a0f;
  --bg-secondary: #12121a;
  --bg-glass: rgba(255, 255, 255, 0.03);
  --bg-glass-hover: rgba(255, 255, 255, 0.06);
  --border-glass: rgba(255, 255, 255, 0.08);
  --border-glass-hover: rgba(255, 255, 255, 0.15);
  --text-primary: #f0f0f5;
  --text-secondary: rgba(240, 240, 245, 0.55);
  --text-muted: rgba(240, 240, 245, 0.3);
  --accent-1: #6c5ce7;
  --accent-2: #a29bfe;
  --accent-3: #00cec9;
  --accent-4: #fd79a8;
  --accent-5: #fdcb6e;
  --gradient-main: linear-gradient(135deg, #6c5ce7 0%, #a29bfe 40%, #00cec9 100%);
  --gradient-warm: linear-gradient(135deg, #fd79a8 0%, #fdcb6e 100%);
  --shadow-glow: 0 0 80px rgba(108, 92, 231, 0.15);
  --shadow-card: 0 8px 32px rgba(0, 0, 0, 0.4);
  --radius-sm: 8px;
  --radius-md: 16px;
  --radius-lg: 24px;
  --radius-xl: 32px;
  --font-display: 'Outfit', sans-serif;
  --font-mono: 'Space Mono', monospace;
  /* 网盘品牌色 */
  --color-aliyun: #ff6a00;
  --color-baidu: #2932e1;
  --color-115: #fba800;
  --color-quark: #6236ff;
  --color-123: #e4393c;
}

/* 全局样式重置 */
* { margin: 0; padding: 0; box-sizing: border-box; }
html { scroll-behavior: smooth; }

body {
  font-family: var(--font-display);
  background: var(--bg-primary);
  color: var(--text-primary);
  min-height: 100vh;
  overflow-x: hidden;
  -webkit-font-smoothing: antialiased;
}

/* 动态背景 */
.bg-canvas {
  position: fixed; top: 0; left: 0;
  width: 100%; height: 100%;
  z-index: 0; overflow: hidden;
}
.bg-orb {
  position: absolute; border-radius: 50%;
  filter: blur(120px); opacity: 0.35;
  animation: orbFloat 20s ease-in-out infinite;
}
.bg-orb:nth-child(1) {
  width: 600px; height: 600px;
  background: radial-gradient(circle, var(--accent-1) 0%, transparent 70%);
  top: -15%; left: -10%; animation-duration: 25s;
}
.bg-orb:nth-child(2) {
  width: 500px; height: 500px;
  background: radial-gradient(circle, var(--accent-3) 0%, transparent 70%);
  top: 50%; right: -15%; animation-duration: 20s; animation-delay: -5s;
}
.bg-orb:nth-child(3) {
  width: 400px; height: 400px;
  background: radial-gradient(circle, var(--accent-4) 0%, transparent 70%);
  bottom: -10%; left: 30%; animation-duration: 22s; animation-delay: -10s; opacity: 0.18;
}
@keyframes orbFloat {
  0%, 100% { transform: translate(0, 0) scale(1); }
  25% { transform: translate(50px, -30px) scale(1.05); }
  50% { transform: translate(-20px, 40px) scale(0.95); }
  75% { transform: translate(30px, 20px) scale(1.02); }
}
.bg-grid {
  position: fixed; top: 0; left: 0;
  width: 100%; height: 100%; z-index: 1; pointer-events: none;
  background-image:
      linear-gradient(rgba(255,255,255,0.015) 1px, transparent 1px),
      linear-gradient(90deg, rgba(255,255,255,0.015) 1px, transparent 1px);
  background-size: 60px 60px;
}
.bg-noise {
  position: fixed; top: 0; left: 0;
  width: 100%; height: 100%; z-index: 2;
  opacity: 0.03; pointer-events: none;
  background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E");
}

/* 动画效果 */
@keyframes fadeInUp {
  from { opacity: 0; transform: translateY(30px); }
  to { opacity: 1; transform: translateY(0); }
}
@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

/* 过渡效果 */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

/* 滚动条样式 */
::-webkit-scrollbar { width: 6px; }
::-webkit-scrollbar-track { background: transparent; }
::-webkit-scrollbar-thumb { background: var(--border-glass); border-radius: 3px; }
::-webkit-scrollbar-thumb:hover { background: var(--border-glass-hover); }
</style>