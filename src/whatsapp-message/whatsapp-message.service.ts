import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { TwilioService } from '../twilio/twilio.service';
import { ChatFlowService } from '../chat-flow/chat-flow.service';
import { MessageDirection, MessageStatus } from '@prisma/client';

@Injectable()
export class WhatsAppMessageService {
  private readonly logger = new Logger(WhatsAppMessageService.name);

  constructor(
    private prisma: PrismaService,
    private twilioService: TwilioService,
    private chatFlowService: ChatFlowService,
  ) {}

  
  
  async processIncomingMessage(phoneNumber: string, message: string) {
    try {
      this.logger.log(`Processing message from ${phoneNumber}: ${message}`);

      // Check for ongoing chat
      const ongoingChat = await this.prisma.ongoingChat.findUnique({
        where: { phoneNumber },
        include: {
          chatFlow: {
            include: {
              questions: true,
            },
          },
        },
      });

      this.logger.log(`Ongoing chat status: ${JSON.stringify(ongoingChat)}`);

      if (!ongoingChat) {
        this.logger.log(
          'No ongoing chat found - initiating chat flow selection',
        );
        return await this.sendChatFlowSelection(phoneNumber);
      }

      return await this.processChatResponse(
        phoneNumber,
        message,
        ongoingChat.chatFlowId,
      );
    } catch (error) {
      this.logger.error(`Error in processIncomingMessage: ${error.message}`);
      throw error;
    }
  }

  async sendChatFlowSelection(phoneNumber: string) {
    try {
      const chatFlows = await this.chatFlowService.list();

      if (chatFlows.length === 0) {
        return await this.sendResponse(phoneNumber, 'No available chat flows.');
      }

      let message = 'Welcome! Please select an option:\n';
      chatFlows.forEach((flow, index) => {
        message += `${index + 1}️⃣ ${flow.name}\n`;
      });

      // Use upsert to handle existing records
      await this.prisma.ongoingChat.upsert({
        where: { phoneNumber },
        update: { chatFlowId: null },
        create: {
          phoneNumber,
          chatFlowId: null,
        },
      });

      return await this.sendResponse(phoneNumber, message);
    } catch (error) {
      this.logger.error(`Error in sendChatFlowSelection: ${error.message}`);
      throw error;
    }
  }

  async processChatResponse(
    phoneNumber: string,
    message: string,
    chatFlowId: string | null,
  ) {
    this.logger.log(
      `Processing chat response: ${message} for flow: ${chatFlowId}`,
    );

    // If user has no active chatFlowId, treat it as a selection
    if (!chatFlowId) {
      return this.handleChatFlowSelection(phoneNumber, message);
    }

    // Otherwise, process their response within the chat flow
    return this.processUserAnswer(phoneNumber, message, chatFlowId);
  }

  async handleChatFlowSelection(phoneNumber: string, message: string) {
    try {
      const chatFlows = await this.chatFlowService.list();
      const selectedIndex = parseInt(message) - 1;

      this.logger.log(
        `User selected index ${selectedIndex} from ${chatFlows.length} flows`,
      );

      if (
        isNaN(selectedIndex) ||
        selectedIndex < 0 ||
        selectedIndex >= chatFlows.length
      ) {
        return this.sendResponse(
          phoneNumber,
          'Invalid selection. Please enter a valid number.',
        );
      }

      const selectedFlow = chatFlows[selectedIndex];
      this.logger.log(`Starting chat flow: ${selectedFlow.name}`);

      return this.startChat(phoneNumber, selectedFlow.id);
    } catch (error) {
      this.logger.error(`Error in handleChatFlowSelection: ${error.message}`);
      throw error;
    }
  }

  async startChat(phoneNumber: string, chatFlowId: string) {
    try {
      const chatFlow = await this.chatFlowService.findById(chatFlowId);

      if (!chatFlow || chatFlow.questions.length === 0) {
        return this.sendResponse(
          phoneNumber,
          'This chat flow is currently unavailable.',
        );
      }

      const firstQuestion = chatFlow.questions[0];

      // Update existing ongoing chat instead of creating new
      await this.prisma.ongoingChat.update({
        where: { phoneNumber },
        data: {
          chatFlowId,
          currentQuestionId: firstQuestion.id,
        },
      });

      this.logger.log(
        `Started chat flow with first question: ${firstQuestion.question}`,
      );
      return this.sendResponse(phoneNumber, firstQuestion.question);
    } catch (error) {
      this.logger.error(`Error in startChat: ${error.message}`);
      throw error;
    }
  }

  async processUserAnswer(
    phoneNumber: string,
    message: string,
    chatFlowId: string,
  ) {
    const ongoingChat = await this.prisma.ongoingChat.findUnique({
      where: { phoneNumber },
    });

    if (!ongoingChat) {
      return this.sendResponse(
        phoneNumber,
        'Session expired. Please start over.',
      );
    }

    // Save response
    await this.prisma.userResponse.create({
      data: {
        phoneNumber,
        questionId: ongoingChat.currentQuestionId,
        response: message,
      },
    });

    // Get next question
    const nextQuestion =
      await this.chatFlowService.getNextQuestion(phoneNumber);

    if (nextQuestion) {
      await this.prisma.ongoingChat.update({
        where: { phoneNumber },
        data: { currentQuestionId: nextQuestion.id },
      });
      return this.sendResponse(phoneNumber, nextQuestion.question);
    }

    // No more questions - send completion message
    await this.prisma.ongoingChat.delete({ where: { phoneNumber } });

    // Get custom completion message if exists
    const customMessage =
      await this.chatFlowService.getCompletionMessage(chatFlowId);

    return this.sendResponse(
      phoneNumber,
      customMessage || 'Thank you! Your responses have been recorded.',
    );
  }

  private async sendResponse(phoneNumber: string, message: string) {
    this.logger.log(`Sending message to ${phoneNumber}: ${message}`);

    // Use a generic template
    let template = await this.prisma.messageTemplate.findFirst({
      where: { name: 'generic_response' },
    });

    if (!template) {
      template = await this.prisma.messageTemplate.create({
        data: { name: 'generic_response', content: '{message}' },
      });
    }

    await this.twilioService.sendWhatsAppMessage(phoneNumber, template.id, {
      message,
    });

    // Log the message
    await this.prisma.messageLog.create({
      data: {
        phoneNumber,
        message,
        direction: MessageDirection.OUTBOUND,
        status: MessageStatus.SENT,
      },
    });
  }
}
