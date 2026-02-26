enum BotState {
  IDLE = 'idle',
  PENDING = 'pending',
}

export class BotStateManager {
  private state = BotState.IDLE;

  isPending(): boolean {
    return this.state === BotState.PENDING;
  }

  setPending(): void {
    this.state = BotState.PENDING;
  }

  setIdle(): void {
    this.state = BotState.IDLE;
  }
}
