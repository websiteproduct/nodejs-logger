import { EventEmitter } from 'node:events';
import fs from 'node:fs/promises';
import { copyFileSync, truncateSync } from 'node:fs';

export class Logger extends EventEmitter {
  constructor(filename, maxSize) {
    super();

    this.filename = filename;
    this.maxSize = maxSize;
    this.logQueue = [];
    this.writing = false;
    this.logsFolder = './logs';

    this.checkFileSize();
  }

  async log(message) {
    this.logQueue.unshift(message);

    if (!this.writing) {
      this.writing = true;
      await this.writeLog();
    }
  }

  async writeLog() {
    const message = this.logQueue.pop();
    let currentContent = '';

    try {
      currentContent = await fs.readFile(
        `${this.logsFolder}/${this.filename}`,
        'utf8',
      );
    } catch (error) {
      console.error('Произошла ошибка чтения файла', error.message);
    }

    const newContent = `${message}\n${currentContent}`;

    try {
      fs.writeFile(`${this.logsFolder}/${this.filename}`, newContent);
    } catch (error) {
      console.error('Произошла ошибка при записи файла', error.message);
    }

    this.emit('messageLogged', message);
    await this.checkFileSize();

    this.writing = false;

    if (this.logQueue.length !== 0) {
      this.writeLog();
    }
  }

  async getFileSize() {
    try {
      const stats = await fs.stat(`${this.logsFolder}/${this.filename}`);

      return stats.size;
    } catch (error) {
      return 0;
    }
  }

  async checkFileSize() {
    try {
      const fileSize = await this.getFileSize();

      if (fileSize > this.maxSize) {
        this.rotateLog();
      }
    } catch (error) {
      console.error(
        'Произошла ошибка при проверке размера файла',
        error.message,
      );
    }
  }

  rotateLog() {
    try {
      copyFileSync(
        `${this.logsFolder}/${this.filename}`,
        `${this.logsFolder}/${this.filename}.bak`,
      );

      truncateSync(`${this.logsFolder}/${this.filename}`, 0);
    } catch (error) {
      console.error('При ротации лога произошла ошибка', error);
    }
  }
}
