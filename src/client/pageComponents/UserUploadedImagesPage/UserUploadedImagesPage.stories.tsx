import { AppLayout } from "@/client/ui/AppLayout/AppLayout";
import { mockTrpcQuery, trpcMsw } from "@/client/__mocks__/trpc";
import { faker } from "@faker-js/faker";
import { Meta, StoryObj } from "@storybook/react";
import { UserUploadedImagesPage } from "./UserUploadedImagesPage";

const meta = {
  title: "Page/ユーザーがアップロードした画像",
  component: UserUploadedImagesPage,
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
} satisfies Meta<typeof UserUploadedImagesPage>;
export default meta;

type Story = StoryObj<typeof meta>;
export const Default: Story = {
  parameters: {
    msw: {
      handlers: [
        mockTrpcQuery(
          trpcMsw.uploadedImage.getAll,
          [...new Array(30)].map((_) => ({
            url: faker.image.url(),
            created: new Date().toLocaleString(),
            size: 10,
          }))
        ),
      ],
    },
  },
};

export const Empty: Story = {};
