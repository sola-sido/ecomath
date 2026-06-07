// 경제 지표 학습 도우미 — Google Gemini AI + 오프라인 백업

const CHATBOT_KB = [
    {
        keys: ['cpi', '소비자물가', '물가지수', '물가', '소비자물가지수'],
        answer: `<strong>소비자물가지수(CPI)</strong>는 가구가 일상적으로 구매하는 상품·서비스 가격 변동을 종합한 지표입니다.<br><br>
        • <strong>1965년 이후</strong> 우리나라 CPI는 전반적으로 지속 상승해 왔습니다.<br>
        • 상승 속도는 일정하지 않으며, <strong>1980년 전후</strong>와 <strong>2021~2023년</strong>에 급격한 상승 구간이 나타납니다.<br>
        • 최근에도 물가는 오르지만 <strong>상승 속도는 다소 둔화</strong>되는 경향을 관찰할 수 있습니다.<br>
        • 분석 시 단순 증가량보다 <strong>증가율</strong>(기울기·전년 대비 %)을 보는 것이 중요합니다.<br>
        • CPI는 <strong>화폐 가치 하락</strong>과 <strong>인플레이션</strong>을 이해하는 대표 지표입니다.`
    },
    {
        keys: ['고용가이드', '고용탐구', '고용분석', '고용지표', '노동시장분석', '탐구가이드'],
        answer: `<strong>고용 지표 탐구·분석 가이드</strong> (고용 탭 참고)<br><br>
        <strong>① 고용률</strong> — 선그래프(계·남·여), X=연도 Y=고용률(%)<br>
        질문: 장기 증가? 남녀 격차 감소? 2020 코로나 변화?<br>
        → 격차·증가 속도·사회 변화 분석. <em>최근 20년: 여성 고용률↑, 남녀 격차↓</em><br><br>
        <strong>② 실업률</strong> — 전체·남·여 비교<br>
        질문: 최고 시기? 코로나 변화? 남녀 차이? (+ 고용률·참가율 함께)<br><br>
        <strong>③ 경제활동참가율</strong> = (경제활동인구÷15세+)×100<br>
        질문: 참여 비율 증가? 여성 참가율 변화?<br><br>
        <strong>④ 취업자 수</strong> — 전체·남·여<br>
        질문: 꾸준히 증가? 어느 성별이 더 빠른가? 증가량 vs 증가율<br><br>
        <strong>⑤ 비경제활동인구</strong> — 증가? 고령화?<br>
        토론: 「비경제활동인구 증가가 반드시 나쁜 현상일까?」<br><br>
        <strong>추천 시각화</strong>: 지표 <strong>고용률</strong> → 탐구 「남녀 비교」 → 슬라이더 2000년대~`
    },
    {
        keys: ['남녀고용률', '남녀고용', '고용률비교', '남녀격차', '여성고용'],
        answer: `<strong>남녀 고용률 비교</strong> — 가장 추천하는 시각화<br><br>
        <strong>그래프 설정</strong><br>
        • 선그래프: X=연도, Y=고용률(%)<br>
        • 선 3개: <strong>계, 남자, 여자</strong><br>
        • 고용 탭 → 지표 <strong>고용률</strong> → 탐구 「<strong>남녀 비교</strong>」<br><br>
        <strong>분석 질문</strong><br>
        • 고용률은 장기적으로 증가하는가?<br>
        • 남녀 격차는 줄어드는가?<br>
        • 2020년 코로나 시기 변화는?<br><br>
        <strong>학생 분석 포인트</strong>: 격차 감소? 증가 속도? 사회 변화(여성 경제 참여 등)?<br>
        <strong>시사점</strong>: 최근 20년 여성 고용률 상승·남녀 격차 감소 추세. 슬라이더로 최근 20년 확대.<br><br>
        탐구 주제 3: 「남녀 격차는 사라지고 있을까?」→ 추세선·<strong>감소율</strong> 계산`
    },
    {
        keys: ['실업률변화', '실업률분석', '실업률그래프', '실업비교'],
        answer: `<strong>② 실업률 변화 추이</strong><br><br>
        <strong>그래프</strong>: 선그래프 — <strong>전체·남자·여자</strong> 실업률 (지표→실업률, 남녀 비교)<br><br>
        <strong>분석 질문</strong><br>
        • 실업률이 <strong>가장 높았던 시기</strong>는?<br>
        • <strong>코로나(2020)</strong> 시기 변화는?<br>
        • <strong>남녀 실업률 차이</strong>는?<br><br>
        ⚠️ 실업률 하락만으로 고용 개선을 단정하지 마세요. <strong>고용률·참가율</strong>과 함께 보고, 구직단논자 가능성도 생각하세요.<br><br>
        추천 탐구: 「실업률 변화」·「코로나 전후 노동시장」(2018~2022 슬라이더 확대)`
    },
    {
        keys: ['참가율', '경제활동참가', '경제활동인구', '참가율분석'],
        answer: `<strong>③ 경제활동참가율</strong> = (경제활동인구 ÷ 15세 이상 인구) × 100<br><br>
        • <strong>경제활동인구</strong> = 취업자 + 실업자<br>
        • 그래프: 선그래프 (지표 → 경제활동참가율)<br><br>
        <strong>분석 질문</strong><br>
        • 경제활동에 참여하는 비율은 증가하는가?<br>
        • <strong>여성</strong>의 경제활동참가율은 어떻게 변화했는가?<br><br>
        참가율이 낮아지면 구직단논자 증가 가능. 실업률·고용률 해석 시 분모 변화를 함께 보세요.`
    },
    {
        keys: ['취업자', '취업자수', '취업자변화', '취업자분석'],
        answer: `<strong>④ 취업자 수 변화</strong><br><br>
        <strong>취업자</strong>: 1주일 이상 일한 사람 (휴업·휴직 중이어도 일자리가 있으면 포함)<br>
        <strong>그래프</strong>: 선그래프 — <strong>전체·남성·여성</strong> (지표 → 취업자)<br><br>
        <strong>분석 질문</strong><br>
        • 취업자는 꾸준히 증가하는가?<br>
        • 어느 성별이 더 빠르게 증가하는가?<br><br>
        탐구 주제 4: 「취업자 수 증가 속도는 일정한가?」→ <strong>증가량</strong> vs <strong>증가율</strong> 비교`
    },
    {
        keys: ['실업자'],
        answer: `<strong>실업자</strong>: 일할 의사·능력이 있으나 구직 중인 사람<br>
        • 취업자 + 실업자 = <strong>경제활동인구</strong><br>
        • 15세 이상 인구 − 경제활동인구 = <strong>비경제활동인구</strong> (학생, 주부, 은퇴자, 구직단논자 등)`
    },
    {
        keys: ['비경제활동', '비경제활동인구', '고령화', '토론'],
        answer: `<strong>⑤ 비경제활동인구 변화</strong><br><br>
        • 그래프: 선그래프 (해당 항목 체크)<br>
        • 질문: 경제활동을 하지 않는 사람은 늘어나는가? <strong>고령화</strong>와 관련?<br><br>
        <strong>토론 주제</strong>: 「비경제활동인구 증가가 반드시 나쁜 현상일까?」<br>
        (육아·학업·은퇴 등 선택적 비경제활동도 포함 — 단순히 '나쁘다'고만 말하기 어렵습니다)`
    },
    {
        keys: ['코로나', '2020', '2018', '2022', '코로나19', '팬데믹', '전후'],
        answer: `<strong>코로나19와 노동시장</strong> (탐구 주제 2)<br><br>
        • 슬라이더로 <strong>2018~2022년</strong> 확대 분석<br>
        • 2020년 전후: 실업률 급등, 고용률·참가율 동반 흔들림 가능<br>
        • 원인: 영업·학교 휴업, 자영업·서비스업 타격, 구직단논자 증가<br>
        • 2021년 이후: 실업률↓ + 고용률·참가율 회복이 <strong>함께</strong> 나타나는지 비교<br><br>
        추천 탐구 3위: 「코로나 전후 노동시장 비교」— 고용률·실업률·참가율 그래프를 차례로 보며 메모`
    },
    {
        keys: ['탐구', '프로젝트', '주제', '상관', '산점도', '노동시장', '추천주제'],
        answer: `<strong>경제수학 탐구 프로젝트 주제</strong><br><br>
        <strong>주제 1</strong> 「고용률과 실업률은 어떤 관계?」→ <strong>산점도</strong> → <strong>상관계수</strong><br>
        <strong>주제 2</strong> 「코로나19는 노동시장에?」→ <strong>2018~2022</strong> 확대<br>
        <strong>주제 3</strong> 「남녀 고용률 격차는 사라지고?」→ 선그래프 + <strong>추세선</strong> + <strong>감소율</strong><br>
        <strong>주제 4</strong> 「취업자 증가 속도는 일정?」→ <strong>증가량</strong> vs <strong>증가율</strong><br>
        <strong>주제 5</strong> 「고용률과 CPI는 관련?」→ CPI·고용률 <strong>동시 시각화</strong> → 경제 전반 분석<br><br>
        <strong>고등학교 추천 TOP 3</strong><br>
        1. 남녀 고용률 변화  2. 실업률 변화  3. 코로나 전후 노동시장<br>
        → 그래프 해석 + 증가율·평균·상관관계 등 수학 연결 용이`
    },
    {
        keys: ['상관계수', '산점도', '추세선', '감소율', '증가량'],
        answer: `고용 탐구의 <strong>수학적 확장</strong>:<br><br>
        • 고용률 vs 실업률 → <strong>산점도</strong> + <strong>상관계수</strong> (항상 반대만은 아님!)<br>
        • 남녀 격차 → <strong>추세선</strong> + 격차 <strong>감소율</strong> 계산<br>
        • 취업자·CPI → 전년 대비 <strong>증가량</strong>과 <strong>증가율</strong> 구분<br><br>
        KOSIS CSV 수치를 표로 옮겨 엑셀·계산기로도 연습할 수 있습니다.`
    },
    {
        keys: ['고용cpi', 'cpi고용', '물가고용', '고용과cpi'],
        answer: `<strong>주제 5: 고용률과 CPI는 관련이 있을까?</strong><br><br>
        • CPI 탭: 물가 상승(인플레이션) 추세 분석<br>
        • 고용 탭: 고용률·실업률 변화 분석<br>
        • 같은 연도를 기준으로 <strong>동시에</strong> 비교·시각화<br><br>
        예: 2021~2023 CPI 급등 구간에 고용률·실업률은 어떻게 움직였는지 메모에 연결 → <strong>경제 전반</strong> 분석`
    },
    {
        keys: ['구직단논', '단논', '구직단논자'],
        answer: `<strong>구직단논자</strong>는 일자리를 구하지 않아 실업자 통계에 포함되지 않는 사람입니다.<br><br>
        • 경기가 나빠도 "취업 포기"로 실업률이 낮아 보일 수 있습니다.<br>
        • 이럴 때는 실업률만 보지 말고 <strong>참가율·고용률</strong>을 함께 확인하세요.<br>
        • 코로나·취업난 분석(② 실업률, ③ 참가율)에서 특히 중요합니다.`
    },
    {
        keys: ['실업률', '실업'],
        answer: `<strong>실업률</strong> = (실업자 ÷ 경제활동인구) × 100<br><br>
        「실업률 변화」「실업률 분석」이라고 더 물어보시면 그래프·코로나·남녀 비교 안내를 드립니다.<br>
        실업률만 보면 고용을 단정하기 어렵습니다. <strong>고용률·참가율</strong>과 함께 보세요.`
    },
    {
        keys: ['고용률', '고용'],
        answer: `<strong>고용률</strong> = (취업자 ÷ 15세 이상 인구) × 100<br><br>
        「남녀 고용률」「고용 탐구 가이드」라고 물어보시면 계·남·여 그래프 분석·탐구 주제를 자세히 안내합니다.<br>
        고용 탭 → 지표 <strong>고용률</strong> → 「<strong>남녀 비교</strong>」`
    },
    {
        keys: ['인플레이션', '물가상승', '디플레이션'],
        answer: `<strong>인플레이션</strong>은 물가가 지속적으로 오르는 현상입니다. CPI 그래프가 우상향하면 물가 상승 압력이 큽니다.<br><br>
        • 반대로 물가가 장기간 하락하면 <strong>디플레이션</strong>입니다.<br>
        • 그래프 분석 시 "어느 구간에서 가장 가파르게 올랐는지"를 연도와 함께 적어 보세요.`
    },
    {
        keys: ['kosis', '코시스', '통계청'],
        answer: `<strong>KOSIS(국가통계포털)</strong>에서 경제 지표 CSV를 받는 방법:<br><br>
        1. 통계표 검색 → CPI 또는 고용 통계 선택<br>
        2. <strong>행렬 전환(세로)</strong> — 이걸 안 하면 그래프가 깨질 수 있습니다!<br>
        3. 필요한 연도·항목 선택 → CSV 다운로드<br>
        4. 이 사이트 CPI/고용 탭에서 파일 업로드 → "그래프 그리기"<br><br>
        자세한 스크린샷 안내는 <strong>소개</strong> 섹션의 KOSIS 안내를 참고하세요.`
    },
    {
        keys: ['csv', '업로드', '파일', '행렬', '전환'],
        answer: `CSV 업로드 팁:<br><br>
        • KOSIS에서 <strong>행렬을 세로(연도가 행)</strong>로 받아야 합니다.<br>
        • 파일 선택 후 <strong>"그래프 그리기"</strong> 버튼을 눌러야 차트가 나옵니다.<br>
        • 숫자에 %, 쉼표(,)가 있어도 자동으로 처리합니다.<br>
        • 그래프가 이상하면 연도 열·수치 열 방향을 KOSIS 설정에서 다시 확인하세요.`
    },
    {
        keys: ['고용그래프', '고용데이터', '고용해석', '노동', '일자리', '격차', '사회변화'],
        answer: `<strong>고용 데이터 그래프 분석</strong> — ①~⑤ 가이드 요약<br><br>
        ① <strong>고용률</strong>(계·남·여): 장기 증가? 격차 감소? 2020 코로나?<br>
        ② <strong>실업률</strong>: 최고 시기? 코로나? 남녀 차이?<br>
        ③ <strong>참가율</strong>: 참여 비율·여성 참가율 변화<br>
        ④ <strong>취업자 수</strong>: 증가 추세? 성별 속도? 증가량/율<br>
        ⑤ <strong>비경제활동인구</strong>: 고령화? 토론 주제<br><br>
        학생 분석: <strong>격차·증가 속도·사회 변화</strong> 연결. 「고용 탐구 가이드」로 전체 보기.`
    },
    {
        keys: ['그래프', '차트', '추세', '시각화', '급상승', '2021', '2023', '111', '1965', '1980', '둔화'],
        answer: `<strong>CPI</strong> 그래프 종합 분석:<br>
        1965년 이후 지속 상승 → 1980·2021~2023 급등 → 최근 속도 둔화. 증가율(기울기) 비교.<br><br>
        <strong>고용</strong> 그래프는 「고용 탐구 가이드」「남녀 고용률」이라고 물어보세요.<br>
        본인 데이터: <strong>"내 그래프 분석"</strong>`
    },
    {
        keys: ['분석', '해석'],
        answer: `어떤 지표를 분석하시나요?<br><br>
        • <strong>CPI</strong>: 1965년~ 상승, 1980·2021~2023 급등, 증가율 중심<br>
        • <strong>고용</strong>: 「고용 탐구 가이드」— 고용률·실업률·참가율·취업자·비경제활동 ①~⑤<br>
        • 업로드 후 <strong>"내 그래프 분석"</strong> 입력 시 본인 수치 기준 힌트`
    },
    {
        keys: ['체크박스', '필터', '검색', '항목', '선택'],
        answer: `고용 지표는 항목이 많아 <strong>체크박스</strong>로 원하는 선만 골라 그릴 수 있습니다.<br><br>
        • 카테고리: 전체 종합, 성별, 농가, 비농가<br>
        • 검색창에 "실업률", "남자" 등 입력하면 항목을 빠르게 찾을 수 있습니다.<br>
        • 처음에는 '계' + % 지표만 켜져 있고, 필요한 것만 추가로 체크하세요.`
    },
    {
        keys: ['기간', '슬라이더', '연도', '범위'],
        answer: `그래프 아래 <strong>기간 슬라이더</strong>로 분석 구간을 조절할 수 있습니다.<br><br>
        • 전체 기간 추세를 먼저 보고, 관심 구간만 좁혀서 자세히 보세요.<br>
        • CPI와 고용 지표는 서로 다른 기간을 비교할 때 "왜 이 시기를 골랐는지" 메모에 적어 두면 좋습니다.`
    },
    {
        keys: ['남자', '여자', '성별', '남녀', '농가', '비농가'],
        answer: `고용·CPI 데이터는 <strong>성별(남·여)</strong>, <strong>농가·비농가</strong>로 나뉩니다.<br><br>
        • <strong>남녀 고용률</strong>: 계·남·여 3선 → 격차 감소? 여성 고용률 상승?<br>
        • 탐구 「남녀 비교」·「남녀 격차」 활용<br>
        • 농가·비농가: 계절성·산업별 차이 (월별·분기별 데이터 심화)<br>
        • 「남녀 고용률 그래프 분석」이라고 더 물어보세요.`
    },
    {
        keys: ['퀴즈', '문제', '정답', '확인'],
        answer: `확인 퀴즈는 CPI·고용 개념을 점검합니다.<br><br>
        • 정답 확인 후 <strong>해설</strong>을 꼭 읽어 보세요.<br>
        • 틀린 문제는 "왜 이 보기가 맞/틀린지"를 챗봇에 다시 물어볼 수 있습니다.<br>
        • 퀴즈 정답을 그대로 알려달라고 하면, <strong>힌트</strong> 위주로 도와드립니다.`
    },
    {
        keys: ['공식', '수식', '계산'],
        answer: `교과서 핵심 공식:<br><br>
        • CPI = (비교 시점 가중 평균 ÷ 기준 시점 가중 평균) × 100<br>
        • 경제활동참가율 = (경제활동인구 ÷ 15세 이상 인구) × 100<br>
        • 실업률 = (실업자 ÷ 경제활동인구) × 100<br>
        • 고용률 = (취업자 ÷ 15세 이상 인구) × 100<br><br>
        분모가 무엇인지(15세 이상 vs 경제활동인구)를 구분하는 것이 핵심입니다.`
    },
    {
        keys: ['메모', '저장', '이미지', '캡처'],
        answer: `분석 메모와 그래프 저장:<br><br>
        • 각 탭에 <strong>메모</strong> 칸이 있어 관찰 내용을 적을 수 있습니다.<br>
        • 그래프 영역을 이미지로 저장하는 기능도 활용해 보고서에 붙일 수 있습니다.<br>
        • "내 그래프 분석"으로 챗봇 힌트를 받은 뒤, 본인 말로 메모에 정리해 보세요.`
    },
    {
        keys: ['차이', '비교', '다른', 'vs'],
        answer: `자주 헷갈리는 비교:<br><br>
        • <strong>실업률 vs 고용률</strong>: 분모가 다릅니다 (경제활동인구 vs 15세 이상 인구).<br>
        • <strong>CPI vs 실업률</strong>: 물가와 고용은 같은 시기에 반대로 움직이지 않을 수 있습니다.<br>
        • <strong>전체(계) vs 세부</strong>: 평균만 보면 남·여·농가 차이가 숨겨집니다.<br>
        • <strong>고용률 vs 실업률</strong> 탐구: 산점도·상관계수 (주제 1)`
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

function getEmploymentGuideForPrompt() {
    return `
고용 지표 탐구·분석 가이드 (고용 탭 #emp-analysis-guide):
① 고용률: 선그래프(계·남·여), X=연도 Y=고용률(%). 질문: 장기 증가? 남녀 격차 감소? 2020 코로나? 최근 20년 여성 고용률↑ 격차↓. 학생은 격차·증가속도·사회변화 분석.
② 실업률: 전체·남·여. 최고 시기? 코로나? 성별 차이? (고용률·참가율 함께)
③ 참가율=(경제활동인구÷15세+)×100. 참여 증가? 여성 참가율?
④ 취업자 수: 전체·남·여. 증가 추세? 성별 속도? 증가량 vs 증가율
⑤ 비경제활동인구: 증가? 고령화? 토론「반드시 나쁜가?」
탐구주제: 1.고용률-실업률 산점도·상관 2.코로나 2018-2022 3.남녀격차 추세선·감소율 4.취업자 증가량/율 5.고용률+CPI 동시분석
추천 TOP3: 남녀 고용률, 실업률 변화, 코로나 전후. 시각화: 고용률→남녀비교→슬라이더 2000년~`;
}

function buildSystemPrompt() {
    const section = getVisibleSection();
    const sectionNames = { intro: '소개', cpi: 'CPI 분석', employment: '고용 지표 분석', quiz: '확인 퀴즈' };
    const empBlock = section === 'employment' ? getEmploymentGuideForPrompt() : '';

    return `당신은 고등학교 2학년 경제수학 수업을 돕는 친절한 AI 튜터입니다.

역할:
- CPI(소비자물가지수), 경제활동참가율, 실업률, 고용률 등 경제 지표를 쉬운 한국어로 설명
- 학생이 업로드한 그래프 데이터를 바탕으로 분석 질문에 힌트 제공 (정답을 대신 쓰지 말고 스스로 생각하도록 유도)
- KOSIS 데이터 다운로드, 그래프 해석 방법 안내
- 고용 데이터: ①고용률 ②실업률 ③참가율 ④취업자 ⑤비경제활동인구 분석 가이드와 탐구 프로젝트 주제 안내
${empBlock}
공식 (교과서 기준):
- CPI = (비교 시점 가중 평균 ÷ 기준 시점 가중 평균) × 100
- 경제활동참가율 = (경제활동인구 ÷ 15세 이상 인구) × 100
- 실업률 = (실업자 ÷ 경제활동인구) × 100
- 고용률 = (취업자 ÷ 15세 이상 인구) × 100

중요: 실업률 하락만으로 고용 개선을 단정하지 말 것. 구직 단논자 개념 설명.

현재 학생 위치: ${sectionNames[section] || section}
현재 그래프 데이터:
${buildChartContextText()}

답변 규칙:
- 학생 질문에 충분히 답할 만큼 자세히 설명 (보통 5~12문장, 복잡하면 더 길어도 됨)
- 존댓말, 예시·비유 활용, 필요 시 번호 목록
- 퀴즈 정답은 직접 알려주지 말고 힌트·개념 설명으로 유도
- 그래프·데이터가 있으면 수치를 인용해 구체적으로 코멘트
- 모르는 내용은 지어내지 말고, 이 사이트에서 확인할 수 있는 방법을 안내`;
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
            temperature: 0.8,
            maxOutputTokens: 2048
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

function scoreKnowledgeMatch(input, item) {
    const norm = normalizeText(input);
    let score = 0;
    for (const key of item.keys) {
        const nk = normalizeText(key);
        if (norm.includes(nk)) score += nk.length >= 4 ? 3 : 2;
    }
    if (getVisibleSection() === 'employment') {
        const empTerms = ['고용', '실업', '참가', '취업', '노동', '남녀', '코로나', '비경제', '탐구', '산점', '상관', '격차', '고령'];
        const itemText = item.keys.join(' ') + item.answer;
        if (empTerms.some(t => normalizeText(itemText).includes(t))) score += 1;
        if (empTerms.some(t => norm.includes(t))) score += 2;
    }
    return score;
}

function findKnowledgeAnswers(input, maxItems = 2) {
    const ranked = CHATBOT_KB
        .map(item => ({ item, score: scoreKnowledgeMatch(input, item) }))
        .filter(x => x.score > 0)
        .sort((a, b) => b.score - a.score);

    if (!ranked.length) return null;

    const top = ranked.slice(0, maxItems);
    const answers = [...new Set(top.map(x => x.item.answer))];
    return answers.join('<br><br>—<br><br>');
}

function findKnowledgeAnswer(input) {
    return findKnowledgeAnswers(input, 1);
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
        const changeText = pct !== null ? `${start}→${end} (${diff >= 0 ? '+' : ''}${diff}, 약 ${pct >= 0 ? '+' : ''}${pct}%)` : `${start}→${end}`;
        return `• <strong>${ds.label}</strong>: ${slicedLabels[0]}~${slicedLabels[slicedLabels.length - 1]}, ${changeText} → <em>${trend}</em>`;
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
        if (s) parts.push(`📊 <strong>고용</strong> (${emp.indicator}, ${emp.rangeLabel}):<br>${s}`);
    }
    if (!parts.length) return null;

    const tips = [];
    if (cpi?.hasData) {
        tips.push('종합 분석 예: 1965년 이후 지속 상승 → 1980·2021~2023 급등 → 최근 속도 둔화. 증가율(기울기)을 비교하세요.');
    }
    if (emp?.hasData) {
        tips.push('고용 분석 ①~⑤: 고용률(남녀 격차)·실업률(2020 코로나)·참가율·취업자(증가율)·비경제활동(고령화) 중 해당 지표에 맞게 작성.');
        tips.push('최근 20년: 여성 고용률↑·남녀 격차↓, 코로나 구간은 2018~2022 슬라이더 확대.');
    }
    tips.push('메모 형식: ① 전체 추세 → ② 특정 구간(연도·수치) → ③ 원인·실생활 연결');
    tips.push('특정 연도에 급변한 구간이 있으면 그 시기의 사회·경제 이벤트와 연결해 추측해 보세요.');

    return parts.join('<br><br>') +
        '<br><br><strong>✍️ 메모 작성 팁</strong><br>' + tips.map(t => `• ${t}`).join('<br>');
}

function getSectionHint() {
    const section = getVisibleSection();
    const hints = {
        intro: 'KOSIS 다운로드, CSV 업로드 방법, 사이트 사용법을 물어보세요.',
        cpi: 'CPI 개념, 인플레이션, 그래프 해석, "내 그래프 분석"을 물어보세요.',
        employment: '고용 탐구 가이드(①~⑤), 남녀 고용률, 실업률·코로나19, 탐구 프로젝트 주제, "내 그래프 분석"을 물어보세요.',
        quiz: '퀴즈 개념(실업률 공식, CPI 의미 등)을 물어보세요. 정답 대신 힌트를 드립니다.'
    };
    return hints[section] || hints.intro;
}

function generateLocalReply(input) {
    const trimmed = input.trim();
    if (!trimmed) return '질문을 입력해 주세요.';

    const norm = normalizeText(trimmed);
    if (norm.includes('안녕') || norm.includes('hello')) {
        return '안녕하세요! 경제 지표 학습 도우미입니다. 😊<br><br>CPI, 실업률, 고용률, 그래프 해석, KOSIS 이용법 등 무엇이든 물어보세요.';
    }

    if (norm.includes('도움') || norm.includes('뭐물') || (norm.includes('어떻게') && norm.includes('쓰'))) {
        return `이 도우미가 도와드릴 수 있는 것:<br><br>
        • <strong>개념</strong>: CPI, 실업률, 고용률, 참가율, 구직단논자<br>
        • <strong>데이터</strong>: KOSIS·CSV 업로드, 체크박스·기간 조절<br>
        • <strong>고용 분석</strong>: ①고용률 ②실업률 ③참가율 ④취업자 ⑤비경제활동, 탐구 주제, "내 그래프 분석"<br>
        • <strong>퀴즈</strong>: 개념 힌트 (정답 대신 설명)<br><br>
        ${getSectionHint()}`;
    }

    if (norm.includes('내그래프') || norm.includes('그래프분석') || norm.includes('현재그래프') || norm.includes('업로드한')) {
        const hint = getChartAnalysisHint();
        return hint || '아직 그래프가 없습니다. CSV 업로드 후 "그래프 그리기"를 눌러 주세요.';
    }

    if (/고용.*(가이드|탐구|분석)|탐구.*(가이드|주제)|①|②|③|④|⑤/.test(trimmed) || norm.includes('남녀고용률') && norm.includes('분석')) {
        const guide = findKnowledgeAnswer('고용탐구가이드');
        if (guide) return guide;
    }

    const kb = findKnowledgeAnswers(trimmed, 3);
    if (kb) return kb;

    const partial = findKnowledgeAnswers(trimmed.split(/\s+/).slice(0, 3).join(' '), 1);
    if (partial) {
        return partial + '<br><br>💡 더 구체적으로 물어보시면 (예: "실업률이 내려가면 고용이 좋아진 건가요?") 더 맞춤 답변을 드릴 수 있습니다.';
    }

    return `질문을 조금 더 구체적으로 적어 주시면 도와드리기 쉽습니다.<br><br>
        예: "실업률과 고용률 차이", "KOSIS CSV 받는 법", "그래프 우상향이면 뭐라고 쓰지?"<br>
        ${getSectionHint()}<br>
        그래프를 올렸다면 <strong>"내 그래프 분석"</strong>도 입력해 보세요.`;
}

function generateFallbackReply(input, status) {
    const local = generateLocalReply(input);
    if (local && !local.includes('질문을 조금 더 구체적으로')) return local;
    const hint = status?.hint || getSectionHint();
    return `${status?.status || 'AI 연결 안 됨'}<br><br>${local || hint}`;
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
            'CPI·고용 지표 개념, ①~⑤ 탐구 가이드, 그래프 해석, 탐구 프로젝트 주제 등 자세히 답해 드립니다.<br>' +
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
            if (chatHistory.length > 20) chatHistory = chatHistory.slice(-20);

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
