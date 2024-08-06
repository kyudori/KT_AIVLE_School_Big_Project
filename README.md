# Voice Verity 프로젝트

## 소개
KT AIVLE School AI Track 5기 빅(최종) 프로젝트


**Voice Verity**는 오디오 및 유튜브 영상의 음성을 분석하여 해당 음성이 Deep Fake Voice인지 Real Voice인지 판별하는 API 서비스입니다.
- 서비스 URL: http://voice-verity.com (현재는 서버 종료)
- [발표 영상(Full)](https://youtu.be/Ml-k_nT5-gs?feature=shared)
- [발표 영상(Short)](https://youtu.be/mp11_yAb4lg?feature=shared)
- [팀 인터뷰](https://youtu.be/9RefN1SSlWk?feature=shared)
- [발표 자료](https://github.com/kyudori/KT_AIVLE_School_Big_Project/blob/main/%EC%84%9C%EB%A5%98%20%EB%AA%A8%EC%9D%8C/7%EC%A3%BC%EC%B0%A8%20%EC%B5%9C%EC%A2%85%20%EC%B5%9C%EC%B6%9C%ED%8C%8C%EC%9D%BC/AI%208%EC%A1%B0%20%EB%B0%9C%ED%91%9C%EC%9E%90%EB%A3%8C.pdf)

## 맡은 역할
- **Backend**: 백 로직(기능) 구현
- **Frontend**: 웹 퍼블리싱(CSS)을 제외한 기능 구현, API 통합(백 통신), 예외 처리 개발
- **Server**: AWS EC2, S3 환경에서 배포 및 서비스가 서빙될 수 있도록 백/프론트 환경 셋팅

## 기술 스택
- **Backend**: Python 3.11.5, Django 5.0.6, MySQL 8.0.20
- **Frontend**: React 18.3.1 / Next.js 14.2.4, npm 10.8.1, Node.js 22.1.0

## 실행 방법
### 백엔드
```
cd backend
python manage.py runserver 0.0.0.0
```

### 프론트엔드
```
cd frontend
npm run dev
```


# 주요 기능

## 회원 관리
- **회원가입**: 사용자는 이메일, 비밀번호 등을 입력하여 회원가입을 할 수 있습니다.
- **로그인**: 이메일과 비밀번호로 로그인하여 토큰을 발급받습니다.
- **비밀번호 초기화**: 사용자는 비밀번호를 초기화할 수 있습니다.
- **회원 정보 조회 및 수정**: 사용자는 자신의 정보를 조회하고 수정할 수 있습니다.
- **회원 탈퇴**: 사용자는 계정을 삭제할 수 있습니다.

## 음성 분석
- **오디오 파일 업로드**: 사용자는 오디오 파일을 업로드하여 해당 음성이 Deep Fake Voice인지 Real Voice인지 분석할 수 있습니다.
- **분석 결과 조회**: 업로드된 오디오 파일의 분석 결과를 조회할 수 있습니다.

## 유튜브 영상 분석
- **유튜브 URL 업로드**: 사용자는 유튜브 영상의 URL을 업로드하여 해당 음성이 Deep Fake Voice인지 Real Voice인지 분석할 수 있습니다.
- **분석 결과 조회**: 업로드된 유튜브 영상의 분석 결과를 조회할 수 있습니다.

## 결제 및 구독 관리
- **구독 플랜 조회**: 사용자는 다양한 구독 플랜을 조회할 수 있습니다.
- **결제**: 카카오페이를 통해 구독 플랜을 결제할 수 있습니다.
- **구독 관리**: 현재 구독 중인 플랜을 조회하고 관리할 수 있습니다.

## API 키 관리
- **API 키 발급 및 조회**: 사용자는 API 키를 발급받고 조회할 수 있습니다.
- **API 키 재발급**: API 키를 재발급 받을 수 있습니다.
- **API 키 삭제**: API 키를 삭제할 수 있습니다.
- **API 키 상태 변경**: API 키의 활성화 상태를 변경할 수 있습니다.

## 크레딧 관리
- **크레딧 조회**: 사용자는 남은 크레딧을 조회할 수 있습니다.

## 게시판 기능
- **게시글 목록 조회 및 생성**: 게시판의 게시글을 조회하고 생성할 수 있습니다.
- **게시글 수정 및 삭제**: 게시글을 수정하고 삭제할 수 있습니다.
- **댓글 생성 및 관리**: 게시글에 댓글을 달고 관리할 수 있습니다.

## API 호출 기록
- **API 호출 기록 조회**: 사용자는 자신의 API 호출 기록을 조회할 수 있습니다.
- **API 호출 요약**: API 호출 횟수, 성공률 등의 요약 정보를 조회할 수 있습니다.
