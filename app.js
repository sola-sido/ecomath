// 전역 차트 인스턴스와 데이터 저장용 변수
let cpiChartInstance = null;
let empChartInstance = null;

let cpiGlobalData = { labels: [], datasets: [] };
let empGlobalData = { labels: [], datasets: [] };

// 데이터셋 라벨 정렬 우선순위 (지표 종류 → 세부 분류)
function getDatasetSortKey(label) {
    const indicatorOrder = ['경제활동참가율', '실업률', '고용률', '취업자', '실업자', '경제활동인구', '비경제활동인구'];
    const groupOrder = ['계', '남자', '여자', '농가', '비농가'];

    let indicatorIdx = indicatorOrder.findIndex(k => label.includes(k));
    if (indicatorIdx === -1) indicatorIdx = 99;

    let groupIdx = groupOrder.findIndex(k => label.startsWith(k) || label.includes(` ${k}`));
    if (groupIdx === -1) groupIdx = 50;

    const isPercent = label.includes('%') || label.includes('율') ? 0 : 1;

    return `${String(groupIdx).padStart(2, '0')}_${String(indicatorIdx).padStart(2, '0')}_${isPercent}_${label}`;
}

function sortDatasets(datasets) {
    return [...datasets].sort((a, b) => getDatasetSortKey(a.label).localeCompare(getDatasetSortKey(b.label), 'ko'));
}

function categorizeDataset(label) {
    if (label.startsWith('계') || label.includes(' 계 ')) return '전체 종합';
    if (label.startsWith('남자') || label.startsWith('여자')) return '성별 (남자/여자)';
    if (label.startsWith('농가')) return '농가';
    if (label.startsWith('비농가')) return '비농가';
    return '기타';
}

// 필터 UI 생성 함수 (카테고리별 분류 + 정렬)
function renderFilterCheckboxes(containerId, datasets, updateCallback, colorClass) {
    const container = document.getElementById(containerId);
    container.innerHTML = '';

    const categoryOrder = ['전체 종합', '성별 (남자/여자)', '농가', '비농가', '기타'];
    const categories = Object.fromEntries(categoryOrder.map(name => [name, []]));

    sortDatasets(datasets).forEach(ds => {
        categories[categorizeDataset(ds.label)].push(ds);
    });

    for (const categoryName of categoryOrder) {
        const items = categories[categoryName];
        if (items.length === 0) continue;

        const categoryHeader = document.createElement('h5');
        categoryHeader.className = 'filter-category w-full text-sm font-bold text-gray-800 border-b border-gray-200 pb-1 mt-4 mb-2 first:mt-0';
        categoryHeader.textContent = `■ ${categoryName}`;
        categoryHeader.dataset.category = categoryName;
        container.appendChild(categoryHeader);

        const groupContainer = document.createElement('div');
        groupContainer.className = 'filter-group flex flex-wrap gap-2 mb-2 w-full';
        groupContainer.dataset.category = categoryName;

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
            label.className = 'filter-item flex items-center space-x-2 cursor-pointer p-1.5 px-3 bg-white border border-gray-200 rounded-lg shadow-sm hover:bg-gray-50 transition text-sm';
            label.dataset.label = ds.label;
            
            const checkbox = document.createElement('input');
            checkbox.type = 'checkbox';
            checkbox.value = ds.label;
            checkbox.checked = isChecked;
            checkbox.className = `form-checkbox text-${colorClass}-600 rounded w-4 h-4 focus:ring-0`;
            checkbox.addEventListener('change', updateCallback);
            
            const span = document.createElement('span');
            span.className = 'text-gray-700 font-medium';
            span.textContent = ds.label;
            span.title = ds.label;
            
            label.appendChild(checkbox);
            label.appendChild(span);
            groupContainer.appendChild(label);
        });

        container.appendChild(groupContainer);
    }
}

function setupFilterSearch(searchInputId, containerId) {
    const searchInput = document.getElementById(searchInputId);
    if (!searchInput) return;

    searchInput.value = '';
    searchInput.oninput = () => {
        const query = searchInput.value.trim().toLowerCase();
        const container = document.getElementById(containerId);
        container.querySelectorAll('.filter-item').forEach(item => {
            const text = (item.dataset.label || '').toLowerCase();
            item.classList.toggle('hidden', query !== '' && !text.includes(query));
        });
        container.querySelectorAll('.filter-category, .filter-group').forEach(group => {
            const visible = group.querySelectorAll('.filter-item:not(.hidden)').length > 0;
            group.classList.toggle('hidden', query !== '' && !visible);
        });
    };
}

// 필터링된 데이터셋 가져오는 함수
function getFilteredDatasets(containerId, datasets) {
    const container = document.getElementById(containerId);
    const checkedValues = Array.from(container.querySelectorAll('input:checked')).map(cb => cb.value);
    
    // 만약 모두 체크 해제되었다면 빈 차트가 나오게 됨
    return datasets.filter(ds => checkedValues.includes(ds.label));
}

const CHART_COLORS = ['#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#14b8a6', '#6366f1', '#f97316', '#3b82f6', '#10b981'];

function parseNumeric(val) {
    if (val === null || val === undefined || val === '') return null;
    const num = parseFloat(String(val).replace(/,/g, '').replace(/%/g, ''));
    return isNaN(num) ? null : num;
}

function isTimeLikeValue(val) {
    const s = String(val).trim();
    return /^[0-9]{4}(\.[0-9]{1,2})?(\s*(년|월|분기|Q))?/i.test(s) || /^[0-9]{4}$/.test(s);
}

function isTimeFieldName(field) {
    if (!field) return false;
    const f = String(field);
    return f.includes('시점') || f.includes('기간') || f.includes('연도') || (f.includes('년') && !f.includes('천명'));
}

function sortTimeLabels(labels) {
    return [...labels].sort((a, b) => String(a).localeCompare(String(b)));
}

function makeDataset(label, values, colorIdx, defaultColor, fill = false) {
    const color = CHART_COLORS[colorIdx % CHART_COLORS.length] || defaultColor;
    return {
        label,
        data: values,
        borderColor: color,
        backgroundColor: color + '33',
        fill,
        tension: 0.1,
        pointRadius: 2
    };
}

function scoreParseResult(result) {
    if (!result.labels.length || !result.datasets.length) return 0;
    const numericCount = result.datasets.reduce((sum, ds) =>
        sum + ds.data.filter(v => v !== null).length, 0);
    return numericCount + result.datasets.length * 10 + result.labels.length;
}

// 와이드 포맷: 시간이 열 헤더 (고용 기본 다운로드)
function parseWideColumns(data, fields, defaultColor) {
    const wideTimeCols = fields.filter(f => /^[0-9]{4}/.test(String(f)));
    if (wideTimeCols.length === 0) return null;

    const labels = sortTimeLabels(wideTimeCols);
    const nonTimeCols = fields.filter(f => !wideTimeCols.includes(f));
    const datasets = [];
    let colorIdx = 0;

    data.forEach((row, i) => {
        if (wideTimeCols.every(col => !row[col] || String(row[col]).trim() === '')) return;
        const rowLabel = nonTimeCols.map(c => row[c]).filter(v => v).join(' ') || `데이터 ${i + 1}`;
        const values = labels.map(col => parseNumeric(row[col]));
        if (values.some(v => v !== null)) {
            datasets.push(makeDataset(rowLabel, values, colorIdx++, defaultColor));
        }
    });

    return datasets.length ? { labels, datasets } : null;
}

// 시점이 행(세로)인 포맷: 첫 열이 시점, 나머지 열이 항목
function parseTimeRows(data, fields, defaultColor) {
    const timeField = fields.find(isTimeFieldName) || fields[0];
    const timeRows = data.filter(r => isTimeLikeValue(r[timeField]));
    if (timeRows.length < data.length * 0.5) return null;

    const labels = sortTimeLabels([...new Set(timeRows.map(r => String(r[timeField])))]);
    const valueCols = fields.filter(f => f !== timeField && data.some(r => parseNumeric(r[f]) !== null));
    if (!valueCols.length) return null;

    const datasets = valueCols.map((col, i) => {
        const values = labels.map(l => {
            const row = timeRows.find(r => String(r[timeField]) === l);
            return row ? parseNumeric(row[col]) : null;
        });
        return makeDataset(col, values, i, defaultColor);
    }).filter(ds => ds.data.some(v => v !== null));

    return datasets.length ? { labels, datasets } : null;
}

// 롱 포맷: 시점 + 항목 + 데이터 (행렬 전환 후)
function parseLongFormat(data, fields, defaultColor) {
    const xField = fields.find(isTimeFieldName) || fields.find(f => data.some(r => isTimeLikeValue(r[f]))) || fields[0];
    const yField = fields.includes('데이터') ? '데이터' : fields.find(f => f !== xField && data.some(r => parseNumeric(r[f]) !== null)) || fields[fields.length - 1];
    const groupFields = fields.filter(f => f !== xField && f !== yField);

    const labels = sortTimeLabels([...new Set(data.map(r => String(r[xField])).filter(v => v && v !== 'undefined'))]);
    if (!labels.length) return null;

    const datasets = [];

    if (groupFields.length > 0) {
        const grouped = {};
        data.forEach(row => {
            const groupKey = groupFields.map(f => row[f]).filter(v => v).join(' ');
            if (!groupKey) return;
            if (!grouped[groupKey]) grouped[groupKey] = {};
            grouped[groupKey][row[xField]] = parseNumeric(row[yField]);
        });

        let colorIdx = 0;
        for (const [key, valObj] of Object.entries(grouped)) {
            const values = labels.map(l => valObj[l] ?? null);
            if (values.some(v => v !== null)) {
                datasets.push(makeDataset(key, values, colorIdx++, defaultColor));
            }
        }
    } else {
        const values = labels.map(l => {
            const row = data.find(r => String(r[xField]) === l);
            return row ? parseNumeric(row[yField]) : null;
        });
        datasets.push(makeDataset(yField, values, 0, defaultColor, true));
    }

    return datasets.length ? { labels, datasets } : null;
}

// KOSIS 데이터 파싱 (여러 포맷 자동 감지)
function parseKosisData(data, meta, defaultColor) {
    const fields = meta.fields.filter(f => f && !f.startsWith('_'));

    const strategies = [
        () => parseWideColumns(data, fields, defaultColor),
        () => parseTimeRows(data, fields, defaultColor),
        () => parseLongFormat(data, fields, defaultColor)
    ];

    let best = null;
    let bestScore = 0;

    for (const strategy of strategies) {
        const result = strategy();
        if (!result) continue;
        const s = scoreParseResult(result);
        if (s > bestScore) {
            bestScore = s;
            best = result;
        }
    }

    if (!best) throw new Error('지원하지 않는 CSV 형식입니다. KOSIS에서 행렬을 세로로 전환했는지 확인해 주세요.');

    if (best.datasets.length === 1) {
        best.datasets[0].fill = true;
        best.datasets[0].borderColor = defaultColor;
        best.datasets[0].backgroundColor = defaultColor + '33';
    }

    return best;
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

function setupNavigation() {
    const mobileToggle = document.getElementById('nav-mobile-toggle');
    const mobileMenu = document.getElementById('nav-mobile-menu');

    mobileToggle?.addEventListener('click', () => {
        mobileMenu.classList.toggle('hidden');
    });

    document.querySelectorAll('#main-nav a, #bottom-nav a').forEach(link => {
        link.addEventListener('click', () => mobileMenu?.classList.add('hidden'));
    });

    const sections = ['intro', 'cpi', 'employment', 'quiz'].map(id => ({
        id,
        el: document.getElementById(id)
    })).filter(s => s.el);

    const updateActiveNav = () => {
        let current = sections[0].id;
        const scrollY = window.scrollY + 180;

        for (const section of sections) {
            if (section.el.offsetTop <= scrollY) current = section.id;
        }

        document.querySelectorAll('.nav-link, .bottom-nav-link').forEach(link => {
            const isActive = link.dataset.section === current;
            link.classList.toggle('active', isActive);
            if (link.classList.contains('nav-link') && link.dataset.section === 'quiz' && !isActive) {
                link.classList.remove('bg-yellow-400', 'text-indigo-900');
            } else if (link.classList.contains('nav-link') && link.dataset.section === 'quiz' && isActive) {
                link.classList.add('bg-yellow-400', 'text-indigo-900');
            }
        });
    };

    window.addEventListener('scroll', updateActiveNav, { passive: true });
    updateActiveNav();
}

document.addEventListener('DOMContentLoaded', () => {
    setupNavigation();

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
                    setupFilterSearch('emp-filter-search', 'emp-filter-checkboxes');

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
        const totalQuestions = 12;
        let wrongQuestions = [];
        
        // 문제 확인 함수
        const checkQuestion = (qName, qNumber, feedbackText) => {
            const allRadios = document.querySelectorAll(`input[name="${qName}"]`);
            if (!allRadios.length) return;
            const parentQuizItem = allRadios[0].closest('.quiz-item');
            
            // 기존 피드백 요소 찾기 또는 생성
            let feedbackDiv = parentQuizItem.querySelector('.quiz-feedback');
            if (!feedbackDiv) {
                feedbackDiv = document.createElement('div');
                feedbackDiv.className = 'quiz-feedback mt-4 p-4 rounded-lg text-sm font-bold hidden';
                parentQuizItem.appendChild(feedbackDiv);
            }

            const q = document.querySelector(`input[name="${qName}"]:checked`);
            
            // 클래스 초기화
            feedbackDiv.classList.remove('hidden', 'bg-emerald-100', 'text-emerald-700', 'bg-red-100', 'text-red-700', 'bg-gray-100', 'text-gray-700');

            if (q) {
                parentQuizItem.querySelectorAll('label').forEach(lbl => {
                    const inp = lbl.querySelector('input[type="radio"]');
                    if (!inp) return;
                    lbl.classList.remove('correct-answer', 'wrong-answer');
                    if (inp.value === 'correct') lbl.classList.add('correct-answer');
                    else if (inp.checked) lbl.classList.add('wrong-answer');
                });
                
                if (q.value === 'correct') {
                    score++;
                    feedbackDiv.classList.add('bg-emerald-100', 'text-emerald-700');
                    feedbackDiv.innerHTML = `✅ 정답입니다! <div class="font-normal mt-1 text-emerald-800">${feedbackText}</div>`;
                } else {
                    wrongQuestions.push(`${qNumber}번`);
                    feedbackDiv.classList.add('bg-red-100', 'text-red-700');
                    feedbackDiv.innerHTML = `❌ 틀렸습니다. <div class="font-normal mt-1 text-red-800"><strong>해설:</strong> ${feedbackText}</div>`;
                }
            } else {
                wrongQuestions.push(`${qNumber}번`);
                feedbackDiv.classList.add('bg-gray-200', 'text-gray-700');
                feedbackDiv.innerHTML = `⚠️ 문제를 풀지 않았습니다. <div class="font-normal mt-1 text-gray-800"><strong>해설:</strong> ${feedbackText}</div>`;
            }
        };

        checkQuestion('q1', 1, '소비자물가지수(CPI)는 가구가 소비생활을 유지하기 위해 구입하는 상품과 서비스의 가격 변동을 측정한 것입니다.');
        checkQuestion('q2', 2, '실업률은 (실업자 수 ÷ 경제활동인구) × 100 입니다.');
        checkQuestion('q3', 3, '인플레이션이 발생하면 화폐 가치가 떨어지므로 갚을 돈의 가치도 떨어져 채무자에게 유리해집니다.');
        checkQuestion('q4_1', '4-1', '2018년 지수를 기준 연도(2020년) 지수로 나누면 99.1 / 100.0 = 0.991배입니다.');
        checkQuestion('q4_2', '4-2', '2022년 지수를 기준 연도(2020년) 지수로 나누면 107.7 / 100.0 = 1.077배입니다.');
        checkQuestion('q5_1', '5-1', '3월의 실업률 분모는 경제활동인구(100명), 참가율과 고용률 분모는 15세 이상 인구(120명)입니다.');
        checkQuestion('q5_2', '5-2', '4월의 실업률 분모는 경제활동인구(90명)입니다.');
        checkQuestion('q5_3', '5-3', '4월의 고용률 분모는 15세 이상 인구(120명), 분자는 취업자 수(60명)입니다.');
        checkQuestion('q6', 6, '구직 단념자는 일할 능력은 있으나 의사가 없어진 상태이므로 비경제활동인구에 속합니다.');
        checkQuestion('q7', 7, '고용 지표를 계산할 때 노동 가능 인구는 "15세 이상 인구"를 기준으로 합니다.');
        checkQuestion('q8', 8, '실업률만 분모가 "경제활동인구"이고, 참가율과 고용률의 분모는 "15세 이상 인구"입니다.');
        checkQuestion('q9', 9, '실업자가 구직을 단념하면 경제활동인구(분모)와 실업자(분자)가 같이 줄어 실업률은 하락하지만, 취업자 수는 변함이 없어 고용률은 변함없습니다.');
        checkQuestion('q10', 10, '경제활동인구는 15세 이상 인구 중에서 일할 능력과 의사가 모두 있는 취업자와 실업자를 합한 것입니다.');

        // 결과 및 피드백 표시
        const resultDiv = document.getElementById('quiz-result');
        resultDiv.classList.remove('hidden');
        
        const finalScore = (score / totalQuestions) * 100;
        
        // 소수점 처리 (예: 91.666... -> 91.7)
        const displayScore = Number.isInteger(finalScore) ? finalScore : finalScore.toFixed(1);
        
        // 등급 판정 로직
        let gradeMessage = '';
        let gradeColor = '';
        if (score >= 8) {
            gradeMessage = '🏆 경제지표 해석 우수';
            gradeColor = 'text-emerald-600';
        } else if (score >= 5) {
            gradeMessage = '📚 공식과 개념 확인';
            gradeColor = 'text-blue-600';
        } else {
            gradeMessage = '💡 개념 복습 필요';
            gradeColor = 'text-red-600';
        }
        
        if (score === totalQuestions) {
            resultDiv.innerHTML = `<div class="mb-2">🎉 대단해요! ${displayScore}점 만점입니다! 💯</div>
                                   <div class="mb-4 text-2xl font-black ${gradeColor}">${gradeMessage}</div>
                                   <div class="text-sm font-normal text-emerald-700">모든 문제의 해설을 위에서 확인할 수 있습니다.</div>`;
            resultDiv.className = "mt-6 text-xl font-bold text-emerald-600 bg-emerald-50 p-6 rounded-xl text-center";
        } else {
            let feedbackHTML = `<div class="mb-2 text-purple-700">📝 ${displayScore}점 입니다.</div>
                                <div class="mb-4 text-2xl font-black ${gradeColor}">${gradeMessage}</div>`;
            feedbackHTML += `<div class="text-left text-sm text-gray-700 bg-white p-4 rounded border border-purple-200 mt-4">
                <h5 class="font-bold mb-2">💡 오답 노트</h5>
                <p class="mb-2 text-red-600 font-bold">틀린 문제 또는 안 푼 문제: ${wrongQuestions.join(', ')}</p>
                <p>각 문제 바로 아래에 표시된 <strong>해설(피드백)</strong>과 초록색으로 표시된 정답을 다시 한번 확인해보세요!</p>
            </div>`;
            
            resultDiv.innerHTML = feedbackHTML;
            resultDiv.className = "mt-6 text-xl font-bold bg-purple-50 p-6 rounded-xl text-center";
        }
    });

    // 분석 결과 캡처(이미지 저장) 기능
    const captureArea = (areaId, filename) => {
        const area = document.getElementById(areaId);
        if (!area) return;
        
        // html2canvas 호출
        html2canvas(area, {
            scale: 2, // 고화질 저장
            backgroundColor: '#ffffff' // 배경색 흰색 보장
        }).then(canvas => {
            const link = document.createElement('a');
            link.download = filename;
            link.href = canvas.toDataURL('image/png');
            link.click();
        });
    };

    // 이미지 저장 버튼 이벤트 리스너
    document.getElementById('cpi-save-btn')?.addEventListener('click', () => captureArea('cpi-capture-area', '소비자물가지수_분석결과.png'));
    document.getElementById('emp-save-btn')?.addEventListener('click', () => captureArea('emp-capture-area', '고용관련지표_분석결과.png'));
});
