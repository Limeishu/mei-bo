import uuid, { UUID } from '../util/uuid';
import Bridge, { IBridge } from './bridge';
import { IMessage } from './message';
import { ITGServerMessage } from '../util/resolver';
import commandHandler from '../util/commandHandler';

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

  public async setWebhook(webhookUrl: string): Promise<void> {
    const result = await this.bridge.send('bot://setWebhook', {
      url: `${webhookUrl}/${this.ID}`
    });

    console.log(result);
  }

  public async sendMessage(chatId: number | string, msg: IMessage): Promise<void> {
    const result = await this.bridge.send('bot://sendMessage', {
      chat_id: chatId,
      text: msg.text,
      parse_mode: msg.parseMode !== 'Normal' ? msg.parseMode : null,
      disable_web_page_preview: !msg.options.webPageReview,
      disable_notification: !msg.options.notification
    });

    console.log(result);
  }

  public receivedMessage(data: ITGServerMessage): void {
    const msgText = data.message.text;
    commandHandler(msgText.split(' ')[0]);
  }
}

export default Bot;
