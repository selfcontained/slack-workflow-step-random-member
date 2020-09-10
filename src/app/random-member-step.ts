import { App, WorkflowStep } from "@slack/bolt";

export const configureRandomMemberStep = (bolt: App): void => {
  const step = new WorkflowStep("random_member", {
    edit: [
      /* @ts-ignore */
      async ({ ack, step, configure }) => {
        ack();

        console.log("edit step: ", step);
        const channel = step.inputs?.channel?.value ?? "";

        configure({
          blocks: [
            {
              type: "section",
              text: {
                type: "mrkdwn",
                text:
                  "This step selects a random member of the provided channel",
              },
            },
            {
              type: "input",
              block_id: "channel_block",
              element: {
                action_id: "channel_action",
                type: "channels_select",
                initial_channel: channel,
              },
              label: {
                type: "plain_text",
                text: "Select a channel",
              },
              hint: {
                type: "plain_text",
                text:
                  "A random user of this channel will be selected as an output",
              },
            },
          ],
        });
      },
    ],
    save: [
      /* @ts-ignore */
      async ({ ack, step, view, update }) => {
        ack();

        console.log("save step: ", step);

        const channel =
          view.state.values?.channel_block?.channel_action?.selected_channel ??
          "";

        update({
          inputs: {
            channel: {
              value: channel,
            },
          },
          outputs: [
            {
              name: "randomChannelMember",
              type: "user",
              label: "Random Channel Member",
            },
          ],
        });
      },
    ],
    execute: [
      /* @ts-ignore */
      async ({ context, step, complete, fail }) => {
        console.log("step execution", step);

        const channel = step?.inputs?.channel?.value ?? "";
        if (!channel) {
          return fail({ error: { message: "No channel was provided :(" } });
        }

        console.log("channel: ", channel);
        const result = await bolt.client.conversations.members({
          token: context.botToken,
          channel,
        });

        /* @ts-ignore */
        const members = <string[]>result.members || [];
        if (members.length === 0) {
          return fail({ error: { message: "No members found :(" } });
        }

        const randomChannelMember =
          members[Math.floor(Math.random() * members.length)];
        console.log("random channel member", randomChannelMember);

        complete({
          outputs: {
            randomChannelMember,
          },
        });
      },
    ],
  });

  bolt.step(step);
};
