import { UserEditPage } from "@/client/pageComponents/UserEditPage/UserEditPage";
import { AppLayout } from "@/client/ui/AppLayout/AppLayout";
import { mockTrpcQuery, trpcMsw } from "@/client/__mocks__/trpc";
import { UserHelper } from "@/models/tests/helpers";
import { Meta, StoryObj } from "@storybook/react";

const meta = {
  title: "Page/ユーザーの編集",
  component: UserEditPage,
  parameters: {
    layout: "fullscreen",
  },
  decorators: [
    (Story) => {
      return (
        <AppLayout>
          <Story />
        </AppLayout>
      );
    },
  ],
} satisfies Meta<typeof UserEditPage>;
export default meta;

type Story = StoryObj<typeof meta>;
export const Default: Story = {
  args: { user: UserHelper.create({ profile: "profile" }) },
  parameters: {
    msw: {
      handlers: [
        mockTrpcQuery(trpcMsw.session, {
          user: UserHelper.create(),
          expires: "",
        }),
      ],
    },
  },
};
