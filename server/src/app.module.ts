import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { CoreModule } from './libs/core/core.module';
import { CurrentUserMiddleware } from './libs/common/middlewares/current-user.middleware';
import { DomainModule } from './modules/domain.module';

@Module({
  imports: [CoreModule, DomainModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(CurrentUserMiddleware).forRoutes('v1');
  }
}
