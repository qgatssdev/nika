import { Body, Controller, HttpStatus, HttpCode, Post } from '@nestjs/common';
import { TradeWebhookDto } from '../dto/trade-webhook';
import { TradeService } from '../services/trade.service';

@Controller({
  path: 'trade',
  version: '1',
})
export class TradeController {
  constructor(private readonly tradeService: TradeService) {}

  @Post('webhook')
  @HttpCode(HttpStatus.OK)
  async handleTradeWebhook(@Body() data: TradeWebhookDto) {
    return this.tradeService.processTradeWebhook(data);
  }
}
