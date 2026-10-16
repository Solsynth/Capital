/**
 * App Store availability, by product. These are the only places a build can be had
 * outside the release pages — the listings do not accept an artifact upload.
 */
export type AppStoreBadgeKind = "ios" | "macos";

export type AppStoreListing = {
  url: string;
  labelKey: string;
  badge: AppStoreBadgeKind;
  /** Shown under the badges when a listing is not available in every region. */
  noticeKey?: string;
};

export type AppStoreAvailability = {
  ios?: AppStoreListing;
  macos?: AppStoreListing;
};

export const APP_STORE_AVAILABILITY: Record<string, AppStoreAvailability> = {
  "maid-kit": {
    ios: {
      url: "https://apps.apple.com/app/id6793576897",
      labelKey: "maidKit.download.ios.appStore",
      badge: "ios",
    },
    macos: {
      url: "https://apps.apple.com/app/id6793576897",
      labelKey: "maidKit.download.macos.appStore",
      badge: "macos",
    },
  },
  "solar-network": {
    ios: {
      url: "https://apps.apple.com/app/id6499032345",
      labelKey: "solarNetwork.download.ios.appStore",
      badge: "ios",
      noticeKey: "solarNetwork.download.cnNotice",
    },
    macos: {
      url: "https://apps.apple.com/app/id6499032345",
      labelKey: "solarNetwork.download.macos.appStore",
      badge: "macos",
      noticeKey: "solarNetwork.download.cnNotice",
    },
  },
};

/** Intrinsic size of each lockup, in the SVG's own units — all are 40 tall. */
const BADGE_INTRINSIC: Record<string, { width: number; height: number }> = {
  "app-store-en": { width: 120, height: 40 },
  "app-store-zh": { width: 109, height: 40 },
  "mac-app-store-en": { width: 156, height: 40 },
  "mac-app-store-zh": { width: 140, height: 40 },
};

/**
 * Official store lockups, one per store, size and language. The intrinsic size travels with
 * the paths so the layout can reserve the badge's box before the file loads.
 */
export function appStoreBadgeSrc(
  listing: AppStoreListing,
  locale: string,
): { light: string; dark: string; width: number; height: number } {
  const language = locale.startsWith("zh") ? "zh" : "en";
  const prefix = listing.badge === "macos" ? "mac-app-store" : "app-store";
  return {
    light: `/images/app-store/${prefix}-${language}-light.svg`,
    dark: `/images/app-store/${prefix}-${language}-dark.svg`,
    ...BADGE_INTRINSIC[`${prefix}-${language}`],
  };
}
