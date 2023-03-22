import { router } from "../../lib/trpc";
import { getPickedIdeas } from "./getPickedIdeas";
import { getTop10LikesDevelopmentsInThisMonth } from "./getTop10LikesDevelopmentsInThisMonth";
import { getTop10LikesIdeasInThisMonth } from "./getTop10LikesIdeasInThisMonth";
import { getTop10LikesPostersInThisMonth } from "./getTop10LikesPostersInThisMonth";

export const aggregateRoute = router({
  /** 1ヶ月間でいいねが多かったお題Top10を取得する */
  getTop10LikesIdeasInThisMonth: getTop10LikesIdeasInThisMonth,

  /** 1ヶ月間でいいねが多かった開発者Top10を取得する */
  getTop10LikesDevelopmentsInThisMonth: getTop10LikesDevelopmentsInThisMonth,

  /** 1ヶ月間でいいねが多かったお題投稿者Top10を取得する */
  getTop10LikesPostersInThisMonth: getTop10LikesPostersInThisMonth,

  /** お題をいくつかピックアップする */
  getPickedIdeas: getPickedIdeas,
});
