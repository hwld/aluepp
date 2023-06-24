import { stopPropagation } from "@/client/lib/utils";
import { Routes } from "@/share/routes";
import { OmitStrict } from "@/types/OmitStrict";
import { Badge, BadgeProps } from "@mantine/core";
import Link from "next/link";

type Props = { tagId: string } & OmitStrict<BadgeProps, "sx">;
export const IdeaTagBadge: React.FC<Props> = ({
  tagId,
  children,
  ...props
}) => {
  return (
    <Badge
      // スタイルを当てるために使用している
      aria-label="tag-badge"
      component={Link}
      href={Routes.ideaSearch({ tagIds: tagId })}
      {...props}
      sx={(theme) => ({
        transition: "all 150ms",
        cursor: "pointer",
        textTransform: "none",
        backgroundColor: theme.fn.rgba(theme.colors.red[7], 0.1),
        color: theme.colors.red[7],
        "&:hover": {
          backgroundColor: theme.fn.rgba(theme.colors.red[7], 0.3),
          color: theme.colors.red[8],
        },
      })}
      onClick={stopPropagation}
    >
      {children}
    </Badge>
  );
};
