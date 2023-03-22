import { Prisma } from "@prisma/client";
import { formatDistanceStrict } from "date-fns";
import { ja } from "date-fns/locale";
import { IdeaOrder, IdeaPeriod } from "../../share/schema";
import { sortedInSameOrder } from "../../share/utils";
import { OmitStrict } from "../../types/OmitStrict";
import { db } from "../lib/prismadb";

export type Idea = {
  user: {
    id: string;
    name: string | null;
    image: string | null;
  };
  likes: number;
  id: string;
  title: string;
  descriptionHtml: string;
  tags: {
    id: string;
    name: string;
  }[];
  developments: number;
  comments: number;
  createdAt: string;
  updatedAt: string;
  /** 作成してから取得するまでの経過時間 */
  elapsedSinceCreation: string;
};

const ideaArgs = {
  include: {
    tags: { include: { tag: true, idea: true } },
    user: true,
    _count: { select: { likes: true, developments: true, comments: true } },
  },
} satisfies Prisma.IdeaArgs;

const convertIdea = (rawIdea: Prisma.IdeaGetPayload<typeof ideaArgs>): Idea => {
  const idea: Idea = {
    id: rawIdea.id,
    title: rawIdea.title,
    tags: rawIdea.tags.map(({ tag: { id, name } }) => ({ id, name })),
    descriptionHtml: rawIdea.description,
    createdAt: rawIdea.createdAt.toUTCString(),
    elapsedSinceCreation: formatDistanceStrict(rawIdea.createdAt, new Date(), {
      addSuffix: true,
      locale: ja,
    }),
    updatedAt: rawIdea.updatedAt.toUTCString(),
    user: {
      id: rawIdea.user.id,
      name: rawIdea.user.name,
      image: rawIdea.user.image,
    },
    likes: rawIdea._count.likes,
    developments: rawIdea._count.developments,
    comments: rawIdea._count.comments,
  };

  return idea;
};

export const findIdea = async (
  where: Prisma.IdeaWhereUniqueInput
): Promise<Idea | undefined> => {
  const rawIdea = await db.idea.findFirst({
    where,
    ...ideaArgs,
  });

  if (!rawIdea) {
    return undefined;
  }

  const idea = convertIdea(rawIdea);
  return idea;
};

export const findManyIdeas = async (
  {
    orderBy,
    ...args
  }: OmitStrict<Prisma.IdeaFindManyArgs, "include" | "select">,
  transactionClient?: Prisma.TransactionClient
) => {
  const client = transactionClient ?? db;

  const rawIdeas = await client.idea.findMany({
    orderBy: { createdAt: "desc", ...orderBy },
    ...args,
    ...ideaArgs,
  });
  const ideas = rawIdeas.map(convertIdea);
  return ideas;
};

type SearchIdeasArgs = {
  keyword: string;
  tagIds: string[];
  order: IdeaOrder;
  period: IdeaPeriod;
};

export const pickUpIdeas = async (
  order: IdeaOrder,
  limit: number
): Promise<Idea[]> => {
  const paginatedIdeas = await db.$transaction(async (tx) => {
    // orderに対応するクエリや並び替え関数を宣言する
    const orderMap: {
      [T in typeof order]: {
        select: Prisma.Sql;
        from: Prisma.Sql;
        orderBy: Prisma.Sql;
      };
    } = {
      // 古い順
      createdAsc: {
        select: Prisma.sql`, MAX(Idea.createdAt) as ideaCreatedAt`,
        from: Prisma.empty,
        orderBy: Prisma.sql`ideaCreatedAt asc`,
      },
      createdDesc: {
        select: Prisma.sql`, MAX(Idea.createdAt) as ideaCreatedAt`,
        from: Prisma.empty,
        orderBy: Prisma.sql`ideaCreatedAt desc`,
      },
      likeDesc: {
        select: Prisma.sql`, COUNT(IdeaLike.id) as likeCounts`,
        from: Prisma.sql`LEFT JOIN IdeaLike ON (Idea.id = IdeaLike.ideaId)`,
        orderBy: Prisma.sql`likeCounts desc`,
      },
      developmentDesc: {
        select: Prisma.sql`, COUNT(Development.id) as developmentCounts`,
        from: Prisma.sql`LEFT JOIN Development ON (Idea.id = Development.ideaId)`,
        orderBy: Prisma.sql`developmentCounts desc`,
      },
    };

    // マスタとなるクエリを作る
    const master = Prisma.sql`
      (
        SELECT
          Idea.id as ideaId
          ${orderMap[order].select}
        FROM
          Idea
          ${orderMap[order].from}
        GROUP BY
          Idea.id
        ORDER BY
          ${orderMap[order].orderBy}
      ) master
    `;

    // お題のidのリストを求める
    type IdeaIds = { ideaId: string }[];
    const ideaIdObjs = await tx.$queryRaw<IdeaIds>`
      SELECT 
        * 
      FROM
        ${master}
      LIMIT 
        ${limit}
    `;
    const pickUpedIdeaIds = ideaIdObjs.map(({ ideaId }) => ideaId);

    const ideas = await findManyIdeas(
      { where: { id: { in: pickUpedIdeaIds } } },
      tx
    );

    const sortedIdeas = sortedInSameOrder({
      target: ideas,
      base: pickUpedIdeaIds,
      getKey: (t) => t.id,
    });

    return sortedIdeas;
  });

  return paginatedIdeas;
};

export const searchIdeas = async (
  { keyword, tagIds, order, period }: SearchIdeasArgs,
  pagingData: { page: number; limit: number }
): Promise<{ ideas: Idea[]; allPages: number }> => {
  // トランザクションを使用する
  const paginatedIdeas = await db.$transaction(async (tx) => {
    // orderに対応するクエリや並び替え関数を宣言する
    const orderMap: {
      [T in typeof order]: {
        select: Prisma.Sql;
        from: Prisma.Sql;
        orderBy: Prisma.Sql;
      };
    } = {
      // 古い順
      createdAsc: {
        select: Prisma.sql`, MAX(Idea.createdAt) as ideaCreatedAt`,
        from: Prisma.empty,
        orderBy: Prisma.sql`ideaCreatedAt asc`,
      },
      createdDesc: {
        select: Prisma.sql`, MAX(Idea.createdAt) as ideaCreatedAt`,
        from: Prisma.empty,
        orderBy: Prisma.sql`ideaCreatedAt desc`,
      },
      likeDesc: {
        select: Prisma.sql`, COUNT(IdeaLike.id) as likeCounts`,
        from: Prisma.sql`LEFT JOIN IdeaLike ON (Idea.id = IdeaLike.ideaId)`,
        orderBy: Prisma.sql`likeCounts desc`,
      },
      developmentDesc: {
        select: Prisma.sql`, COUNT(Development.id) as developmentCounts`,
        from: Prisma.sql`LEFT JOIN Development ON (Idea.id = Development.ideaId)`,
        orderBy: Prisma.sql`developmentCounts desc`,
      },
    };

    // マスタとなるクエリを作る
    const master = Prisma.sql`
      (
        SELECT
          Idea.id as ideaId
          ${orderMap[order].select}
        FROM
          Idea
          LEFT JOIN IdeaTagOnIdea
            ON (Idea.id = IdeaTagOnIdea.ideaId)
          ${orderMap[order].from}
        WHERE
          Idea.title LIKE ${"%" + keyword + "%"}
          ${
            period === "monthly"
              ? Prisma.sql`
          AND Idea.createdAt > (NOW() - INTERVAL 1 MONTH)`
              : Prisma.empty
          }
          ${
            tagIds.length > 0
              ? Prisma.sql`
          AND tagId IN (${Prisma.join(tagIds)})`
              : Prisma.empty
          }
        GROUP BY
          Idea.id
        ${
          tagIds.length > 0
            ? Prisma.sql`
        HAVING
          COUNT(ideaId) = ${tagIds.length}`
            : Prisma.empty
        }
        ORDER BY
          ${orderMap[order].orderBy}
      ) master
    `;

    // お題のidのリストを求める
    type SearchedIdeaIds = { ideaId: string }[];
    const ideaIdObjs = await tx.$queryRaw<SearchedIdeaIds>`
      SELECT 
        * 
      FROM
        ${master}
      LIMIT 
        ${pagingData.limit}
      OFFSET
        ${(pagingData.page - 1) * pagingData.limit}
    `;
    const searchedIdeaIds = ideaIdObjs.map(({ ideaId }) => ideaId);

    // 検索結果の合計数を求める
    const allItemsArray = await tx.$queryRaw<[{ allItems: BigInt }]>`
      SELECT
        COUNT(*) as allItems
      FROM ${master}
    `;
    const allItems = Number(allItemsArray[0].allItems);
    const allPages = Math.ceil(allItems / pagingData?.limit);

    const ideas = await findManyIdeas(
      { where: { id: { in: searchedIdeaIds } } },
      tx
    );

    // searchedIdeaIdsの並び順が保持されないので、並び替え直す。
    const sortedIdeas = sortedInSameOrder({
      target: ideas,
      base: searchedIdeaIds,
      getKey: (t) => t.id,
    });

    return { ideas: sortedIdeas, allPages };
  });

  return paginatedIdeas;
};