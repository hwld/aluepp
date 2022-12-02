import { ActionIcon, Menu } from "@mantine/core";
import { showNotification } from "@mantine/notifications";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { SyntheticEvent } from "react";
import { BsThreeDots } from "react-icons/bs";
import { FaTrash } from "react-icons/fa";
import { RiEdit2Fill } from "react-icons/ri";
import { ThemeDeveloper } from "../../server/models/themeDeveloper";
import { useSessionQuery } from "../hooks/useSessionQuery";
import { themeDevelopersQueryKey } from "../hooks/useThemeDevelopersQuery";
import { trpc } from "../trpc";
import { AppMenu } from "./AppMenu/AppMenu";
import { MenuDropdown } from "./AppMenu/MenuDropdown";
import { MenuItem } from "./AppMenu/MenuItem";
import { MenuLinkItem } from "./AppMenu/MenuLinkItem";

type Props = { developer: ThemeDeveloper };
export const DeveloperMenuButton: React.FC<Props> = ({ developer }) => {
  const queryClient = useQueryClient();
  const { session } = useSessionQuery();

  const stopPropagation = (e: SyntheticEvent) => {
    e.stopPropagation();
  };

  const deleteMutation = useMutation({
    mutationFn: () => {
      return trpc.themeDeveloper.delete.mutate({ developerId: developer.id });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(themeDevelopersQueryKey(developer.themeId));
    },
    onError: () => {
      showNotification({
        color: "red",
        title: "開発者の削除",
        message: "開発者を削除できませんでした。",
      });
    },
  });

  const handleDeleteDeveloper = () => {
    deleteMutation.mutate();
  };

  return (
    <AppMenu>
      <Menu.Target>
        <ActionIcon
          size={30}
          color="gray"
          sx={(theme) => ({
            transition: "all 150ms",
            "&:hover": {
              backgroundColor: theme.fn.rgba(theme.colors.gray[5], 0.1),
            },
          })}
          onClick={stopPropagation}
        >
          <BsThreeDots size="70%" />
        </ActionIcon>
      </Menu.Target>

      <MenuDropdown>
        {session?.user.id === developer.userId ? (
          <>
            <MenuLinkItem
              icon={<RiEdit2Fill size={20} />}
              href={`/themes/${developer.themeId}/developers/${developer.id}/update`}
            >
              参加情報を更新する
            </MenuLinkItem>
            <MenuItem
              icon={<FaTrash size={18} />}
              onClick={handleDeleteDeveloper}
              red
            >
              参加情報を削除する
            </MenuItem>
          </>
        ) : (
          <Menu.Label>選択できる項目がありません。</Menu.Label>
        )}
      </MenuDropdown>
    </AppMenu>
  );
};
