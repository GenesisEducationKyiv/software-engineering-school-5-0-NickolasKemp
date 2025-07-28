import { Module, Global } from '@nestjs/common';
import { MetricsService } from './metrics.service';
import { PrometheusModule } from '@willsoto/nestjs-prometheus';

@Global()
@Module({
  imports: [PrometheusModule.register()],
  providers: [MetricsService],
  exports: [MetricsService],
})
export class MetricsModule {}
