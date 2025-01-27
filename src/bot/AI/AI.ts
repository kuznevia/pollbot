import axios from 'axios';
import { gigaToken } from '../../shared/consts/consts';
import { AuthResponse, GigaChatResponse } from './model';

export class AI {
  authUrl = 'https://ngw.devices.sberbank.ru:9443/api/v2/oauth';
  sendMessageUrl =
    'https://gigachat.devices.sberbank.ru/api/v1/chat/completions';
  accessToken: string | null = null;

  private async _auth() {
    const headers = {
      'Content-Type': 'application/x-www-form-urlencoded',
      Accept: 'application/json',
      RqUID: '08b29447-e2a6-4084-9aab-7006c7ccf702',
      Authorization: `Basic ${gigaToken}`,
    };

    const payload = new URLSearchParams({
      scope: 'GIGACHAT_API_PERS',
    });

    const authResponse = await axios.post<AuthResponse>(this.authUrl, payload, {
      headers,
    });

    this.accessToken = authResponse.data.access_token;

    setTimeout(() => {
      this.accessToken = null;
    }, 1500000);
  }

  async sendMessage(content: string, model: string) {
    if (!this.accessToken) {
      await this._auth();
    }

    const messageData = JSON.stringify({
      model,
      messages: [
        {
          role: 'system',
          content,
        }, // Твое задание или вопрос
      ],
      stream: false,
      update_interval: 0,
    });

    const config = {
      method: 'post',
      maxBodyLength: Infinity,
      url: this.sendMessageUrl,
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        Authorization: `Bearer ${this.accessToken}`,
      },
      data: messageData,
    };

    return await axios<GigaChatResponse>(config);
  }
}
