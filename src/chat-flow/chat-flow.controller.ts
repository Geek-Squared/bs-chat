import {
  Controller,
  Post,
  Get,
  Patch,
  Delete,
  Body,
  Param,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { ChatFlowService } from './chat-flow.service';
import { CreateChatFlowDto } from './dto/create-chat-flow.dto';
import { UpdateChatFlowDto } from './dto/update-chat-flow.dto';

@Controller('chat-flows')
export class ChatFlowController {
  constructor(private chatFlowService: ChatFlowService) {}

  @Post()
  @UsePipes(new ValidationPipe({ transform: true }))
  create(@Body() dto: CreateChatFlowDto) {
    return this.chatFlowService.create(dto);
  }

  @Get()
  list() {
    return this.chatFlowService.list();
  }

  @Get(':id')
  findById(@Param('id') id: string) {
    return this.chatFlowService.findById(id);
  }

  @Patch(':id')
  @UsePipes(new ValidationPipe({ transform: true }))
  update(@Param('id') id: string, @Body() dto: UpdateChatFlowDto) {
    return this.chatFlowService.update(id, dto);
  }

  @Delete(':id')
  delete(@Param('id') id: string) {
    return this.chatFlowService.delete(id);
  }

  @Delete()
  deleteAll() {
    return this.chatFlowService.deleteAll();
  }
}
