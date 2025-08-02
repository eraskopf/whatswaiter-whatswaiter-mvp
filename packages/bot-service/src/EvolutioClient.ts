import axios, { AxiosInstance } from 'axios';

export class EvolutioClient {
  private client: AxiosInstance;

  constructor(private token: string, baseURL: string = 'https://api.evolutio.cloud') {
    this.client = axios.create({
      baseURL,
      headers: { Authorization: `Bearer ${token}` }
    });
  }

  async sendText(to: string, message: string): Promise<void> {
    await this.client.post('/messages', { to, message });
  }

  async sendImage(to: string, imageUrl: string, caption?: string): Promise<void> {
    await this.client.post('/images', { to, imageUrl, caption });
  }

  async sendList(to: string, items: string[]): Promise<void> {
    await this.client.post('/lists', { to, items });
  }
}

export default EvolutioClient;
