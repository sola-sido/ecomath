// 이 파일을 복사해서 config.js 로 저장한 뒤, 본인의 Google API 키를 넣으세요.
// config.js 는 GitHub에 올리지 마세요! (.gitignore에 포함됨)

window.ECOMATH_CONFIG = {
    // Google AI Studio (https://aistudio.google.com/apikey) 에서 발급
    // Google AI Studio 키: AIza... (기존) 또는 AQ.... (신규) 모두 지원
    geminiApiKey: '여기에_Google_API_키_입력',

    // 사용할 Gemini 모델 (기본: gemini-1.5-flash — 빠르고 저렴)
    geminiModel: 'gemini-2.5-flash-lite'
};
