## Figma → 코드 재현을 위한 API 가이드

### 피드백

피그마 플러그인 api로 변경
https://www.figma.com/plugin-docs/

### 분석

- Plugin API 로 변경

### TL;DR (최소 셋)

- `GET /v1/files/:key/nodes` 또는 `GET /v1/files/:key?ids=...`
- `GET /v1/files/:file_key/variables/local`
- (이미지가 있을 때) `GET /v1/files/:key/images`, `GET /v1/images/:key?ids=...`

---

### 1) 반드시 필요한 API

| 영역             | 엔드포인트                                                   | 용도                                                          | 비고                                        |
| ---------------- | ------------------------------------------------------------ | ------------------------------------------------------------- | ------------------------------------------- |
| 노드 스타일 소스 | `GET /v1/files/:key/nodes` 또는 `GET /v1/files/:key?ids=...` | 오토 레이아웃, 텍스트, 페인트, 코너, 패딩 등 실제 스타일 추출 | 부분 노드만 받을 때 `ids` 사용              |
| 변수 해석        | `GET /v1/files/:file_key/variables/local`                    | `boundVariables`의 VariableID → 값/모드 해석                  | Enterprise 플랜, `file_variables:read` 필요 |
| 이미지(조건부)   | `GET /v1/files/:key/images`                                  | 이미지 fill의 `imageRef` → 실제 URL 매핑                      | URL 만료(≤14일)                             |
| 이미지(조건부)   | `GET /v1/images/:key?ids=...`                                | 특정 노드 렌더(스냅샷)                                        | 스냅샷/문서화/시각 회귀용                   |

---

### 2) 보조적으로 필요한 API

| 카테고리           | 엔드포인트                                                              | 목적/사용처                                              |
| ------------------ | ----------------------------------------------------------------------- | -------------------------------------------------------- |
| 문서 메타/맵       | `GET /v1/files/:key`                                                    | `components`/`componentSets`/`styles` 맵 활용, 문서 메타 |
| 스타일 참조 시     | `GET /v1/files/:file_key/styles`, `GET /v1/styles/:key`                 | 노드가 스타일 ID를 참조하는 경우 메타 확인               |
| 컴포넌트/Variants  | `GET /v1/files/:file_key/components`, `GET /v1/components/:key`         | 인스턴스의 원본 컴포넌트 메타                            |
| 컴포넌트 셋        | `GET /v1/files/:file_key/component_sets`, `GET /v1/component_sets/:key` | 변형 축(Variants) 해석                                   |
| 팀 디스커버리      | `GET /v1/teams/:team_id/components`, `.../component_sets`, `.../styles` | 팀 라이브러리 탐색/카탈로그                              |
| 퍼블리시 변수 메타 | `GET /v1/files/:file_key/variables/published`                           | 배포된 변수/구독 ID 동기화                               |
| 파일 메타데이터    | `GET /v1/files/:key/meta`                                               | UI 리스트/동기화 표기용 메타                             |

---

### 3) 추가 제약/주의

- **변수 모드 선택**: REST로 “현재 적용 모드”는 직접 노출되지 않음. 노드의 계산 값 사용 또는 컬렉션의 `defaultModeId`/선택 모드로 해석.
- **폰트**: 예) `pretendard`는 런타임에서 직접 로드 필요.
- **CSS와 1:1 아님**: corner smoothing, stroke-align(inside/outside), 일부 blend/effect는 브라우저에서 근사치 처리.
- **벡터**: 벡터를 그대로 써야 하면 `geometry=paths` 옵션으로 SVG 생성 로직 연계.
- **SVG 옵션**: `svg_outline_text`, `svg_include_id`, `svg_include_node_id`, `svg_simplify_stroke` 등은 스냅샷 품질/가독성 트레이드오프.
- **권한/토큰**: 403 에러 시 플랜/스코프/토큰 만료 확인.

---

## Variables API 요약

Variables는 컬렉션/모드 기반 디자인 토큰이며, `boundVariables` 해석에 필수입니다.

### 이용 요건

- **플랜**: Enterprise
- **계정**: GET(조직 구성원), POST(Full seats/Admins)
- **권한**: 파일 View/Edit
- **토큰 스코프**: `file_variables:read`, `file_variables:write`

### 주요 타입

- `VariableCollection`: `id`, `name`, `key`, `modes[]`, `defaultModeId`, `variableIds[]` 등
- `Variable`: `id`, `name`, `key`, `variableCollectionId`, `resolvedType`, `valuesByMode`, `scopes`, `codeSyntax` 등
- `VariableAlias`: `{ type: 'VARIABLE_ALIAS', id: string }`

### 엔드포인트

| 엔드포인트                                    | 목적                                 | 포함 정보/제약                              |
| --------------------------------------------- | ------------------------------------ | ------------------------------------------- |
| `GET /v1/files/:file_key/variables/local`     | 로컬 변수 + 사용 중인 원격 변수 조회 | 모드/값 포함, 해석에 권장                   |
| `GET /v1/files/:file_key/variables/published` | 퍼블리시된 변수 메타                 | 모드 없음, `subscribed_id`/`updatedAt` 제공 |
| `POST /v1/files/:file_key/variables`          | 컬렉션/모드/변수/값 일괄 변경        | 4MB 제한, 원자성, 원격 변수 수정 불가       |

### 구현 메모

- `files/:key` 또는 `files/:key/nodes`의 `boundVariables` → `variables/local`의 `variables`/`variableCollections`로 해석
- 퍼블리시드 변수는 `subscribed_id`가 변경될 수 있어 동기화 로직에 주의
- 문자열 변수가 텍스트 콘텐츠에 바인딩되고 공유 폰트를 사용할 때 일부 업데이트 제한(400)

### 조건부로만 추가

- 동기화/배포 관리(변수 퍼블리시 상태 추적): GET /v1/files/:file_key/variables/published
- 팀/파일 라이브러리 탐색(카탈로그용): GET /v1/teams/:team_id/{components,component_sets,styles}
- 변수/컬렉션을 코드에서 갱신(자동화·CI): POST /v1/files/:file_key/variables
