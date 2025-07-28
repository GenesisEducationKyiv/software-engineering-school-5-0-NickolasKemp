# Observability

## Alerts

- **weather providers**: both weather providers fail
- **SMTP server**: email sending fails for 5 times in a raw attempts
- **getting weather response time**: 95th percentile response time exceeds 3 seconds
- **subscription queue**: subscription queue has more than 100 pending items for more then 10 minutes

- **memory usage**: memory usage exceeds 90% for 10 minutes

## Log Retention Policy

### Retention

- **error level logs**: Retain for 7 days (to debug any issues)
- **log level logs**: Retain for 7 days (need for debugging as well, to understand error logs better. In case alert fires will help to get more context)

### Archival Strategy

- logs older than 7 days are compressed
- archives are stored for 1 months before deletion (in cases they may be needed for some kind of analytics)

_\*In case logs are need for longer, it's possible to extended manually_
