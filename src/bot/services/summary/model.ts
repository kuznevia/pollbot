import { PollBot } from '../../bot';
import { Service } from '../model';

export interface Summary extends Service {
  /** Экземпляр бота, через который сервис работает */
  bot: PollBot;

  /** Карта для шифрования и дешифрования пользователей */
  usersMap: Map<string, string>;
}
