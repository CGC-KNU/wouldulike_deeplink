# wouldulike_deeplink

우주라이크 딥링크 브릿지 (GitHub Pages): https://cgc-knu.github.io/wouldulike_deeplink/

## 운영용 링크

- 식당: https://cgc-knu.github.io/wouldulike_deeplink/?type=restaurant&id={식당ID}
- 쿠폰함(한정쿠폰 배너): https://cgc-knu.github.io/wouldulike_deeplink/?type=coupons
- 홈: https://cgc-knu.github.io/wouldulike_deeplink/?type=main
- 마일리지 이벤트(임시, 지갑/쿠폰함으로 연결): https://cgc-knu.github.io/wouldulike_deeplink/?type=mileage
- 앱 내 설문: https://cgc-knu.github.io/wouldulike_deeplink/?type=survey&id={설문 코드} (2.6.0 까지의 옛 앱은 설문을 몰라 첫 화면만 열린다)

## 매장 QR (스티커·포스터·텐트)

- 주소: `?type=restaurant&id={식당ID}&src=sticker|poster|tent`
- 앱이 있으면 앱의 해당 매장으로 연다 (앱의 QR 첫 방문 쿠폰·마일리지 흐름 그대로).
- 앱이 없으면: **2026-12-01 00:00 KST 전**에는 스토어, **이후**에는 웹 스탬프(`https://wouldulike-experience.vercel.app/s/{id}?src=…`)로 보낸다. 웹에서 적립하고 앱 설치로 이어진다.
- 이미 붙인 스티커도 같은 주소라 12/1에 자동으로 웹 스탬프로 바뀐다. 전환일·웹 주소는 `bridge.js` 맨 위 `WEB_STAMP_START`, `WEB_STAMP_BASE`.
