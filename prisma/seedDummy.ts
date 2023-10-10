/**
 * ダミーデータを生成
 */

import { DevStatusIds } from "@/models/developmentStatus";
import { faker } from "@faker-js/faker/locale/ja";
import { PrismaClient } from "@prisma/client";
import { Presets, SingleBar } from "cli-progress";

const prisma = new PrismaClient();

const bar = new SingleBar(
  { format: "{bar} | {percentage}% | {value}/{total}" },
  Presets.shades_classic
);

main();

async function main() {
  // シードを固定して、実行のたびに同じ値が生成されるようにする
  faker.seed(2);

  // ユーザーの作成
  const userIds = await createUsers(100);

  // お題の作成
  const ideaIds = await createIdeas(userIds, 50);

  // お題へのいいねの追加
  await createIdeaLike({
    userIds,
    ideaIds: ideaIds,
    // いいねされるお題の数
    likedIdeaCounts: 25,
    // お題へのいいねの最大数 (自分の投稿にいいねができないので(ユーザー数 - お題の数) < いいねの最大数　の場合にはエラーが出る可能性がある
    maxIdeaLikeCounts: 10,
  });

  // 開発情報の作成
  const developmentIds = await createDevelopments({
    userIds,
    ideaIds: ideaIds,
    // 開発されるお題の数
    developedIdeaCounts: 25,
    // 開発するユーザーの最大数
    maxDevelopmentCounts: 15,
  });

  // 開発者へのいいねを追加
  await createDevelopmentLikes({
    userIds,
    developmentIds: developmentIds,
    // いいねされる開発者の数
    likedDevelopmentCounts: 25,
    // 開発者へのいいねの最大数 (自分にいいねができないので(ユーザー数 - 一つのお題の最大開発者) < いいねの最大数　の場合にはエラーになる可能性がある)
    maxDevelopmentLikeCounts: 10,
  });
}

/**
 * 指定された数のユーザーを作成する
 * @returns 作成したユーザーのIDのリスト
 */
async function createUsers(counts: number): Promise<string[]> {
  console.log("ユーザーの作成");

  bar.start(counts, 0);
  const userIds = [];

  for (let i = 0; i < counts; i++) {
    const id = faker.string.uuid();
    // 既に存在すれば作成日だけ更新する作成しない
    const user = await prisma.user.upsert({
      where: { id },
      create: { id, name: faker.person.fullName() },
      update: { createdAt: new Date() },
    });
    userIds.push(user.id);
    bar.increment();
  }
  bar.stop();
  console.log("");

  return userIds;
}

/**
 * お題を作成する
 * @return 作成したお題のIDのリスト
 */
async function createIdeas(
  userIds: string[],
  counts: number
): Promise<string[]> {
  console.log("お題の作成");

  bar.start(counts, 0);
  const ideaIds = [];

  for (let i = 0; i < counts; i++) {
    const id = faker.string.uuid();
    const idea = await prisma.idea.upsert({
      where: { id },
      create: {
        id,
        title: faker.lorem.words(3),
        description: faker.lorem.lines(),
        // 先頭のユーザーから投稿していく
        userId: userIds[i],
      },
      update: { createdAt: new Date() },
    });

    ideaIds.push(idea.id);
    bar.increment();
  }
  bar.stop();
  console.log("");

  return ideaIds;
}

type CreateIdeaLikeArgs = {
  userIds: string[];
  ideaIds: string[];
  /** いいねされるお題の数 */
  likedIdeaCounts: number;
  /** 一つのお題の最大のいいね数  */
  maxIdeaLikeCounts: number;
};
/**
 * お題のいいねを追加する
 */
async function createIdeaLike({
  userIds,
  ideaIds,
  likedIdeaCounts,
  maxIdeaLikeCounts,
}: CreateIdeaLikeArgs) {
  console.log("お題にいいねを追加");

  // いいねされるお題をランダムで選択する
  const likedIdeaIds = faker.helpers.arrayElements(ideaIds, likedIdeaCounts);

  // お題それぞれに何個いいねをつけるかを決めておく
  const ideaLikeCountsList = [...new Array(likedIdeaIds.length)].map(() =>
    faker.number.int({
      min: 1,
      max: maxIdeaLikeCounts,
    })
  );

  // 何個のいいねを作成するか数える
  const sumIdeaLikes = ideaLikeCountsList.reduce(
    (prev, curr) => prev + curr,
    0
  );
  bar.start(sumIdeaLikes, 0);

  for (let i = 0; i < likedIdeaIds.length; i++) {
    // いいねをつけるお題のid
    const ideaId = likedIdeaIds[i];
    // いいねを何個つけるか
    const likeCounts = ideaLikeCountsList[i];

    // ユーザーを後ろから走査していいねをつけていく。
    for (let userIndex = 0; userIndex < likeCounts; userIndex++) {
      const id = faker.string.uuid();
      await prisma.ideaLike.upsert({
        where: { id },
        create: {
          id,
          ideaId,
          userId: userIds[userIds.length - 1 - userIndex],
        },
        update: { createdAt: new Date() },
      });
      bar.increment();
    }
  }
  bar.stop();
  console.log("");
}

type CreateDevelopmentArgs = {
  ideaIds: string[];
  userIds: string[];
  /** 開発されるお題の数 */
  developedIdeaCounts: number;
  /** 一つのお題に最大何人開発できるか */
  maxDevelopmentCounts: number;
};
/** 開発情報を作成 */
async function createDevelopments({
  ideaIds,
  userIds,
  developedIdeaCounts,
  maxDevelopmentCounts,
}: CreateDevelopmentArgs): Promise<string[]> {
  console.log("開発者の作成");

  // 開発されるお題をランダムで選択する
  const developedIdeaIds = faker.helpers.arrayElements(
    ideaIds,
    developedIdeaCounts
  );
  // お題それぞれに何人開発するかを決めておく
  const developmentCountList = [...new Array(developedIdeaIds.length)].map(() =>
    faker.number.int({ min: 1, max: maxDevelopmentCounts })
  );

  // 開発者の総数を求める
  const sumDevelopments = developmentCountList.reduce(
    (prev, curr) => prev + curr,
    0
  );
  bar.start(sumDevelopments, 0);

  const developmentIds = [];
  for (let i = 0; i < developedIdeaIds.length; i++) {
    // 開発されるお題のインデックス
    const ideaId = developedIdeaIds[i];
    // 何人開発するか
    const developmentCounts = developmentCountList[i];

    // ユーザーを先頭から走査して開発させる。
    for (let userIndex = 0; userIndex < developmentCounts; userIndex++) {
      const id = faker.string.uuid();
      const development = await prisma.development.upsert({
        where: { id },
        create: {
          id,
          githubUrl: "",
          comment: faker.lorem.words(3),
          developedItemUrl: "",
          ideaId,
          userId: userIds[userIndex],
          statusId: faker.helpers.arrayElement([
            DevStatusIds.IN_PROGRESS,
            DevStatusIds.ABORTED,
            DevStatusIds.COMPLETED,
          ]),
        },
        update: { createdAt: new Date() },
      });
      developmentIds.push(development.id);
      bar.increment();
    }
  }
  bar.stop();
  console.log("");

  return developmentIds;
}

type CreateDevelopmentLikesArgs = {
  userIds: string[];
  developmentIds: string[];
  // 何人の開発者がいいねされるか
  likedDevelopmentCounts: number;
  // 一人の開発者に最大何いいねされるか
  maxDevelopmentLikeCounts: number;
};
/** 開発者へのいいねを追加する */
async function createDevelopmentLikes({
  userIds,
  developmentIds,
  likedDevelopmentCounts,
  maxDevelopmentLikeCounts,
}: CreateDevelopmentLikesArgs) {
  console.log("開発者へのいいねを追加");

  //　いいねされる開発者をランダムで選択する
  const likeDevelopmentIds = faker.helpers.arrayElements(
    developmentIds,
    likedDevelopmentCounts
  );
  // 開発者それぞれに何個いいねをつけるかを決めておく
  const developmentLikeCountsList = [
    ...new Array(likeDevelopmentIds.length),
  ].map(() =>
    faker.number.int({
      min: 1,
      max: maxDevelopmentLikeCounts,
    })
  );
  const sumDevelopmentLikes = developmentLikeCountsList.reduce(
    (prev, curr) => prev + curr,
    0
  );
  bar.start(sumDevelopmentLikes, 0);
  for (let i = 0; i < likeDevelopmentIds.length; i++) {
    // いいねをつける開発者のid
    const developmentId = likeDevelopmentIds[i];
    // いいねを何個つけるか
    const likeCounts = developmentLikeCountsList[i];

    // ユーザーを後ろから走査していいねをつけていく
    for (let userIndex = 0; userIndex < likeCounts; userIndex++) {
      const id = faker.string.uuid();
      await prisma.developmentLike.upsert({
        where: { id },
        create: {
          id,
          developmentId,
          userId: userIds[userIds.length - 1 - userIndex],
        },
        update: { createdAt: new Date() },
      });
      bar.increment();
    }
  }
  bar.stop();
  console.log("");
}
