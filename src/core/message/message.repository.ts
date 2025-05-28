import { Injectable } from '@nestjs/common';
import { Db, Collection } from 'mongodb';
import { Inject } from '@nestjs/common';
import { CreateMessageDto } from './create-message.dto';
import { MessageStatus } from 'src/common/enums/message-status.enum';

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

  /**
   * Atualizar o status de uma mensagem existente.
   * @param messageId ID da mensagem a ser atualizada
   * @param status Novo status da mensagem
   */
  async updateStatus(messageId: string, status: MessageStatus) {
    return this.messageCollection.updateOne(
      { messageId },
      { $set: { status } }, // Atualiza o status
    );
  }
}
