import { Module, Global } from '@nestjs/common';
import { HttpMetricsService } from './http-metrics.service';
import { AbstractHttpMetrics } from '../domain/http-metrics.interface';
import { PrometheusModule } from '@willsoto/nestjs-prometheus';

@Global()
@Module({
  imports: [PrometheusModule.register()],
  providers: [
    {
      provide: AbstractHttpMetrics,
      useClass: HttpMetricsService,
    },
  ],
  exports: [AbstractHttpMetrics],
})
export class MetricsModule {}
