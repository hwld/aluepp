import { LikedDevCard } from "@/client/features/dev/LikedDevCard/LikedDevCard";
import { useLikedDevelopments } from "@/client/features/dev/useLikedDevelopments";
import { UserContentContainer } from "@/client/features/user/UserContentContainer/UserContentContainer";
import { User } from "next-auth";
import { TbHeart } from "react-icons/tb";

type Props = { user: User; page: number; onChangePage: (page: number) => void };

export const UserLikedDevelopments: React.FC<Props> = ({
  user,
  page,
  onChangePage,
}) => {
  const { likedDevelopments } = useLikedDevelopments({ userId: user.id, page });

  return (
    <UserContentContainer
      itemMinWidthPx={450}
      page={page}
      onChangePage={onChangePage}
      totalPages={likedDevelopments?.allPages ?? 0}
      emptyProps={{
        isEmpty: likedDevelopments?.list.length === 0,
        icon: (
          <TbHeart
            size="100"
            color="transparent"
            fill="var(--mantine-color-red-7)"
            style={{ position: "relative", top: "10px" }}
          />
        ),
        text: "開発情報のいいねがありません",
        description: (
          <>
            ユーザーが開発情報にいいねすると、<br></br>ここに表示されます。
          </>
        ),
      }}
    >
      {likedDevelopments?.list.map((dev) => (
        <LikedDevCard key={dev.id} development={dev} />
      ))}
    </UserContentContainer>
  );
};
