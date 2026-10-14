
let current = {};
let dirty = false;
const pendingFiles = new Map();
const $ = (s) => document.querySelector(s);

const esc = (s) => String(s ?? "").replace(/[&<>"']/g, (m) => ({
  "&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"
}[m]));

const boolVal = (v) => {
  if (typeof v === "boolean") return v;
  return !["false","0","off","no",""].includes(String(v ?? "").trim().toLowerCase());
};

const clone = (x) => JSON.parse(JSON.stringify(x));

function setDirty(v = true) {
  dirty = v;
  document.querySelector("#dirty")?.classList.toggle("show", v);
}

function status(message, isError = false) {
  const box = $("#status");
  if (!box) return;
  box.textContent = message;
  box.className = "status show" + (isError ? " err" : "");
  clearTimeout(window.__statusTimer);
  window.__statusTimer = setTimeout(() => box.className = "status", 5000);
}

function makeField(key, label, type) {
  const wrap = document.createElement("div");
  wrap.className = "field " + (["textarea","html","image"].includes(type) ? "full" : "");

  const lab = document.createElement("label");
  lab.textContent = label;
  const small = document.createElement("small");
  small.textContent = key;
  wrap.append(lab, small);

  if (type === "toggle") {
    const row = document.createElement("div");
    row.className = "toggle-row";
    const txt = document.createElement("span");
    txt.textContent = boolVal(current[key]) ? "표시" : "숨김";
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "switch " + (boolVal(current[key]) ? "on" : "");
    btn.dataset.toggleKey = key;
    btn.onclick = () => {
      const on = !btn.classList.contains("on");
      btn.classList.toggle("on", on);
      txt.textContent = on ? "표시" : "숨김";
      current[key] = on;
      setDirty();
    };
    row.append(txt, btn);
    wrap.append(row);
    return wrap;
  }

  if (type === "color") {
    const row = document.createElement("div");
    row.className = "color-wrap";
    const picker = document.createElement("input");
    picker.type = "color";
    picker.value = current[key] || "#17372f";
    const input = document.createElement("input");
    input.type = "text";
    input.dataset.key = key;
    input.value = current[key] || "#17372f";

    picker.oninput = () => {
      input.value = picker.value;
      current[key] = picker.value;
      setDirty();
    };
    input.oninput = () => {
      current[key] = input.value;
      if (/^#[0-9a-fA-F]{6}$/.test(input.value)) picker.value = input.value;
      setDirty();
    };
    row.append(picker, input);
    wrap.append(row);
    return wrap;
  }

  if (type === "number") {
    const input = document.createElement("input");
    input.type = "number";
    input.min = "10";
    input.max = "140";
    input.step = "1";
    input.dataset.key = key;
    input.value = current[key] ?? "";
    input.oninput = () => {
      current[key] = Number(input.value);
      setDirty();
    };
    wrap.append(input);
    return wrap;
  }

  if (type === "image") {
    const box = document.createElement("div");
    box.className = "image-field";

    const preview = document.createElement("div");
    preview.className = "image-preview";
    const img = document.createElement("img");
    img.src = current[key] || "";
    img.alt = "";
    preview.append(img);

    const controls = document.createElement("div");
    controls.className = "image-controls";

    const pathInput = document.createElement("input");
    pathInput.type = "text";
    pathInput.dataset.key = key;
    pathInput.value = current[key] || "";
    pathInput.placeholder = "이미지 URL 또는 assets/images/... 경로";
    pathInput.oninput = () => {
      current[key] = pathInput.value;
      img.src = pathInput.value;
      setDirty();
    };

    const fileInput = document.createElement("input");
    fileInput.type = "file";
    fileInput.accept = "image/*";
    fileInput.onchange = () => {
      const file = fileInput.files?.[0];
      if (!file) return;
      pendingFiles.set(key, file);
      img.src = URL.createObjectURL(file);
      help.textContent = "새 이미지 선택됨 · GitHub 저장 시 이미지와 경로가 함께 반영됩니다.";
      setDirty();
    };

    const help = document.createElement("div");
    help.className = "image-help";
    help.textContent = "경로를 직접 바꾸거나 새 이미지를 선택할 수 있습니다.";

    controls.append(pathInput, fileInput, help);
    box.append(preview, controls);
    wrap.append(box);
    return wrap;
  }

  const input = (type === "textarea" || type === "html")
    ? document.createElement("textarea")
    : document.createElement("input");

  input.dataset.key = key;
  input.value = current[key] ?? "";
  if (type === "html") input.placeholder = "<br>로 줄바꿈 가능";
  if (type === "url") input.placeholder = "https://...";

  input.oninput = () => {
    current[key] = input.value;
    setDirty();
  };
  wrap.append(input);
  return wrap;
}

function newStore() {
  return {
    id: "store-" + Date.now(),
    visible: true,
    region: "REGION",
    name: "신규 매장",
    desc: "매장 설명을 입력해주세요.",
    image: "assets/images/brand-shelf.webp",
    address: "주소 입력",
    hours: "영업시간 입력",
    phone: "",
    map_url: "",
    tags: ["만화","OTT"]
  };
}

function renderStoresManager() {
  const holder = $("#storeManager");
  if (!holder) return;
  holder.innerHTML = "";

  const items = Array.isArray(current["stores.items"]) ? current["stores.items"] : [];
  items.forEach((store, index) => {
    const card = document.createElement("div");
    card.className = "store-edit-card";
    card.innerHTML = `
      <div class="store-edit-top">
        <div class="store-edit-title"><span class="store-index">${index + 1}</span><span>${esc(store.name)}</span></div>
        <div class="store-actions">
          <button type="button" data-up>↑ 위로</button>
          <button type="button" data-down>↓ 아래로</button>
          <button type="button" class="danger" data-del>삭제</button>
        </div>
      </div>
      <div class="store-fields">
        <div><label>노출 여부</label><div class="store-visible-row"><input type="checkbox" data-f="visible" ${boolVal(store.visible) ? "checked" : ""}> 홈페이지에 표시</div></div>
        <div><label>지역 표기</label><input data-f="region" value="${esc(store.region)}"></div>
        <div><label>매장명</label><input data-f="name" value="${esc(store.name)}"></div>
        <div><label>전화번호</label><input data-f="phone" value="${esc(store.phone)}"></div>
        <div class="wide"><label>매장 설명</label><textarea data-f="desc">${esc(store.desc)}</textarea></div>
        <div><label>주소</label><input data-f="address" value="${esc(store.address)}"></div>
        <div><label>영업시간</label><input data-f="hours" value="${esc(store.hours)}"></div>
        <div><label>지도 링크</label><input data-f="map_url" value="${esc(store.map_url)}"></div>
        <div><label>태그</label><input data-f="tags" value="${esc((store.tags || []).join(", "))}"></div>
        <div class="wide"><label>매장 이미지</label>
          <div class="store-image-row">
            <div class="store-image-preview"><img data-img src="${esc(store.image)}"></div>
            <div class="store-image-controls">
              <input data-f="image" value="${esc(store.image)}">
              <input type="file" accept="image/*" data-file>
              <div class="image-help" data-store-help>기존 경로를 직접 바꾸거나 새 이미지를 선택할 수 있습니다.</div>
            </div>
          </div>
        </div>
      </div>`;

    card.querySelectorAll("[data-f]").forEach((input) => {
      const field = input.dataset.f;
      input.addEventListener(field === "visible" ? "change" : "input", () => {
        if (field === "visible") store[field] = input.checked;
        else if (field === "tags") store[field] = input.value.split(",").map(v => v.trim()).filter(Boolean);
        else store[field] = input.value;

        if (field === "name") card.querySelector(".store-edit-title span:last-child").textContent = store.name;
        if (field === "image") card.querySelector("[data-img]").src = store.image;
        setDirty();
      });
    });

    card.querySelector("[data-file]").onchange = (e) => {
      const file = e.target.files?.[0];
      if (!file) return;
      pendingFiles.set(`stores.items.${store.id}.image`, file);
      card.querySelector("[data-img]").src = URL.createObjectURL(file);
      card.querySelector("[data-store-help]").textContent = "새 이미지 선택됨 · 저장 시 이미지와 경로가 함께 반영됩니다.";
      setDirty();
    };

    card.querySelector("[data-del]").onclick = () => {
      if (!confirm(`'${store.name}'을 삭제할까요?`)) return;
      current["stores.items"].splice(index, 1);
      renderStoresManager();
      setDirty();
    };

    card.querySelector("[data-up]").onclick = () => {
      if (index <= 0) return;
      const arr = current["stores.items"];
      [arr[index - 1], arr[index]] = [arr[index], arr[index - 1]];
      renderStoresManager();
      setDirty();
    };

    card.querySelector("[data-down]").onclick = () => {
      const arr = current["stores.items"];
      if (index >= arr.length - 1) return;
      [arr[index + 1], arr[index]] = [arr[index], arr[index + 1]];
      renderStoresManager();
      setDirty();
    };

    holder.append(card);
  });
}

function render(data) {
  current = Object.assign({}, window.DODO_DEFAULT_CONTENT || {}, clone(data || {}));
  if (!Array.isArray(current["stores.items"])) current["stores.items"] = [];
  pendingFiles.clear();
  setDirty(false);

  const root = $("#groups");
  const side = $("#sideLinks");
  root.innerHTML = "";
  side.innerHTML = "";

  if (!window.DODO_SCHEMA) {
    status("관리 항목 파일(admin-schema.js)을 불러오지 못했습니다.", true);
    return;
  }

  let index = 0;
  Object.entries(window.DODO_SCHEMA).forEach(([name, fields]) => {
    const id = "group-" + index++;
    const link = document.createElement("button");
    link.className = "side-link";
    link.textContent = name;
    link.onclick = () => document.getElementById(id)?.scrollIntoView({behavior:"smooth"});
    side.append(link);

    const section = document.createElement("section");
    section.className = "group";
    section.id = id;
    section.innerHTML = `<div class="gh"><h2>${esc(name)}</h2><span>${fields.length}개 항목</span></div><div class="fields"></div>`;
    fields.forEach(args => section.querySelector(".fields").append(makeField(...args)));
    root.append(section);
  });

  const storeLink = document.createElement("button");
  storeLink.className = "side-link";
  storeLink.textContent = "매장 추가 / 관리";
  storeLink.onclick = () => $("#storeGroup")?.scrollIntoView({behavior:"smooth"});
  side.append(storeLink);

  const storeSection = document.createElement("section");
  storeSection.className = "store-manager";
  storeSection.id = "storeGroup";
  storeSection.innerHTML = `
    <div class="store-manager-head">
      <div><h2>매장 추가 / 관리</h2><div style="font-size:10px;color:#7d8580;margin-top:3px">신규 매장은 원하는 만큼 계속 추가할 수 있습니다.</div></div>
      <button id="addStore" class="add-store-btn" type="button">+ 신규 매장 추가</button>
    </div>
    <div id="storeManager" class="store-list"></div>`;
  root.append(storeSection);

  $("#addStore").onclick = () => {
    current["stores.items"].push(newStore());
    renderStoresManager();
    setDirty();
  };
  renderStoresManager();
}

async function load() {
  let data = window.DODO_DEFAULT_CONTENT || {};
  if (location.protocol !== "file:") {
    try {
      const r = await fetch("content.json?_=" + Date.now(), {cache:"no-store"});
      if (r.ok) data = await r.json();
    } catch (_) {}
  }
  render(data);
}

function collect() {
  const data = clone(current);
  document.querySelectorAll("[data-key]").forEach((input) => {
    data[input.dataset.key] = input.type === "number" ? Number(input.value) : input.value;
  });
  document.querySelectorAll("[data-toggle-key]").forEach((btn) => {
    data[btn.dataset.toggleKey] = btn.classList.contains("on");
  });
  return data;
}

function arrayBufferToBase64(ab) {
  const bytes = new Uint8Array(ab);
  let binary = "";
  for (let i = 0; i < bytes.length; i += 32768) {
    binary += String.fromCharCode(...bytes.subarray(i, Math.min(i + 32768, bytes.length)));
  }
  return btoa(binary);
}

function textToBase64(text) {
  return btoa(unescape(encodeURIComponent(text)));
}

function base64ToText(base64) {
  const clean = String(base64 || "").replace(/\n/g, "");
  return decodeURIComponent(escape(atob(clean)));
}

function safeImageName(name) {
  const ext = (name.split(".").pop() || "jpg").toLowerCase().replace(/[^a-z0-9]/g, "") || "jpg";
  return `cms-${Date.now()}-${Math.random().toString(36).slice(2,7)}.${ext}`;
}

async function getGithubMeta(api, branch, headers) {
  const r = await fetch(api + "?ref=" + encodeURIComponent(branch) + "&_=" + Date.now(), {
    headers,
    cache:"no-store"
  });
  if (r.status === 404) return null;
  if (!r.ok) throw new Error("GitHub 파일 정보를 확인하지 못했습니다.");
  return r.json();
}

async function putGithub(api, branch, headers, content, message, sha) {
  const body = {message, content, branch};
  if (sha) body.sha = sha;
  const r = await fetch(api, {
    method:"PUT",
    headers:{...headers, "Content-Type":"application/json"},
    body:JSON.stringify(body)
  });
  if (!r.ok) {
    const t = await r.text();
    throw new Error("GitHub 저장 실패: " + t.slice(0,180));
  }
  return r.json();
}

async function save() {
  const token = $("#token").value.trim();
  const owner = $("#owner").value.trim();
  const repo = $("#repo").value.trim();
  const branch = $("#branch").value.trim() || "main";

  if (!token || !owner || !repo) {
    status("GitHub 토큰·계정명·저장소명을 입력해주세요.", true);
    return;
  }

  const headers = {
    "Accept":"application/vnd.github+json",
    "Authorization":"Bearer " + token,
    "X-GitHub-Api-Version":"2022-11-28"
  };

  const data = collect();

  try {
    let uploaded = 0;

    // 1) 이미지 먼저 업로드 + content 데이터의 이미지 경로를 즉시 변경
    for (const [key, file] of pendingFiles.entries()) {
      uploaded++;
      status(`이미지 업로드 중... (${uploaded}/${pendingFiles.size})`);

      const path = "assets/images/cms/" + safeImageName(file.name);
      const imageApi = `https://api.github.com/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}/contents/${path}`;

      await putGithub(
        imageApi,
        branch,
        headers,
        arrayBufferToBase64(await file.arrayBuffer()),
        "Upload CMS image"
      );

      if (key.startsWith("stores.items.")) {
        const id = key.split(".")[2];
        const store = data["stores.items"]?.find(x => x.id === id);
        if (store) store.image = path;
      } else {
        data[key] = path;
      }
    }

    // 2) content.json 저장
    const contentApi = `https://api.github.com/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}/contents/content.json`;

    const writeContent = async () => {
      const meta = await getGithubMeta(contentApi, branch, headers);
      await putGithub(
        contentApi,
        branch,
        headers,
        textToBase64(JSON.stringify(data, null, 2)),
        "Update DODO CMS content",
        meta?.sha
      );
    };

    status("홈페이지 설정값 저장 중...");
    await writeContent();

    // 3) GitHub의 content.json을 다시 읽어서 이미지 경로까지 검증
    const verify = async () => {
      const file = await getGithubMeta(contentApi, branch, headers);
      if (!file?.content) return false;

      const saved = JSON.parse(base64ToText(file.content));

      for (const [key] of pendingFiles.entries()) {
        if (key.startsWith("stores.items.")) {
          const id = key.split(".")[2];
          const expected = data["stores.items"]?.find(x => x.id === id)?.image;
          const actual = saved["stores.items"]?.find(x => x.id === id)?.image;
          if (expected !== actual) return false;
        } else {
          if (saved[key] !== data[key]) return false;
        }
      }
      return true;
    };

    let verified = await verify();

    if (!verified) {
      status("이미지 경로 동기화 확인 중...");
      await new Promise(r => setTimeout(r, 1000));
      await writeContent();
      await new Promise(r => setTimeout(r, 700));
      verified = await verify();
    }

    if (!verified) {
      throw new Error("이미지는 올라갔지만 content.json 경로 확인에 실패했습니다. 다시 저장해주세요.");
    }

    current = clone(data);
    pendingFiles.clear();
    setDirty(false);

    // 화면상의 이미지 경로 입력값도 최신값으로 재표시
    render(current);
    status("저장 완료! 이미지 경로까지 자동 반영됐습니다. 1~3분 후 홈페이지에서 확인하세요.");

  } catch (e) {
    status(e.message || "저장 중 오류가 발생했습니다.", true);
  }
}

function backup() {
  const blob = new Blob([JSON.stringify(collect(), null, 2)], {type:"application/json;charset=utf-8"});
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = "content-backup.json";
  a.click();
  URL.revokeObjectURL(a.href);
}

function restore(file) {
  const reader = new FileReader();
  reader.onload = () => {
    try {
      render(JSON.parse(reader.result));
      setDirty(true);
      status("백업을 불러왔습니다. GitHub에 저장을 눌러 실제 적용하세요.");
    } catch (_) {
      status("올바른 JSON 백업 파일이 아닙니다.", true);
    }
  };
  reader.readAsText(file, "utf-8");
}

document.addEventListener("DOMContentLoaded", () => {
  load();

  $("#save").onclick = save;
  $("#reload").onclick = () => {
    if (dirty && !confirm("저장하지 않은 변경사항이 있습니다. 현재값을 다시 불러올까요?")) return;
    load();
  };
  $("#preview").onclick = () => window.open("index.html", "_blank");
  $("#backup").onclick = backup;

  if ($("#restoreBtn")) {
    $("#restoreBtn").onclick = () => $("#restoreFile")?.click();
  }
  if ($("#restoreFile")) {
    $("#restoreFile").onchange = (e) => {
      const file = e.target.files?.[0];
      if (file) restore(file);
    };
  }

  window.addEventListener("beforeunload", (e) => {
    if (!dirty) return;
    e.preventDefault();
    e.returnValue = "";
  });
});
