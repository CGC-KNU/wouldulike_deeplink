// node --test bridge.test.js
const test = require("node:test");
const assert = require("node:assert");
const { buildPlan, sanitizeSrc, sanitizeId, resolvePath, detectPlatform } = require("./bridge.js");

const IOS = "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit";
const ANDROID = "Mozilla/5.0 (Linux; Android 14; Pixel 8) Chrome/120";
const DESKTOP = "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) Chrome/120";

test("매장 QR: src 가 앱 링크까지 전달된다 (iOS)", () => {
  const p = buildPlan("?type=restaurant&id=317&src=qr", IOS);
  assert.strictEqual(p.deeplink, "wouldulike://restaurant/317?src=qr");
  assert.strictEqual(p.platform, "ios");
  assert.match(p.storeUrl, /apps\.apple\.com/);
});

test("매장 QR: Android 는 앱 열기 + Play 스토어 대체를 intent 하나로", () => {
  const p = buildPlan("?type=restaurant&id=317&src=sticker", ANDROID);
  assert.strictEqual(
    p.androidIntent,
    "intent://restaurant/317?src=sticker#Intent;scheme=wouldulike;package=com.coggiri.new1;" +
      "S.browser_fallback_url=" + encodeURIComponent("https://play.google.com/store/apps/details?id=com.coggiri.new1") + ";end"
  );
});

test("src 가 없던 옛 QR 은 이전과 똑같이 동작한다", () => {
  assert.strictEqual(buildPlan("?type=restaurant&id=56", IOS).deeplink, "wouldulike://restaurant/56");
  assert.strictEqual(buildPlan("?type=coupons", IOS).deeplink, "wouldulike://coupons");
  assert.strictEqual(buildPlan("?type=MAIN", IOS).deeplink, "wouldulike://main");
});

test("src 는 안전한 값만 통과 (주소 주입 방지)", () => {
  assert.strictEqual(sanitizeSrc("Sticker"), "sticker");
  assert.strictEqual(sanitizeSrc("tent_2"), "tent_2");
  assert.strictEqual(sanitizeSrc("a&b=c"), "");
  assert.strictEqual(sanitizeSrc("x".repeat(21)), "");
  assert.strictEqual(sanitizeSrc("../etc"), "");
  assert.strictEqual(buildPlan("?type=restaurant&id=1&src=a%26evil%3D1", IOS).deeplink, "wouldulike://restaurant/1");
});

test("매장이 아닌 화면에는 src 를 붙이지 않는다", () => {
  assert.strictEqual(buildPlan("?type=coupons&src=qr", IOS).deeplink, "wouldulike://coupons");
});

test("id 없는 매장 링크는 식당 목록, 모르는 type 은 앱 첫 화면", () => {
  assert.strictEqual(buildPlan("?type=restaurant", IOS).deeplink, "wouldulike://restaurant");
  assert.strictEqual(buildPlan("?type=nope", IOS).deeplink, "wouldulike://");
  assert.strictEqual(buildPlan("", IOS).deeplink, "wouldulike://");
});

test("기존 type 들이 그대로 매핑된다", () => {
  const cases = { tab: ["tab", "2", "tab/2"], shop: ["shop", "", "shop"], profile: ["profile", "", "profile"],
    mileage: ["mileage", "", "coupons"], affiliate: ["affiliate", "", "restaurant"] };
  for (const [, [type, id, want]] of Object.entries(cases)) assert.strictEqual(resolvePath(type, id), want);
});

test("PC 는 이동하지 않는 플랫폼으로 구분", () => {
  assert.strictEqual(detectPlatform(DESKTOP), "other");
  assert.strictEqual(buildPlan("?type=restaurant&id=1", DESKTOP).androidIntent, undefined);
});

test("id 에 경로·쿼리 문자가 들어와도 앱 주소가 깨지지 않는다", () => {
  assert.strictEqual(sanitizeId("317"), "317");
  assert.strictEqual(sanitizeId("7/../x"), "");
  assert.strictEqual(sanitizeId("7?a=1"), "");
  assert.strictEqual(buildPlan("?type=restaurant&id=7%2F..%2Fx", IOS).deeplink, "wouldulike://restaurant");
});
