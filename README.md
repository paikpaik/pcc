# pcc (paikpaik claude code)

개인 전용 Claude Code 플러그인. [ECC](https://github.com/affaan-m/ECC)의 구조를 참고해
필요한 만큼만 가볍게 채워가는 중입니다.

## 구조

| 디렉토리 | 용도 |
|---|---|
| `agents/` | 특화된 서브에이전트 |
| `skills/` | 재사용 가능한 워크플로우/도메인 지식 |
| `commands/` | 슬래시 명령어 |
| `hooks/` | 라이프사이클 자동화 |
| `rules/` | 언어/도메인별 always-load 규칙 |

자세한 작성 규칙은 [CLAUDE.md](CLAUDE.md) 참고, 구조를 한눈에 보려면 [docs/index.html](docs/index.html) 참고.

## 설치 (로컬 개발용)

```bash
claude plugin validate .claude-plugin/plugin.json
```
