import { CommandInteraction, Client, ApplicationCommandOptionType } from 'discord.js';
import { Command } from '../Command';
import axios from 'axios';

export const AiPromptImage: Command = {
  cooldown: 10,
  name: 'ai',
  description: 'Returns an image generated based on the given prompt with artificial inteligence',
  options: [
    {
      name: 'prompt',
      description: 'A prompt description of what you would like to be generated',
      type: ApplicationCommandOptionType.String,
      required: true,
    },
  ],
  run: async (client: Client, interaction: CommandInteraction) => {
    if (!interaction.isChatInputCommand()) return;
    const prompt = interaction.options.getString('prompt');

    if (!prompt) {
      interaction.followUp({
        ephemeral: true,
        content: 'Prompt not found.',
      });
      return;
    }

    try {
      const response = await axios.post(
        'https://api.openai.com/v1/images/generations',
        {
          model: `${process.env.OPEN_AI_IMAGE_MODEL ?? 'dall-e-3'}`, // Check the latest model version
          prompt: prompt,
          n: parseInt(process.env.OPEN_AI_IMAGE_MODEL_NUMBER_PER_PROMPT ?? '1'),
          size: '1024x1024',
        },
        {
          headers: {
            Authorization: `Bearer ${process.env.OPEN_API_KEY}`,
            'Content-Type': 'application/json',
          },
        },
      );

      const imageUrl = response.data.data[0].url;

      try {
        const buffer = await axios.get(imageUrl, {
          responseType: 'arraybuffer',
        });

        const imageBuffer = Buffer.from(buffer.data, 'binary');

        // Use the imageBuffer as needed
        interaction.followUp({
          files: [imageBuffer],
        });
      } catch (error) {
        console.error('Error reading file from URL:', error);
      }
    } catch (error) {
      interaction.followUp(
        'I could not generate anything based on the given prompt. Try again bad boy',
      );
    }
  },
};
