import { router } from "../../lib/trpc";
import { createTheme } from "./createTheme";
import { deleteTheme } from "./deleteTheme";
import { developedTheme } from "./developedTheme";
import { developTheme } from "./developTheme";
import { getAllTags } from "./getAllTags";
import { getDevelopedThemesByUser } from "./getDevelopedThemesByUser";
import { getLikedThemesByUser } from "./getLikedThemesByUser";
import { getPostedThemesByUser } from "./getPostedThemesByUser";
import { getTheme } from "./getTheme";
import { getThemeLikeCountByUser } from "./getThemeLikeCountByUser";
import { likedTheme } from "./likedTheme";
import { likeTheme } from "./likeTheme";
import { searchTheme } from "./searchTheme";
import { updateTheme } from "./updateTheme";

export const themeRoute = router({
  /** すべてのタグを取得する */
  getAllTags,

  /** idを指定してテーマを取得する */
  get: getTheme,

  /** お題を検索する */
  search: searchTheme,

  /** お題を作成する */
  create: createTheme,

  /** お題を更新する */
  update: updateTheme,

  /**　お題を削除する */
  delete: deleteTheme,

  /** お題を開発する */
  develop: developTheme,

  /** ログインユーザーが指定されたお題を開発しているか */
  developed: developedTheme,

  /** お題にいいね・いいね解除する */
  like: likeTheme,

  /** ログインユーザーがお題をいいねしているか */
  liked: likedTheme,

  /** 指定されたユーザーが投稿したお題についたすべての「いいね」を取得する */
  getLikeCountByUser: getThemeLikeCountByUser,

  /** 指定されたユーザーが投稿されたお題を取得する */
  getPostedThemesByUser,

  /** 指定されたユーザーが開発しているお題を取得する */
  getDevelopedThemesByUser: getDevelopedThemesByUser,

  /** 指定されたユーザーがいいねしたお題を取得する */
  getLikedThemesByUser,
});