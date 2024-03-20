import { Guild, Message, PartialMessage, TextChannel } from 'discord.js';
const LogChannel = require('../lib/enums').LogChannel;

export function getChannelFromMessage(message: any, logChannel: string): TextChannel | null {
  const guild: Guild = message.guild;
  if (guild) {
    const channel = guild.channels.cache.find(
      (channel) => channel.name === logChannel && channel instanceof TextChannel,
    ) as TextChannel;
    if (channel) {
      return channel;
    }
  }

  return null;
}

export function hasMessageAttachments(message: Message | PartialMessage): boolean {
  return message.attachments.size > 0;
}

export function isAuthorBotOrNotTextChannelOrLogChannel(
  message: Message | PartialMessage,
): boolean {
  if (message.author?.bot || !(message.channel instanceof TextChannel)) {
    return true;
  }

  const channelName = message.channel?.name;
  if (channelName && Object.values(LogChannel).includes(channelName)) {
    return true;
  }

  return false;
}
