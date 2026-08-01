---
title: "(GPT요약) SSH 세팅"
date: 2026-07-29
categories:
  - CS
tags:
  - OpenSSH
---

# WSL2 Ubuntu를 SSH 서버로 설정하고 VS Code Remote SSH로 접속하기

Windows 11에 설치된 WSL2 Ubuntu를 SSH 서버로 구성하고, Mac이나 다른 PC에서 공개키 인증을 이용해 접속하는 방법을 정리한다.

최종 구성은 다음과 같다.

```text
클라이언트 PC
├── 개인키: ~/.ssh/id_ed25519
└── 공개키: ~/.ssh/id_ed25519.pub
          │
          │ SSH
          ▼
Windows 호스트의 LAN IP:22
└── WSL2 Mirrored Networking
    └── Ubuntu
        └── OpenSSH Server
            └── /home/bean/.ssh/authorized_keys
```

> 개인키는 클라이언트 PC에 보관하고, 공개키만 WSL 서버의 `authorized_keys`에 등록한다.

---

## 1. 사용 환경

이번 설정에서 사용한 환경은 다음과 같다.

```text
호스트 운영체제 : Windows 11
WSL 배포판     : Ubuntu 24.04 LTS
WSL 사용자     : bean
WSL hostname   : LABEAN
SSH 포트       : 22
네트워크 방식  : Mirrored Networking
클라이언트     : Mac 또는 다른 Windows PC
```

PowerShell에서 WSL 버전을 확인한다.

```powershell
wsl --version
```

설치된 배포판과 WSL 버전을 확인한다.

```powershell
wsl -l -v
```

정상적인 예시는 다음과 같다.

```text
  NAME      STATE           VERSION
* Ubuntu    Running         2
```

---

# 2. WSL hostname 설정

WSL을 처음 설치하면 프롬프트가 다음과 같이 표시될 수 있다.

```text
bean@DESKTOP-XXXXXXX:~$
```

각 항목의 의미는 다음과 같다.

```text
bean               : Ubuntu 사용자 이름
DESKTOP-XXXXXXX    : WSL hostname
~                  : 현재 사용자의 홈 디렉터리
```

hostname을 `LABEAN`으로 변경하려면 WSL에서 다음 파일을 연다.

```bash
sudo nano /etc/wsl.conf
```

다음 내용을 작성한다.

```ini
[network]
hostname=LABEAN
```

시스템에서 `systemd`도 사용할 예정이라면 다음과 같이 작성할 수 있다.

```ini
[boot]
systemd=true

[network]
hostname=LABEAN
```

파일을 저장한 후 Windows PowerShell에서 WSL을 완전히 종료한다.

```powershell
wsl --shutdown
```

다시 WSL을 실행한다.

```powershell
wsl
```

hostname을 확인한다.

```bash
hostname
```

예상 결과:

```text
LABEAN
```

프롬프트도 다음처럼 변경된다.

```text
bean@LABEAN:~$
```

---

# 3. WSL2 네트워크를 Mirrored 모드로 설정

WSL2 기본 NAT 네트워크에서는 외부 PC가 Windows 호스트의 IP를 통해 WSL 서비스에 직접 접근하기 어려울 수 있다.

이를 단순화하기 위해 Mirrored Networking을 사용한다.

Windows 사용자 폴더에 다음 파일을 만든다.

```text
C:\Users\<Windows 사용자 이름>\.wslconfig
```

예:

```text
C:\Users\bean\.wslconfig
```

파일 내용은 다음과 같다.

```ini
[wsl2]
networkingMode=mirrored
```

저장 후 PowerShell에서 WSL을 완전히 종료한다.

```powershell
wsl --shutdown
```

그다음 WSL을 다시 실행한다.

```powershell
wsl
```

## `shutdown now`와 `wsl --shutdown`의 차이

WSL 내부에서 실행하는 다음 명령은 Ubuntu만 종료한다.

```bash
sudo shutdown now
```

반면 Windows PowerShell에서 실행하는 다음 명령은 WSL 가상 머신과 네트워크 설정을 완전히 다시 시작한다.

```powershell
wsl --shutdown
```

따라서 `.wslconfig`를 수정한 경우에는 반드시 PowerShell에서 `wsl --shutdown`을 실행해야 한다.

---

# 4. 기존 Port Proxy 설정 제거

Mirrored Networking을 사용하는 경우 일반적으로 `netsh portproxy`를 함께 사용할 필요가 없다.

이전에 Port Proxy를 설정했다면 PowerShell을 관리자 권한으로 열고 현재 설정을 확인한다.

```powershell
netsh interface portproxy show all
```

22번 포트에 설정된 Port Proxy를 제거하려면 다음 명령을 실행한다.

```powershell
netsh interface portproxy delete v4tov4 listenaddress=0.0.0.0 listenport=22
```

다시 확인한다.

```powershell
netsh interface portproxy show all
```

출력이 없다면 Port Proxy가 제거된 것이다.

> Mirrored Networking과 Port Proxy를 동시에 설정하면 어떤 경로를 통해 SSH가 전달되는지 파악하기 어려워질 수 있다.

---

# 5. OpenSSH Server 설치

WSL에서 SSH 클라이언트 버전을 확인한다.

```bash
ssh -V
```

이 명령은 SSH 클라이언트가 설치되어 있는지만 확인한다.

WSL을 SSH 서버로 사용하려면 `openssh-server`를 별도로 설치해야 한다.

```bash
sudo apt update
sudo apt install openssh-server -y
```

설치 여부를 확인한다.

```bash
dpkg -l | grep openssh-server
```

정상적으로 설치되었다면 `openssh-server` 패키지가 표시된다.

---

# 6. SSH 서비스 시작

다음 명령으로 SSH 서비스를 시작한다.

```bash
sudo service ssh start
```

상태를 확인한다.

```bash
sudo service ssh status
```

또는 `systemd`를 사용하고 있다면 다음 명령을 사용할 수 있다.

```bash
sudo systemctl enable --now ssh
```

상태 확인:

```bash
sudo systemctl status ssh
```

`active (running)`이 표시되면 정상이다.

---

# 7. SSH가 22번 포트에서 대기 중인지 확인

다음 명령으로 SSH 서버가 22번 포트에서 대기 중인지 확인한다.

```bash
sudo ss -tlnp | grep ':22'
```

정상적인 예시는 다음과 같다.

```text
LISTEN 0 128 0.0.0.0:22 0.0.0.0:*
LISTEN 0 128    [::]:22    [::]:*
```

의미는 다음과 같다.

```text
0.0.0.0:22 : 모든 IPv4 인터페이스에서 SSH 연결 허용
[::]:22    : 모든 IPv6 인터페이스에서 SSH 연결 허용
```

---

# 8. WSL 내부에서 SSH 접속 테스트

외부 접속을 시도하기 전에 WSL 내부에서 SSH 서버가 정상적으로 작동하는지 확인한다.

```bash
ssh bean@localhost
```

처음 접속하면 다음과 같은 메시지가 표시될 수 있다.

```text
Are you sure you want to continue connecting (yes/no/[fingerprint])?
```

다음을 입력한다.

```text
yes
```

비밀번호를 입력하여 접속할 수 있다면 SSH 서버 자체는 정상적으로 실행 중이다.

접속을 종료하려면 다음 명령을 실행한다.

```bash
exit
```

---

# 9. Windows 호스트 IP 확인

외부 PC에서는 WSL 내부 IP가 아니라 Windows 호스트의 LAN IP로 접속한다.

Windows PowerShell 또는 CMD에서 다음 명령을 실행한다.

```powershell
ipconfig
```

사용 중인 네트워크 어댑터의 IPv4 주소를 확인한다.

예:

```text
IPv4 Address. . . . . . . . . . . : 192.168.0.20
```

이후 문서에서는 이 주소를 다음처럼 표기한다.

```text
<WINDOWS_HOST_IP>
```

실제 명령을 실행할 때는 꺾쇠 없이 실제 IP를 입력한다.

예:

```bash
ssh bean@192.168.0.20
```

---

# 10. Windows 방화벽에서 22번 포트 허용

외부 PC에서 접속할 수 있도록 Windows 방화벽에서 TCP 22번 포트를 허용한다.

관리자 권한 PowerShell에서 다음 명령을 실행한다.

```powershell
New-NetFirewallRule `
  -DisplayName "WSL SSH" `
  -Direction Inbound `
  -Protocol TCP `
  -LocalPort 22 `
  -Action Allow
```

등록된 규칙을 확인한다.

```powershell
Get-NetFirewallRule -DisplayName "WSL SSH"
```

규칙을 제거하려면 다음 명령을 사용한다.

```powershell
Remove-NetFirewallRule -DisplayName "WSL SSH"
```

> 보안을 위해 가능하다면 공용 네트워크보다 개인 네트워크에서만 SSH를 허용하는 것이 좋다.

---

# 11. 외부 PC에서 포트 연결 확인

## Mac/Linux 클라이언트

```bash
nc -vz <WINDOWS_HOST_IP> 22
```

예:

```bash
nc -vz 192.168.0.20 22
```

정상이라면 다음과 비슷한 결과가 나온다.

```text
Connection to 192.168.0.20 port 22 [tcp/ssh] succeeded!
```

## Windows 클라이언트

PowerShell에서 다음 명령을 실행한다.

```powershell
Test-NetConnection <WINDOWS_HOST_IP> -Port 22
```

정상이라면 다음 값이 표시된다.

```text
TcpTestSucceeded : True
```

---

# 12. 외부 PC에서 비밀번호로 SSH 접속 테스트

클라이언트 PC에서 다음 명령을 실행한다.

```bash
ssh bean@<WINDOWS_HOST_IP>
```

예:

```bash
ssh bean@192.168.0.20
```

22번 포트를 명시하려면 다음과 같이 실행한다.

```bash
ssh -p 22 bean@192.168.0.20
```

비밀번호를 입력하여 접속할 수 있다면 다음 항목들이 정상인 것이다.

```text
WSL SSH 서버
WSL Mirrored Networking
Windows 방화벽
외부 PC와 Windows 호스트 간 네트워크
```

---

# 13. 클라이언트에서 SSH 키 생성

비밀번호 없이 안전하게 접속하기 위해 클라이언트 PC에서 SSH 키를 생성한다.

Mac 또는 Linux 클라이언트에서 다음 명령을 실행한다.

```bash
ssh-keygen -t ed25519
```

기본 경로를 사용할 경우 Enter를 누른다.

```text
Enter file in which to save the key:
```

기본 생성 위치:

```text
~/.ssh/id_ed25519
~/.ssh/id_ed25519.pub
```

두 파일의 역할은 다음과 같다.

```text
id_ed25519      : 개인키, 클라이언트 PC에만 보관
id_ed25519.pub  : 공개키, WSL 서버에 등록
```

## 주의

다음 개인키는 절대 외부에 공개하면 안 된다.

```text
~/.ssh/id_ed25519
```

다음 공개키는 서버에 등록하거나 공유해도 된다.

```text
~/.ssh/id_ed25519.pub
```

---

# 14. 생성된 공개키 확인

클라이언트 PC에서 다음 명령을 실행한다.

```bash
cat ~/.ssh/id_ed25519.pub
```

정상적인 ED25519 공개키는 한 줄로 출력된다.

```text
ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAI... bean@client
```

구조는 다음과 같다.

```text
ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAI... bean@client
│           │                              │
│           │                              └─ comment, 선택 사항
│           └─ Base64 형식 공개키 데이터
└─ 키 알고리즘
```

---

# 15. 공개키를 WSL 서버에 등록

## 방법 1. `ssh-copy-id` 사용

클라이언트에서 다음 명령을 실행한다.

```bash
ssh-copy-id -i ~/.ssh/id_ed25519.pub bean@<WINDOWS_HOST_IP>
```

포트까지 명시하려면 다음과 같이 실행한다.

```bash
ssh-copy-id -i ~/.ssh/id_ed25519.pub -p 22 bean@<WINDOWS_HOST_IP>
```

서버 비밀번호를 입력하면 공개키가 다음 파일에 추가된다.

```text
/home/bean/.ssh/authorized_keys
```

## 방법 2. 수동으로 등록

클라이언트에서 공개키를 출력한다.

```bash
cat ~/.ssh/id_ed25519.pub
```

출력된 한 줄 전체를 복사한다.

WSL 서버에서 `.ssh` 디렉터리를 만든다.

```bash
mkdir -p ~/.ssh
```

`authorized_keys` 파일을 연다.

```bash
nano ~/.ssh/authorized_keys
```

복사한 공개키를 한 줄 그대로 붙여 넣는다.

예:

```text
ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAI... bean@Mac-mini
```

저장 후 종료한다.

---

# 16. `authorized_keys` 파일 형식

`authorized_keys`의 기본 형식은 다음과 같다.

```text
[옵션] 키-타입 공개키-데이터 [comment]
```

일반적인 ED25519 키:

```text
ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAI... bean@Mac-mini
```

여러 클라이언트를 등록할 때는 한 줄에 하나씩 추가한다.

```text
ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAI... bean@Mac-mini
ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAI... bean@MacBook
ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAI... bean@Desktop
```

## 올바르지 않은 예시

개인키를 넣으면 안 된다.

```text
-----BEGIN OPENSSH PRIVATE KEY-----
...
-----END OPENSSH PRIVATE KEY-----
```

공개키 중간에 줄바꿈이 들어가면 안 된다.

```text
ssh-ed25519 AAAAC3NzaC1lZDI1NTE5
AAAAIxxxxxxxxxxxxxxxxxxxx
bean@Mac
```

다음처럼 한 줄이어야 한다.

```text
ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAIxxxxxxxxxxxxxxxxxxxx bean@Mac
```

Windows에서 복사한 파일에 CRLF 문자가 들어갔다면 다음 명령으로 제거할 수 있다.

```bash
sed -i 's/\r$//' ~/.ssh/authorized_keys
```

---

# 17. 서버의 SSH 파일 권한 설정

OpenSSH는 `.ssh` 디렉터리나 `authorized_keys`의 권한이 너무 넓으면 보안을 위해 공개키 인증을 거부할 수 있다.

WSL에서 다음 명령을 실행한다.

```bash
chmod 700 ~/.ssh
chmod 600 ~/.ssh/authorized_keys
chown -R bean:bean ~/.ssh
```

권한을 확인한다.

```bash
ls -ld ~/.ssh
ls -l ~/.ssh/authorized_keys
```

정상적인 예:

```text
drwx------ 2 bean bean 4096 Jul 29 20:00 /home/bean/.ssh
-rw------- 1 bean bean  100 Jul 29 20:00 /home/bean/.ssh/authorized_keys
```

---

# 18. 클라이언트 개인키 권한 설정

Mac 또는 Linux 클라이언트에서 다음 명령을 실행한다.

```bash
chmod 700 ~/.ssh
chmod 600 ~/.ssh/id_ed25519
chmod 644 ~/.ssh/id_ed25519.pub
```

SSH 설정 파일을 사용한다면 다음 권한도 설정한다.

```bash
chmod 600 ~/.ssh/config
```

---

# 19. SSH Agent에 개인키 등록

SSH Agent에 키를 등록하려면 `.pub` 파일이 아니라 개인키를 사용해야 한다.

올바른 명령:

```bash
ssh-add ~/.ssh/id_ed25519
```

잘못된 명령:

```bash
ssh-add ~/.ssh/id_ed25519.pub
```

등록된 키를 확인한다.

```bash
ssh-add -l
```

다만 SSH 설정에서 `IdentityFile`을 직접 지정한다면 `ssh-add`를 사용하지 않아도 접속할 수 있다.

---

# 20. 공개키 인증 테스트

클라이언트에서 개인키를 직접 지정하여 접속한다.

```bash
ssh -i ~/.ssh/id_ed25519 bean@<WINDOWS_HOST_IP>
```

다른 키를 사용하지 못하도록 강제하려면 다음과 같이 실행한다.

```bash
ssh \
  -i ~/.ssh/id_ed25519 \
  -o IdentitiesOnly=yes \
  bean@<WINDOWS_HOST_IP>
```

비밀번호를 묻지 않고 접속되면 공개키 인증이 성공한 것이다.

공개키 인증만 허용하여 테스트할 수도 있다.

```bash
ssh \
  -o PreferredAuthentications=publickey \
  -o PasswordAuthentication=no \
  -i ~/.ssh/id_ed25519 \
  bean@<WINDOWS_HOST_IP>
```

---

# 21. SSH Config 설정

매번 IP, 사용자 이름, 포트, 키 경로를 입력하지 않으려면 클라이언트의 SSH 설정 파일을 사용한다.

Mac 또는 Linux:

```text
~/.ssh/config
```

Windows:

```text
C:\Users\<사용자 이름>\.ssh\config
```

설정 예시는 다음과 같다.

```sshconfig
Host labean
    HostName 192.168.0.20
    Port 22
    User bean
    IdentityFile ~/.ssh/id_ed25519
    IdentitiesOnly yes
```

각 항목의 의미는 다음과 같다.

```text
Host           : 접속할 때 사용할 별칭
HostName       : 실제 Windows 호스트 IP
Port           : SSH 포트
User           : WSL 사용자 이름
IdentityFile   : 클라이언트 개인키 경로
IdentitiesOnly : 지정한 키만 인증에 사용
```

## 주의

다음처럼 `<ip>`를 그대로 작성하면 안 된다.

```sshconfig
HostName <ip>
```

실제 IP를 꺾쇠 없이 작성해야 한다.

```sshconfig
HostName 192.168.0.20
```

설정 후에는 다음 명령으로 접속할 수 있다.

```bash
ssh labean
```

---

# 22. SSH Config가 적용되는지 확인

설정 파일이 정상적으로 읽히는지 확인한다.

```bash
ssh -G labean
```

다음 항목을 확인한다.

```text
hostname 192.168.0.20
user bean
port 22
identityfile ~/.ssh/id_ed25519
identitiesonly yes
```

상세 디버그 로그를 보려면 다음 명령을 실행한다.

```bash
ssh -vvv labean
```

공개키 인증이 정상적으로 진행되는 경우 다음과 비슷한 로그가 표시된다.

```text
Offering public key: /Users/bean/.ssh/id_ed25519
Server accepts key
Authenticated to 192.168.0.20 using "publickey".
```

---

# 23. 공개키 지문 비교

클라이언트 공개키의 지문을 확인한다.

```bash
ssh-keygen -lf ~/.ssh/id_ed25519.pub
```

예:

```text
256 SHA256:xxxxxxxxxxxxxxxxxxxxxxxx bean@Mac-mini (ED25519)
```

WSL의 `authorized_keys`에 키가 하나만 있고 형식이 정상이라면 다음 명령으로 확인할 수 있다.

```bash
ssh-keygen -lf ~/.ssh/authorized_keys
```

다음 오류가 발생한다면 파일 안의 키 형식이 잘못되었을 가능성이 있다.

```text
/home/bean/.ssh/authorized_keys is not a public key file.
```

이 경우 먼저 파일 내용을 확인한다.

```bash
cat -n ~/.ssh/authorized_keys
```

한 줄씩 검사하려면 다음과 같이 임시 공개키 파일을 만들어 확인할 수 있다.

```bash
head -n 1 ~/.ssh/authorized_keys > /tmp/authorized_key.pub
ssh-keygen -lf /tmp/authorized_key.pub
rm -f /tmp/authorized_key.pub
```

여러 키가 등록되어 있다면 줄 번호를 바꿔가며 검사한다.

예를 들어 두 번째 키:

```bash
sed -n '2p' ~/.ssh/authorized_keys > /tmp/authorized_key.pub
ssh-keygen -lf /tmp/authorized_key.pub
rm -f /tmp/authorized_key.pub
```

클라이언트와 서버에서 출력된 `SHA256:` 값이 같아야 같은 공개키이다.

---

# 24. SSH 서버 설정 확인

WSL에서 SSH 서버의 실제 적용 설정을 확인한다.

```bash
sudo sshd -T | grep -E 'pubkeyauthentication|authorizedkeysfile|passwordauthentication'
```

공개키 인증에 필요한 주요 설정:

```text
pubkeyauthentication yes
authorizedkeysfile .ssh/authorized_keys .ssh/authorized_keys2
```

SSH 설정 파일은 다음 경로에 있다.

```text
/etc/ssh/sshd_config
```

편집하려면 다음 명령을 사용한다.

```bash
sudo nano /etc/ssh/sshd_config
```

공개키 인증 관련 설정:

```text
PubkeyAuthentication yes
AuthorizedKeysFile .ssh/authorized_keys
```

설정 파일 문법을 검사한다.

```bash
sudo sshd -t
```

오류가 없으면 아무 출력도 나오지 않는다.

설정을 변경한 후 SSH 서버를 재시작한다.

```bash
sudo service ssh restart
```

또는:

```bash
sudo systemctl restart ssh
```

---

# 25. 비밀번호 인증 비활성화

공개키 인증이 완전히 작동하는 것을 확인한 후 비밀번호 인증을 비활성화할 수 있다.

```bash
sudo nano /etc/ssh/sshd_config
```

다음 설정을 적용한다.

```text
PubkeyAuthentication yes
PasswordAuthentication no
PermitRootLogin no
```

설정 검사:

```bash
sudo sshd -t
```

SSH 재시작:

```bash
sudo service ssh restart
```

또는:

```bash
sudo systemctl restart ssh
```

## 중요

기존 SSH 연결을 끊기 전에 새 터미널에서 공개키 접속이 되는지 확인한다.

```bash
ssh labean
```

비밀번호 인증부터 먼저 비활성화하면 공개키가 잘못 등록된 경우 서버에 접속하지 못할 수 있다.

---

# 26. VS Code에서 WSL에 접속하는 두 가지 방법

## 같은 Windows PC에서 작업할 때

현재 Windows PC에서 바로 WSL을 사용하는 경우에는 VS Code의 `WSL` 확장을 사용하는 것이 간단하다.

구조:

```text
Windows VS Code
└── WSL 확장
    └── 로컬 WSL Ubuntu
```

VS Code에서 다음 명령을 선택한다.

```text
WSL: Connect to WSL
```

이 방법은 현재 Windows PC 내부에서 작업할 때 적합하다.

## 다른 PC에서 접속할 때

Mac, 노트북, 다른 데스크톱에서 WSL에 접속하려면 `Remote - SSH` 확장을 사용한다.

구조:

```text
외부 PC의 VS Code
└── Remote - SSH
    └── Windows 호스트 IP:22
        └── WSL Ubuntu
```

두 확장은 동시에 설치해도 충돌하지 않는다.

---

# 27. VS Code Remote SSH 접속

클라이언트 VS Code에서 다음 확장을 설치한다.

```text
Remote - SSH
Publisher: Microsoft
```

먼저 일반 터미널에서 다음 명령이 성공하는지 확인한다.

```bash
ssh labean
```

터미널 접속이 성공하면 VS Code 명령 팔레트를 연다.

Mac:

```text
Command + Shift + P
```

Windows/Linux:

```text
Ctrl + Shift + P
```

다음 명령을 선택한다.

```text
Remote-SSH: Connect to Host...
```

호스트 목록에서 다음 항목을 선택한다.

```text
labean
```

접속 후 VS Code 왼쪽 아래에 다음과 비슷하게 표시된다.

```text
SSH: labean
```

---

# 28. 연결이 안 될 때 점검 순서

SSH 연결 문제는 다음 순서로 확인하면 원인을 빠르게 찾을 수 있다.

## 1단계: SSH 서버 실행 여부

WSL에서 확인한다.

```bash
sudo service ssh status
```

또는:

```bash
sudo systemctl status ssh
```

실행되지 않았다면 시작한다.

```bash
sudo service ssh start
```

---

## 2단계: 22번 포트 대기 여부

```bash
sudo ss -tlnp | grep ':22'
```

`0.0.0.0:22` 또는 `[::]:22`가 보여야 한다.

---

## 3단계: localhost 접속 여부

WSL 내부에서 확인한다.

```bash
ssh bean@localhost
```

이 단계부터 실패하면 네트워크 문제가 아니라 SSH 서버 설정 문제이다.

---

## 4단계: Windows 방화벽 확인

관리자 PowerShell에서 확인한다.

```powershell
Get-NetFirewallRule -DisplayName "WSL SSH"
```

규칙이 없다면 다시 생성한다.

```powershell
New-NetFirewallRule `
  -DisplayName "WSL SSH" `
  -Direction Inbound `
  -Protocol TCP `
  -LocalPort 22 `
  -Action Allow
```

---

## 5단계: 외부에서 포트 확인

Mac/Linux:

```bash
nc -vz <WINDOWS_HOST_IP> 22
```

Windows:

```powershell
Test-NetConnection <WINDOWS_HOST_IP> -Port 22
```

---

## 6단계: SSH 상세 로그 확인

```bash
ssh -vvv labean
```

주요 오류별 의미:

```text
Connection timed out
```

네트워크, IP, 방화벽 또는 Mirrored Networking 문제일 가능성이 높다.

```text
Connection refused
```

SSH 서버가 실행되지 않았거나 22번 포트에서 대기하지 않는 상태일 수 있다.

```text
Permission denied (publickey)
```

공개키, 개인키, 파일 권한 또는 `authorized_keys` 형식 문제일 가능성이 높다.

```text
Permission denied (publickey,password)
```

공개키 인증과 비밀번호 인증이 모두 실패한 상태이다.

```text
UNPROTECTED PRIVATE KEY FILE
```

클라이언트 개인키 권한이 너무 넓다.

다음 명령으로 수정한다.

```bash
chmod 600 ~/.ssh/id_ed25519
```

---

# 29. 서버 인증 로그 확인

WSL에서 SSH 인증 로그를 확인한다.

`systemd` 환경:

```bash
sudo journalctl -u ssh -n 100 --no-pager
```

실시간으로 확인:

```bash
sudo journalctl -u ssh -f
```

Ubuntu 로그 파일을 직접 확인할 수도 있다.

```bash
sudo tail -f /var/log/auth.log
```

공개키 권한 문제라면 다음과 비슷한 메시지가 나타날 수 있다.

```text
Authentication refused: bad ownership or modes for file
```

이 경우 다음 명령으로 권한을 수정한다.

```bash
chmod 700 ~/.ssh
chmod 600 ~/.ssh/authorized_keys
chown -R bean:bean ~/.ssh
```

---

# 30. Windows의 `wslrelay.exe`는 무엇인가

Windows에서 다음 명령으로 22번 포트를 확인할 수 있다.

```powershell
netstat -ano | findstr :22
```

Mirrored Networking 환경에서는 `wslrelay.exe`가 루프백 주소의 22번 포트와 관련되어 표시될 수 있다.

이 프로세스는 Windows OpenSSH Server가 아니라 WSL 네트워크 연결을 중계하는 프로세스일 수 있다.

Windows 자체 SSH 서버가 실행 중인지 확인하려면 다음 명령을 사용한다.

```powershell
Get-Service sshd
```

Windows의 `sshd` 서비스와 WSL 내부의 `sshd`는 서로 다른 서버이다.

이번 구성에서는 WSL 내부의 OpenSSH Server를 사용한다.

---

# 31. WSL을 재시작한 후 SSH가 안 될 때

WSL이 완전히 종료되면 SSH 서비스도 함께 종료될 수 있다.

WSL을 다시 시작한 후 다음 명령으로 SSH 서비스를 시작한다.

```bash
sudo service ssh start
```

`systemd`가 활성화되어 있다면 자동 시작을 설정할 수 있다.

```bash
sudo systemctl enable ssh
```

즉시 시작과 자동 시작을 함께 설정하려면 다음 명령을 사용한다.

```bash
sudo systemctl enable --now ssh
```

확인:

```bash
systemctl is-enabled ssh
systemctl is-active ssh
```

정상적인 결과:

```text
enabled
active
```

---

# 32. SSH 연결 종료

SSH 접속을 종료하려면 원격 터미널에서 다음 명령을 실행한다.

```bash
exit
```

또는 다음 단축키를 사용한다.

```text
Ctrl + D
```

응답이 없는 SSH 연결을 강제로 종료하려면 새 줄에서 다음 키를 순서대로 입력한다.

```text
Enter
~
.
```

---

# 33. 최종 설정 예시

## WSL의 `/etc/wsl.conf`

```ini
[boot]
systemd=true

[network]
hostname=LABEAN
```

## Windows의 `.wslconfig`

```ini
[wsl2]
networkingMode=mirrored
```

## WSL의 `authorized_keys`

```text
ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAI... bean@Mac-mini
```

## 클라이언트의 `~/.ssh/config`

```sshconfig
Host labean
    HostName 192.168.0.20
    Port 22
    User bean
    IdentityFile ~/.ssh/id_ed25519
    IdentitiesOnly yes
```

## 접속 명령

```bash
ssh labean
```

---

# 34. 전체 설정 체크리스트

- [ ] WSL2 Ubuntu 설치
- [ ] WSL hostname 설정
- [ ] `.wslconfig`에서 Mirrored Networking 설정
- [ ] PowerShell에서 `wsl --shutdown` 실행
- [ ] WSL에 `openssh-server` 설치
- [ ] SSH 서비스 실행
- [ ] WSL에서 22번 포트 대기 확인
- [ ] `ssh bean@localhost` 접속 확인
- [ ] Windows 호스트 LAN IP 확인
- [ ] Windows 방화벽에서 TCP 22번 포트 허용
- [ ] 외부 PC에서 22번 포트 연결 확인
- [ ] 외부 PC에서 비밀번호 SSH 접속 확인
- [ ] 클라이언트에서 ED25519 키 생성
- [ ] 공개키를 WSL의 `authorized_keys`에 등록
- [ ] WSL의 `.ssh` 및 `authorized_keys` 권한 설정
- [ ] 클라이언트 개인키 권한 설정
- [ ] `ssh -i` 명령으로 공개키 인증 확인
- [ ] 클라이언트의 `~/.ssh/config` 작성
- [ ] `ssh labean` 접속 확인
- [ ] VS Code Remote SSH 접속 확인
- [ ] 공개키 인증 성공 후 비밀번호 인증 비활성화

---

# 35. 핵심 정리

이번 구성에서 가장 중요한 파일은 다음 네 개이다.

```text
Windows
C:\Users\<사용자>\.wslconfig

WSL
/etc/wsl.conf
/home/bean/.ssh/authorized_keys

클라이언트
~/.ssh/config
~/.ssh/id_ed25519
```

각 파일의 역할은 다음과 같다.

```text
.wslconfig
└── WSL 가상 머신의 Mirrored Networking 설정

/etc/wsl.conf
└── WSL 내부 hostname과 systemd 설정

authorized_keys
└── 서버 접속을 허용할 클라이언트 공개키 목록

~/.ssh/config
└── 서버 IP, 사용자, 포트, 개인키 경로를 별칭으로 관리

~/.ssh/id_ed25519
└── 클라이언트가 보관하는 개인키
```

최종 접속 흐름은 다음과 같다.

```text
ssh labean
    │
    ├── ~/.ssh/config에서 서버 정보 확인
    ├── ~/.ssh/id_ed25519 개인키로 서명
    ├── Windows 호스트 IP의 22번 포트에 연결
    ├── WSL Mirrored Networking을 통해 sshd에 전달
    └── authorized_keys의 공개키와 검증 후 로그인
```

공개키 인증이 정상적으로 구성되면 비밀번호를 서버로 전송하지 않고도 안전하게 WSL에 접속할 수 있다.
