import { DevsPage } from "@/client/pageComponents/DevsPage/DevsPage";
import { AppLayout } from "@/client/ui/AppLayout/AppLayout";
import { mockTrpcQuery, trpcMsw } from "@/client/__mocks__/trpc";
import { DevHelper, IdeaHelper } from "@/models/tests/helpers";
import { Meta, StoryObj } from "@storybook/react";

const meta = {
  title: "Page/開発情報の一覧",
  component: DevsPage,
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
} satisfies Meta<typeof DevsPage>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Filled: Story = {
  args: { idea: IdeaHelper.createFilled() },
  parameters: {
    msw: {
      handlers: [
        mockTrpcQuery(trpcMsw.dev.getManyByIdea, {
          list: [...new Array(10)].map(() => DevHelper.createFilled()),
          allPages: 2,
        }),
      ],
    },
  },
};
