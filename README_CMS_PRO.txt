DODO WORLD CMS PRO

수정모드 주소
- admin.html

이번 PRO 버전에서 가능한 것
1. 텍스트 수정
2. 이미지 교체
   - 이미지 경로/URL 직접 입력
   - 새 이미지 파일 선택 후 GitHub에 자동 업로드
3. 버튼/지도/메뉴 링크 수정
4. 매장별 이름·설명·주소·영업시간·전화·지도 링크 수정
5. 매장별 표시/숨김
6. 메인/브랜드/먹거리/가맹 폼 등 섹션 표시/숨김
7. 홈페이지 대표 컬러 4종 수정
8. JSON 백업 저장 / 백업 불러오기
9. GitHub에 저장 후 실제 홈페이지 자동 반영

GitHub 저장 권한
- Fine-grained Personal Access Token
- 해당 홈페이지 저장소만 선택
- Repository permissions > Contents: Read and write

이미지 업로드
- admin.html에서 새 이미지 파일을 선택합니다.
- GitHub에 저장을 누르면 assets/images/cms/ 폴더로 자동 업로드됩니다.
- content.json의 이미지 경로도 함께 변경됩니다.

주의
- GitHub 토큰은 코드나 content.json에 저장되지 않습니다.
- 관리자 페이지는 일반 홈페이지 메뉴에서 링크하지 않는 것을 권장합니다.
- GitHub Pages 반영까지 보통 1~3분 정도 걸릴 수 있습니다.
