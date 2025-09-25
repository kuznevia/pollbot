import axios from 'axios';
import { gigaToken } from '../../../shared/consts/consts';
import { AuthResponse, GigaChatResponse, LLMProvider } from '../model';

export class GigaChatProvider implements LLMProvider {
  authUrl = 'https://ngw.devices.sberbank.ru:9443/api/v2/oauth';
  sendMessageUrl =
    'https://gigachat.devices.sberbank.ru/api/v1/chat/completions';
  accessToken: string | null = null;
  tokenTimeout: NodeJS.Timeout | null = null;

  private async _auth() {
    try {
      const headers = {
        'Content-Type': 'application/x-www-form-urlencoded',
        Accept: 'application/json',
        RqUID: '08b29447-e2a6-4084-9aab-7006c7ccf702',
        Authorization: `Basic ${gigaToken}`,
      };

      const payload = new URLSearchParams({
        scope: 'GIGACHAT_API_PERS',
      });

      const authResponse = await axios.post<AuthResponse>(
        this.authUrl,
        payload,
        {
          headers,
        }
      );

      this.accessToken = authResponse.data.access_token;

      const expiresIn = authResponse.data.expires_at - Date.now();
      if (this.tokenTimeout) {
        clearTimeout(this.tokenTimeout);
      }

      this.tokenTimeout = setTimeout(() => {
        this.accessToken = null;
      }, expiresIn);
    } catch (error) {
      console.error('Authentication failed:', error);
      throw new Error('Unable to authenticate with GigaChat API.');
    }
  }

  async sendMessage(content: string, model: string): Promise<string> {
    try {
      if (!this.accessToken) {
        await this._auth();
      }

      const messageData = JSON.stringify({
        model,
        messages: [
          {
            role: 'system',
            content,
          },
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

      const response = await axios<GigaChatResponse>(config);
      return response.data.choices[0].message.content;
    } catch (error) {
      console.error('Message sending failed:', error);
      throw new Error('Unable to send message to GigaChat API.');
    }
  }
}
