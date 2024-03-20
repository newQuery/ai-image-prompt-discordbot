import { Client, Collection } from 'discord.js';

export default class extends Client {
  cooldown: Collection<any, any>;

  constructor(object: any) {
    super(object);
    this.cooldown = new Collection();
  }
}
