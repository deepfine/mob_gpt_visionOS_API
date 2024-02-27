FROM node:16.15.1

# 컨테이너에 워킹 디렉토리를 생성하여 소스코드 분리
WORKDIR /home/deepfine/app

# npm install의 정상 수행을 위해, 그전에 컨테이너 내부에 패키지 모듈 파일 복사
COPY package.json ./

# ENV PATH /home/deepfine/app/node_modules/.bin:$PATH

# 도커 서버가 수행할 커맨드 추가
RUN npm install

# package.json 외의 다른 파일들도 복사 (index.js가 없으면 cmd 명령어 수행 불가함)
# COPY를 두 부분으로 구분해둔 이유: 효율적인 재빌드 목적
COPY ./ ./

# 컨테이너가 실행될 때 1번만 수행되는 {시작 명령어} 자리에 들어갈 커맨드
CMD ["node", "index.js"]

# wait-for-it.sh
# COPY wait-for-it.sh ./
# RUN chmod +x wait-for-it.sh

# Docker Demon Port Mapping
# EXPOSE 3000