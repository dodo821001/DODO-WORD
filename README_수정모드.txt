DODO WORLD 수정모드(CMS)

일반 홈페이지
- index.html
- about.html
- cafe.html
- stores.html
- franchise.html

수정모드
- admin.html

작동 방식
- 홈페이지의 수정 가능한 문구는 content.json에서 읽습니다.
- admin.html에서 글을 수정하고 GitHub에 저장하면 content.json만 변경됩니다.
- 디자인 HTML/CSS는 건드리지 않으므로 안전하게 문구만 수정할 수 있습니다.
- GitHub Pages는 저장 후 보통 1~3분 뒤 반영됩니다.

GitHub 저장에 필요한 것
1. 홈페이지 파일을 GitHub 저장소에 업로드
2. Fine-grained Personal Access Token 생성
3. 해당 저장소만 선택
4. Repository permissions > Contents > Read and write
5. admin.html에서 계정명/저장소명/main/토큰 입력
6. 문구 수정 후 'GitHub에 저장'

보안
- GitHub 토큰은 사이트 파일에 저장하지 않습니다.
- 수정할 때마다 관리자 화면에 직접 입력하는 방식입니다.
- admin.html은 홈페이지 메뉴에 노출하지 않는 것을 권장합니다.

현재는 텍스트 중심 수정모드입니다.
추후 같은 방식으로 이미지 교체, 매장 주소/영업시간, 버튼 링크, 메인 배너 표시 여부까지 수정 가능하게 확장할 수 있습니다.
