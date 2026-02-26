import TelegramBot from 'node-telegram-bot-api';
import { HealthCheckHandler } from './handlers/HealthCheckHandler';
import { ChatIdHandler } from './handlers/ChatIdHandler';
import { DropDbHandler } from './handlers/DropDbHandler';
import { SummaryHandler } from './handlers/SummaryHandler';
import { GamePollHandler } from './handlers/GamePollHandler';
import { PracticePollHandler } from './handlers/PracticePollHandler';
import { PracticePollScheduler } from './schedulers/PracticePollScheduler';
import { GamePollScheduler } from './schedulers/GamePollScheduler';

const BOT_COMMANDS: TelegramBot.BotCommand[] = [
  { command: '/practicepoll', description: 'Запустить опрос на тренировку' },
  { command: '/gamepoll', description: 'Запустить опрос на игру' },
  { command: '/check', description: 'Проверка связи' },
  { command: '/drop', description: 'Дропнуть БД' },
  { command: '/summary', description: 'Доложить обстановку' },
];

export class BotCommandRegistry {
  constructor(
    private readonly telegramBot: TelegramBot,
    private readonly healthCheckHandler: HealthCheckHandler,
    private readonly chatIdHandler: ChatIdHandler,
    private readonly dropDbHandler: DropDbHandler,
    private readonly summaryHandler: SummaryHandler,
    private readonly gamePollHandler: GamePollHandler,
    private readonly practicePollHandler: PracticePollHandler,
    private readonly practicePollScheduler: PracticePollScheduler,
    private readonly gamePollScheduler: GamePollScheduler
  ) {}

  register(): void {
    this.telegramBot.setMyCommands(BOT_COMMANDS);

    this.healthCheckHandler.register();
    this.chatIdHandler.register();
    this.dropDbHandler.register();
    this.summaryHandler.register();
    this.gamePollHandler.register();
    this.practicePollHandler.register();

    this.practicePollScheduler.start();
    this.gamePollScheduler.start();
  }
}
