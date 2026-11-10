// 경제 지표 학습 도우미 — 선생님 검토 학습 자료 기반 (외부 AI·서버 전송 없음)

const CHATBOT_DISCLAIMER =
    '선생님이 검토한 학습 자료에서 관련 설명을 찾아 제공합니다. 이름·학번 등 개인정보를 입력하지 마세요.';

const NO_MATCH_REPLY =
    '선생님이 준비한 자료에서는 이 질문에 맞는 설명을 찾지 못했어요.<br><br>' +
    '<strong>이렇게 물어보면 바로 도와드려요</strong>:<br>' +
    '• CPI란? / CPI 급상승 예시 / 내 그래프 분석<br>' +
    '• 고용 탐구 가이드 / 남녀 고용률 / 코로나·노동<br>' +
    '• KOSIS 안내 / 공식 / 사용법<br><br>' +
    '위 <strong>추천 질문</strong>을 누르거나, 선생님께 질문해 주세요.';

/** @type {{ role: 'user'|'bot', html: string }[]} */
let chatHistory = [];
let isChatLoading = false;

/** 같은 주제 반복 시 다른 층의 답을 주기 위한 상태 (메모리만, 저장·전송 없음) */
let lastEntryId = null;
let lastEntryStreak = 0;

function getKnowledgeBase() {
    return window.ECOMATH_CHATBOT_KB || [];
}

function getEntryById(id) {
    return getKnowledgeBase().find(e => e.id === id) || null;
}

function normalizeText(text) {
    return String(text).toLowerCase().replace(/\s+/g, '');
}

function escapeHtml(text) {
    return text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
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

function sectionNudgeHtml() {
    const section = getVisibleSection();
    const tips = {
        intro: '지금 <strong>소개</strong> 화면입니다. 「KOSIS 안내」「사용법」을 물어보세요.',
        cpi: '지금 <strong>CPI</strong> 탭입니다. 「급상승」「내 그래프 분석」이 도움이 됩니다.',
        employment: '지금 <strong>고용</strong> 탭입니다. 「①~⑤ 가이드」「남녀 고용률」「코로나」를 추천합니다.',
        quiz: '지금 <strong>퀴즈</strong>입니다. 「공식」「실업률과 고용률 차이」는 힌트만 드립니다.'
    };
  const tip = tips[section];
    return tip ? `<p class="text-xs text-indigo-600 mt-2 border-t border-gray-100 pt-2">${tip}</p>` : '';
}

function summarizeDataset(labels, datasets, startIdx, endIdx) {
    if (!labels.length || !datasets.length) return null;
    const slicedLabels = labels.slice(startIdx, endIdx + 1);
    return datasets.slice(0, 4).map(ds => {
        const values = ds.data.slice(startIdx, endIdx + 1).filter(v => v !== null);
        if (values.length < 2) return null;
        const start = values[0];
        const end = values[values.length - 1];
        const diff = parseFloat((end - start).toFixed(2));
        const pct = start !== 0 ? parseFloat(((diff / Math.abs(start)) * 100).toFixed(1)) : null;
        const trend = diff > 0.5 ? '상승' : diff < -0.5 ? '하락' : '횡보';
        const change =
            pct !== null
                ? `${start}→${end} (약 ${pct >= 0 ? '+' : ''}${pct}%)`
                : `${start}→${end}`;
        return `• <strong>${ds.label}</strong> (${slicedLabels[0]}~${slicedLabels[slicedLabels.length - 1]}): ${change} — <em>${trend}</em>`;
    }).filter(Boolean).join('<br>');
}

function getChartAnalysisHint(deep) {
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
        if (s) parts.push(`📊 <strong>고용</strong> (${emp.indicator}, ${emp.rangeLabel}):<br>${s}`);
    }
    if (!parts.length) {
        return '아직 그래프가 없습니다. CSV 업로드 후 「그래프 그리기」를 누러 주세요.';
    }
    const memo = deep
        ? '<br><br><strong>메모 예시</strong><br>① 전체 추세 ② 구간(연도·수치) ③ 원인 추정 ④ 한 줄 결론'
        : '<br><br>💡 위 수치를 메모에 옮기고, 「그래프 해석」처럼 다시 질문하면 분석 순서도 안내합니다.';
    return parts.join('<br><br>') + memo + sectionNudgeHtml();
}

function wantsMoreDetail(norm) {
    return (
        norm.includes('자세히') ||
        norm.includes('더알려') ||
        norm.includes('더설명') ||
        norm.includes('예시') ||
        norm.includes('구체적') ||
        norm.includes('그다음') ||
        norm.includes('이어서')
    );
}

function resolveEntryByChip(norm) {
    const map = window.ECOMATH_CHIP_TO_ID || {};
    if (map[norm]) return getEntryById(map[norm]);

    for (const [key, id] of Object.entries(map)) {
        if (norm === key || (norm.length > 8 && norm.includes(key))) return getEntryById(id);
    }
    return null;
}

function scoreEntry(inputNorm, entry) {
    let score = 0;
    const keyTerms = entry.keys || [];
    const synTerms = entry.synonyms || [];
    for (const term of keyTerms) {
        const nt = normalizeText(term);
        if (!nt || !inputNorm.includes(nt)) continue;
        if (nt.length <= 3) score += 2;
        else if (nt.length >= 6) score += 5;
        else score += 4;
    }
    for (const term of synTerms) {
        const nt = normalizeText(term);
        if (!nt || !inputNorm.includes(nt)) continue;
        if (nt.length <= 3) score += 1;
        else score += 3;
    }
    return score;
}

function pickBestEntry(inputNorm) {
    const chipEntry = resolveEntryByChip(inputNorm);
    if (chipEntry) return { entry: chipEntry, score: 999 };

    const kb = getKnowledgeBase();
    let best = null;
    let bestScore = 0;
    for (const entry of kb) {
        const score = scoreEntry(inputNorm, entry);
        if (score > bestScore) {
            bestScore = score;
            best = entry;
        }
    }
    if (!best || bestScore < 3) return null;
    return { entry: best, score: bestScore };
}

function buildAnswerFromEntry(entry, inputNorm, detailRequest) {
    if (!entry) return null;

  const sameTopic = entry.id === lastEntryId;
    if (sameTopic && !detailRequest) {
        lastEntryStreak += 1;
    } else if (!sameTopic) {
        lastEntryId = entry.id;
        lastEntryStreak = 0;
    }

    let body;
    const chartHint = () => getChartAnalysisHint(detailRequest);

    if (entry.answer === '__CHART_HINT__' && lastEntryStreak === 0 && !detailRequest) {
        body = chartHint();
    } else if (detailRequest && entry.answerDeep) {
        body = entry.answerDeep;
    } else if (lastEntryStreak === 0) {
        body = entry.answer === '__CHART_HINT__' ? chartHint() : entry.answer;
    } else if (lastEntryStreak === 1 && entry.answerMore) {
        body = entry.answerMore;
    } else if (entry.seeAlso?.length) {
        const idx = (lastEntryStreak - 2) % entry.seeAlso.length;
        const related = getEntryById(entry.seeAlso[idx]);
        const step = lastEntryStreak + 1;
        body =
            `<p class="text-xs text-indigo-600 mb-2">다른 각도 안내 (${step}번째)</p>` +
            (related
                ? `<strong>${related.title}</strong><br><br>${related.answer}`
                : entry.answer);
    } else if (lastEntryStreak >= 2) {
        body =
            '이 주제는 앞에서 충분히 안내했습니다.<br><br>' +
            '<strong>다른 추천 칩</strong>을 눌러 보세요: 고용 탐구 가이드, 공식, KOSIS 안내, 탐구 주제 등.<br>' +
            '「<strong>기준 연도가 몇 년인가요?</strong>」처럼 구체적으로 물어도 됩니다.';
    } else {
        body = entry.answerMore || entry.answer;
    }

    const title = entry.title
        ? `<h4 class="text-xs font-bold text-indigo-700 mb-1.5">📘 ${escapeHtml(entry.title)}</h4>`
        : '';

    if (lastEntryStreak === 0 && entry.id !== 'site-help' && !detailRequest) {
        body += '<br><span class="text-xs text-gray-500">💬 같은 질문을 다시 보내면 추가·연결 설명이 이어집니다.</span>';
    }

    const showSectionTip = lastEntryStreak === 0;
    return title + body + (showSectionTip ? sectionNudgeHtml() : '');
}

function findBestAnswer(input) {
    const trimmed = input.trim();
    if (!trimmed) return null;

    const norm = normalizeText(trimmed);
    const detail = wantsMoreDetail(norm);

    if (norm.includes('안녕') || norm.includes('hello')) {
        return (
            '안녕하세요! <strong>경제 지표 학습 도우미</strong>입니다. 📈<br><br>' +
            '아래 <strong>추천 질문</strong>을 누르거나, 「실업률」「KOSIS」「고용 가이드」처럼 짧게 입력해 보세요.' +
            sectionNudgeHtml()
        );
    }

    if (
        norm.includes('도움') ||
        norm.includes('뭐할') ||
        norm.includes('사용법') ||
        (norm.includes('어떻게') && norm.includes('써'))
    ) {
        const help = getEntryById('site-help');
        return buildAnswerFromEntry(help, norm, true);
    }

    if (
        norm.includes('기준') &&
        (norm.includes('연도') ||
            norm.includes('몇년') ||
            norm.includes('년기준') ||
            norm.includes('시점') ||
            norm.includes('100'))
    ) {
        const ref = getEntryById('reference-year');
        if (ref) return buildAnswerFromEntry(ref, norm, detail);
    }

    const kb = getKnowledgeBase();
    if (!kb.length) {
        console.warn('ECOMATH_CHATBOT_KB가 비어 있습니다. chatbot-knowledge.js를 확인하세요.');
        return null;
    }

    if (detail && lastEntryId) {
        const last = getEntryById(lastEntryId);
        if (last) return buildAnswerFromEntry(last, norm, true);
    }

    const picked = pickBestEntry(norm);
    if (!picked) return null;

    return buildAnswerFromEntry(picked.entry, norm, detail);
}

function replyForUserInput(text, forcedEntryId) {
    if (forcedEntryId) {
        const entry = getEntryById(forcedEntryId);
        if (entry) {
            const detail = wantsMoreDetail(normalizeText(text));
            return buildAnswerFromEntry(entry, normalizeText(text), detail) || NO_MATCH_REPLY;
        }
    }
    const answer = findBestAnswer(text);
    return answer || NO_MATCH_REPLY;
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
    const disclaimerEl = document.getElementById('chatbot-disclaimer');
    const chips = document.querySelectorAll('.chatbot-chip');

    if (!toggle || !panel) return;

    if (disclaimerEl) disclaimerEl.textContent = CHATBOT_DISCLAIMER;

    const oldStatus = document.getElementById('chatbot-status');
    if (oldStatus) {
        oldStatus.classList.add('hidden');
        oldStatus.textContent = '';
    }

    let chatState = 'closed';

    const showWelcomeIfEmpty = () => {
        if (messagesEl.children.length > 0) return;
        appendMessage(
            '안녕하세요! <strong>경제 지표 학습 도우미</strong>입니다. 📈<br><br>' +
            '이 도우미는 <strong>ChatGPT가 아니라</strong>, 선생님이 검토한 <strong>수업 자료·탐구 가이드</strong>를 찾아 주는 도구입니다.<br>' +
            '추천 칩을 누르면 주제별 안내가 나옵니다. 같은 질문을 다시 하거나 「자세히」라고 하면 <strong>이어지는 설명</strong>을 받을 수 있습니다.<br>' +
            `<span class="text-xs text-gray-500">${CHATBOT_DISCLAIMER}</span>`,
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

    const appendMessage = (html, role) => {
        const div = document.createElement('div');
        div.className = `chatbot-msg ${role === 'user' ? 'chatbot-msg-user' : 'chatbot-msg-bot'}`;
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

    const sendMessage = (text, forcedEntryId) => {
        const trimmed = text.trim();
        if (!trimmed || isChatLoading) return;

        appendMessage(escapeHtml(trimmed), 'user');
        inputEl.value = '';

        chatHistory.push({ role: 'user', html: trimmed });
        if (chatHistory.length > 40) chatHistory = chatHistory.slice(-40);

        setLoading(true);
        window.setTimeout(() => {
            const reply = replyForUserInput(trimmed, forcedEntryId);
            appendMessage(reply, 'bot');
            chatHistory.push({ role: 'bot', html: reply });
            if (chatHistory.length > 40) chatHistory = chatHistory.slice(-40);
            setLoading(false);
        }, 120);
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
    chips.forEach(chip =>
        chip.addEventListener('click', () =>
            sendMessage(chip.dataset.prompt, chip.dataset.entryId || null)
        )
    );
}

document.addEventListener('DOMContentLoaded', initChatbot);
