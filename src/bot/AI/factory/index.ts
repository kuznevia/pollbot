export abstract class AI {
  abstract sendMessage(content: string, model: string): Promise<string>;

  protected _checkImplementation() {
    if (typeof this.sendMessage !== 'function') {
      throw new Error('Class must implement sendMessage method');
    }
  }

  constructor() {
    this._checkImplementation();
  }
}
