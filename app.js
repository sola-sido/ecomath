// 전역 차트 인스턴스와 데이터 저장용 변수
let cpiChartInstance = null;
let empChartInstance = null;

let cpiGlobalData = { labels: [], datasets: [] };
let empGlobalData = { labels: [], datasets: [] };

// 필터 UI 생성 함수 (카테고리별 분류 기능 추가)
function renderFilterCheckboxes(containerId, datasets, updateCallback, colorClass) {
    const container = document.getElementById(containerId);
    container.innerHTML = ''; // 초기화
    
    // 카테고리 정의
    const categories = {
        '전체 종합': [],
        '성별 데이터 (남자/여자)': [],
        '농가 데이터': [],
        '비농가 데이터': [],
        '기타': []
    };

    // 데이터셋 분류
    datasets.forEach(ds => {
        if (ds.label.startsWith('계')) {
            categories['전체 종합'].push(ds);
        } else if (ds.label.startsWith('남자') || ds.label.startsWith('여자')) {
            categories['성별 데이터 (남자/여자)'].push(ds);
        } else if (ds.label.startsWith('농가')) {
            categories['농가 데이터'].push(ds);
        } else if (ds.label.startsWith('비농가')) {
            categories['비농가 데이터'].push(ds);
        } else {
            categories['기타'].push(ds);
        }
    });

    // 카테고리별로 렌더링
    for (const [categoryName, items] of Object.entries(categories)) {
        if (items.length === 0) continue; // 데이터가 없는 카테고리는 건너뜀

        // 카테고리 제목
        const categoryHeader = document.createElement('h5');
        categoryHeader.className = 'w-full text-sm font-bold text-gray-800 border-b border-gray-200 pb-1 mt-4 mb-2 first:mt-0';
        categoryHeader.textContent = `■ ${categoryName}`;
        container.appendChild(categoryHeader);

        // 체크박스 컨테이너
        const groupContainer = document.createElement('div');
        groupContainer.className = 'flex flex-wrap gap-2 mb-2 w-full';

        items.forEach(ds => {
            // 처음에는 모든 체크박스를 해제 상태로 둡니다 (너무 많아서 복잡해짐 방지)
            // 비율(%) 지표 중 '전체 종합(계)'인 것만 기본으로 몇 개 켜둡니다.
            let isChecked = false;
            if (datasets.length > 3) {
                if (ds.label.includes('계') && (ds.label.includes('%') || ds.label.includes('율'))) {
                    isChecked = true;
                }
            } else {
                isChecked = true; // CPI처럼 항목이 적은 경우는 모두 켜둠
            }

            const label = document.createElement('label');
            label.className = 'flex items-center space-x-2 cursor-pointer p-1.5 px-3 bg-white border border-gray-200 rounded-lg shadow-sm hover:bg-gray-50 transition text-sm';
            
            const checkbox = document.createElement('input');
            checkbox.type = 'checkbox';
            checkbox.value = ds.label;
            checkbox.checked = isChecked;
            checkbox.className = `form-checkbox text-${colorClass}-600 rounded w-4 h-4 focus:ring-0`;
            checkbox.addEventListener('change', updateCallback);
            
            const span = document.createElement('span');
            span.className = 'text-gray-700 font-medium truncate max-w-[200px] md:max-w-none';
            span.textContent = ds.label;
            span.title = ds.label; // 마우스 올렸을 때 전체 이름 보이기
            
            label.appendChild(checkbox);
            label.appendChild(span);
            groupContainer.appendChild(label);
        });

        container.appendChild(groupContainer);
    }
}

// 필터링된 데이터셋 가져오는 함수
function getFilteredDatasets(containerId, datasets) {
    const container = document.getElementById(containerId);
    const checkedValues = Array.from(container.querySelectorAll('input:checked')).map(cb => cb.value);
    
    // 만약 모두 체크 해제되었다면 빈 차트가 나오게 됨
    return datasets.filter(ds => checkedValues.includes(ds.label));
}

// KOSIS 데이터 파싱 유틸리티 함수 (가로/세로 포맷 모두 지원)
function parseKosisData(data, meta, defaultColor) {
    let labels = [];
    let datasets = [];
    
    // 차트 선 색상 팔레트 (여러 줄이 나올 경우 순차적으로 사용)
    const colors = [defaultColor, '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#14b8a6', '#6366f1', '#f97316', '#3b82f6', '#10b981'];

    // 1. 와이드 포맷 (Wide Format) 감지: 연도로 시작하는 컬럼이 있는지 확인 (예: "1999.06 월", "2025.11")
    const wideTimeCols = meta.fields.filter(f => /^[0-9]{4}/.test(f));

    if (wideTimeCols.length > 0) {
        // --- 와이드 포맷 처리 (예: 고용관련지표 기본 다운로드 파일) ---
        labels = [...wideTimeCols].sort((a, b) => a.localeCompare(b));
        const nonTimeCols = meta.fields.filter(f => !wideTimeCols.includes(f));
        
        let colorIdx = 0;
        data.forEach((row, i) => {
            // 값이 전혀 없는 빈 행은 무시
            if (wideTimeCols.every(col => !row[col] || row[col].trim() === '')) return;
            
            // "계", "경제활동참가율[%]", "천명" 등의 비시간 컬럼 값을 합쳐서 범례 이름으로 사용
            let rowLabel = nonTimeCols.map(c => row[c]).filter(v => v).join(' ');
            if (!rowLabel) rowLabel = `데이터 ${i+1}`;
            
            // 값 추출 및 콤마 제거
            const values = labels.map(col => {
                const val = parseFloat(String(row[col]).replace(/,/g, ''));
                return isNaN(val) ? null : val;
            });
            
            datasets.push({
                label: rowLabel,
                data: values,
                borderColor: colors[colorIdx % colors.length],
                backgroundColor: colors[colorIdx % colors.length] + '33',
                fill: false, // 선이 여러 개면 겹치지 않게 투명 처리
                tension: 0.1,
                pointRadius: 2
            });
            colorIdx++;
        });
    } else {
        // --- 롱 포맷 처리 (행렬 전환하여 다운로드한 파일, 예: 소비자물가지수) ---
        // 시점(X축) 찾기
        const xField = meta.fields.find(f => f.includes('시점') || f.includes('기간') || f.includes('년')) || meta.fields[0];
        // 값(Y축) 찾기
        const yField = meta.fields.includes('데이터') ? '데이터' : meta.fields[meta.fields.length - 1];
        
        // 항목(범례) 찾기 (시점과 데이터가 아닌 나머지 컬럼들)
        const groupFields = meta.fields.filter(f => f !== xField && f !== yField);
        
        // 중복 없는 시점 라벨 생성 후 과거->최신 정렬
        labels = [...new Set(data.map(r => String(r[xField])))].sort((a, b) => a.localeCompare(b));
        
        if (groupFields.length > 0) {
            // 여러 항목이 섞여 있는 경우 (예: 전국, 서울, 부산...)
            const grouped = {};
            data.forEach(row => {
                const groupKey = groupFields.map(f => row[f]).filter(v => v).join(' ');
                if (!grouped[groupKey]) grouped[groupKey] = {};
                grouped[groupKey][row[xField]] = parseFloat(String(row[yField]).replace(/,/g, ''));
            });
            
            let colorIdx = 0;
            for (const [key, valObj] of Object.entries(grouped)) {
                const values = labels.map(l => isNaN(valObj[l]) ? null : valObj[l]);
                datasets.push({
                    label: key || yField,
                    data: values,
                    borderColor: colors[colorIdx % colors.length],
                    backgroundColor: colors[colorIdx % colors.length] + '33',
                    fill: false,
                    tension: 0.1,
                    pointRadius: 2
                });
                colorIdx++;
            }
        } else {
            // 항목 구분이 없는 단순 데이터
            const values = labels.map(l => {
                const row = data.find(r => String(r[xField]) === l);
                return row ? parseFloat(String(row[yField]).replace(/,/g, '')) : null;
            });
            datasets.push({
                label: yField,
                data: values,
                borderColor: defaultColor,
                backgroundColor: defaultColor + '33',
                fill: true,
                tension: 0.1,
                pointRadius: 2
            });
        }
    }
    
    // 데이터셋이 1개뿐이라면 배경색을 채워 예쁘게 보임
    if (datasets.length === 1) {
        datasets[0].fill = true;
        // 색상도 기본 색상으로 강제 지정
        datasets[0].borderColor = defaultColor;
        datasets[0].backgroundColor = defaultColor + '33';
    }

    return { labels, datasets };
}

function showError(element, message) {
    element.textContent = message;
    element.classList.remove('hidden');
}

// CPI 차트 업데이트 함수 (슬라이더 값에 따라)
function updateCpiChart() {
    if (!cpiGlobalData.labels.length) return;

    let startIdx = parseInt(document.getElementById('cpi-slider-start').value);
    let endIdx = parseInt(document.getElementById('cpi-slider-end').value);

    // 시작이 끝보다 크면 교정
    if (startIdx > endIdx) {
        let temp = startIdx;
        startIdx = endIdx;
        endIdx = temp;
    }

    const slicedLabels = cpiGlobalData.labels.slice(startIdx, endIdx + 1);
    
    // 1. 선택된 체크박스에 따라 데이터셋 필터링
    let filteredDatasets = getFilteredDatasets('cpi-filter-checkboxes', cpiGlobalData.datasets);
    
    // 2. 데이터셋 배열의 데이터들도 슬라이더에 맞춰 잘라줌
    const slicedDatasets = filteredDatasets.map(ds => {
        return { ...ds, data: ds.data.slice(startIdx, endIdx + 1) };
    });

    // 라벨 텍스트 업데이트
    const labelSpan = document.getElementById('cpi-range-label');
    labelSpan.textContent = `${slicedLabels[0]} ~ ${slicedLabels[slicedLabels.length - 1]}`;

    if (cpiChartInstance) cpiChartInstance.destroy();

    const ctx = document.getElementById('cpiChart').getContext('2d');
    cpiChartInstance = new Chart(ctx, {
        type: 'line',
        data: {
            labels: slicedLabels,
            datasets: slicedDatasets
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { position: 'top' },
            }
        }
    });
}

// 고용 지표 차트 업데이트 함수 (슬라이더 및 분석 조건에 따라)
function updateEmpChart() {
    if (!empGlobalData.labels.length) return;

    let startIdx = parseInt(document.getElementById('emp-slider-start').value);
    let endIdx = parseInt(document.getElementById('emp-slider-end').value);

    if (startIdx > endIdx) {
        let temp = startIdx;
        startIdx = endIdx;
        endIdx = temp;
    }

    const slicedLabels = empGlobalData.labels.slice(startIdx, endIdx + 1);
    
    // UI 요소 읽기
    const indicator = document.getElementById('emp-indicator-select').value;
    const exploreType = document.querySelector('input[name="emp-explore-radio"]:checked').value;
    
    // 수동 선택 영역 표시 제어
    const customArea = document.getElementById('emp-custom-checkbox-area');
    if (exploreType === 'custom') {
        customArea.classList.remove('hidden');
    } else {
        customArea.classList.add('hidden');
    }

    let targetDatasets = [];
    const allDatasets = empGlobalData.datasets;

    // 분석 조건에 따른 데이터셋 필터링 및 생성
    if (exploreType === 'custom') {
        targetDatasets = getFilteredDatasets('emp-filter-checkboxes', allDatasets);
    } 
    else if (exploreType === 'all') {
        // '계' + 선택한 지표
        const ds = allDatasets.find(d => d.label.includes('계') && d.label.includes(indicator));
        if (ds) targetDatasets.push(ds);
        // 만약 '계'가 없다면 그냥 지표 이름이 포함된 첫번째 것 선택
        else {
            const fallback = allDatasets.find(d => d.label.includes(indicator));
            if (fallback) targetDatasets.push(fallback);
        }
    }
    else if (exploreType === 'gender') {
        const maleDs = allDatasets.find(d => d.label.startsWith('남자') && d.label.includes(indicator));
        const femaleDs = allDatasets.find(d => d.label.startsWith('여자') && d.label.includes(indicator));
        if (maleDs) {
            maleDs.borderColor = '#3b82f6'; // 파란색
            maleDs.backgroundColor = '#3b82f633';
            targetDatasets.push(maleDs);
        }
        if (femaleDs) {
            femaleDs.borderColor = '#ec4899'; // 핑크색
            femaleDs.backgroundColor = '#ec489933';
            targetDatasets.push(femaleDs);
        }
    }
    else if (exploreType === 'gender_diff') {
        const maleDs = allDatasets.find(d => d.label.startsWith('남자') && d.label.includes(indicator));
        const femaleDs = allDatasets.find(d => d.label.startsWith('여자') && d.label.includes(indicator));
        if (maleDs && femaleDs) {
            const diffData = maleDs.data.map((val, idx) => {
                if (val === null || femaleDs.data[idx] === null) return null;
                return parseFloat((val - femaleDs.data[idx]).toFixed(2));
            });
            targetDatasets.push({
                label: `남녀 격차 (남자 - 여자) [${indicator}]`,
                data: diffData,
                borderColor: '#8b5cf6', // 보라색
                backgroundColor: '#8b5cf633',
                fill: true,
                tension: 0.1,
                pointRadius: 2
            });
        } else {
            showError(document.getElementById('emp-error'), '성별 데이터가 포함되어 있지 않습니다.');
        }
    }
    else if (exploreType === 'farm') {
        const farmDs = allDatasets.find(d => d.label.startsWith('농가') && !d.label.includes('남자') && !d.label.includes('여자') && d.label.includes(indicator));
        const nonFarmDs = allDatasets.find(d => d.label.startsWith('비농가') && !d.label.includes('남자') && !d.label.includes('여자') && d.label.includes(indicator));
        if (farmDs) {
            farmDs.borderColor = '#10b981'; // 초록색
            farmDs.backgroundColor = '#10b98133';
            targetDatasets.push(farmDs);
        }
        if (nonFarmDs) {
            nonFarmDs.borderColor = '#f59e0b'; // 주황색
            nonFarmDs.backgroundColor = '#f59e0b33';
            targetDatasets.push(nonFarmDs);
        }
        if (!farmDs && !nonFarmDs) {
            showError(document.getElementById('emp-error'), '농가/비농가 데이터가 포함되어 있지 않습니다.');
        }
    }
    else if (exploreType === 'farm_diff') {
        const farmDs = allDatasets.find(d => d.label.startsWith('농가') && !d.label.includes('남자') && !d.label.includes('여자') && d.label.includes(indicator));
        const nonFarmDs = allDatasets.find(d => d.label.startsWith('비농가') && !d.label.includes('남자') && !d.label.includes('여자') && d.label.includes(indicator));
        if (farmDs && nonFarmDs) {
            const diffData = nonFarmDs.data.map((val, idx) => {
                if (val === null || farmDs.data[idx] === null) return null;
                return parseFloat((val - farmDs.data[idx]).toFixed(2));
            });
            targetDatasets.push({
                label: `농가와 비농가 격차 (비농가 - 농가) [${indicator}]`,
                data: diffData,
                borderColor: '#ef4444', // 빨간색
                backgroundColor: '#ef444433',
                fill: true,
                tension: 0.1,
                pointRadius: 2
            });
        } else {
            showError(document.getElementById('emp-error'), '농가/비농가 데이터가 포함되어 있지 않습니다.');
        }
    }

    // 슬라이더 범위에 맞게 데이터 자르기
    const slicedDatasets = targetDatasets.map(ds => {
        return { ...ds, data: ds.data.slice(startIdx, endIdx + 1) };
    });

    const labelSpan = document.getElementById('emp-range-label');
    labelSpan.textContent = `${slicedLabels[0]} ~ ${slicedLabels[slicedLabels.length - 1]}`;

    if (empChartInstance) empChartInstance.destroy();

    const ctx = document.getElementById('empChart').getContext('2d');
    empChartInstance = new Chart(ctx, {
        type: 'line',
        data: {
            labels: slicedLabels,
            datasets: slicedDatasets
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { position: 'top' },
            }
        }
    });
}

document.addEventListener('DOMContentLoaded', () => {
    
    // CPI 슬라이더 이벤트
    document.getElementById('cpi-slider-start').addEventListener('input', updateCpiChart);
    document.getElementById('cpi-slider-end').addEventListener('input', updateCpiChart);

    // 고용 슬라이더 이벤트
    document.getElementById('emp-slider-start').addEventListener('input', updateEmpChart);
    document.getElementById('emp-slider-end').addEventListener('input', updateEmpChart);
    
    // 고용 분석 조건 이벤트
    document.getElementById('emp-indicator-select').addEventListener('change', updateEmpChart);
    document.querySelectorAll('input[name="emp-explore-radio"]').forEach(radio => {
        radio.addEventListener('change', updateEmpChart);
    });

    // CPI 데이터 초기화(삭제) 버튼
    document.getElementById('cpi-clear-btn').addEventListener('click', () => {
        document.getElementById('cpi-file').value = '';
        if (cpiChartInstance) cpiChartInstance.destroy();
        document.getElementById('cpi-placeholder').classList.remove('hidden');
        document.getElementById('cpi-slider-container').classList.add('hidden');
        document.getElementById('cpi-filter-container').classList.add('hidden');
        document.getElementById('cpi-clear-btn').classList.add('hidden');
        document.getElementById('cpi-error').classList.add('hidden');
        cpiGlobalData = { labels: [], datasets: [] };
    });

    // 고용 지표 데이터 초기화(삭제) 버튼
    document.getElementById('emp-clear-btn').addEventListener('click', () => {
        document.getElementById('emp-file').value = '';
        if (empChartInstance) empChartInstance.destroy();
        document.getElementById('emp-placeholder').classList.remove('hidden');
        document.getElementById('emp-slider-container').classList.add('hidden');
        document.getElementById('emp-filter-container').classList.add('hidden');
        document.getElementById('emp-clear-btn').classList.add('hidden');
        document.getElementById('emp-error').classList.add('hidden');
        empGlobalData = { labels: [], datasets: [] };
        // 분석 조건 UI 초기화 (옵션)
        document.getElementById('emp-indicator-select').value = '경제활동참가율';
        document.querySelector('input[name="emp-explore-radio"][value="all"]').checked = true;
        document.getElementById('emp-custom-checkbox-area').classList.add('hidden');
    });

    // CPI 차트 그리기 버튼
    document.getElementById('cpi-process-btn').addEventListener('click', () => {
        const fileInput = document.getElementById('cpi-file');
        const errorDiv = document.getElementById('cpi-error');
        errorDiv.classList.add('hidden');

        if (!fileInput.files || fileInput.files.length === 0) {
            showError(errorDiv, 'CSV 파일을 선택해주세요.');
            return;
        }
        
        Papa.parse(fileInput.files[0], {
            header: true,
            skipEmptyLines: true,
            encoding: "EUC-KR",
            complete: function(results) {
                try {
                    const data = results.data;
                    const meta = results.meta;
                    if(data.length === 0) throw new Error("데이터가 없습니다.");
                    
                    // 파싱 로직 호출 (#10b981 : emerald-500)
                    const parsed = parseKosisData(data, meta, '#10b981');
                    cpiGlobalData = parsed;

                    // 슬라이더 초기화
                    const maxIdx = parsed.labels.length - 1;
                    const startSlider = document.getElementById('cpi-slider-start');
                    const endSlider = document.getElementById('cpi-slider-end');
                    
                    startSlider.max = maxIdx;
                    startSlider.value = 0;
                    endSlider.max = maxIdx;
                    endSlider.value = maxIdx;

                    // 체크박스 필터 렌더링
                    renderFilterCheckboxes('cpi-filter-checkboxes', parsed.datasets, updateCpiChart, 'emerald');

                    document.getElementById('cpi-placeholder').classList.add('hidden');
                    document.getElementById('cpi-slider-container').classList.remove('hidden');
                    document.getElementById('cpi-filter-container').classList.remove('hidden');
                    document.getElementById('cpi-clear-btn').classList.remove('hidden'); // 추가: 삭제 버튼 표시
                    
                    // 차트 렌더링
                    updateCpiChart();

                } catch(e) {
                    showError(errorDiv, "데이터를 파싱할 수 없습니다. " + e.message);
                }
            }
        });
    });

    // 고용 차트 그리기 버튼
    document.getElementById('emp-process-btn').addEventListener('click', () => {
        const fileInput = document.getElementById('emp-file');
        const errorDiv = document.getElementById('emp-error');
        errorDiv.classList.add('hidden');

        if (!fileInput.files || fileInput.files.length === 0) {
            showError(errorDiv, 'CSV 파일을 선택해주세요.');
            return;
        }
        
        Papa.parse(fileInput.files[0], {
            header: true,
            skipEmptyLines: true,
            encoding: "EUC-KR",
            complete: function(results) {
                try {
                    const data = results.data;
                    const meta = results.meta;
                    if(data.length === 0) throw new Error("데이터가 없습니다.");
                    
                    // 파싱 로직 호출 (#3b82f6 : blue-500)
                    const parsed = parseKosisData(data, meta, '#3b82f6');
                    empGlobalData = parsed;

                    // 슬라이더 초기화
                    const maxIdx = parsed.labels.length - 1;
                    const startSlider = document.getElementById('emp-slider-start');
                    const endSlider = document.getElementById('emp-slider-end');
                    
                    startSlider.max = maxIdx;
                    startSlider.value = 0;
                    endSlider.max = maxIdx;
                    endSlider.value = maxIdx;

                    // 체크박스 필터 렌더링
                    renderFilterCheckboxes('emp-filter-checkboxes', parsed.datasets, updateEmpChart, 'blue');

                    document.getElementById('emp-placeholder').classList.add('hidden');
                    document.getElementById('emp-slider-container').classList.remove('hidden');
                    document.getElementById('emp-filter-container').classList.remove('hidden');
                    document.getElementById('emp-clear-btn').classList.remove('hidden'); // 추가: 삭제 버튼 표시
                    
                    // 차트 렌더링
                    updateEmpChart();

                } catch(e) {
                    showError(errorDiv, "데이터를 파싱할 수 없습니다. " + e.message);
                }
            }
        });
    });

    // 퀴즈 채점 기능
    document.getElementById('quiz-submit-btn').addEventListener('click', () => {
        let score = 0;
        const totalQuestions = 3;
        
        // 문제 1
        const q1 = document.querySelector('input[name="q1"]:checked');
        if (q1) {
            const parent = q1.closest('.space-y-3').querySelectorAll('label');
            parent.forEach(lbl => {
                lbl.classList.remove('correct-answer', 'wrong-answer');
                const inp = lbl.querySelector('input');
                if (inp.value === 'correct') lbl.classList.add('correct-answer');
                else if (inp.checked) lbl.classList.add('wrong-answer');
            });
            if (q1.value === 'correct') score++;
        }

        // 문제 2
        const q2 = document.querySelector('input[name="q2"]:checked');
        if (q2) {
            const parent = q2.closest('.space-y-3').querySelectorAll('label');
            parent.forEach(lbl => {
                lbl.classList.remove('correct-answer', 'wrong-answer');
                const inp = lbl.querySelector('input');
                if (inp.value === 'correct') lbl.classList.add('correct-answer');
                else if (inp.checked) lbl.classList.add('wrong-answer');
            });
            if (q2.value === 'correct') score++;
        }

        // 문제 3
        const q3 = document.querySelector('input[name="q3"]:checked');
        if (q3) {
            const parent = q3.closest('.space-y-3').querySelectorAll('label');
            parent.forEach(lbl => {
                lbl.classList.remove('correct-answer', 'wrong-answer');
                const inp = lbl.querySelector('input');
                if (inp.value === 'correct') lbl.classList.add('correct-answer');
                else if (inp.checked) lbl.classList.add('wrong-answer');
            });
            if (q3.value === 'correct') score++;
        }

        // 결과 표시
        const resultDiv = document.getElementById('quiz-result');
        resultDiv.classList.remove('hidden');
        
        if (score === totalQuestions) {
            resultDiv.innerHTML = `🎉 대단해요! ${score}/${totalQuestions}점 만점입니다! 💯`;
            resultDiv.className = "mt-6 text-xl font-bold text-emerald-600";
        } else {
            resultDiv.innerHTML = `📝 ${score}/${totalQuestions}점 입니다. 초록색으로 표시된 정답을 다시 한번 확인해보세요.`;
            resultDiv.className = "mt-6 text-xl font-bold text-purple-600";
        }
    });
});
