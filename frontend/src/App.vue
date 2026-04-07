<template>
  <div class="app-container">
    <!-- 背景氛围 -->
    <div class="bg-atmosphere">
      <div class="orb orb-1"></div>
      <div class="orb orb-2"></div>
      <div class="orb orb-3"></div>
    </div>
    <div class="bg-grid"></div>
    <div class="noise"></div>
    <div class="loading-bar" ref="loadingBar"></div>

    <!-- 头部导航 -->
    <header class="animate-fadeSlideDown">
      <a href="#" class="logo" @click.prevent="resetSearch">
        <div class="logo-icon">N</div>
        <span class="logo-text">Nova</span>
      </a>
      <nav class="nav-links">
        <a href="#" class="active">搜索</a>
        <a href="#">图片</a>
        <a href="#">视频</a>
        <a href="#">新闻</a>
      </nav>
    </header>

    <!-- 搜索区域 -->
    <section class="hero" :class="{ compact: isSearching }" id="hero">
      <h1 class="hero-title">探索世界的<span class="highlight">智能起点</span></h1>
      <p class="hero-subtitle">由 AI 驱动的新一代搜索引擎，为你提供精准、深度的搜索体验</p>

      <SearchBox 
        @search="performSearch"
        @voice-search="performVoiceSearch"
      />

      <div class="quick-tags">
        <span 
          v-for="(tag, index) in quickTags" 
          :key="index" 
          class="tag"
          @click="quickSearch(tag.text)"
        >
          {{ tag.icon }} {{ tag.text }}
        </span>
      </div>
    </section>

    <!-- 搜索结果 -->
    <section class="results-section" :class="{ visible: isSearching }" id="resultsSection">
      <div class="ai-summary" v-if="aiSummary" id="aiSummary">
        <div class="ai-summary-header">
          <span class="ai-badge">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2 2 7l10 5 10-5-10-5Z"/><path d="m2 17 10 5 10-5"/><path d="m2 12 10 5 10-5"/></svg>
            AI 摘要
          </span>
        </div>
        <div class="ai-summary-text" v-html="aiSummary"></div>
      </div>
      <div class="results-meta" id="resultsMeta" v-if="resultsMeta">
        {{ resultsMeta }}
      </div>
      <div id="resultsContainer">
        <div 
          v-for="(result, index) in searchResults" 
          :key="index" 
          class="result-card"
          :style="{ animationDelay: `${index * 0.08}s` }"
        >
          <div class="result-source">
            <div class="result-favicon">{{ result.url.charAt(0).toUpperCase() }}</div>
            <span class="result-url">{{ result.url }}</span>
          </div>
          <div class="result-title">{{ highlightMatch(result.title, searchQuery) }}</div>
          <div class="result-desc">{{ highlightMatch(result.desc, searchQuery) }}</div>
          <div class="result-tags">
            <span v-for="(tag, tagIndex) in result.tags" :key="tagIndex" class="result-tag">
              {{ tag }}
            </span>
          </div>
        </div>
      </div>
    </section>

    <!-- 页脚 -->
    <footer class="animate-fadeSlideUp">
      <p>Nova Search &copy; 2026 &nbsp;·&nbsp; <a href="#">隐私政策</a> &nbsp;·&nbsp; <a href="#">使用条款</a> &nbsp;·&nbsp; <a href="#">关于</a></p>
    </footer>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import SearchBox from './components/SearchBox.vue';

// 状态管理
const isSearching = ref(false);
const searchQuery = ref('');
const aiSummary = ref('');
const resultsMeta = ref('');
const searchResults = ref<any[]>([]);
const loadingBar = ref<HTMLElement | null>(null);

// 快速标签数据
const quickTags = [
  { text: '人工智能发展趋势', icon: '🤖' },
  { text: '量子计算最新进展', icon: '⚛️' },
  { text: '太空探索 2026', icon: '🚀' },
  { text: '全球气候变化数据', icon: '🌍' },
  { text: '深度学习框架对比', icon: '💻' }
];

// 执行搜索
const performSearch = async (query: string) => {
  if (!query.trim()) return;
  
  searchQuery.value = query.trim();
  isSearching.value = true;
  
  // 显示加载条
  if (loadingBar.value) {
    loadingBar.value.classList.add('active');
  }
  
  try {
    // 调用后端API
    const response = await fetch(`http://localhost:8888/api/search?kw=${encodeURIComponent(query)}`);
    if (!response.ok) {
      throw new Error('搜索失败');
    }
    const data = await response.json();
    
    // 处理API响应
    if (data.code === 0 && data.data) {
      // 这里需要根据实际API响应结构调整
      // 暂时使用模拟数据，后续替换为真实API数据
      mockSearchResults(query);
    } else {
      throw new Error(data.message || '搜索失败');
    }
  } catch (error) {
    console.error('搜索错误:', error);
    // 显示错误信息
    aiSummary.value = `搜索出错：${error instanceof Error ? error.message : '未知错误'}`;
    resultsMeta.value = '';
    searchResults.value = [];
  } finally {
    // 隐藏加载条
    if (loadingBar.value) {
      setTimeout(() => {
        loadingBar.value?.classList.remove('active');
      }, 500);
    }
  }
};

// 语音搜索
const performVoiceSearch = (text: string) => {
  if (text.trim()) {
    performSearch(text);
  }
};

// 快速搜索
const quickSearch = (query: string) => {
  performSearch(query);
};

// 重置搜索
const resetSearch = () => {
  isSearching.value = false;
  searchQuery.value = '';
  aiSummary.value = '';
  resultsMeta.value = '';
  searchResults.value = [];
};

// 高亮匹配文本
const highlightMatch = (text: string, query: string) => {
  if (!query) return text;
  const escaped = query.replace(/[.*+?^${}()|\[\]\\]/g, '\\$&');
  return text.replace(new RegExp(`(${escaped})`, 'gi'), '<em>$1</em>');
};

// 模拟搜索结果
const mockSearchResults = (query: string) => {
  // 模拟数据
  const mockData: Record<string, any> = {
    '人工智能发展趋势': {
      aiSummary: '<strong>人工智能</strong>正在经历前所未有的快速发展。2026年，<strong>多模态大模型</strong>成为主流，AI Agent 生态日趋成熟，具身智能和自动驾驶取得重大突破。全球AI市场规模预计突破<strong>5000亿美元</strong>，中国、美国和欧盟在AI治理方面持续加强合作。',
      results: [
        { url: 'techreview.example/ai-trends-2026', title: '2026年人工智能十大发展趋势深度解析', desc: '从多模态大模型到AI Agent，从具身智能到科学计算，全面解读AI领域的最新发展方向与突破性进展...', tags: ['趋势分析', '深度报告'] },
        { url: 'aiinsights.example/future-of-ai', title: 'AI Agent 生态系统：从概念到大规模商用', desc: 'AI Agent 正在重塑企业级应用，自主决策、多步骤推理和工具调用能力使其成为2026年最受关注的技术方向...', tags: ['AI Agent', '企业应用'] },
        { url: 'research.example/multimodal-llm', title: '多模态大模型的下一个前沿：跨模态推理与生成', desc: '最新研究表明，新一代多模态模型在视觉理解、代码生成和复杂推理任务上取得了显著提升...', tags: ['多模态', '研究论文'] },
        { url: 'policy.example/ai-governance', title: '全球AI治理框架：合作与竞争并行', desc: '中国、美国、欧盟在AI安全与治理方面展开对话，推动建立全球统一的AI伦理标准...', tags: ['AI治理', '政策'] },
        { url: 'venture.example/ai-investment', title: 'AI投资报告：资本流向与产业格局变化', desc: '2026年AI领域投融资总额突破千亿美元，基础设施、垂直应用和AI芯片成为三大热门赛道...', tags: ['投资', '产业'] },
      ]
    },
    '量子计算最新进展': {
      aiSummary: '<strong>量子计算</strong>在2026年迎来里程碑式突破。IBM、Google和中国的研究团队相继展示了<strong>超过1000量子比特</strong>的处理器，量子纠错技术取得关键进展。量子计算在药物发现、金融建模和密码学领域的应用前景日益明朗。',
      results: [
        { url: 'quantum.example/1000-qubit', title: '突破1000量子比特：量子计算进入新纪元', desc: 'IBM最新推出的量子处理器实现了1200+量子比特，标志着量子计算从实验室走向实用化的关键一步...', tags: ['硬件突破', '里程碑'] },
        { url: 'science.example/quantum-error', title: '量子纠错技术的革命性进展', desc: '新型量子纠错码将逻辑错误率降低至十万分之一以下，为实现大规模量子计算铺平道路...', tags: ['纠错', '技术'] },
        { url: 'pharma.example/quantum-drug', title: '量子计算加速药物发现：从理论到临床', desc: '多家制药公司利用量子模拟精确预测分子相互作用，新药研发周期有望缩短60%...', tags: ['药物研发', '应用'] },
        { url: 'crypto.example/quantum-security', title: '后量子密码学：应对量子威胁的新防线', desc: 'NIST发布后量子密码标准，全球金融机构开始部署抗量子攻击的加密系统...', tags: ['安全', '密码学'] },
      ]
    },
    '太空探索 2026': {
      aiSummary: '2026年是<strong>太空探索</strong>的丰收年。中国<strong>载人登月</strong>计划稳步推进，SpaceX星舰完成首次商业载人火星任务预备，詹姆斯·韦伯望远镜发现了多颗<strong>宜居系外行星</strong>。国际空间站迎来新一轮扩建。',
      results: [
        { url: 'space.example/moon-2026', title: '中国载人登月计划：2026年关键节点全览', desc: '从嫦娥七号到新一代载人飞船，中国探月工程进入冲刺阶段，预计2027年前实现载人登月...', tags: ['登月', '中国航天'] },
        { url: 'spacex.example/starship', title: 'SpaceX星舰：火星任务的最后准备', desc: '星舰完成第12次试飞，全回收技术日趋成熟，首次载人火星任务窗口期定于2028年...', tags: ['SpaceX', '火星'] },
        { url: 'nasa.example/exoplanets', title: '韦伯望远镜发现首批宜居系外行星', desc: '詹姆斯·韦伯太空望远镜在距离地球40光年的恒星系统中发现了多颗位于宜居带的类地行星...', tags: ['系外行星', '发现'] },
        { url: 'esa.example/station', title: '国际空间站扩建计划：新时代的太空实验室', desc: 'ESA与NASA联合推进空间站商业模块建设，为未来的深空探索任务提供关键基础设施...', tags: ['空间站', '国际合作'] },
      ]
    },
    '全球气候变化数据': {
      aiSummary: '全球<strong>气候变化</strong>数据表明，2025年全球平均气温较工业化前水平高出<strong>1.4°C</strong>。可再生能源装机容量首次超过化石燃料，碳捕获技术取得规模化突破。各国加速推进碳中和目标。',
      results: [
        { url: 'climate.example/global-temp', title: '2025年全球气温数据报告：1.4°C的警示', desc: '世界气象组织最新数据显示，全球平均气温持续攀升，极端天气事件频率显著增加...', tags: ['气温', '报告'] },
        { url: 'energy.example/renewable', title: '可再生能源里程碑：装机容量超越化石燃料', desc: '2025年全球可再生能源新增装机容量创历史新高，太阳能和风能成为最经济的电力来源...', tags: ['可再生能源', '里程碑'] },
        { url: 'tech.example/carbon-capture', title: '碳捕获与封存技术进入规模化应用阶段', desc: '新一代直接空气碳捕获(DAC)技术成本降低70%，全球已建成超过50座大型碳捕获设施...', tags: ['碳捕获', '技术'] },
        { url: 'policy.example/carbon-neutral', title: '全球碳中和进展追踪：各国目标与实际行动', desc: '超过140个国家承诺2050年实现碳中和，但实际行动与目标之间仍存在显著差距...', tags: ['碳中和', '政策'] },
      ]
    },
    '深度学习框架对比': {
      aiSummary: '<strong>深度学习框架</strong>领域在2026年呈现新格局。<strong>PyTorch</strong>继续保持研究领域的领先地位，<strong>JAX</strong>在高性能计算和大规模训练中崭露头角，<strong>MindSpore</strong>在国产化替代中发挥重要作用。',
      results: [
        { url: 'ml.example/framework-2026', title: '2026年深度学习框架全面对比：PyTorch vs JAX vs TensorFlow', desc: '从性能、生态、易用性和部署能力四个维度，深入分析主流深度学习框架的优劣势...', tags: ['框架对比', '评测'] },
        { url: 'google.example/jax-rise', title: 'JAX的崛起：为什么越来越多团队从PyTorch迁移', desc: 'JAX在TPU优化、自动微分和函数式编程方面的优势使其成为大规模AI训练的首选...', tags: ['JAX', '趋势'] },
        { url: 'huawei.example/mindspore', title: 'MindSpore 3.0：国产深度学习框架的新突破', desc: 'MindSpore在昇腾芯片上的性能优化取得重大进展，支持万亿参数大模型的高效训练...', tags: ['MindSpore', '国产化'] },
        { url: 'deploy.example/production', title: '从训练到部署：深度学习模型生产化最佳实践', desc: 'ONNX、TensorRT和vLLM等推理框架的对比分析，帮助你选择最优的模型部署方案...', tags: ['部署', '推理'] },
      ]
    }
  };

  const data = mockData[query];
  
  if (data) {
    aiSummary.value = data.aiSummary;
    resultsMeta.value = `找到约 <span>${data.results.length * 1247 + Math.floor(Math.random() * 500)}</span> 条结果（${(Math.random() * 0.3 + 0.15).toFixed(2)} 秒）`;
    searchResults.value = data.results;
  } else {
    // 通用结果
    aiSummary.value = `关于「<strong>${query}</strong>」的搜索结果如下。Nova Search 正在为你整理最相关的信息，帮助你快速获取所需内容。`;
    
    const fakeResults = generateFakeResults(query);
    resultsMeta.value = `找到约 <span>${(Math.floor(Math.random() * 900) + 100).toLocaleString()}</span> 条结果（${(Math.random() * 0.3 + 0.12).toFixed(2)} 秒）`;
    searchResults.value = fakeResults;
  }
};

// 生成假结果
const generateFakeResults = (query: string) => {
  const domains = ['wikipedia.example', 'techblog.example', 'research.example', 'news.example', 'learn.example'];
  return [
    { url: `${domains[0]}/wiki/${encodeURIComponent(query)}`, title: `${query} — 维基百科`, desc: `${query}是一个广泛讨论的话题。本文将从多个角度全面介绍${query}的定义、历史、发展现状和未来趋势...`, tags: ['百科', '综合'] },
    { url: `${domains[1]}/${encodeURIComponent(query)}-guide`, title: `深入了解${query}：完整指南与最佳实践`, desc: `本指南涵盖了${query}的核心概念、实际应用和进阶技巧，适合不同层次的读者参考学习...`, tags: ['指南', '教程'] },
    { url: `${domains[2]}/papers/${encodeURIComponent(query)}`, title: `${query}相关最新研究论文汇总`, desc: `精选了2025-2026年间关于${query}的高影响力学术论文，涵盖理论研究和实践应用两个方面...`, tags: ['研究', '论文'] },
    { url: `${domains[3]}/${encodeURIComponent(query)}-news`, title: `${query}最新资讯与行业动态`, desc: `追踪${query}领域的最新发展，包括技术突破、市场变化和政策更新等重要信息...`, tags: ['新闻', '动态'] },
  ];
};
</script>

<style scoped>
/* 布局样式 */
.app-container {
  position: relative;
  z-index: 1;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

/* 头部导航 */
header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px 40px;
  animation: fadeSlideDown 0.8s ease-out both;
}

.logo {
  display: flex;
  align-items: center;
  gap: 10px;
  text-decoration: none;
  color: var(--text-primary);
}

.logo-icon {
  width: 36px;
  height: 36px;
  background: linear-gradient(135deg, var(--accent), #d4883a);
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: var(--font-display);
  font-weight: 800;
  font-size: 18px;
  color: var(--bg-primary);
  box-shadow: 0 4px 20px rgba(232,168,73,0.25);
}

.logo-text {
  font-family: var(--font-display);
  font-weight: 700;
  font-size: 20px;
  letter-spacing: -0.5px;
}

.nav-links {
  display: flex;
  align-items: center;
  gap: 8px;
}

.nav-links a {
  color: var(--text-secondary);
  text-decoration: none;
  font-size: 14px;
  font-weight: 400;
  padding: 8px 16px;
  border-radius: var(--radius-sm);
  transition: all 0.25s ease;
}

.nav-links a:hover {
  color: var(--text-primary);
  background: var(--bg-card-hover);
}

.nav-links a.active {
  color: var(--accent);
  background: var(--accent-soft);
}

/* 搜索区域 */
.hero {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px 20px 60px;
  transition: all 0.6s cubic-bezier(0.4, 0, 0.2, 1);
}

.hero.compact {
  justify-content: flex-start;
  padding-top: 30px;
  flex: none;
}

.hero-title {
  font-family: var(--font-display);
  font-size: clamp(42px, 6vw, 72px);
  font-weight: 800;
  letter-spacing: -2px;
  text-align: center;
  margin-bottom: 12px;
  animation: fadeSlideUp 0.8s ease-out 0.15s both;
  line-height: 1.1;
}

.hero-title .highlight {
  background: linear-gradient(135deg, var(--accent), #f0c87a);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.hero-subtitle {
  font-size: 17px;
  color: var(--text-secondary);
  text-align: center;
  margin-bottom: 48px;
  font-weight: 300;
  animation: fadeSlideUp 0.8s ease-out 0.3s both;
  max-width: 500px;
  line-height: 1.6;
}

.hero.compact .hero-title { display: none; }
.hero.compact .hero-subtitle { display: none; }

/* 快速标签 */
.quick-tags {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 8px;
  margin-top: 28px;
  animation: fadeSlideUp 0.8s ease-out 0.6s both;
}

.hero.compact .quick-tags { display: none; }

.tag {
  padding: 8px 18px;
  border-radius: 100px;
  border: 1px solid var(--border);
  background: var(--bg-card);
  color: var(--text-secondary);
  font-size: 13px;
  cursor: pointer;
  transition: all 0.25s ease;
  font-weight: 400;
  backdrop-filter: blur(8px);
}

.tag:hover {
  border-color: var(--border-focus);
  color: var(--accent);
  background: var(--accent-soft);
  transform: translateY(-1px);
}

/* 搜索结果 */
.results-section {
  max-width: 780px;
  width: 100%;
  margin: 0 auto;
  padding: 0 20px 80px;
  display: none;
}

.results-section.visible {
  display: block;
}

.results-meta {
  font-size: 13px;
  color: var(--text-muted);
  margin-bottom: 24px;
  padding-left: 4px;
}

.results-meta span {
  color: var(--accent);
  font-weight: 500;
}

.result-card {
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  padding: 24px 28px;
  margin-bottom: 16px;
  transition: all 0.3s ease;
  cursor: pointer;
  animation: resultIn 0.5s ease-out both;
  position: relative;
  overflow: hidden;
}

.result-card::before {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(135deg, var(--accent-soft), transparent 50%);
  opacity: 0;
  transition: opacity 0.3s ease;
}

.result-card:hover {
  border-color: var(--border-focus);
  transform: translateY(-2px);
  box-shadow: 0 8px 30px rgba(0,0,0,0.3);
}

.result-card:hover::before {
  opacity: 1;
}

.result-card > * {
  position: relative;
  z-index: 1;
}

.result-source {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 10px;
}

.result-favicon {
  width: 20px;
  height: 20px;
  border-radius: 6px;
  background: var(--bg-card-hover);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 10px;
  font-weight: 700;
  color: var(--accent);
  flex-shrink: 0;
}

.result-url {
  font-size: 13px;
  color: var(--text-muted);
}

.result-title {
  font-family: var(--font-display);
  font-size: 18px;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 8px;
  letter-spacing: -0.3px;
  line-height: 1.4;
  transition: color 0.2s ease;
}

.result-card:hover .result-title {
  color: var(--accent);
}

.result-desc {
  font-size: 14px;
  color: var(--text-secondary);
  line-height: 1.7;
  font-weight: 300;
}

.result-desc em {
  font-style: normal;
  color: var(--text-primary);
  font-weight: 500;
}

.result-tags {
  display: flex;
  gap: 6px;
  margin-top: 14px;
}

.result-tag {
  font-size: 11px;
  padding: 3px 10px;
  border-radius: 6px;
  background: var(--accent-soft);
  color: var(--accent);
  font-weight: 500;
}

/* AI摘要 */
.ai-summary {
  background: linear-gradient(135deg, rgba(232,168,73,0.06), rgba(120,80,200,0.04));
  border: 1px solid rgba(232,168,73,0.15);
  border-radius: var(--radius);
  padding: 24px 28px;
  margin-bottom: 24px;
  animation: resultIn 0.5s ease-out both;
}

.ai-summary-header {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 12px;
}

.ai-badge {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  font-weight: 600;
  color: var(--accent);
  background: var(--accent-soft);
  padding: 4px 12px;
  border-radius: 100px;
  font-family: var(--font-display);
  letter-spacing: 0.5px;
  text-transform: uppercase;
}

.ai-summary-text {
  font-size: 14px;
  color: var(--text-secondary);
  line-height: 1.8;
  font-weight: 300;
}

.ai-summary-text strong {
  color: var(--text-primary);
  font-weight: 500;
}

/* 页脚 */
footer {
  text-align: center;
  padding: 24px;
  font-size: 13px;
  color: var(--text-muted);
  border-top: 1px solid var(--border);
  animation: fadeSlideUp 0.8s ease-out 0.75s both;
}

footer a {
  color: var(--text-secondary);
  text-decoration: none;
}

footer a:hover {
  color: var(--accent);
}

/* 加载条 */
.loading-bar {
  position: fixed;
  top: 0;
  left: 0;
  height: 2px;
  background: linear-gradient(90deg, transparent, var(--accent), transparent);
  z-index: 1000;
  width: 0;
  opacity: 0;
  transition: opacity 0.3s ease;
}

.loading-bar.active {
  opacity: 1;
  animation: loadProgress 1.2s ease-out forwards;
}

/* 响应式 */
@media (max-width: 640px) {
  header {
    padding: 16px 20px;
  }
  
  .nav-links a {
    padding: 6px 12px;
    font-size: 13px;
  }
  
  .hero {
    padding: 30px 16px 40px;
  }
  
  .result-card {
    padding: 20px;
  }
  
  .quick-tags {
    gap: 6px;
  }
  
  .tag {
    padding: 6px 14px;
    font-size: 12px;
  }
}
</style>