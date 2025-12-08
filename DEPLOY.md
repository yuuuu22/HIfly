# 배포 가이드 (Deployment Guide)

이 프로젝트를 다른 사람에게 공유하기 위한 배포 방법입니다.

## 🚀 방법 1: Vercel 배포 (가장 추천)

### 1단계: GitHub에 코드 업로드

1. GitHub에서 새 저장소 생성 (https://github.com/new)
2. 터미널에서 다음 명령어 실행:

```bash
# Git 초기화 (아직 안 했다면)
git init
git add .
git commit -m "Initial commit"

# GitHub 저장소와 연결 (YOUR_USERNAME과 YOUR_REPO_NAME을 실제 값으로 변경)
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git
git branch -M main
git push -u origin main
```

### 2단계: Vercel 배포

1. https://vercel.com 접속
2. "Sign Up" 또는 "Log In" (GitHub 계정으로 로그인)
3. "Add New Project" 클릭
4. 방금 만든 GitHub 저장소 선택
5. 프로젝트 설정:
   - **Framework Preset**: Vite (자동 감지됨)
   - **Build Command**: `npm run build` (자동 설정됨)
   - **Output Directory**: `dist` (자동 설정됨)
6. "Deploy" 클릭
7. 배포 완료 후 공유 가능한 링크 제공됨 (예: `https://your-project.vercel.app`)

✅ **장점**: 
- 완전 무료
- 자동 HTTPS
- GitHub에 푸시하면 자동 재배포
- 전 세계 CDN으로 빠른 속도

---

## 🌐 방법 2: Netlify 배포

### 1단계: GitHub에 코드 업로드 (위와 동일)

### 2단계: Netlify 배포

1. https://netlify.com 접속
2. "Sign up" 또는 "Log in" (GitHub 계정으로 로그인)
3. "Add new site" → "Import an existing project"
4. GitHub 저장소 선택
5. 빌드 설정:
   - **Build command**: `npm run build`
   - **Publish directory**: `dist`
6. "Deploy site" 클릭
7. 배포 완료 후 공유 가능한 링크 제공됨 (예: `https://your-project.netlify.app`)

---

## ⚡ 방법 3: 빠른 테스트용 (ngrok - 임시 공유)

로컬에서 실행 중인 개발 서버를 임시로 공개하고 싶을 때 사용합니다.

### 설치 및 사용

1. ngrok 설치:
```bash
# macOS
brew install ngrok

# 또는 https://ngrok.com/download 에서 다운로드
```

2. 개발 서버 실행:
```bash
npm run dev
```

3. 다른 터미널에서 ngrok 실행:
```bash
ngrok http 5173
```

4. ngrok이 제공하는 공개 URL을 공유 (예: `https://xxxx-xx-xx-xx-xx.ngrok-free.app`)

⚠️ **주의**: 
- 개발 서버가 실행 중일 때만 접근 가능
- 무료 버전은 URL이 자주 변경됨
- 프로덕션 배포에는 권장하지 않음

---

## 📝 배포 전 체크리스트

- [ ] `package.json`의 프로젝트 이름과 버전 확인
- [ ] 환경 변수가 있다면 Vercel/Netlify에 설정 추가
- [ ] 빌드 테스트: `npm run build` 실행 후 오류 확인
- [ ] 로컬 프리뷰: `npm run preview`로 빌드 결과 확인

---

## 🔄 업데이트 배포

코드를 수정한 후:

1. GitHub에 푸시:
```bash
git add .
git commit -m "Update features"
git push
```

2. Vercel/Netlify가 자동으로 재배포합니다 (보통 1-2분 소요)

---

## 💡 추천

**프로덕션 배포**: Vercel (가장 간단하고 빠름)
**빠른 테스트**: ngrok (로컬 서버 임시 공개)

