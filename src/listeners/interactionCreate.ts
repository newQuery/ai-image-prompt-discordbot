import { CommandInteraction, Client, Interaction, Collection } from 'discord.js';
import { Commands } from '../Commands';
import CooliClient from 'src/lib/CooliClient';

export default (client: CooliClient): void => {
  client.on('interactionCreate', async (interaction: Interaction) => {
    if (interaction.isCommand() || interaction.isContextMenuCommand()) {
      try {
        const { commandName } = interaction;
        if (hasActiveCooldown(interaction, commandName)) return;
        await handleSlashCommand(client, interaction);
      } catch (error) {
        console.log('could not handle slash command', error);
      }
    }
  });
};

const hasActiveCooldown = (interaction: Interaction, commandName: string): boolean => {
  const cooldowns = (interaction.client as CooliClient).cooldown;

  const command = Commands.find((c) => c.name === commandName);

  if (!command) return true;

  if (!cooldowns.has(commandName)) {
    cooldowns.set(commandName, new Collection());
  }

  const now = interaction.createdTimestamp;
  const timestamps = cooldowns.get(commandName);
  const defaultCooldownDuration = 3;
  const cooldownAmount = (command.cooldown ?? defaultCooldownDuration) * 1000;

  if (timestamps.has(interaction.user.id)) {
    const expirationTime = timestamps.get(interaction.user.id) + cooldownAmount;

    if (now < expirationTime) {
      const expiredTimestamp = Math.round(expirationTime / 1000);
      if (interaction.isCommand() || interaction.isContextMenuCommand()) {
        interaction.reply({
          content: `Please wait, you are on a cooldown for \`${commandName}\`. You can use it again <t:${expiredTimestamp}:R>.`,
          ephemeral: true,
        });
      }

      return true;
    }
  }

  timestamps.set(interaction.user.id, now);
  setTimeout(() => timestamps.delete(interaction.user.id), cooldownAmount);

  return false;
};

const handleSlashCommand = async (
  client: Client,
  interaction: CommandInteraction,
): Promise<void> => {
  const slashCommand = Commands.find((c) => c.name === interaction.commandName);
  if (!slashCommand) {
    interaction.followUp({ content: 'An error has occurred' });
    return;
  }

  await interaction.deferReply();

  slashCommand.run(client, interaction);
};
