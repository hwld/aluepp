export const PAGE_LIMIT = {
  favoritedUsers: 50,
  devs: 20,
  searchedIdeas: 24,
  ideaLikers: 20,
  devLikers: 20,
  devsByUser: 18,
  likedIdeas: 18,
  likedDevs: 18,
  postedIdeas: 18,
} as const;

export const Bytes = {
  KB: 1024,
  MB: 1024 ** 2,
} as const;

export const UPLOAD_IMAGE_LIMIT_MB = 1;

export const TOTAL_UPLOAD_IMAGE_LIMIT_MB = 100;

/**
 * welcomeメッセージを非表示にしたときにセットされるクッキーの名前
 */
export const welcomeMessageHiddenCookie = "welcome-message-hidden";
