<template>
  <div class="search-wrapper">
    <div class="search-box" id="searchBox" ref="searchBox">
      <svg class="search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/>
      </svg>
      <input 
        class="search-input" 
        id="searchInput" 
        type="text" 
        placeholder="搜索任何内容..." 
        autocomplete="off" 
        autofocus
        v-model="searchQuery"
        @input="handleInput"
        @keydown="handleKeydown"
      >
      <div class="search-actions">
        <button class="voice-btn" id="voiceBtn" title="语音搜索" @click="toggleVoiceSearch">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" x2="12" y1="19" y2="22"/>
          </svg>
        </button>
        <button class="search-btn" id="searchBtn" @click="handleSearch">搜索</button>
      </div>
    </div>
    <div class="suggestions" id="suggestions" :class="{ visible: showSuggestions }" ref="suggestions">
      <div 
        v-for="(suggestion, index) in filteredSuggestions" 
        :key="index" 
        class="suggestion-item"
        :class="{ selected: selectedIndex === index }"
        @mouseenter="selectSuggestion(index)"
        @click="pickSuggestion(index)"
      >
        <svg class="s-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/>
        </svg>
        <span class="s-text" v-html="highlightSuggestion(suggestion.text)"></span>
        <span class="s-type">{{ suggestion.type }}</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue';

// 定义props和emits
const emit = defineEmits<{
  (e: 'search', query: string): void;
  (e: 'voice-search', text: string): void;
}>();

// 状态管理
const searchQuery = ref('');
const showSuggestions = ref(false);
const selectedIndex = ref(-1);
const isListening = ref(false);
const searchBox = ref<HTMLElement | null>(null);
const suggestions = ref<HTMLElement | null>(null);

// 搜索建议池
const suggestionPool = [
  { text: '人工智能发展趋势', type: '热门' },
  { text: '人工智能应用案例', type: '推荐' },
  { text: '人工智能伦理问题', type: '话题' },
  { text: '量子计算最新进展', type: '热门' },
  { text: '量子计算入门教程', type: '推荐' },
  { text: '量子计算 vs 经典计算', type: '对比' },
  { text: '太空探索 2026', type: '热门' },
  { text: '太空探索纪录片推荐', type: '推荐' },
  { text: '全球气候变化数据', type: '热门' },
  { text: '气候变化应对措施', type: '话题' },
  { text: '深度学习框架对比', type: '热门' },
  { text: '深度学习入门指南', type: '推荐' },
  { text: '如何学习机器学习', type: '教程' },
  { text: 'Python 数据分析', type: '教程' },
  { text: '2026 科技趋势', type: '热门' },
  { text: 'Web 开发最佳实践', type: '教程' },
];

// 过滤后的搜索建议
const filteredSuggestions = computed(() => {
  if (!searchQuery.value.trim()) return [];
  return suggestionPool
    .filter(s => s.text.toLowerCase().includes(searchQuery.value.toLowerCase()))
    .slice(0, 6);
});

// 处理输入
const handleInput = () => {
  if (searchQuery.value.trim()) {
    showSuggestions.value = true;
    selectedIndex.value = -1;
  } else {
    showSuggestions.value = false;
  }
};

// 处理键盘事件
const handleKeydown = (e: KeyboardEvent) => {
  if (!showSuggestions.value) {
    if (e.key === 'Enter') {
      handleSearch();
    }
    return;
  }

  if (e.key === 'ArrowDown') {
    e.preventDefault();
    selectedIndex.value = Math.min(selectedIndex.value + 1, filteredSuggestions.value.length - 1);
    scrollToSelected();
  } else if (e.key === 'ArrowUp') {
    e.preventDefault();
    selectedIndex.value = Math.max(selectedIndex.value - 1, -1);
    scrollToSelected();
  } else if (e.key === 'Enter') {
    e.preventDefault();
    if (selectedIndex.value >= 0) {
      pickSuggestion(selectedIndex.value);
    } else {
      handleSearch();
    }
  } else if (e.key === 'Escape') {
    showSuggestions.value = false;
  }
};

// 滚动到选中的建议项
const scrollToSelected = () => {
  if (selectedIndex.value >= 0 && suggestions.value) {
    const items = suggestions.value.querySelectorAll('.suggestion-item');
    if (items[selectedIndex.value]) {
      (items[selectedIndex.value] as HTMLElement).scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  }
};

// 处理搜索
const handleSearch = () => {
  if (searchQuery.value.trim()) {
    emit('search', searchQuery.value.trim());
    showSuggestions.value = false;
  }
};

// 选择建议项
const selectSuggestion = (index: number) => {
  selectedIndex.value = index;
};

// 选择建议并搜索
const pickSuggestion = (index: number) => {
  if (index >= 0 && index < filteredSuggestions.value.length) {
    searchQuery.value = filteredSuggestions.value[index].text;
    showSuggestions.value = false;
    emit('search', searchQuery.value);
  }
};

// 高亮建议文本
const highlightSuggestion = (text: string) => {
  if (!searchQuery.value) return text;
  const escaped = searchQuery.value.replace(/[.*+?^${}()|\[\]\\]/g, '\\$&');
  return text.replace(new RegExp(`(${escaped})`, 'gi'), '<em>$1</em>');
};

// 切换语音搜索
const toggleVoiceSearch = () => {
  if (isListening.value) {
    stopListening();
    return;
  }

  if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
    alert('您的浏览器不支持语音搜索功能');
    return;
  }

  const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
  const recognition = new SpeechRecognition();
  recognition.lang = 'zh-CN';
  recognition.interimResults = true;

  recognition.onstart = () => {
    isListening.value = true;
    if (searchBox.value) {
      const voiceBtn = searchBox.value.querySelector('.voice-btn');
      if (voiceBtn) {
        voiceBtn.classList.add('listening');
      }
    }
  };

  recognition.onresult = (event: SpeechRecognitionEvent) => {
    const transcript = Array.from(event.results)
      .map(r => r[0].transcript)
      .join('');
    searchQuery.value = transcript;
  };

  recognition.onend = () => stopListening();
  recognition.onerror = () => stopListening();

  recognition.start();
};

// 停止语音搜索
const stopListening = () => {
  isListening.value = false;
  if (searchBox.value) {
    const voiceBtn = searchBox.value.querySelector('.voice-btn');
    if (voiceBtn) {
      voiceBtn.classList.remove('listening');
    }
  }
  if (searchQuery.value.trim()) {
    emit('voice-search', searchQuery.value.trim());
  }
};

// 点击外部关闭建议
const handleClickOutside = (e: MouseEvent) => {
  if (searchBox.value && !searchBox.value.contains(e.target as Node)) {
    showSuggestions.value = false;
  }
};

// 键盘快捷键
const handleKeyPress = (e: KeyboardEvent) => {
  if (e.key === '/' && document.activeElement !== document.getElementById('searchInput')) {
    e.preventDefault();
    const searchInput = document.getElementById('searchInput') as HTMLInputElement;
    if (searchInput) {
      searchInput.focus();
    }
  }
};

// 生命周期钩子
onMounted(() => {
  document.addEventListener('click', handleClickOutside);
  document.addEventListener('keydown', handleKeyPress);
});

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside);
  document.removeEventListener('keydown', handleKeyPress);
});
</script>

<style scoped>
/* 搜索框容器 */
.search-wrapper {
  width: 100%;
  max-width: 680px;
  animation: fadeSlideUp 0.8s ease-out 0.45s both;
  position: relative;
}

/* 搜索框 */
.search-box {
  position: relative;
  width: 100%;
  background: var(--bg-secondary);
  border: 1.5px solid var(--border);
  border-radius: var(--radius);
  display: flex;
  align-items: center;
  padding: 6px 6px 6px 20px;
  transition: all 0.35s ease;
  box-shadow: 0 4px 30px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.03);
}

.search-box:focus-within {
  border-color: var(--border-focus);
  box-shadow: 0 4px 40px rgba(0,0,0,0.4), 0 0 0 4px var(--accent-glow), inset 0 1px 0 rgba(255,255,255,0.03);
  background: rgba(18,18,26,0.95);
}

/* 搜索图标 */
.search-icon {
  flex-shrink: 0;
  width: 20px;
  height: 20px;
  color: var(--text-muted);
  transition: color 0.3s ease;
}

.search-box:focus-within .search-icon {
  color: var(--accent);
}

/* 搜索输入 */
.search-input {
  flex: 1;
  background: none;
  border: none;
  outline: none;
  color: var(--text-primary);
  font-size: 16px;
  font-family: var(--font-body);
  padding: 14px 16px;
  font-weight: 400;
}

.search-input::placeholder {
  color: var(--text-muted);
  font-weight: 300;
}

/* 搜索操作按钮 */
.search-actions {
  display: flex;
  align-items: center;
  gap: 6px;
  flex-shrink: 0;
}

/* 搜索按钮 */
.search-btn {
  height: 42px;
  padding: 0 24px;
  border: none;
  border-radius: 12px;
  background: linear-gradient(135deg, var(--accent), #d4883a);
  color: var(--bg-primary);
  font-family: var(--font-display);
  font-weight: 600;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.25s ease;
  letter-spacing: 0.3px;
  box-shadow: 0 2px 12px rgba(232,168,73,0.2);
}

.search-btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 20px rgba(232,168,73,0.35);
}

.search-btn:active {
  transform: translateY(0);
}

/* 语音按钮 */
.voice-btn {
  width: 42px;
  height: 42px;
  border: none;
  border-radius: 12px;
  background: var(--bg-card);
  color: var(--text-secondary);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.25s ease;
}

.voice-btn:hover {
  background: var(--bg-card-hover);
  color: var(--text-primary);
}

.voice-btn.listening {
  color: #e84949;
  background: rgba(232,73,73,0.1);
  animation: pulse 1.5s ease-in-out infinite;
}

/* 搜索建议 */
.suggestions {
  position: absolute;
  top: calc(100% + 8px);
  left: 0;
  right: 0;
  background: var(--bg-secondary);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  overflow: hidden;
  z-index: 100;
  box-shadow: 0 20px 60px rgba(0,0,0,0.5);
  display: none;
  animation: suggestIn 0.2s ease-out;
}

.suggestions.visible {
  display: block;
}

/* 建议项 */
.suggestion-item {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 12px 20px;
  cursor: pointer;
  transition: background 0.15s ease;
}

.suggestion-item:hover, .suggestion-item.selected {
  background: var(--bg-card-hover);
}

/* 建议项图标 */
.s-icon {
  width: 18px;
  height: 18px;
  color: var(--text-muted);
  flex-shrink: 0;
}

/* 建议项文本 */
.s-text {
  flex: 1;
  font-size: 14px;
  color: var(--text-primary);
}

.s-text em {
  font-style: normal;
  color: var(--accent);
  font-weight: 500;
}

/* 建议项类型 */
.s-type {
  font-size: 11px;
  color: var(--text-muted);
  background: var(--bg-card);
  padding: 3px 8px;
  border-radius: 6px;
  flex-shrink: 0;
}

/* 响应式 */
@media (max-width: 640px) {
  .search-box {
    padding: 4px 4px 4px 16px;
  }
  
  .search-input {
    font-size: 15px;
    padding: 12px 12px;
  }
  
  .search-btn {
    padding: 0 16px;
    font-size: 13px;
  }
}
</style>