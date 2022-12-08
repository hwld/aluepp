import { TRPCError } from "@trpc/server";
import { z } from "zod";
import {
  pageSchema,
  themeFormSchema,
  themeJoinFormSchema,
  themeUpdateFormSchema,
} from "../../share/schema";
import { paginate } from "../lib/paginate";
import {
  findManyThemes,
  findTheme,
  searchThemes,
  Theme,
} from "../models/theme";
import { findThemeDevelopers, ThemeDeveloper } from "../models/themeDeveloper";
import { findAllThemeTags, ThemeTag } from "../models/themeTag";
import { prisma } from "../prismadb";
import { publicProcedure, requireLoggedInProcedure, router } from "../trpc";

export const themeRoute = router({
  getAll: publicProcedure.query(async () => {
    const allThemes = await findManyThemes({});
    return allThemes;
  }),
  // ページを指定して、お題を取得する
  getMany: publicProcedure
    .input(z.object({ page: pageSchema }))
    .query(async ({ input: { page } }) => {
      const { data: themes, allPages } = await paginate({
        finderInput: undefined,
        finder: findManyThemes,
        counter: prisma.appTheme.count,
        pagingData: { page, limit: 6 },
      });

      return { themes, allPages };
    }),

  // すべてのタグを取得する
  getAllTags: publicProcedure.query(async (): Promise<ThemeTag[]> => {
    const allTags = await findAllThemeTags();
    return allTags;
  }),

  // idを指定してタグを取得する
  get: publicProcedure
    .input(z.object({ themeId: z.string() }))
    .query(async ({ input }): Promise<Theme> => {
      const theme = await findTheme({ id: input.themeId });

      if (!theme) {
        throw new TRPCError({ code: "NOT_FOUND" });
      }

      return theme;
    }),

  // お題を検索する
  search: publicProcedure
    .input(
      z.object({
        keyword: z.string(),
        tagIds: z.array(z.string().min(1)),
        page: pageSchema,
      })
    )
    .query(
      async ({ input }): Promise<{ themes: Theme[]; allPages: number }> => {
        const paginatedThemes = await searchThemes(
          {
            keyword: input.keyword,
            tagIds: input.tagIds,
          },
          { page: input.page, limit: 6 }
        );

        return paginatedThemes;
      }
    ),

  // お題を作成する
  create: requireLoggedInProcedure
    .input(themeFormSchema)
    .mutation(async ({ input, ctx }) => {
      await prisma.appTheme.create({
        data: {
          title: input.title,
          description: input.description,
          tags: { create: input.tags.map((id) => ({ tagId: id })) },
          userId: ctx.session.user.id,
        },
      });
    }),

  // お題を更新する
  update: requireLoggedInProcedure
    .input(themeUpdateFormSchema)
    .mutation(async ({ input, ctx }) => {
      // ログインユーザーが投稿したお題が存在するか確認する
      const existingTheme = await prisma.appTheme.findFirst({
        where: { id: input.themeId, userId: ctx.session.user.id },
      });
      if (!existingTheme) {
        throw new TRPCError({ code: "BAD_REQUEST" });
      }

      // 更新前のタグを全部外す
      const deleteAllTags = prisma.appThemeTagOnAppTheme.deleteMany({
        where: { themeId: input.themeId },
      });

      // 入力されたタグを全て付ける
      const attachTags = prisma.appTheme.update({
        where: { id: input.themeId },
        data: {
          title: input.title,
          description: input.description,
          tags: { create: input.tags.map((tagId) => ({ tagId })) },
        },
      });

      // トランザクションを使用する
      await prisma.$transaction([deleteAllTags, attachTags]);
    }),

  // お題を削除する
  delete: requireLoggedInProcedure
    .input(z.object({ themeId: z.string().min(1) }))
    .mutation(async ({ input, ctx }) => {
      // ログインユーザーが登録しているお題か確認する
      const theme = await prisma.appTheme.findUnique({
        where: { id: input.themeId },
      });
      if (ctx.session.user.id !== theme?.userId) {
        throw new TRPCError({ code: "BAD_REQUEST" });
      }

      await prisma.appTheme.delete({ where: { id: input.themeId } });
    }),

  // お題に参加する
  join: requireLoggedInProcedure
    .input(themeJoinFormSchema)
    .mutation(async ({ input, ctx }) => {
      await prisma.appThemeDeveloper.create({
        data: {
          appTheme: { connect: { id: input.themeId } },
          user: { connect: { id: ctx.session.user.id } },
          githubUrl: input.githubUrl,
          comment: input.comment ?? "",
        },
      });
    }),

  // ログインユーザーが指定されたお題に参加しているか
  joined: publicProcedure
    .input(z.object({ themeId: z.string() }))
    .query(async ({ input, ctx }) => {
      const loggedInUser = ctx.session?.user;
      if (!loggedInUser) {
        return false;
      }

      const developer = await prisma.appThemeDeveloper.findUnique({
        where: {
          userId_appThemeId: {
            userId: loggedInUser.id,
            appThemeId: input.themeId,
          },
        },
        select: { id: true },
      });

      return Boolean(developer);
    }),

  // お題にいいねする
  like: requireLoggedInProcedure
    .input(z.object({ themeId: z.string().min(1), like: z.boolean() }))
    .mutation(async ({ input, ctx }) => {
      const theme = await prisma.appTheme.findUnique({
        where: { id: input.themeId },
      });
      // 指定されたthemeが存在しない場合
      if (!theme) {
        throw new TRPCError({ code: "BAD_REQUEST" });
      }

      // 投稿者が自分のお題にいいねすることはできない
      if (theme.userId == ctx.session.user.id) {
        throw new TRPCError({ code: "BAD_REQUEST" });
      }

      if (input.like) {
        // いいね
        await prisma.appThemeLike.create({
          data: {
            appTheme: { connect: { id: theme.id } },
            user: { connect: { id: ctx.session.user.id } },
          },
        });
      } else {
        // いいね解除
        await prisma.appThemeLike.delete({
          where: {
            userId_appThemeId: {
              appThemeId: input.themeId,
              userId: ctx.session.user.id,
            },
          },
        });
      }
    }),

  // ログインユーザーが指定されたidのお題をいいねしているか
  liked: publicProcedure
    .input(z.object({ themeId: z.string().min(1) }))
    .query(async ({ input, ctx }): Promise<boolean> => {
      const loggedInUser = ctx.session?.user;
      if (!loggedInUser) {
        return false;
      }

      const like = await prisma.appThemeLike.findUnique({
        where: {
          userId_appThemeId: {
            appThemeId: input.themeId,
            userId: loggedInUser.id,
          },
        },
      });

      return Boolean(like);
    }),

  // 指定されたお題の参加者を取得する
  getAllDevelopers: publicProcedure
    .input(z.object({ themeId: z.string().min(1) }))
    .query(async ({ input, ctx }): Promise<ThemeDeveloper[]> => {
      const developers = findThemeDevelopers({
        where: { appThemeId: input.themeId },
        loggedInUserId: ctx.session?.user.id,
      });
      return developers;
    }),

  // 1カ月間でいいねが多かった投稿を取得する
  getTop10LikesThemesInThisMonth: publicProcedure.query(async () => {
    const themes = await prisma.$transaction(async (tx) => {
      // お題のidのリストを取得する
      type ThemeIdObjs = { themeId: string }[];
      const themeIdObjs = await tx.$queryRaw<ThemeIdObjs>`
        SELECT
          Theme.id as themeId
          , COUNT(ThemeLike.id) as likeCount
        FROM
          AppThemeLike as ThemeLike
          LEFT JOIN AppTheme as Theme
            ON (ThemeLike.appThemeId = Theme.id)
        WHERE
          Theme.createdAt > (NOW() - INTERVAL 1 MONTh)
        GROUP BY
          Theme.id
        ORDER BY
          likeCount DESC
          , Theme.createdAt DESC
        LIMIT
          10
      `;
      const themeIds = themeIdObjs.map(({ themeId }) => themeId);

      const themes = await findManyThemes(
        { where: { id: { in: themeIds } } },
        tx
      );

      // themeIdsに並び順を合わせる
      const sortedThemes = themes.sort((a, b) => {
        return themeIds.indexOf(a.id) - themeIds.indexOf(b.id);
      });

      return sortedThemes;
    });

    return themes;
  }),

  // 1カ月間でいいねが多かった開発者ユーザーTop10を取得する
  getTop10LikesDevelopersInThisMonth: publicProcedure.query(async () => {
    const developerUsers = await prisma.$transaction(async (tx) => {
      // ユーザーidのリストを取得する
      type DeveloperUserIdObjs = { userId: string }[];
      const developerUserIdObjs = await tx.$queryRaw<DeveloperUserIdObjs>`
        SELECT
          User.id as userId
          , COUNT(DevLike.id) as likeCount
        FROM
          AppThemeDeveloperLike as DevLike
          LEFT JOIN AppThemeDeveloper as Developer
            ON (DevLike.developerId = Developer.id)
          LEFT JOIN User
            ON (Developer.userId = User.id)
        WHERE
          DevLike.createdAt > (NOW() - INTERVAL 1 MONTH)
        GROUP BY
          User.id
        ORDER BY
          likeCount DESC
          , Developer.createdAt DESC
        LIMIT
          10
      `;
      const developerUserIds = developerUserIdObjs.map(({ userId }) => userId);

      // ユーザーを取得する
      const users = await tx.user.findMany({
        where: { id: { in: developerUserIds } },
      });

      // developerUserIdsはランキング順どおりになっているが、prismaでinを通すと順番が不定になるので、
      // developeruserIdsの順に並び変える
      const sortedUsers = users.sort((a, b) => {
        return developerUserIds.indexOf(a.id) - developerUserIds.indexOf(b.id);
      });

      return sortedUsers;
    });

    return developerUsers;
  }),

  // 1カ月間でいいねが多かった投稿者Top10を取得する
  getTop10LikesPostersInThisMonth: publicProcedure.query(async () => {
    const posterUsers = await prisma.$transaction(async (tx) => {
      type PosterUserIdObjs = { userId: string }[];
      const posterUserIdObjs = await tx.$queryRaw<PosterUserIdObjs>`
        SELECT
          User.id as userId
          , COUNT(AppThemeLike.id) as likeCount
        FROM
          AppThemeLike
          LEFT JOIN AppTheme
            ON (AppThemeLike.appThemeId = AppTheme.id)
          LEFT JOIN User
            ON (AppTheme.userId = User.id)
        WHERE
          AppThemeLike.createdAt > (NOW() - INTERVAL 1 MONTH)
        GROUP BY
          User.id
        ORDER BY
          likeCount DESC
          , AppTheme.createdAt DESC
        LIMIT
          10
      `;
      const posterUserIds = posterUserIdObjs.map(({ userId }) => userId);

      // ユーザーを取得する
      const users = await tx.user.findMany({
        where: { id: { in: posterUserIds } },
      });

      // posterUserIdsはランキング順通りになっているが、prismaでinを通すと順番が不定になるので
      // posterUseridsの順に並び変える
      const sortedUsers = users.sort((a, b) => {
        return posterUserIds.indexOf(a.id) - posterUserIds.indexOf(b.id);
      });

      return sortedUsers;
    });

    return posterUsers;
  }),
});
