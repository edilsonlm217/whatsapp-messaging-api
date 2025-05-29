import { Injectable } from '@nestjs/common';
import { Db, Collection, Int32 } from 'mongodb';
import { Inject } from '@nestjs/common';
import { CreateMessageDto } from './create-message.dto';
import { proto } from '@whiskeysockets/baileys';

@Injectable()
export class MessageRepository {
  private messageCollection: Collection;

  constructor(@Inject('DATABASE_CONNECTION') private readonly db: Db) {
    this.messageCollection = this.db.collection('messages');
  }

  /**
   * Persistir uma nova mensagem no banco de dados.
   * @param createMessageDto Dados da mensagem a ser persistida
   */
  async create(createMessageDto: CreateMessageDto): Promise<void> {
    await this.messageCollection.insertOne(createMessageDto); // Realiza a persistência
  }

  async updateMessageStatus(messageId: string, newStatus: proto.WebMessageInfo.Status) {
    return this.messageCollection.updateOne(
      {
        messageId,
        status: { $lt: newStatus },
      },
      {
        $set: { status: newStatus },
      }
    );
  }
}
