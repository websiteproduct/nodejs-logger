import { Logger } from './modules/logger.js';

const logger = new Logger('log.txt', 1024);

logger.on('messageLogged', message => {
  console.log('Записано сообщение:', message);
});

logger.log('Первое сообщение');
logger.log('Второе сообщение');
