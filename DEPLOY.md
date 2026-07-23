# Vercel API 연결

## 1. 환경변수 등록

Vercel 프로젝트의 `Settings > Environment Variables`에 다음 값을 등록합니다.

```text
SEOUL_API_KEY=서울 열린데이터광장에서 발급받은 키
```

Production, Preview, Development 환경에 모두 적용한 뒤 다시 배포합니다.

기존 키는 프론트엔드 코드와 Git 기록에 노출된 적이 있으므로 가능하면 새 키를 발급받아 사용합니다.

## 2. 배포 후 확인

아래 주소에서 JSON이 표시되는지 확인합니다.

```text
https://배포주소/api/seoul?dataset=arrival&start=1&end=5
```

정상 응답이 확인되면 앱에서 역 상세 페이지의 도착 정보, 편의시설, 역 정보와 대피 안내를 확인합니다.

## 3. 로컬에서 API까지 실행

Vite 개발 서버만 실행하면 Vercel 함수가 실행되지 않습니다. API까지 함께 확인할 때는 프로젝트 루트에서 다음 명령을 사용합니다.

```bash
npx vercel dev
```
