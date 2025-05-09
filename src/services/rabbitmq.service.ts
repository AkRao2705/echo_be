import amqp from 'amqplib';
import { AppError } from '../utils/app-error';

export class RabbitMQService {
  private connection: any | null = null;
  private channel: any | null = null;
  private readonly url: string;

  constructor() {
    this.url = process.env.RABBITMQ_URL || 'amqp://localhost:5672';
  }

  async connect() {
    try {
      this.connection = await amqp.connect(this.url);
      this.channel = await this.connection.createChannel();
      console.log('Connected to RabbitMQ');
    } catch (error) {
      console.error('Error connecting to RabbitMQ:', error);
      throw new AppError(500, 'Failed to connect to RabbitMQ');
    }
  }

  async publishMessage(queue: string, message: string) {
    try {
      if (!this.channel) {
        await this.connect();
      }

      await this.channel!.assertQueue(queue, { durable: true });
      await this.channel!.sendToQueue(queue, Buffer.from(message));
      console.log(`Message published to queue: ${queue}`);
    } catch (error) {
      console.error('Error publishing message to RabbitMQ:', error);
      throw new AppError(500, 'Failed to publish message to RabbitMQ');
    }
  }

  async close() {
    try {
      if (this.channel) {
        await this.channel.close();
      }
      if (this.connection) {
        await this.connection.close();
      }
      console.log('RabbitMQ connection closed');
    } catch (error) {
      console.error('Error closing RabbitMQ connection:', error);
    }
  }
} 