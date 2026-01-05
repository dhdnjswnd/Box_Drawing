# 3D Box Visualizer

React + TypeScript + Three.js를 활용한 현대적인 3D 박스 그리기 및 시각화 웹 애플리케이션입니다.

## 🚀 기술 스택

- **React 18**: 컴포넌트 기반 UI 프레임워크
- **TypeScript**: 타입 안정성과 개발 경험 향상
- **Three.js**: 3D 렌더링 라이브러리
- **Vite**: 빠른 빌드 도구
- **Context API**: 전역 상태 관리

## 주요 기능

### 1. 박스 관리
- ✅ 박스 추가/삭제
- ✅ 박스 선택 및 정보 확인
- ✅ 박스 드래그 앤 드롭으로 이동

### 2. 박스 속성 편집
- ✅ Width, Height, Depth 수치 조정
- ✅ X, Y, Z 위치 직접 수정
- ✅ 실시간 Volume 및 Surface Area 계산

### 3. 스냅 기능
- ✅ 그리드 스냅: 박스가 그리드에 맞춰 정렬
- ✅ 박스 간 스냅: 박스끼리 가까워지면 자동으로 붙음

### 4. 색상 필터 시스템
- ✅ Volume: 부피에 따른 색상
- ✅ Height: 높이에 따른 색상
- ✅ Surface Area: 표면적에 따른 색상
- ✅ Position: 원점으로부터의 거리에 따른 색상

### 5. 멀티 캔버스
- ✅ 여러 개의 3D 뷰포트 동시 사용
- ✅ 각 캔버스마다 독립적인 씬 관리
- ✅ 상단 TAB으로 캔버스 간 빠른 전환
- ✅ TAB 이름 더블클릭으로 캔버스 이름 변경

### 6. 데이터 관리
- ✅ Export Data: 모든 캔버스와 박스 데이터를 JSON 파일로 저장
- ✅ Import Data: JSON 파일에서 데이터 불러오기

## 설치 및 실행

### 필수 요구사항
- Node.js 16.0 이상

### 설치
```bash
npm install
```

### 개발 서버 실행
```bash
npm run dev
```

### 빌드
```bash
npm run build
```

## 사용법

### 캔버스 관리
- **새 캔버스 추가**: 상단의 "+ New Canvas" 버튼 클릭
- **캔버스 전환**: 상단 TAB 클릭
- **캔버스 이름 변경**: TAB 이름을 더블클릭하여 수정
- **캔버스 닫기**: TAB의 × 버튼 클릭

### 박스 추가
1. 원하는 캔버스 TAB을 클릭하여 활성화합니다.
2. "+ Add Box" 버튼을 클릭하여 박스를 추가합니다.

### 박스 이동
- 박스를 클릭하고 드래그하여 원하는 위치로 이동합니다.
- 박스는 자동으로 그리드에 스냅됩니다.
- 다른 박스에 가까이 가면 자동으로 붙습니다.

### 박스 수정
1. 박스를 클릭하여 선택합니다.
2. 우측 패널에서 Width, Height, Depth 값을 수정합니다.
3. Position 값을 직접 입력하여 정확한 위치로 이동할 수 있습니다.

### 색상 필터 변경
- 우측 패널의 "Color Filters"에서 원하는 필터를 선택합니다.
- 모든 박스의 색상이 선택한 기준에 따라 자동으로 변경됩니다.

### 3D 뷰 조작
- **회전**: 마우스 왼쪽 버튼 드래그
- **이동**: 마우스 오른쪽 버튼 드래그
- **줌**: 마우스 휠

### 데이터 저장 및 불러오기
- **Export Data**: 상단의 "Export Data" 버튼을 클릭하여 현재 작업을 JSON 파일로 저장합니다.
- **Import Data**: 상단의 "Import Data" 버튼을 클릭하여 이전에 저장한 JSON 파일을 불러옵니다.
- 저장된 파일에는 모든 캔버스, 박스 정보, 색상 필터 설정이 포함됩니다.

## 📁 프로젝트 구조

```
src/
├── components/          # React 컴포넌트
│   ├── Header.tsx      # 헤더 및 메인 액션 버튼
│   ├── CanvasTabs.tsx  # 캔버스 탭 시스템
│   ├── Canvas3DView.tsx # Three.js 3D 뷰
│   ├── MainContent.tsx  # 메인 컨텐츠 레이아웃
│   ├── SidePanel.tsx    # 사이드 패널
│   ├── PropertiesPanel.tsx # 박스 속성 편집
│   └── ColorFilters.tsx    # 색상 필터
├── context/            # Context API
│   └── AppContext.tsx  # 전역 상태 관리
├── types/              # TypeScript 타입 정의
│   └── index.ts
├── App.tsx             # 메인 앱 컴포넌트
├── App.css             # 스타일
└── main.tsx            # 엔트리 포인트
```

## 🎨 주요 기능

### Type-Safe Development
- TypeScript로 작성되어 타입 안정성 보장
- 컴파일 타임 에러 감지
- 우수한 IDE 지원 및 자동 완성

### React Architecture
- 컴포넌트 기반 모듈화
- Context API를 통한 효율적인 상태 관리
- React Hooks를 활용한 사이드 이펙트 관리

### Performance
- Vite의 빠른 HMR (Hot Module Replacement)
- 최적화된 빌드
- Three.js를 활용한 효율적인 3D 렌더링

## 📝 개발 가이드

### 컴포넌트 추가
새로운 컴포넌트는 `src/components/` 디렉토리에 추가하세요.

### 타입 정의
타입은 `src/types/index.ts`에 정의되어 있으며, 필요시 확장할 수 있습니다.

### 상태 관리
전역 상태는 `src/context/AppContext.tsx`에서 관리됩니다.

## 🔧 트러블슈팅

### Three.js 타입 에러
Three.js 타입이 없다는 에러가 발생하면:
```bash
npm install --save-dev @types/three
```

### Vite 빌드 에러
캐시를 삭제하고 다시 빌드:
```bash
rm -rf node_modules/.vite
npm run dev
```

## 🤝 기여하기

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 라이선스
MIT
