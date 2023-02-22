import Link from "next/link";
import React from "react";
import { Routes } from "../../share/routes";
import { stopPropagation } from "../utils";
import { UserIcon, UserIconProps } from "./UserIcon";

type Props = {
  iconSrc?: string | null;
  userId: string;
  size?: UserIconProps["size"];
};

export const UserIconLink: React.FC<Props> = ({
  iconSrc,
  userId,
  size = "md",
}) => {
  return (
    <Link
      href={Routes.user(userId)}
      onClick={stopPropagation}
      passHref
      aria-label="ユーザー詳細画面を開く"
    >
      <UserIcon iconSrc={iconSrc} interactive size={size} />
    </Link>
  );
};
