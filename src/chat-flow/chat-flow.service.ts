// src/chat-flow/chat-flow.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateChatFlowDto } from './dto/create-chat-flow.dto';
import { UpdateChatFlowDto } from './dto/update-chat-flow.dto';

@Injectable()
export class ChatFlowService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateChatFlowDto) {
    const { questions, ...chatFlowData } = dto;

    return this.prisma.$transaction(async (tx) => {
      return tx.chatFlow.create({
        data: {
          ...chatFlowData,
          questions: questions
            ? {
                create: questions,
              }
            : undefined,
        },
        include: { questions: true },
      });
    });
  }

  async findById(id: string) {
    const chatFlow = await this.prisma.chatFlow.findUnique({
      where: { id },
      include: { questions: true },
    });

    if (!chatFlow) {
      throw new NotFoundException(`ChatFlow with ID ${id} not found`);
    }

    return chatFlow;
  }

  async update(id: string, dto: UpdateChatFlowDto) {
    await this.findById(id); // Verify existence

    return this.prisma.chatFlow.update({
      where: { id },
      data: dto,
      include: { questions: true },
    });
  }

  async delete(id: string) {
    await this.findById(id); // Verify existence

    return this.prisma.chatFlow.delete({
      where: { id },
    });
  }

  async list() {
    return this.prisma.chatFlow.findMany({
      include: { questions: true },
    });
  }

  async startChat(phoneNumber: string, chatFlowId: string) {
    const chatFlow = await this.prisma.chatFlow.findUnique({
      where: { id: chatFlowId },
      include: { questions: true },
    });

    if (!chatFlow || chatFlow.questions.length === 0) {
      throw new NotFoundException('Chat flow not found or has no questions.');
    }

    const firstQuestion = chatFlow.questions[0];

    await this.prisma.ongoingChat.upsert({
      where: { phoneNumber },
      update: { currentQuestionId: firstQuestion.id },
      create: { phoneNumber, chatFlowId, currentQuestionId: firstQuestion.id },
    });

    return firstQuestion.question;
  }

  async getNextQuestion(phoneNumber: string) {
    const ongoingChat = await this.prisma.ongoingChat.findUnique({
      where: { phoneNumber },
    });

    if (!ongoingChat) return null;

    const questions = await this.prisma.question.findMany({
      where: { chatFlowId: ongoingChat.chatFlowId },
      orderBy: { createdAt: 'asc' },
    });

    const currentIndex = questions.findIndex(
      (q) => q.id === ongoingChat.currentQuestionId,
    );

    return currentIndex + 1 < questions.length
      ? questions[currentIndex + 1]
      : null;
  }

  async getCompletionMessage(chatFlowId: string) {
    const chatFlow = await this.prisma.chatFlow.findUnique({
      where: { id: chatFlowId },
      select: { completionMessage: true },
    });
    return chatFlow?.completionMessage;
  }

  async deleteAll() {
    return this.prisma.$transaction(async (tx) => {
      // First, delete all UserResponses that reference Questions
      await tx.userResponse.deleteMany({});

      // Then delete OngoingChats that reference ChatFlows
      await tx.ongoingChat.deleteMany({});

      // Delete all Questions that reference ChatFlows
      await tx.question.deleteMany({});

      // Finally, delete all ChatFlows
      await tx.chatFlow.deleteMany({});

      return {
        message: 'All chat flows and related data deleted successfully',
      };
    });
  }
}
