import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateMessageTemplateDto } from './dto/create-message-template.dto';

@Injectable()
export class MessageTemplateService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateMessageTemplateDto) {
    return this.prisma.messageTemplate.create({
      data: dto
    });
  }

  async findById(id: string) {
    const template = await this.prisma.messageTemplate.findUnique({
      where: { id }
    });

    if (!template) {
      throw new NotFoundException(`MessageTemplate with ID ${id} not found`);
    }

    return template;
  }

  async getAll() {
    return this.prisma.messageTemplate.findMany();
  }

  generateMessage(template: string, variables: Record<string, string>): string {
    return template.replace(/\{(\w+)\}/g, (match, key) => 
      variables[key] || match
    );
  }
}