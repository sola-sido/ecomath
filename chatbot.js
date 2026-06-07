// 경제 지표 학습 도우미 — Google Gemini AI + 오프라인 백업

const CHATBOT_KB = [
    {
        keys: ['cpi', '소비자물가', '물가지수', '물가'],
        answer: `<strong>소비자물가지수(CPI)</strong>는 가구가 생활에 쓰는 상품·서비스 가격 변동을 종합한 지표입니다.<br><br>
        • 기준 시점 물가를 <strong>100</strong>으로 두고 비교합니다.<br>
        • CPI가 오르면 <strong>인플레이션</strong> 압력이 커진다고 봅니다.`
    },
    {
        keys: ['실업률'],
        answer: `<strong>실업률</strong> = (실업자 ÷ 경제활동인구) × 100<br>분모는 15세 이상 전체가 아닌 <strong>경제활동인구</strong>입니다.`
    },
    {
        keys: ['고용률'],
        answer: `<strong>고용률</strong> = (취업자 ÷ 15세 이상 인구) × 100<br>실업률과 <strong>함께</strong> 봐야 합니다.`
    },
    {
        keys: ['kosis', '코시스', '다운로드', 'csv', '행렬'],
        answer: `KOSIS: 행렬전환(세로) → 전체 연도 선택 → CSV 다운로드. 소개 섹션 안내를 참고하세요.`
    },
    {
        keys: ['그래프', '차트', '추세', '분석', '해석'],
        answer: `그래프 분석 순서: ① 전체 추세 ② 특이 시점 ③ 남녀·농가 비교 ④ 메모 작성<br>"내 그래프 분석"이라고 입력하면 업로드한 데이터 기준 힌트를 드립니다.`
    },
    {
        keys: ['참가율', '경제활동'],
        answer: `<strong>경제활동참가율</strong> = (경제활동인구 ÷ 15세 이상 인구) × 100`
    },
    {
        keys: ['인플레이션'],
        answer: `인플레이션은 물가가 지속적으로 오르는 현상입니다. CPI 그래프가 우상향하면 물가 상승 압력이 큽니다.`
    }
];

let chatHistory = [];
let isChatLoading = false;

function getConfig() {
    return window.ECOMATH_CONFIG || {};
}

function isValidGeminiKeyFormat(key) {
    return key.startsWith('AIza') || key.startsWith('AQ.');
}

function getApiKeyStatus() {
    const key = (getConfig().geminiApiKey || '').trim();

    if (!key || key === '여기에_Google_API_키_입력') {
        return {
            ok: false,
            code: 'missing',
            status: '📚 기본 학습 도우미 모드',
            hint: 'CPI·고용·그래프 분석 질문에 답해 드립니다.'
        };
    }

    if (!isValidGeminiKeyFormat(key)) {
        return {
            ok: false,
            code: 'format',
            status: '⚠️ API 키 형식을 확인해 주세요',
            hint: 'Google AI Studio에서 발급한 키는 보통 <strong>AIza</strong> 또는 <strong>AQ.</strong> 로 시작합니다.'
        };
    }

    const keyType = key.startsWith('AQ.') ? 'AQ (신규)' : 'AIza (기존)';
    return { ok: true, code: 'ok', status: `✨ Google Gemini AI 연결됨 (${keyType})`, hint: '' };
}

function hasGeminiKey() {
    return getApiKeyStatus().ok;
}

function normalizeText(text) {
    return text.toLowerCase().replace(/\s+/g, '');
}

function formatBotReply(text) {
    return text
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
        .replace(/\n/g, '<br>');
}

function getVisibleSection() {
    const sections = ['intro', 'cpi', 'employment', 'quiz'];
    let current = 'intro';
    const scrollY = window.scrollY + 200;
    for (const id of sections) {
        const el = document.getElementById(id);
        if (el && el.offsetTop <= scrollY) current = id;
    }
    return current;
}

function buildChartContextText() {
    const getCtx = window.getEcomathContext;
    if (!getCtx) return '업로드된 그래프 없음';

    const { cpi, emp } = getCtx();
    const lines = [];

    if (cpi?.hasData && cpi.datasets?.length) {
        lines.push(`[CPI] 기간: ${cpi.rangeLabel}`);
        cpi.datasets.forEach(ds => {
            const vals = ds.data.slice(cpi.startIdx, cpi.endIdx + 1).filter(v => v !== null);
            if (vals.length >= 2) {
                lines.push(`  - ${ds.label}: ${vals[0]} → ${vals[vals.length - 1]}`);
            }
        });
    }
    if (emp?.hasData && emp.datasets?.length) {
        lines.push(`[고용] 지표: ${emp.indicator}, 기간: ${emp.rangeLabel}`);
        emp.datasets.forEach(ds => {
            const vals = ds.data.slice(emp.startIdx, emp.endIdx + 1).filter(v => v !== null);
            if (vals.length >= 2) {
                lines.push(`  - ${ds.label}: ${vals[0]} → ${vals[vals.length - 1]}`);
            }
        });
    }

    return lines.length ? lines.join('\n') : '업로드된 그래프 없음';
}

function buildSystemPrompt() {
    const section = getVisibleSection();
    const sectionNames = { intro: '소개', cpi: 'CPI 분석', employment: '고용 지표 분석', quiz: '확인 퀴즈' };

    return `당신은 고등학교 2학년 경제수학 수업을 돕는 친절한 AI 튜터입니다.

역할:
- CPI(소비자물가지수), 경제활동참가율, 실업률, 고용률 등 경제 지표를 쉬운 한국어로 설명
- 학생이 업로드한 그래프 데이터를 바탕으로 분석 질문에 힌트 제공 (정답을 대신 쓰지 말고 스스로 생각하도록 유도)
- KOSIS 데이터 다운로드, 그래프 해석 방법 안내

공식 (교과서 기준):
- CPI = (비교 시점 가중 평균 ÷ 기준 시점 가중 평균) × 100
- 경제활동참가율 = (경제활동인구 ÷ 15세 이상 인구) × 100
- 실업률 = (실업자 ÷ 경제활동인구) × 100
- 고용률 = (취업자 ÷ 15세 이상 인구) × 100

중요: 실업률 하락만으로 고용 개선을 단정하지 말 것. 구직 단논자 개념 설명.

현재 학생 위치: ${sectionNames[section] || section}
현재 그래프 데이터:
${buildChartContextText()}

답변 규칙: 3~8문장, 존댓말, 필요 시 번호 목록. 수식은 간단히.`;
}

async function requestGemini(model, key, payload) {
    const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`;
    const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'x-goog-api-key': key
        },
        body: JSON.stringify(payload)
    });

    const data = await response.json();

    if (!response.ok) {
        const errMsg = data?.error?.message || `API 오류 (${response.status})`;
        const err = new Error(errMsg);
        err.status = response.status;
        err.isModelError = response.status === 404 || /not found|not supported/i.test(errMsg);
        err.isQuotaError = response.status === 429 || /quota|rate limit|exceeded/i.test(errMsg);
        throw err;
    }

    const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!text) throw new Error('AI가 답변을 생성하지 못했습니다.');
    return text;
}

async function callGemini(userMessage) {
    const config = getConfig();
    const key = config.geminiApiKey.trim();

    const contents = [
        ...chatHistory.map(msg => ({
            role: msg.role,
            parts: [{ text: msg.text }]
        })),
        { role: 'user', parts: [{ text: userMessage }] }
    ];

    const payload = {
        systemInstruction: { parts: [{ text: buildSystemPrompt() }] },
        contents,
        generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 1024
        }
    };

    const modelsToTry = [...new Set([
        config.geminiModel,
        'gemini-2.5-flash-lite',
        'gemini-2.0-flash-lite',
        'gemini-1.5-flash',
        'gemini-2.0-flash',
        'gemini-2.5-flash'
    ].filter(Boolean))];

    let lastError = null;

    for (const model of modelsToTry) {
        try {
            return await requestGemini(model, key, payload);
        } catch (err) {
            lastError = err;
            if (err.isModelError || err.isQuotaError) continue;
            break;
        }
    }

    if (lastError?.message === 'Failed to fetch' || lastError?.name === 'TypeError') {
        throw new Error('브라우저에서 API에 연결하지 못했습니다. index.html을 더블클릭 대신 아래 방법으로 열어 보세요: Cursor 터미널에서 npx serve . 실행 후 http://localhost:3000 접속');
    }

    throw lastError || new Error('알 수 없는 오류');
}

function findKnowledgeAnswer(input) {
    const norm = normalizeText(input);
    for (const item of CHATBOT_KB) {
        for (const key of item.keys) {
            if (norm.includes(normalizeText(key))) return item.answer;
        }
    }
    return null;
}

function summarizeDataset(labels, datasets, startIdx, endIdx) {
    if (!labels.length || !datasets.length) return null;
    const slicedLabels = labels.slice(startIdx, endIdx + 1);
    return datasets.slice(0, 3).map(ds => {
        const values = ds.data.slice(startIdx, endIdx + 1).filter(v => v !== null);
        if (values.length < 2) return null;
        const diff = parseFloat((values[values.length - 1] - values[0]).toFixed(2));
        const trend = diff > 0.5 ? '상승' : diff < -0.5 ? '하락' : '횡보';
        return `• <strong>${ds.label}</strong>: ${slicedLabels[0]}→${slicedLabels[slicedLabels.length - 1]}, ${values[0]}→${values[values.length - 1]} (${trend})`;
    }).filter(Boolean).join('<br>');
}

function getChartAnalysisHint() {
    const getCtx = window.getEcomathContext;
    if (!getCtx) return null;
    const { cpi, emp } = getCtx();
    const parts = [];
    if (cpi?.hasData) {
        const s = summarizeDataset(cpi.labels, cpi.datasets, cpi.startIdx, cpi.endIdx);
        if (s) parts.push(`📊 <strong>CPI</strong> (${cpi.rangeLabel}):<br>${s}`);
    }
    if (emp?.hasData) {
        const s = summarizeDataset(emp.labels, emp.datasets, emp.startIdx, emp.endIdx);
        if (s) parts.push(`📊 <strong>고용</strong> (${emp.rangeLabel}):<br>${s}`);
    }
    return parts.length ? parts.join('<br><br>') + '<br><br>💡 위 수치를 메모에 쓰고 변화 원인을 추측해 보세요.' : null;
}

function generateLocalReply(input) {
    const trimmed = input.trim();
    if (!trimmed) return '질문을 입력해 주세요.';

    const norm = normalizeText(trimmed);
    if (norm.includes('안녕')) return '안녕하세요! 경제 지표 학습 도우미입니다. 😊';

    if (norm.includes('내그래프') || norm.includes('그래프분석') || norm.includes('현재그래프')) {
        const hint = getChartAnalysisHint();
        return hint || '아직 그래프가 없습니다. CSV 업로드 후 "그래프 그리기"를 눌러 주세요.';
    }

    const kb = findKnowledgeAnswer(trimmed);
    if (kb) return kb;

    return `CPI · 실업률 · 고용률 · 그래프 분석 · KOSIS · "내 그래프 분석" 등으로 질문해 보세요.`;
}

function generateFallbackReply(input, status) {
    const local = generateLocalReply(input);
    if (local && !local.includes('CPI · 실업률')) return local;
    const hint = status?.hint || '키워드로 질문해 보세요. (CPI, 실업률, 그래프 분석, KOSIS 등)';
    return `${status?.status || 'AI 연결 안 됨'}<br><br>${hint}`;
}

function initChatbot() {
    const toggle = document.getElementById('chatbot-toggle');
    const panel = document.getElementById('chatbot-panel');
    const header = document.getElementById('chatbot-header');
    const closeBtn = document.getElementById('chatbot-close');
    const minimizeBtn = document.getElementById('chatbot-minimize');
    const messagesEl = document.getElementById('chatbot-messages');
    const inputEl = document.getElementById('chatbot-input');
    const sendBtn = document.getElementById('chatbot-send');
    const statusEl = document.getElementById('chatbot-status');
    const chips = document.querySelectorAll('.chatbot-chip');

    if (!toggle || !panel) return;

    let chatState = 'closed';

    const keyStatus = getApiKeyStatus();
    const aiEnabled = keyStatus.ok;

    const showWelcomeIfEmpty = () => {
        if (messagesEl.children.length > 0) return;
        appendMessage(
            '안녕하세요! <strong>경제 지표 학습 도우미</strong>입니다. 📈<br><br>' +
            'CPI·고용 지표 개념, 그래프 해석, KOSIS 활용 등 무엇이든 물어보세요.<br>' +
            '그래프를 올린 뒤 <strong>"내 그래프 분석"</strong>이라고도 질문해 보세요!',
            'bot'
        );
    };

    const setChatState = (state) => {
        chatState = state;
        panel.classList.remove('chatbot-closed', 'chatbot-open', 'chatbot-minimized');
        panel.classList.add(state === 'closed' ? 'chatbot-closed' : state === 'minimized' ? 'chatbot-minimized' : 'chatbot-open');
        panel.setAttribute('aria-hidden', state === 'closed' ? 'true' : 'false');
        toggle.classList.toggle('chatbot-toggle-hidden', state === 'open' || state === 'minimized');

        document.querySelectorAll('[data-section="chatbot"]').forEach(el => {
            el.classList.toggle('nav-chatbot-active', state !== 'closed');
        });

        if (state === 'open') {
            showWelcomeIfEmpty();
            inputEl.focus();
        }
    };

    window.openChatbot = () => setChatState('open');
    window.closeChatbot = () => setChatState('closed');
    window.minimizeChatbot = () => setChatState('minimized');
    window.toggleChatbot = () => setChatState(chatState === 'open' ? 'closed' : 'open');

    if (statusEl) {
        if (keyStatus.ok) {
            statusEl.textContent = keyStatus.status;
            statusEl.classList.remove('hidden');
        } else {
            statusEl.textContent = '';
            statusEl.classList.add('hidden');
        }
    }

    const appendMessage = (html, role, extraClass = '') => {
        const div = document.createElement('div');
        div.className = `chatbot-msg ${role === 'user' ? 'chatbot-msg-user' : 'chatbot-msg-bot'} ${extraClass}`.trim();
        div.innerHTML = html;
        messagesEl.appendChild(div);
        messagesEl.scrollTop = messagesEl.scrollHeight;
        return div;
    };

    const setLoading = (loading) => {
        isChatLoading = loading;
        inputEl.disabled = loading;
        sendBtn.disabled = loading;
        sendBtn.classList.toggle('opacity-50', loading);
    };

    const sendMessage = async (text) => {
        const trimmed = text.trim();
        if (!trimmed || isChatLoading) return;

        appendMessage(trimmed.replace(/</g, '&lt;').replace(/>/g, '&gt;'), 'user');
        inputEl.value = '';

        if (!aiEnabled) {
            setTimeout(() => appendMessage(generateFallbackReply(trimmed, keyStatus), 'bot'), 300);
            return;
        }

        const typingEl = appendMessage('<i class="fa-solid fa-spinner fa-spin mr-1"></i> 생각하는 중...', 'bot', 'chatbot-typing');

        setLoading(true);
        try {
            const reply = await callGemini(trimmed);
            typingEl.remove();

            chatHistory.push({ role: 'user', text: trimmed });
            chatHistory.push({ role: 'model', text: reply });
            if (chatHistory.length > 10) chatHistory = chatHistory.slice(-10);

            appendMessage(formatBotReply(reply), 'bot');
        } catch (err) {
            typingEl.remove();
            console.error('Gemini API error:', err);

            const isQuota = /quota|rate limit|exceeded/i.test(err.message);
            const localReply = generateLocalReply(trimmed);

            if (isQuota) {
                appendMessage(
                    `📚 <strong>AI 무료 사용량 한도</strong>에 도달해, 기본 학습 도우미로 답변드립니다.<br><br>${localReply}` +
                    `<br><br><span class="text-xs text-gray-500">💡 내일 다시 시도하거나, Google AI Studio에서 사용량·결제 설정을 확인하세요.</span>`,
                    'bot'
                );
                if (statusEl) statusEl.textContent = '📚 AI 한도 초과 — 기본 학습 도우미 모드';
            } else {
                appendMessage(
                    `⚠️ AI 응답 실패: ${formatBotReply(err.message)}<br><br>` +
                    `<strong>기본 답변:</strong><br>${localReply}`,
                    'bot'
                );
            }
        } finally {
            setLoading(false);
        }
    };

    toggle.addEventListener('click', () => {
        if (chatState === 'minimized') setChatState('open');
        else if (chatState === 'open') setChatState('closed');
        else setChatState('open');
    });

    header?.addEventListener('click', () => {
        if (chatState === 'minimized') setChatState('open');
    });

    closeBtn?.addEventListener('click', () => setChatState('closed'));
    minimizeBtn?.addEventListener('click', () => setChatState('minimized'));

    ['nav-chatbot-btn', 'nav-chatbot-btn-mobile', 'bottom-nav-chatbot'].forEach(id => {
        document.getElementById(id)?.addEventListener('click', (e) => {
            e.preventDefault();
            document.getElementById('nav-mobile-menu')?.classList.add('hidden');
            setChatState('open');
        });
    });

    sendBtn?.addEventListener('click', () => sendMessage(inputEl.value));
    inputEl?.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendMessage(inputEl.value);
        }
    });
    chips.forEach(chip => chip.addEventListener('click', () => sendMessage(chip.dataset.prompt)));
}

document.addEventListener('DOMContentLoaded', initChatbot);
