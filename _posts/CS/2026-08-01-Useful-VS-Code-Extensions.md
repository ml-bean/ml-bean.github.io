---
title: "유용한 VS Code Extensions"
date: 2026-08-01
categories:
  - CS
tags:
  - VS Code
  - Extension
classes: wide
---

WSL의 VS Code Server에 설치된 확장 프로그램을 용도별로 정리한다.

설치된 확장 목록은 터미널에서 다음 명령으로 확인할 수 있다.

```bash
code --list-extensions --show-versions
```

## AI 코딩 도구

| Extension | 기능 |
| --- | --- |
| `openai.chatgpt` | Codex를 이용해 코드 작성, 수정, 설명과 작업 자동화를 수행한다. |
| `anthropic.claude-code` | VS Code 안에서 Claude Code 기반의 코딩 에이전트를 사용한다. |

## Python 개발

| Extension | 기능 |
| --- | --- |
| `ms-python.python` | Python 실행, 테스트, 리팩터링 등 기본 개발 기능을 제공한다. |
| `ms-python.vscode-pylance` | 빠른 자동 완성, 타입 검사, 코드 탐색을 제공한다. |
| `ms-python.debugpy` | 중단점, 변수 확인, 단계별 실행을 지원하는 Python 디버거다. |
| `ms-python.vscode-python-envs` | Python 인터프리터와 가상환경을 선택하고 관리한다. |

## Jupyter Notebook

| Extension | 기능 |
| --- | --- |
| `ms-toolsai.jupyter` | VS Code에서 Jupyter Notebook 실행과 대화형 분석을 지원한다. |
| `ms-toolsai.jupyter-keymap` | Jupyter에서 사용하던 단축키를 VS Code Notebook에 적용한다. |
| `ms-toolsai.jupyter-renderers` | Plotly, Vega, 이미지 등 Notebook 출력 결과를 렌더링한다. |
| `ms-toolsai.vscode-jupyter-cell-tags` | Notebook 셀에 태그와 메타데이터를 지정한다. |
| `ms-toolsai.vscode-jupyter-slideshow` | Notebook 셀을 슬라이드 형식으로 구성한다. |

## 문서와 데이터

| Extension | 기능 |
| --- | --- |
| `yzhang.markdown-all-in-one` | Markdown 단축키, 목차 생성, 표 정렬과 자동 완성을 지원한다. |
| `mechatroner.rainbow-csv` | CSV/TSV 열을 색상으로 구분하고 SQL과 유사한 쿼리를 실행한다. |

## 코드 가독성

| Extension | 기능 |
| --- | --- |
| `oderwat.indent-rainbow` | 들여쓰기 단계마다 색을 입혀 코드 구조를 쉽게 구분한다. |

Python과 Jupyter 관련 확장들은 서로 연동되는 구성 요소가 많다. 따라서 개별 확장을 무작정 제거하기보다 Python 또는 Jupyter의 핵심 확장이 의존하는 기능인지 먼저 확인하는 것이 좋다.
