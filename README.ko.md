[EN](README.md)|[KR](README.ko.md)
## BDSX: Minecraft Bedrock Dedicated Server + node.js!
![logo](icon.png)  
Minecraft Bedrock Dedicated Server를 [Node.js](https://nodejs.org/)와 같이 지원합니다.
* 지원 OS: 윈도우 & 리눅스(와인 필요)
* BDS에 모든 기능 기능 지원
*  Node.js에 모든 기능[(?)](https://github.com/karikera/bdsx/wiki/Available-NPM-Modules) 을 지원
* [Visual Studio Code로 디버그(에드온도 가능)](https://github.com/karikera/bdsx/wiki/Debug-with-VSCode)지원
* 다른 에드온 없이 스크립트 지원
* 채팅 불러오기&수정
```ts
import { chat } from 'bdsx';
chat.on(ev=>{
    ev.setMessage(ev.message.toUpperCase()+" YEY!");
});
```
* 네트워크 패킷 + IP 주소 및 XUID 불러오기
```ts
import { netevent, PacketId } from "bdsx";
netevent.after(PacketId.Login).on((ptr, networkIdentifier, packetId)=>{
    const ip = networkIdentifier.getAddress();
    const [xuid, username] = netevent.readLoginPacket(ptr);
    console.log(`${username}> IP=${ip}, XUID=${xuid}`);
});
```
* [커멘드 후킹](https://github.com/karikera/bdsx/wiki/Command-Hooking)!
* [DLL 호출](https://github.com/karikera/bdsx/wiki/Call-DLL-Directly)!

## 사용법
### 바로 실행
* 의존성
Wine(리눅스 한정)  
[Download Link](https://github.com/karikera/bdsx/releases/latest)

### NPM 모듈
* 의존성
[node.js](https://nodejs.org/)  
Wine(리눅스 한정)  
```sh
# BDSX 설치
npm i bdsx -g # 리눅스 사용시, 아마도 sudo가 필요
# BDSX 실행
bdsx example ./example # './example' 에 예시 프로젝트를 생성합니다.
bdsx ./example # BDSX를 './example'와 같이 실행합니다. 'path/package.json' 에 'main'을 읽습니다.
```

### 도커로 실행
```sh
docker run karikera/bdsx
```

## Build (Watch Mode)
Watch Mode에서 rollup/babel/typescript로 빌드합니다.
babel은 최신 문법을 es2015로 변환합니다. 그리고 이것은 소스를 적합하게 만듭니다.

* VSCode로 빌드
1. `bdsx`를 VSCode로 엽니다.
2. Ctrl + Shift + B
3. `tsc: watch`를 고릅니다.

* Command Line으로 비륻
1. `bdsx/` 를 명령 프롬프트로 엽니다
2. `npm run watch`를 실행합니다

## BDSX 위키(자바스크립트 레퍼런스 문서 포함)
https://github.com/karikera/bdsx/wiki

## 버그 리포트 / Q&A
https://github.com/karikera/bdsx/issues

## Q&A를 위한 디스코드(영문)
https://discord.gg/pC9XdkC

## 직접 빌드
* 의존성
[Visual Studio 2019](https://visualstudio.microsoft.com/)  
[Visual Studio Code](https://code.visualstudio.com/)  
[NASM](https://www.nasm.us/) & PATH 설정 필요 `node-chakracore`에 의해 필요합니다.  

1. BDSX 와 ken. 클론(개인 라이브러리 프로젝트)  
**[부모 폴더]**  
├ ken (https://github.com/karikera/ken)  
└ bdsx (https://github.com/karikera/bdsx)  

2. Git 서브모듈 업데이트.

3. bdsx.sln을 Visual Studio 2019로 빌드.

4. `bdsx/bdsx-node`를 Visual Studio Code로 빌드.그리고 `tsc watch` 선택.

5. `bdsx/bdsx-node` Visual Studio Code로 빌드. 그리고 `Package` 선택.  
 `bdsx/release-zip/bdsx-[version].zip`에 zip파일이 생성됩니다.
