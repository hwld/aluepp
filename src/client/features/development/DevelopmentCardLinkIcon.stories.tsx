import { DevelopmentCardIconLink } from "@/client/features/development/DevelopmentCardLinkIcon";
import { Meta, StoryObj } from "@storybook/react";
import { TbFile } from "react-icons/tb";

const meta = { component: DevelopmentCardIconLink } satisfies Meta<
  typeof DevelopmentCardIconLink
>;
export default meta;

type Story = StoryObj<typeof meta>;
export const Default: Story = {
  args: {
    icon: <TbFile size="80%" color="var(--mantine-color-gray-7)" />,
    label: "Label",
    url: "url",
  },
};
