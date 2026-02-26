import TelegramBot from 'node-telegram-bot-api';
import { envConfig } from './shared/config/config';
import { mongoURI, currentLLMModel } from './shared/consts/consts';

// Infrastructure
import { MongoDBClient } from './infrastructure/db/MongoDBClient';
import { MongoPollRepository } from './infrastructure/db/MongoPollRepository';
import { MongoGamePollRepository } from './infrastructure/db/MongoGamePollRepository';
import { MongoSummaryRepository } from './infrastructure/db/MongoSummaryRepository';
import { LLMFactory, LLMModelType } from './infrastructure/llm/LLMFactory';
import { InfobasketApiClient } from './infrastructure/game-api/InfobasketApiClient';
import { TelegramBotAdapter } from './infrastructure/telegram/TelegramBotAdapter';

// Application
import { BotStateManager } from './application/shared/BotStateManager';
import { HealthCheckUseCase } from './application/use-cases/admin/HealthCheckUseCase';
import { DropCollectionUseCase } from './application/use-cases/admin/DropCollectionUseCase';
import { CollectMessageUseCase } from './application/use-cases/summary/CollectMessageUseCase';
import { GenerateSummaryUseCase } from './application/use-cases/summary/GenerateSummaryUseCase';
import { GenerateAIPollContentUseCase } from './application/use-cases/practice-poll/GenerateAIPollContentUseCase';
import { CheckGamesScheduleUseCase } from './application/use-cases/game-poll/CheckGamesScheduleUseCase';
import { SendGamePollUseCase } from './application/use-cases/game-poll/SendGamePollUseCase';
import { SendPracticePollUseCase } from './application/use-cases/practice-poll/SendPracticePollUseCase';

// Presentation
import { HealthCheckHandler } from './presentation/handlers/HealthCheckHandler';
import { ChatIdHandler } from './presentation/handlers/ChatIdHandler';
import { DropDbHandler } from './presentation/handlers/DropDbHandler';
import { SummaryHandler } from './presentation/handlers/SummaryHandler';
import { GamePollHandler } from './presentation/handlers/GamePollHandler';
import { PracticePollHandler } from './presentation/handlers/PracticePollHandler';
import { PracticePollScheduler } from './presentation/schedulers/PracticePollScheduler';
import { GamePollScheduler } from './presentation/schedulers/GamePollScheduler';
import { BotCommandRegistry } from './presentation/BotCommandRegistry';

export async function main() {
  const token = envConfig.get('BOT_TOKEN');

  // Infrastructure
  const dbClient = new MongoDBClient(mongoURI);
  await dbClient.connect();

  const llm = new LLMFactory().getProvider(currentLLMModel as LLMModelType);
  const gameApiClient = new InfobasketApiClient();

  const pollRepo = new MongoPollRepository(dbClient);
  const gamePollRepo = new MongoGamePollRepository(dbClient);
  const summaryRepo = new MongoSummaryRepository(dbClient);
  await summaryRepo.setupTTLCollection();

  const telegramBot = new TelegramBot(token, { polling: true });
  const adapter = new TelegramBotAdapter(telegramBot, dbClient);

  // Application
  const stateManager = new BotStateManager();

  const healthCheckUseCase = new HealthCheckUseCase(adapter);
  const dropCollectionUseCase = new DropCollectionUseCase(adapter, adapter);
  const collectMessageUseCase = new CollectMessageUseCase(summaryRepo);
  const generateSummaryUseCase = new GenerateSummaryUseCase(
    summaryRepo,
    llm,
    adapter,
    collectMessageUseCase
  );
  const generateAIPollContentUseCase = new GenerateAIPollContentUseCase(
    llm,
    adapter
  );
  const checkGamesScheduleUseCase = new CheckGamesScheduleUseCase(
    gameApiClient
  );
  const sendGamePollUseCase = new SendGamePollUseCase(
    adapter,
    gamePollRepo,
    checkGamesScheduleUseCase
  );
  const sendPracticePollUseCase = new SendPracticePollUseCase(
    adapter,
    adapter,
    pollRepo,
    generateAIPollContentUseCase
  );

  // Presentation
  const healthCheckHandler = new HealthCheckHandler(
    adapter,
    healthCheckUseCase
  );
  const chatIdHandler = new ChatIdHandler(adapter);
  const dropDbHandler = new DropDbHandler(adapter, dropCollectionUseCase);
  const summaryHandler = new SummaryHandler(
    adapter,
    collectMessageUseCase,
    generateSummaryUseCase
  );
  const gamePollHandler = new GamePollHandler(
    adapter,
    sendGamePollUseCase,
    stateManager
  );
  const practicePollHandler = new PracticePollHandler(
    adapter,
    sendPracticePollUseCase,
    stateManager
  );
  const practicePollScheduler = new PracticePollScheduler(
    sendPracticePollUseCase
  );
  const gamePollScheduler = new GamePollScheduler(
    sendGamePollUseCase,
    checkGamesScheduleUseCase
  );

  const registry = new BotCommandRegistry(
    telegramBot,
    healthCheckHandler,
    chatIdHandler,
    dropDbHandler,
    summaryHandler,
    gamePollHandler,
    practicePollHandler,
    practicePollScheduler,
    gamePollScheduler
  );

  registry.register();

  telegramBot.on('polling_error', (error) => {
    console.error('Ошибка polling:', error);
  });
}
