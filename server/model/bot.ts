import uuid, { UUID } from '../util/uuid';
import Bridge, { IBridge } from './bridge';

interface IBot {
  ID: UUID;
}

class Bot implements IBot {
  public ID = uuid();
  private token: string;
  private bridge: IBridge;

  constructor(token: string) {
    this.token = token;
    this.bridge = new Bridge(this.token);
  }

  public async setWebhook(webhookUrl: string) {
    const result = await this.bridge.set('bot://setWebhook', {
      url: `${webhookUrl}/${this.ID}`
    });

    console.log(result);
  }

}

export default Bot;
