import { Prisma } from "@prisma/client";
import { z } from "zod";
import { prisma } from "../prismadb";

export const themeSchema = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string(),
  tags: z.array(z.object({ id: z.string(), name: z.string() })),
  user: z.object({
    id: z.string(),
    image: z.string().nullable(),
    name: z.string().nullable(),
  }),
  likes: z.number(),
  createdAt: z.string(),
  updatedAt: z.string(),
});
export type Theme = z.infer<typeof themeSchema>;

const themeArgs = Prisma.validator<Prisma.AppThemeArgs>()({
  include: {
    tags: true,
    user: true,
    likes: true,
  },
});
const convertTheme = (
  rawTheme: Prisma.AppThemeGetPayload<typeof themeArgs>
): Theme => {
  const theme = {
    id: rawTheme.id,
    title: rawTheme.title,
    tags: rawTheme.tags.map(({ id, name }) => ({ id, name })),
    description: rawTheme.description,
    createdAt: rawTheme.createdAt.toUTCString(),
    updatedAt: rawTheme.updatedAt.toUTCString(),
    user: {
      id: rawTheme.user.id,
      name: rawTheme.user.name,
      image: rawTheme.user.image,
    },
    likes: rawTheme.likes.length,
  };

  return theme;
};

export const findTheme = async (
  where: Prisma.AppThemeWhereUniqueInput
): Promise<Theme | undefined> => {
  const rawTheme = await prisma.appTheme.findUnique({
    where,
    ...themeArgs,
  });

  if (!rawTheme) {
    return undefined;
  }

  const theme = convertTheme(rawTheme);
  return theme;
};

export const findManyThemes = async (where?: Prisma.AppThemeWhereInput) => {
  const rawThemes = await prisma.appTheme.findMany({ where, ...themeArgs });
  const themes = rawThemes.map(convertTheme);
  return themes;
};

type SearchThemesArgs = { keyword: string; tagIds: string[] };
export const searchThemes = async ({ keyword, tagIds }: SearchThemesArgs) => {
  if (keyword === "" && tagIds.length === 0) {
    return [];
  }

  const themesContainsKeyword = await findManyThemes({
    OR: [
      { title: { contains: keyword } },
      { description: { contains: keyword } },
    ],
  });

  // tagsをすべて持つお題に絞り込む。
  // prismaでやる方法がある？
  const themes = themesContainsKeyword.filter((theme) => {
    // お題に含まれているすべてのタグId
    const themeTagIds = theme.tags.map(({ id }) => id);
    return tagIds.every((id) => themeTagIds.includes(id));
  });

  return themes;
};