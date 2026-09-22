const OFFICE_LAT = 25.022826;
const OFFICE_LNG = 121.548278;

const statusEl = document.getElementById("status");
const latEl = document.getElementById("lat");
const lngEl = document.getElementById("lng");
const accEl = document.getElementById("acc");
const timeEl = document.getElementById("time");
const officeEl = document.getElementById("office");
const distEl = document.getElementById("dist");
const mapLink = document.getElementById("mapLink");

const btnOnce = document.getElementById("btnOnce");
const btnWatch = document.getElementById("btnWatch");
const btnStop = document.getElementById("btnStop");

let watchId = null;

const options = {
  enableHighAccuracy: true,
  timeout: 10000,
  maximumAge: 0,
};

function setStatus(message, type) {
  statusEl.textContent = message;
  statusEl.className = "status" + (type ? " " + type : "");
}

function distanceInMeters(lat1, lng1, lat2, lng2) {
  const R = 6371000;
  const toRad = (deg) => (deg * Math.PI) / 180;

  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);

  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c;
}

function showPosition(position) {
  const { latitude, longitude, accuracy } = position.coords;

  latEl.textContent = latitude.toFixed(6);
  lngEl.textContent = longitude.toFixed(6);
  accEl.textContent = `約 ${Math.round(accuracy)} 公尺`;
  timeEl.textContent = new Date(position.timestamp).toLocaleTimeString();

  const distance = distanceInMeters(latitude, longitude, OFFICE_LAT, OFFICE_LNG);
  distEl.textContent = `${Math.round(distance)} 公尺`;

  mapLink.href = `https://www.google.com/maps?q=${latitude},${longitude}`;
  mapLink.style.display = "block";

  setStatus("已取得位置", "ok");
}

function showError(error) {
  const messages = {
    1: "使用者拒絕了定位權限，請至瀏覽器設定開啟位置存取",
    2: "無法取得目前位置（訊號不足或裝置不支援）",
    3: "取得位置逾時，請重試",
  };
  setStatus(messages[error.code] || `發生錯誤：${error.message}`, "error");
}

function checkSupport() {
  if (!("geolocation" in navigator)) {
    setStatus("此瀏覽器不支援定位功能", "error");
    btnOnce.disabled = true;
    btnWatch.disabled = true;
    return false;
  }
  return true;
}

btnOnce.addEventListener("click", () => {
  if (!checkSupport()) return;
  setStatus("定位中...");
  navigator.geolocation.getCurrentPosition(showPosition, showError, options);
});

btnWatch.addEventListener("click", () => {
  if (!checkSupport()) return;
  setStatus("持續追蹤中...");
  watchId = navigator.geolocation.watchPosition(showPosition, showError, options);
  btnWatch.disabled = true;
  btnOnce.disabled = true;
  btnStop.disabled = false;
});

btnStop.addEventListener("click", () => {
  if (watchId !== null) {
    navigator.geolocation.clearWatch(watchId);
    watchId = null;
  }
  btnWatch.disabled = false;
  btnOnce.disabled = false;
  btnStop.disabled = true;
  setStatus("已停止追蹤");
});

officeEl.textContent = `${OFFICE_LAT}, ${OFFICE_LNG}`;

checkSupport();
