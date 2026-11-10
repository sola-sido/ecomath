/**
 * 경제 지표 학습 도우미 — 질문·답변 데이터
 * 선생님이 이 파일만 수정하면 답변이 바뀝니다.
 *
 * answer: 첫 답변 | answerMore: 같은 주제를 다시 물을 때 | answerDeep: 「자세히」「더」「예시」
 * seeAlso: 반복 시 연결할 다른 항목 id
 */
window.ECOMATH_CHATBOT_KB = [
    {
        id: 'reference-year',
        title: '기준 연도·기준 시점',
        keys: ['기준연도', '기준시점', '몇년기준', '년기준', '기준이몇년', '소비자물가지수개편'],
        synonyms: ['기준년도', '100기준', '지표기준', 'cpi기준연도', '연도기준', '기준연도바뀔', '2025기준', '개편', '기준년개편', '통계표변경', 'kosis공지'],
        answer: `<strong>「몇 년 기준?」</strong>은 지표마다 뜻이 다릅니다.<br><br>
        <strong>① CPI(물가지수) — 지금 KOSIS 공표</strong><br>
        • 현재 공식 지수는 <strong>2020년 = 100</strong> 기준입니다(국가데이터처·KOSIS 안내).<br>
        • <strong>가중치</strong>는 별도로 2022년 기준 등으로 갱신될 수 있어, 품목 지수와 공표값이 완전히 같지 않을 수 있다는 주의도 통계에 나옵니다.<br><br>
        <strong>② KOSIS 공지 — 기준연도 개편</strong><br>
        • <strong>2020년=100 → 2025년=100</strong>으로 개편합니다.<br>
        • <strong>2026.12.18.</strong> 개편 결과 공표(품목·가중치·분류, 2026년 11월 이전 지수 2025년 기준 연계)<br>
        • <strong>2026.12.31.</strong> 2025년 기준 12월·연간 물가동향 공표<br>
        • 이후 <strong>2020=100 통계표는 더 이상 제공되지 않음</strong> → CSV 받을 때 표기 확인<br><br>
        <strong>③ 고용률·실업률·참가율</strong><br>
        • 「기준 연도」가 아니라 그래프 <strong>가로축 연도</strong>가 관측 시점입니다. 비율 분모는 <strong>15세 이상</strong>·<strong>경제활동인구</strong> 등입니다.<br><br>
        • 이 사이트 <strong>퀴즈 4번</strong> 표는 <strong>2020=100 연습용</strong>입니다. 실제 다운로드 자료는 KOSIS 표기를 따르세요.`,
        answerMore: `수업·탐구에서 쓸 문장 예:<br>
        「KOSIS에서 받은 CPI는 2020=100 기준이나, 국가데이터처 공지에 따라 2025=100 기준으로 공표가 바뀔 예정이므로, 그래프·메모에는 통계표의 기준연도를 명시한다.」<br><br>
        • 「2021~2023 급상승」= 물가가 빨리 오른 <strong>구간</strong>이지, 기준연도가 2021이라는 뜻이 아닙니다.<br>
        • 고용에서 「2020년 코로나」= 그 해 <strong>관측값</strong>입니다.`,
        answerDeep: `메모에 쓸 수 있는 문장 예:<br>
        「본 그래프 CPI는 KOSIS 통계표 기준연도 ○○=100으로 제시된 지수이며, 2021~2023 구간은 전년 대비 상승이 두드러진다.」<br>
        (기준연도 숫자는 본인이 받은 CSV·통계표 표기를 그대로 씁니다.)`,
        seeAlso: ['cpi', 'formulas', 'kosis', 'cpi-spike']
    },
    {
        id: 'cpi',
        title: 'CPI 개념',
        keys: ['cpi', '소비자물가', '소비자물가지수', '물가지수'],
        synonyms: ['cpi가', 'cpi란', '물가지표'],
        answer: `<strong>소비자물가지수(CPI)</strong>는 가구가 자주 사는 물건·서비스 가격이 얼마나 변했는지 나타내는 지수입니다.<br><br>
        • 어떤 해를 <strong>100</strong>으로 잡고, 다른 해와 비교합니다(예: 105 → 약 5% 상승).<br>
        • <strong>1965년 이후</strong> 우리나라 CPI는 대체로 꾸준히 올라왔습니다.<br>
        • CPI는 <strong>인플레이션</strong>(물가 상승)을 보는 대표 지표입니다.<br><br>
        💡 CPI 탭 → CSV 업로드 → 그래프 그리기`,
        answerMore: `CPI를 그래프로 볼 때 자주 쓰는 표현:<br>
        • <strong>우상향</strong> = 장기적으로 물가 상승<br>
        • <strong>기울기 가팔다</strong> = 그 구간 물가상승이 빠름<br>
        • 1980년 전후·2021~2023처럼 <strong>급등 구간</strong>은 메모에 연도·수치를 꼭 적어 두세요.`,
        answerDeep: `CPI 메모 예시 문장:<br>
        「1965~현재 전반적 상승 추세이나, 1980년 전후와 2021~2023년에 상승 속도가 특히 빨랐다. 최근에는 상승은 이어지나 기울기가 다소 완만해진 것으로 보인다.」<br><br>
        💡 「<strong>CPI 급상승 예시</strong>」 칩이나 「<strong>내 그래프 분석</strong>」도 눌러 보세요.`,
        seeAlso: ['cpi-spike', 'inflation-rate', 'formulas']
    },
    {
        id: 'cpi-spike',
        title: 'CPI 급상승 분석',
        keys: ['cpi급상승', '물가급등', '급상승구간'],
        synonyms: ['2021~2023', '2021-2023', '1980년전후', '속도둔화'],
        answer: `<strong>CPI 구간 분석</strong> — 메모에 ①②③으로 쓰세요.<br><br>
        <strong>① 전체</strong>: 1965년 이후 지속 상승<br>
        <strong>② 구간</strong>: 1980년 전후·<strong>2021~2023</strong> 급등, 이후 상승 <strong>둔화</strong> 가능<br>
        <strong>③ 해석</strong>: 증가량보다 <strong>증가율·기울기</strong>, 원인은 「~로 보인다」로 추정<br><br>
        💡 본인 데이터는 「<strong>내 그래프 분석</strong>」`,
        answerMore: `1980년대 vs 2021~2023을 비교해 보세요:<br>
        • 두 구간 모두 급상승이지만, <strong>원인·맥락</strong>은 시기마다 다릅니다(에너지·환율·공급망 등).<br>
        • 같은 ‘급등’이어도 <strong>그래프 기울기(증가율)</strong>가 다른지 슬라이더로 나란히 확인하세요.`,
        answerDeep: `2021~2023 분석 체크리스트:<br>
        1. 시작·끝 연도와 CPI 수치 적기<br>
        2. 전년 대비 %가 가장 큰 해는?<br>
        3. 고용 탭과 같은 연도의 고용률·실업률과 한 줄로 연결해 보기(주제 5)<br><br>
        → 「고용률과 CPI」는 칩 <strong>탐구 주제</strong> 참고`,
        seeAlso: ['my-graph', 'graph-analysis', 'project-topics']
    },
    {
        id: 'inflation-rate',
        title: '인플레이션',
        keys: ['인플레이션', '물가상승률', '물가상승', '디플레이션'],
        synonyms: ['물가올라', '체감물가', '전년대비'],
        answer: `<strong>인플레이션</strong>은 물가가 계속 오르는 현상입니다(CPI 그래프 우상향).<br><br>
        • <strong>증가량</strong>(몇 포인트 올랐는지)과 <strong>증가율</strong>(전년 대비 %)을 구분하세요.<br>
        • 그래프에서는 <strong>기울기</strong>가 가파른 구간 = 상대적으로 빠른 물가 상승입니다.`,
        answerMore: `디플레이션은 물가가 장기간 <strong>내리는</strong> 현상입니다. 우리나라 CPI 장기 추세는 주로 상승입니다.<br>
        수업 보고서에는 「이 구간에서 증가율이 커졌다/작아졌다」처럼 쓰면 좋습니다.`,
        seeAlso: ['cpi-spike', 'formulas']
    },
    {
        id: 'emp-guide',
        title: '고용 탐구 ①~⑤',
        keys: ['고용탐구가이드', '고용탐구', '고용가이드', '탐구가이드'],
        synonyms: ['①부터⑤', '①', '⑤', '고용지표탐구'],
        answer: `<strong>고용 지표 탐구 가이드</strong> (고용 탭 안내문과 같음)<br><br>
        <strong>① 고용률</strong> — 계·남·여 선그래프. 장기 증가? 남녀 격차? 2020 코로나?<br>
        <strong>② 실업률</strong> — 최고 시기? 코로나? (고용률·참가율 함께)<br>
        <strong>③ 참가율</strong> = (경제활동인구÷15세+)×100<br>
        <strong>④ 취업자 수</strong> — 증가량 vs 증가율<br>
        <strong>⑤ 비경제활동인구</strong> — 고령화? 반드시 ‘나쁨’만은 아님<br><br>
        TOP3: 남녀 고용률 / 실업률 변화 / 코로나 전후`,
        answerMore: `①~⑤를 <strong>한 번에</strong> 쓰지 말고, 그래프에 맞는 번호만 골라 메모하세요.<br>
        예: 지표가「실업률」이면 ② 위주 + ③ 참가율 한 줄 + 구직단논 가능성 한 줄.<br><br>
        시각화 추천: 지표 <strong>고용률</strong> → 「남녀 비교」→ 슬라이더 2000년~`,
        answerDeep: `각 번호별 <strong>필수 문장</strong>:<br>
        ① 「○○년~○○년 고용률은 전반적으로 ○○하다」<br>
        ② 「실업률 최고는 ○○년 부근」<br>
        ③ 「참가율 변화는 경제활동 참여에 …」<br>
        ④ 「취업자는 증가했으나 증가율은 …」<br>
        ⑤ 「비경제활동 증가는 고령화 등과 연결할 수 있다」`,
        seeAlso: ['gender-employment', 'unemployment-rate', 'participation', 'covid-labor']
    },
    {
        id: 'gender-employment',
        title: '남녀 고용률',
        keys: ['남녀고용률', '남녀고용률그래프', '남녀격차', '여성고용률'],
        synonyms: ['남녀비교', '남자여자고용률', '어떻게분석해'],
        answer: `<strong>남녀 고용률 그래프</strong><br><br>
        설정: X=연도, Y=고용률(%), 선 3개 — <strong>계·남·여</strong><br>
        고용 탭 → <strong>고용률</strong> → 탐구 「<strong>남녀 비교</strong>」<br><br>
        질문: 장기 증가? 격차 감소? 2020 코로나? (최근 20년 여성↑·격차↓ 언급 가능)`,
        answerMore: `격차 분석 팁:<br>
        • 남-여 고용률 차이를 연도별로 적거나, 추세선으로 <strong>감소율</strong> 탐구(주제 3).<br>
        • ‘계’만 보면 남녀 차이가 가려질 수 있어, 반드시 남·여 선을 함께 보세요.`,
        seeAlso: ['employment-rate', 'covid-labor', 'project-topics']
    },
    {
        id: 'participation',
        title: '경제활동참가율',
        keys: ['경제활동참가율', '경제활동참가', '참가율분석'],
        synonyms: ['참가율은어떻게', '참가율', '여성참가율'],
        answer: `<strong>경제활동참가율</strong> = (경제활동인구 ÷ 15세 이상 인구) × 100<br><br>
        • 경제활동인구 = 취업자 + 실업자<br>
        • 참가율이 내려가면 구직 포기(구직단논) 가능성도 생각하세요.<br>
        • <strong>여성 참가율</strong> 변화는 사회·경제 변화와 연결해 쓰기 좋습니다.`,
        answerMore: `참가율 그래프 분석 순서:<br>
        1. 전체 추세 상승/하락<br>
        2. 여성·남성(체크 가능하면) 비교<br>
        3. 같은 시기 <strong>실업률·고용률</strong>과 한 줄로 묶기`,
        seeAlso: ['discouraged', 'unemployment-rate', 'formulas']
    },
    {
        id: 'employment-rate',
        title: '고용률',
        keys: ['고용률'],
        synonyms: ['고용률변화', '고용률공식', '일하는비율'],
        answer: `<strong>고용률</strong> = (취업자 ÷ 15세 이상 인구) × 100<br><br>
        • 15세 이상 중 실제 일하는 사람의 비율입니다.<br>
        • <strong>실업률</strong>과 분모가 다릅니다 — 헷갈리면 「공식」 관련 질문을 해 보세요.`,
        answerMore: `고용률이 오르는 이유는 여러 가지일 수 있습니다(경기 회복, 인구·구조 변화 등).<br>
        「실업률만 내렸다」고 끝내지 말고 참가율·취업자 수까지 보세요.`,
        seeAlso: ['gender-employment', 'compare-indicators']
    },
    {
        id: 'unemployment-rate',
        title: '실업률',
        keys: ['실업률', '실업률변화', '실업률분석', '실업률변화추이'],
        synonyms: ['실업률은어떻게', '실업률그래프', '실업자비율'],
        answer: `<strong>실업률</strong> = (실업자 ÷ 경제활동인구) × 100<br><br>
        • 경제활동 <strong>인구 안</strong>에서 구직 중인 비율입니다.<br>
        • 코로나(2020) 전후·남녀 차이를 그래프에서 찾아 보세요.<br>
        • ⚠️ 실업률↓만으로 고용이 좋아진 것이 아닐 수 있습니다.`,
        answerMore: `실업률 메모 예: 「2000년대 대비 ○○년에 실업률 피크. 2020년 전후 변동이 컸다. 여성 실업률은 …」<br>
        슬라이더로 <strong>2018~2022</strong>를 좁히면 코로나 영향을 쓰기 쉽습니다.`,
        seeAlso: ['discouraged', 'covid-labor', 'employment-rate']
    },
    {
        id: 'workers',
        title: '취업자 수',
        keys: ['취업자수', '취업자변화', '취업자분석'],
        synonyms: ['취업자', '취업자증가'],
        answer: `<strong>취업자</strong>: 1주일 이상 일한 사람(휴직·휴업 중이어도 일자리 있으면 포함)<br><br>
        • 그래프: 전체·남·여 선그래프<br>
        • <strong>증가량</strong>(몇 명 늘었는지) vs <strong>증가율</strong>(%)을 구분해 보세요.`,
        seeAlso: ['emp-guide', 'project-topics']
    },
    {
        id: 'non-econ',
        title: '비경제활동인구',
        keys: ['비경제활동', '비경제활동인구', '고령화'],
        synonyms: ['비경제', '토론'],
        answer: `<strong>비경제활동인구</strong>: 15세 이상 중 경제활동을 하지 않는 사람<br>
        (학생, 육아·돌봄, 은퇴, 구직단논자 등)<br><br>
        토론: 「증가가 반드시 나쁜 현상일까?」— 선택적 비활동도 포함됩니다.`,
        seeAlso: ['emp-guide', 'discouraged']
    },
    {
        id: 'covid-labor',
        title: '코로나·노동',
        keys: ['코로나19', '코로나노동', '노동시장에미친', '팬데믹'],
        synonyms: ['코로나전후', '2018~2022', '미친영향'],
        answer: `<strong>코로나19와 노동시장</strong><br><br>
        • 슬라이더 <strong>2018~2022</strong> 확대<br>
        • 2020 전후: 실업률 급등, 고용률·참가율도 함께 흔들릴 수 있음<br>
        • 2021~ 이후: 실업↓와 고용·참가 <strong>회복이 같이</strong> 나타나는지 비교<br><br>
        원인 예: 서비스업·대면업 타격, 구직단논 증가`,
        answerMore: `추천 그래프 순서(메모 통합):<br>
        1. 실업률(남녀)  2. 고용률  3. 참가율<br>
        같은 연도 축으로 보면 「코로나 전후 노동시장」 탐구 주제 2와 연결됩니다.`,
        seeAlso: ['unemployment-rate', 'project-topics']
    },
    {
        id: 'project-topics',
        title: '탐구 주제',
        keys: ['탐구프로젝트', '탐구프로젝트주제', '고용탐구프로젝트', '주제추천'],
        synonyms: ['프로젝트주제', '주제추천해줘', '경제수학탐구'],
        answer: `<strong>탐구 프로젝트 주제</strong><br><br>
        1. 고용률 vs 실업률 → <strong>산점도</strong>·<strong>상관계수</strong><br>
        2. 코로나19 → <strong>2018~2022</strong><br>
        3. 남녀 고용 격차 → 추세선·<strong>감소율</strong><br>
        4. 취업자 → 증가량 vs 증가율<br>
        5. 고용률 + CPI 동시 비교<br><br>
        TOP3: 남녀 고용률 / 실업률 / 코로나 전후`,
        answerMore: `주제를 고를 때:<br>
        • 그래프만 그리면 끝이 아니라, <strong>수학 개념 하나</strong>(증가율, 상관, 추세선)를 꼭 넣으세요.<br>
        • KOSIS 수치를 표로 옮겨 계산·엑셀 연습도 가능합니다.`,
        seeAlso: ['math-tools', 'cpi-employment-link']
    },
    {
        id: 'cpi-employment-link',
        title: 'CPI와 고용',
        keys: ['cpi고용', '고용cpi', '물가고용', '고용률과cpi'],
        synonyms: ['동시분석', '물가와고용'],
        answer: `<strong>주제 5</strong>: CPI와 고용을 같은 연도로 맞춰 비교<br><br>
        • CPI 탭: 물가·급등 구간(2021~2023 등)<br>
        • 고용 탭: 같은 연도 고용률·실업률<br>
        • 메모: 「물가 급등기에 고용은 어떻게 움직였는가」— 반드시 같이 좋아지지는 않을 수 있음`,
        seeAlso: ['cpi-spike', 'project-topics']
    },
    {
        id: 'discouraged',
        title: '구직단논자',
        keys: ['구직단논', '구직단논자', '단논'],
        synonyms: ['뭐예요', '취업포기', '실망실업'],
        answer: `<strong>구직단논자</strong>는 일할 능력·의사는 있으나 당장 구직하지 않아 <strong>실업자에 포함되지 않는</strong> 사람입니다.<br><br>
        • 그래서 실업률이 낮아 보여도 고용이 회복된 게 아닐 수 있습니다.<br>
        • <strong>참가율</strong> 하락·<strong>고용률</strong> 정체와 함께 보면 힌트가 됩니다.`,
        answerMore: `코로나·취업난 분석에서 자주 나옵니다. 메모 한 줄: 「실업률 감소가 단논 증가 때문인지는 참가율·고용률로 추가 확인 필요」`,
        seeAlso: ['participation', 'unemployment-rate']
    },
    {
        id: 'kosis',
        title: 'KOSIS',
        keys: ['kosis', '코시스', 'kosis다운로드', '코시스다운로드'],
        synonyms: ['다운로드방법', '통계청', 'kosis안내'],
        answer: `<strong>KOSIS</strong>에서 CSV 받기:<br><br>
        1. 통계표 검색(CPI / 고용)<br>
        2. <strong>행렬 전환(세로)</strong> — 연도가 <strong>행</strong>으로!<br>
        3. 다운로드 → 이 사이트 업로드 → <strong>그래프 그리기</strong><br><br>
        그래프가 깨지면 2번(행렬 방향)을 다시 확인하세요.`,
        answerMore: `소개 섹션에 스크린샷(<code>assets/44.png</code> 등)으로 단계별 안내가 있습니다.<br>
        샘플 CSV는 안내된 Google Drive 링크를 이용할 수 있습니다.`,
        seeAlso: ['csv-tips', 'site-help']
    },
    {
        id: 'csv-tips',
        title: 'CSV·업로드',
        keys: ['csv', 'csv업로드', '파일업로드', '행렬전환'],
        synonyms: ['업로드방법', '그래프그리기', '데이터올리'],
        answer: `CSV 팁:<br><br>
        • KOSIS에서 연도=행 형태로 받기<br>
        • 업로드 후 반드시 <strong>그래프 그리기</strong> 클릭<br>
        • 숫자의 %, 쉼표는 자동 처리<br>
        • 이상하면 열 방향을 KOSIS에서 다시 설정`,
        seeAlso: ['kosis']
    },
    {
        id: 'graph-analysis',
        title: '그래프 해석',
        keys: ['그래프분석', '그래프해석', '분석순서', '차트해석', '그래프보는법'],
        synonyms: ['추세', '우상향', '횡보', '하락추세'],
        answer: `<strong>그래프 분석 4단계</strong><br>
        ① 전체 추세(상승·하락·횡보)  ② 구간(연도·수치·증가율)  ③ 원인 추정  ④ 한 줄 결론<br><br>
        💡 업로드 후 「<strong>내 그래프 분석</strong>」`,
        answerMore: `표현 사전:<br>
        • <strong>우상향</strong> — 값이 시간에 따라 증가<br>
        • <strong>변동성 큼</strong> — 줄이 많이 꺾임(코로나 구간 등)<br>
        • <strong>격차</strong> — 남·여 선 사이 간격`,
        seeAlso: ['my-graph', 'memo-save']
    },
    {
        id: 'my-graph',
        title: '내 그래프',
        keys: ['내그래프', '내그래프분석', '현재그래프', '업로드한그래프'],
        synonyms: ['내그래프', '그래프분석해'],
        answer: '__CHART_HINT__',
        answerMore: `데이터가 없으면 CPI/고용 샘플을 올리거나, KOSIS CSV를 받아 보세요.<br>
        그래프가 있으면 위 안내에 <strong>시작→끝 수치</strong>와 추세(상승/하락)가 붙습니다.`,
        seeAlso: ['graph-analysis', 'kosis']
    },
    {
        id: 'formulas',
        title: '공식',
        keys: ['공식', '수식', '계산공식', '분모'],
        synonyms: ['실업률공식', '고용률공식', '참가율공식', 'cpi공식'],
        answer: `교과 핵심 공식:<br><br>
        • CPI = (비교 시점 가중 평균 ÷ 기준 시점 가중 평균) × 100<br>
        • 경제활동참가율 = (경제활동인구 ÷ 15세 이상 인구) × 100<br>
        • 실업률 = (실업자 ÷ <strong>경제활동인구</strong>) × 100<br>
        • 고용률 = (취업자 ÷ <strong>15세 이상 인구</strong>) × 100<br><br>
        ⚠️ 실업률·고용률의 <strong>분모</strong>가 다릅니다!`,
        seeAlso: ['compare-indicators']
    },
    {
        id: 'compare-indicators',
        title: '지표 비교',
        keys: ['실업률고용률차이', '고용률실업률차이', '헷갈려', '비교'],
        synonyms: ['다른', 'vs', '차이점'],
        answer: `자주 헷갈리는 점:<br><br>
        • <strong>실업률</strong> 분모 = 경제활동인구 / <strong>고용률</strong> 분모 = 15세 이상 전체<br>
        • 실업↓만 보고 「고용 좋아졌다」고 쓰지 말 것 → 참가율·단논<br>
        • <strong>계</strong>만 보면 남녀·농가 차이가 숨음 → 세부 선 확인`,
        seeAlso: ['formulas', 'discouraged']
    },
    {
        id: 'math-tools',
        title: '수학 연결',
        keys: ['상관계수', '산점도', '추세선', '감소율', '증가량'],
        synonyms: ['상관관계', '피어슨', '엑셀'],
        answer: `탐구에 쓸 수 있는 수학:<br><br>
        • 고용률 vs 실업률 → <strong>산점도</strong> + <strong>상관계수</strong>(항상 반대만은 아님)<br>
        • 남녀 격차 → <strong>추세선</strong>, 격차 <strong>감소율</strong><br>
        • CPI·취업자 → 전년 대비 <strong>증가율</strong>`,
        seeAlso: ['project-topics']
    },
    {
        id: 'emp-ui',
        title: '고용 탐구 질문',
        keys: ['탐구질문', '고용분석', '고용설정', '전체추세'],
        synonyms: ['남녀비교', '남녀격차', '농가비농가'],
        answer: `고용 그래프는 <strong>분석할 지표</strong>와 <strong>탐구 질문</strong>으로 골라 봅니다.<br><br>
        • 전체 추세 / 남녀 비교 / 남녀·농가 격차(비율은 %p, 취업자·실업자 등은 천 명)<br>
        • 지표: 참가율·실업률·고용률·취업자·실업자<br>
        • 복잡한 항목을 일일이 고르지 않아도 됩니다.`,
        seeAlso: ['site-help']
    },
    {
        id: 'slider',
        title: '기간 슬라이더',
        keys: ['슬라이더', '기간조절', '연도범위', '기간선택'],
        synonyms: ['2000년', '최근20년', '구간좁'],
        answer: `그래프 아래 <strong>슬라이더</strong>로 분석 구간을 줄이거나 늘릴 수 있습니다.<br><br>
        • 먼저 전체 추세 → 관심 구간만 확대<br>
        • 코로나: 2018~2022 / 최근 20년: 2000년대~ 등`,
        seeAlso: ['covid-labor', 'cpi-spike']
    },
    {
        id: 'memo-save',
        title: '메모·저장',
        keys: ['메모', '이미지저장', '캡처', '보고서'],
        synonyms: ['메모작성', '저장하기', 'html2canvas'],
        answer: `각 탭에 <strong>분석 메모</strong>가 있습니다. 챗봇 힌트를 본인 말로 바꿔 적으세요.<br><br>
        • 그래프+메모를 <strong>이미지로 저장</strong>해 보고서에 붙일 수 있습니다(긴 메모도 잘리지 않게 처리됨).`,
        seeAlso: ['graph-analysis']
    },
    {
        id: 'quiz',
        title: '퀴즈',
        keys: ['확인퀴즈', '퀴즈', '퀴즈힌트'],
        synonyms: ['문제', '정답', '오답'],
        answer: `확인 퀴즈는 개념을 점검합니다. 정답 확인 후 <strong>해설</strong>을 읽으세요.<br>
        정답 번호만 알려달라는 질문에는 <strong>개념·공식 힌트</strong>로만 도와드립니다.<br><br>
        예: 「실업률 분모는?」→ 「공식」 관련 질문`,
        seeAlso: ['formulas', 'compare-indicators']
    },
    {
        id: 'site-help',
        title: '사용법',
        keys: ['사용법', '사이트사용', '어떻게써', '도움말'],
        synonyms: ['처음', '뭐할수', '기능'],
        answer: `이 사이트에서 할 수 있는 것:<br><br>
        • <strong>소개</strong>: KOSIS·사용 안내<br>
        • <strong>CPI / 고용</strong>: CSV 업로드, 그래프, 슬라이더, 메모<br>
        • <strong>퀴즈</strong>: 개념 확인<br>
        • 챗봇: 추천 칩을 누르거나, 「CPI」「실업률」「고용 가이드」처럼 짧게 질문해 보세요.<br><br>
        같은 질문을 다시 보내면 <strong>추가 설명</strong>이 나올 수 있습니다.`,
        seeAlso: ['kosis', 'emp-guide']
    }
];

/** 추천 칩 문장 → 항목 id (가장 정확한 매칭) */
window.ECOMATH_CHIP_TO_ID = {
    'cpiga뭐야?': 'cpi',
    '2021~2023년cpi급상승구간을어떻게분석해?': 'cpi-spike',
    '내그래프분석': 'my-graph',
    '고용탐구가이드①부터⑤까지알려줘': 'emp-guide',
    '남녀고용률그래프는어떻게분석해?': 'gender-employment',
    '코로나19가노동시장에미친영향은?': 'covid-labor',
    '경제활동참가율은어떻게분석해?': 'participation',
    '실업률변화추이는어떻게분석해?': 'unemployment-rate',
    '고용탐구프로젝트주제추천해줘': 'project-topics',
    '구직단논자가뭐예요?': 'discouraged',
    'kosis다운로드방법': 'kosis'
};
