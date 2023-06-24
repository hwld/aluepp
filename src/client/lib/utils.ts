import { AppRouter } from "@/server/router";
import {
  NotificationProps,
  showNotification,
  updateNotification,
} from "@mantine/notifications";
import { TRPCClientError } from "@trpc/client";
import { format } from "date-fns";
import ja from "date-fns/locale/ja";
import { SyntheticEvent } from "react";

export const stopPropagation = (e: SyntheticEvent) => e.stopPropagation();

export const isTRPCClientError = (
  e: unknown
): e is TRPCClientError<AppRouter> => {
  return e instanceof TRPCClientError;
};

export const showLoadingNotification = (props: NotificationProps) => {
  showNotification({
    color: "blue",
    styles: (idea) => ({ title: { color: idea.colors.blue[7] } }),
    ...props,
  });
};

export const showSuccessNotification = (
  props: NotificationProps,
  opt?: { update: true; id: string }
) => {
  const notification = opt?.update
    ? (others: NotificationProps) =>
        updateNotification({ id: opt.id, ...others })
    : showNotification;

  notification({
    color: "green",
    styles: (idea) => ({ title: { color: idea.colors.green[7] } }),
    ...props,
  });
};

export const showErrorNotification = (
  props: NotificationProps,
  opt?: { update: true; id: string }
) => {
  const notification = opt?.update
    ? (others: NotificationProps) =>
        updateNotification({ id: opt.id, ...others })
    : showNotification;

  notification({
    color: "red",
    styles: (idea) => ({ title: { color: idea.colors.red[7] } }),
    ...props,
  });
};

export const formatDate = (date: Date) => {
  return format(date, "yyyy年MM月dd日", { locale: ja });
};
