# 쇼핑몰 가계부 설정 가이드

## 1. Notion 데이터베이스 설정

### 1-1. Notion Integration 생성
1. https://www.notion.so/my-integrations 접속
2. "새 통합" 클릭
3. 이름: `shop-finance` 입력 후 제출
4. **Internal Integration Token** 복사 → `.env.local`의 `NOTION_API_KEY`에 붙여넣기

### 1-2. 수입/지출 데이터베이스 생성
Notion에서 새 페이지를 만들고 아래 속성으로 **데이터베이스**를 생성하세요:

| 속성명 | 유형 |
|--------|------|
| 내용 | 제목(Title) |
| 날짜 | 날짜(Date) |
| 유형 | 선택(Select): `수입`, `지출` |
| 카테고리 | 선택(Select): `상품판매`, `환불수입`, `기타수입`, `상품매입`, `배송비`, `광고비`, `플랫폼수수료`, `포장재`, `인건비`, `임대료`, `기타지출` |
| 금액 | 숫자(Number) |
| 플랫폼 | 선택(Select): `스마트스토어`, `쿠팡`, `11번가`, `G마켓`, `옥션`, `카카오쇼핑`, `자사몰`, `기타` |
| 메모 | 텍스트(Text) |

→ 데이터베이스 URL에서 ID 복사 → `NOTION_TRANSACTIONS_DB_ID`

### 1-3. 플랫폼 매출 데이터베이스 생성
새 Notion 데이터베이스 생성:

| 속성명 | 유형 |
|--------|------|
| 플랫폼 | 선택(Select): `스마트스토어`, `쿠팡`, `11번가`, `G마켓`, `옥션`, `카카오쇼핑`, `자사몰`, `기타` |
| 날짜 | 날짜(Date) |
| 매출액 | 숫자(Number) |
| 주문수 | 숫자(Number) |
| 반품금액 | 숫자(Number) |
| 수수료 | 숫자(Number) |
| 메모 | 텍스트(Text) |

→ 데이터베이스 URL에서 ID 복사 → `NOTION_PLATFORM_SALES_DB_ID`

### 1-4. Integration에 데이터베이스 공유
각 데이터베이스 페이지 우상단 `···` → `연결` → `shop-finance` 통합 추가

### 1-5. 데이터베이스 ID 찾는 법
데이터베이스 URL 형태: `https://notion.so/username/[DATABASE_ID]?v=...`
- URL에서 `?v=` 앞의 32자리 문자열이 Database ID

---

## 2. 로컬 개발 환경

```bash
# 프로젝트 폴더로 이동
cd shop-finance

# 의존성 설치
npm install

# 환경 변수 설정
cp .env.local.example .env.local
# .env.local 파일을 열어 Notion API Key와 DB ID 입력

# 개발 서버 실행
npm run dev
```

브라우저에서 http://localhost:3000 접속

---

## 3. Vercel 배포

```bash
# Vercel CLI 설치 (최초 1회)
npm install -g vercel

# 배포
vercel

# 환경 변수 등록 (Vercel 대시보드 또는 CLI)
vercel env add NOTION_API_KEY
vercel env add NOTION_TRANSACTIONS_DB_ID
vercel env add NOTION_PLATFORM_SALES_DB_ID

# 프로덕션 배포
vercel --prod
```

또는 GitHub 연동 후 Vercel 대시보드에서 자동 배포 설정

**환경 변수 등록 위치:** Vercel 프로젝트 → Settings → Environment Variables

---

## 4. 기능 안내

| 페이지 | 기능 |
|--------|------|
| 대시보드 | 순이익, 마진율, 플랫폼별 매출 파이차트, 월별 수입/지출 차트, 최근 거래 |
| 수입/지출 | 거래 추가/수정/삭제, 기간/유형 필터, 검색 |
| 플랫폼 매출 | 플랫폼별 매출 입력(매출액/주문수/반품/수수료), 순매출 자동계산 |
| 통계/리포트 | 월별 추이, 레이더 차트, 플랫폼별 상세 표, 카테고리별 지출 분석 |
