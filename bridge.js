// 우주라이크 딥링크 브릿지 로직. index.html 이 불러 쓰고, node 로도 테스트한다 (bridge.test.js).
//
// 매장 QR: ?type=restaurant&id={restaurant_id}&src=qr|sticker|poster|tent
//   · 앱이 있으면 wouldulike://restaurant/{id}?src={src} 로 연다 (src 는 출처 기록용).
//   · 앱이 없으면 스토어로 보낸다. 앱이 열렸는데도 스토어로 튕기지 않게 한다.

var ANDROID_PACKAGE = "com.coggiri.new1";
var PLAY_URL = "https://play.google.com/store/apps/details?id=" + ANDROID_PACKAGE;
var APP_STORE_URL = "https://apps.apple.com/app/id6740640251";

// 화면(type) → wouldulike:// 뒤의 경로. 모르는 type 은 앱 첫 화면.
function resolvePath(type, id) {
  type = (type || "").toLowerCase();
  if (type === "restaurant" || type === "restaurants") return id ? "restaurant/" + id : "restaurant";
  if (type === "affiliate") return "restaurant";
  if (type === "tab" && id) return "tab/" + id;
  if (type === "coupons" || type === "coupon") return "coupons";
  if (type === "main") return "main";
  // 앱이 wouldulike://mileage 를 받게 되면 그때 스킴만 바꾸면 됨
  if (type === "mileage") return "coupons";
  if (type === "shop" || type === "mileage-shop" || type === "mileageshop") return "shop";
  if (type === "profile" || type === "profilesetup") return "profile";
  return "";
}

// id(식당 번호·탭 번호)는 영문·숫자·밑줄·하이픈만. 주소 경로에 그대로 들어가므로 "/"·"?" 같은 건 버린다.
function sanitizeId(raw) {
  var s = (raw || "").trim();
  return /^[A-Za-z0-9_-]{1,40}$/.test(s) ? s : "";
}

// 출처 표기. 영문 소문자·숫자·밑줄·하이픈 20자까지만 통과시킨다(주소에 그대로 붙으므로).
function sanitizeSrc(raw) {
  var s = (raw || "").toLowerCase();
  return /^[a-z0-9_-]{1,20}$/.test(s) ? s : "";
}

// 매장 링크에만 src 를 붙인다. 다른 화면은 출처가 의미 없다.
function buildQuery(path, src) {
  return src && path.indexOf("restaurant") === 0 ? "?src=" + src : "";
}

function detectPlatform(ua) {
  ua = ua || "";
  if (/iPhone|iPad|iPod/i.test(ua)) return "ios";
  if (/Android/i.test(ua)) return "android";
  return "other";
}

// 플랫폼별 이동 계획.
//  · android: intent:// 하나로 "앱 열기, 없으면 Play 스토어" 를 처리한다(타이머 불필요).
//  · ios: 커스텀 스킴으로 열고, 화면이 그대로면 잠시 뒤 App Store.
//  · other(PC 등): 이동하지 않고 안내만.
function buildPlan(search, ua) {
  var params = new URLSearchParams(search || "");
  var path = resolvePath(params.get("type"), sanitizeId(params.get("id")));
  var src = sanitizeSrc(params.get("src"));
  var query = buildQuery(path, src);
  var deeplink = "wouldulike://" + path + query;
  var platform = detectPlatform(ua);
  var storeUrl = platform === "ios" ? APP_STORE_URL : PLAY_URL;
  var plan = { platform: platform, deeplink: deeplink, storeUrl: storeUrl };
  if (platform === "android") {
    plan.androidIntent =
      "intent://" + path + query +
      "#Intent;scheme=wouldulike;package=" + ANDROID_PACKAGE +
      ";S.browser_fallback_url=" + encodeURIComponent(PLAY_URL) + ";end";
  }
  return plan;
}

if (typeof module !== "undefined") {
  module.exports = { resolvePath: resolvePath, sanitizeSrc: sanitizeSrc, sanitizeId: sanitizeId, buildPlan: buildPlan, detectPlatform: detectPlatform };
}
