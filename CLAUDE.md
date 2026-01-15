# CLAUDE.md

이 파일은 Claude Code (claude.ai/code)가 이 저장소에서 작업할 때 참고할 가이드를 제공합니다.

## 프로젝트 개요

DevKit은 개발자 도구 포트폴리오 프로젝트입니다 - 일반적인 개발 작업을 위한 웹 기반 유틸리티 모음입니다. Vue 3 + Vite로 구축된 웹 애플리케이션이며, 다양한 개발 도구를 제공합니다.

이 사이트는 6개 카테고리에 걸쳐 19개 이상의 도구를 제공합니다:
- String Utils (JSON/XML 포매팅, Base64, URL 인코딩, 대소문자 변환, diff 체커)
- SQL Tools (SQL 포매터, IN 절 생성기)
- API & Security (JWT 디코더, 해시 생성기, 비밀번호 생성기, UUID 생성기, QR 코드)
- Java Tools (스택 트레이스 분석기, YAML ↔ Properties 변환기)
- Network & API (HTTP 요청 빌더)
- Utilities (정규표현식 테스터, cron 표현식, 타임스탬프 변환기, 마크다운 미리보기)

## 개발 명령어

```bash
# 의존성 설치
npm install

# 개발 서버 (변경 사항 자동 리로드)
npm run dev

# 프로덕션 빌드
npm run build

# 프로덕션 빌드 로컬 미리보기
npm run preview

# 린트 및 자동 수정
npm run lint

# 코드 포맷팅
npm run format
```

## 아키텍처

### 애플리케이션 구조

사이드바 네비게이션을 갖춘 **Single Page Application (SPA)**:
- `src/App.vue` - 접을 수 있는 사이드바, 검색 바, 카테고리별 도구 네비게이션을 포함한 메인 레이아웃
- `src/router/index.js` - 모든 도구의 라우트 정의
- `src/views/` - 개별 도구 페이지 (각각 독립적인 컴포넌트)
- `src/assets/` - 전역 스타일 (다크 테마: #0f0f1e 배경, #6366f1 및 #a78bfa 강조색)

### 디자인 시스템

**전체 다크 테마:**
- Background: `#0f0f1e`
- Card background: `#1a1a2e`
- Borders: `#2d2d44`
- Primary accent: `#6366f1` (인디고)
- Secondary accent: `#a78bfa` (보라)
- Success: `#10b981` (초록)
- Warning: `#fbbf24` (노랑)
- Error: `#ef4444` (빨강)

**타이포그래피:**
- UI 텍스트: 시스템 폰트
- 코드/고정폭: 'Monaco', 'Menlo', 'Ubuntu Mono', 'Consolas'

### 도구 페이지 패턴

각 도구 뷰는 일관된 구조를 따릅니다:

```vue
<script setup>
// Vue 3 Composition API의 <script setup> 사용
// ref()와 computed()로 반응형 상태 관리
// 클라이언트 측 처리 또는 백엔드 API 호출
</script>

<template>
  <div class="tool-name">
    <!-- 페이지 헤더 -->
    <div class="page-header">
      <h1 class="page-title">도구 이름</h1>
      <p class="page-description">간단한 설명</p>
    </div>

    <!-- 컨트롤 (버튼) -->
    <div class="controls">...</div>

    <!-- 메인 콘텐츠 영역 -->
    <!-- 입력/출력 섹션, 옵션, 결과 -->
  </div>
</template>

<style scoped>
/* 다크 테마에 맞는 Scoped 스타일 */
/* 공통 클래스: .btn, .btn-primary, .btn-secondary 등 */
</style>
```

## 새 도구 추가하기

1. **뷰 컴포넌트 생성** - `src/views/` 폴더에 (예: `ToolNameView.vue`)
   - 일관된 UI를 위해 기존 도구를 템플릿으로 사용
   - 위의 도구 페이지 패턴 따르기
   - 도구 특성에 따라 클라이언트 측 처리 또는 백엔드 API 호출 구현
   - 일관된 버튼 스타일 사용: `.btn-primary`, `.btn-secondary`, `.btn-danger`, `.btn-success`

2. **라우트 추가** - `src/router/index.js`에:
   ```javascript
   {
     path: '/tool-name',
     name: 'tool-name',
     component: () => import('../views/ToolNameView.vue'),
   }
   ```

3. **네비게이션에 추가** - `src/App.vue`에:
   - `toolCategories` 배열에서 적절한 카테고리 찾기
   - 항목 추가: `{ name: 'Tool Name', path: '/tool-name' }`

4. **필요한 의존성 설치**:
   - `qrcode` - QR 코드 생성
   - `marked` - 마크다운 파싱
   - 특정 도구 기능에 필요한 다른 라이브러리 추가

## 주요 구현 세부사항

### 상태 관리
- **현재 Pinia 미사용** - 모든 상태는 Vue Composition API를 사용하여 컴포넌트 로컬로 관리
- Pinia는 설치되어 있지만 설정되지 않음; 도구 간 공유 상태가 필요한 경우 사용 고려

### 데이터 처리 아키텍처
- 대부분의 도구는 클라이언트 측에서 데이터를 처리 (프라이버시 중심)
- 일부 도구는 백엔드 RestAPI 통신을 사용하여 기능 제공
- 클라이언트 측 처리: Web API 활용 (`crypto.subtle`, `DOMParser`, `fetch` 등)
- 백엔드 API 통신: 필요한 경우 RestAPI 엔드포인트와 통신

### 라우터 설정
- HTML5 히스토리 모드 사용: `createWebHistory()`
- 코드 스플리팅을 위한 지연 로딩 라우트 (HomeView 제외)
- 성능을 위해 모든 도구 라우트는 동적 임포트 사용

### 스타일링 방식
- 각 컴포넌트에 **Scoped 스타일**
- `src/assets/main.css`의 전역 기본 스타일
- CSS 프레임워크 없음 - 전체 커스텀 스타일
- rem 단위를 사용한 일관된 간격 및 크기
- 모바일 중단점(일반적으로 768px)을 사용한 반응형 디자인

### 네비게이션 구조
도구는 `App.vue`에서 카테고리별로 구성됩니다:
```javascript
const toolCategories = [
  { name: 'Category', icon: '📝', tools: [{ name: 'Tool', path: '/path' }] }
]
```

## 중요 참고사항

- **디자인 목표**: 레퍼런스 사이트(kitd.kr)와 차별화 - 다크 테마 vs 라이트 테마, 사이드바 vs 그리드 레이아웃
- **로고**: "⚡ DevKit" 그라데이션 텍스트 효과, 클릭하면 홈으로 이동
- **사이드바**: 토글 버튼으로 접을 수 있으며, 아이콘이 있는 카테고리
- **코드 표시**: 고정폭 폰트 사용 및 구문에 적합한 색상 (성공은 초록, 경고는 노랑, 오류는 빨강)
