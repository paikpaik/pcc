# CLAUDE.md

이 파일은 pcc(paikpaik claude code) 저장소에서 작업할 때 Claude Code에게 제공하는 가이드입니다.

## 프로젝트 개요

pcc는 개인 전용 Claude Code 플러그인입니다. [affaan-m/ECC](https://github.com/affaan-m/ECC)의
`agents / skills / commands / hooks / rules` 아키텍처 패턴을 참고하되, ECC 전체(292개 스킬,
7개 하네스 지원, 대규모 scripts CLI)를 그대로 가져오지 않고 실제로 쓰는 만큼만 가볍게 채워갑니다.
지금은 단계적으로 하나씩 항목을 추가하며 구조를 파악해가는 초기 단계입니다.

참고용으로 ECC 원본을 `repo/ECC`에 클론해 두었습니다 (이 저장소의 git 추적 대상 아님, 순수 레퍼런스).

## 아키텍처

- `agents/` — 특화된 서브에이전트. 마크다운 + YAML frontmatter (`name`, `description`, `tools`, `model`).
  `tools`는 콤마로 구분된 스칼라 값으로 작성 (`tools: Read, Grep, Bash`), YAML 시퀀스 금지.
- `skills/` — 재사용 가능한 워크플로우/도메인 지식. When to Use / How It Works / Examples 섹션 구성.
- `commands/` — 슬래시 명령어. `description:` frontmatter 필수.
- `hooks/` — 라이프사이클 자동화 (`hooks/hooks.json`). Claude Code v2.1+가 컨벤션으로 자동 로드하므로
  `.claude-plugin/plugin.json`에 `hooks` 필드를 절대 추가하지 않는다.
- `rules/` — 언어/도메인별 always-load 규칙. 현재 주력 스택은 TypeScript/JavaScript, Python.

## 플러그인 매니페스트 주의사항 (`.claude-plugin/plugin.json`)

ECC의 실전 경험(`repo/ECC/.claude-plugin/PLUGIN_SCHEMA_NOTES.md`)에서 확인된 검증기 제약:

- `version` 필드 필수.
- `commands`, `skills`, `hooks`(있다면) 필드는 항상 배열이어야 함 — 문자열 하나만 있어도 배열로 감싼다.
- `agents` 필드는 절대 추가하지 않는다 — 매니페스트 스키마에 없는 필드라 검증 실패(`agents: Invalid input`).
  `agents/*.md`는 컨벤션으로 자동 인식된다.
- `hooks` 필드는 절대 추가하지 않는다 — `hooks/hooks.json`은 자동 로드되며, 명시적으로 선언하면
  "Duplicate hooks file detected" 오류가 난다.
- `mcpServers: {}`를 유지해서 루트 `.mcp.json` 자동 로딩을 막는다 (MCP 서버를 쓰게 되면 이 부분 재검토).

## 개발 방향

- 처음부터 다 채우지 말고, 실제로 쓰면서 필요한 agent/skill/command/hook/rule을 그때그때 추가한다.
- 새 컴포넌트를 추가할 때는 ECC의 해당 파일(`repo/ECC/agents/*.md` 등)을 형식 참고용으로만 보고,
  내용은 pcc 사용자의 실제 워크플로우에 맞게 새로 작성한다.
