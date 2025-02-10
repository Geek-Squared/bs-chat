import { 
    Controller, 
    Post, 
    Get, 
    Body, 
    Param, 
    UsePipes, 
    ValidationPipe 
  } from '@nestjs/common';
  import { MessageTemplateService } from './message-template.service';
  import { CreateMessageTemplateDto } from './dto/create-message-template.dto';
  
  @Controller('message-templates')
  export class MessageTemplateController {
    constructor(private messageTemplateService: MessageTemplateService) {}
  
    @Post()
    @UsePipes(new ValidationPipe({ transform: true }))
    create(@Body() dto: CreateMessageTemplateDto) {
      return this.messageTemplateService.create(dto);
    }
  
    @Get()
    findAll(@Param('id') id: string) {
      return this.messageTemplateService.getAll();
    }

    @Get(':id')
    findById(@Param('id') id: string) {
      return this.messageTemplateService.findById(id);
    }
  }