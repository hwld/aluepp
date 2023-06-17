import { router } from "../../lib/trpc";
import { getFavoritedUsers } from "./favoritedUsers";
import { favoriteUser } from "./favoriteUser";
import { getFavoriteCountByUser } from "./favoriteUserCount";
import { getDevelopmentLikingUsers } from "./getDevelopmentLikingUsers";
import { getIdeaLikingUsers } from "./getIdeaLikingUsers";
import { getReceivedLikeCount } from "./getReceivedLikeCount";
import { getUser } from "./getUser";
import { getUserActivity } from "./getUserActivity";
import { isFavoritedByLoggedInUser } from "./isFavoritedByLoggedInUser";
import { searchUser } from "./searchUser";
import { unfavoriteUser } from "./unfavoriteUser";

export const userRoute = router({
  /** ユーザーを取得する */
  get: getUser,

  /** ユーザーを検索する */
  search: searchUser,

  /** お気に入りを登録 */
  favorite: favoriteUser,

  /** お気に入りの解除 */
  unfavorite: unfavoriteUser,

  /** ログインユーザーがお気に入りしているか */
  isFavoritedByLoggedInUser: isFavoritedByLoggedInUser,

  /** お気に入りしたユーザーの数を取得する */
  getFavoriteCountByUser: getFavoriteCountByUser,

  /** お気に入りユーザーを取得する */
  getFavoritedUsers: getFavoritedUsers,

  /** 指定されたお題をいいねしたユーザーを取得する */
  getIdeaLikingUsers: getIdeaLikingUsers,

  /** 指定された開発情報をいいねしたユーザーを取得する */
  getDevelopmentLikingUsers: getDevelopmentLikingUsers,

  /** ユーザーのアクティビティを取得する */
  getUserActivity: getUserActivity,

  /** ユーザーがもらったいいねの数を取得する */
  getReceivedLikeCount: getReceivedLikeCount,
});
