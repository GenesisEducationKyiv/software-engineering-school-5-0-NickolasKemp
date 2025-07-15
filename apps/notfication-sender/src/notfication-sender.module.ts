import { Module } from '@nestjs/common';
import { NotficationSenderController } from './notfication-sender.controller';
import { NotficationSenderService } from './notfication-sender.service';

@Module({
  imports: [],
  controllers: [NotficationSenderController],
  providers: [NotficationSenderService],
})
export class NotficationSenderModule {}
