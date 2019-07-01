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

  public async receivedMessage(data: ITGServerMessage): Promise<void> {
    const msgText = data.message.text;
    const replyMsg = await commandHandler.call(this, msgText.split(' ')[0])(msgText);
    console.log(replyMsg);

    await this.sendMessage(data.message.chat.id, replyMsg);
  }

  public async agentBroadcastHook(targetChatId: number): Promise<void> {
    const serverStatusMsg = await commandHandler.call(this, '/server')('/server stat --all');
    console.log(serverStatusMsg);

    await this.sendMessage(targetChatId, serverStatusMsg);

    const siteStatusMsg = await commandHandler.call(this, '/site')('/site stat --all');
    console.log(siteStatusMsg);

    await this.sendMessage(targetChatId, siteStatusMsg);
  }
}

export default Bot;
