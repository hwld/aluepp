import { AppSidebar } from "@/client/ui/AppSidebar/AppSidebar";
import { UserHelper } from "@/models/tests/helpers";
import { Meta, StoryObj } from "@storybook/react";

const meta = { component: AppSidebar } satisfies Meta<typeof AppSidebar>;
export default meta;

type Story = StoryObj<typeof meta>;

export const Guest: Story = { name: "未ログイン" };
export const LoggedIn: Story = {
  name: "ログイン",
  args: { loggedInUser: UserHelper.create() },
};
