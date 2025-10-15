/** Тип глобального обработчика ошибок */
export type ErrorHandler = (
  fn: () => Promise<void>,
  config?: { context: string; chatId: number }
) => Promise<void>;

/** Интерфейс сервиса */
export interface Service {
  /**
   * Инициализация сервиса
   * @param errorHandler — опциональный глобальный обработчик ошибок
   */
  init(errorHandler?: ErrorHandler): void | Promise<void>;
}
