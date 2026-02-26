export interface IInteractionPort {
  askYesNo(
    chatId: number,
    promptText: string,
    fromUser: string,
    timeoutMs: number
  ): Promise<boolean | null>;
  askText(
    chatId: number,
    promptText: string,
    fromUser: string,
    timeoutMs: number
  ): Promise<string | null>;
  askInlineChoice(
    chatId: number,
    promptText: string,
    choices: string[],
    fromUser: string,
    timeoutMs: number
  ): Promise<string | null>;
}
