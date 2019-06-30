export type MessageParseMode =
  'Normal' |
  'HTML' |
  'Markdown';

export interface IMessageOptions {
  webPageReview?: boolean;
  notification?: boolean;
  isReply?: boolean;
}

export interface IMessage {
  text: string;
  parseMode?: MessageParseMode;
  options?: IMessageOptions;
}

class Message implements IMessage {
  public text: string;
  public parseMode: MessageParseMode;
  public options: IMessageOptions;

  constructor(
    text: string,
    parseMode: MessageParseMode = 'Normal',
    options: IMessageOptions = {
      webPageReview: true,
      notification: true,
      isReply: false
    }
  ) {
    this.text = text;
    this.parseMode = parseMode;
    this.options = options;
  }
}

export default Message;
