import { Injectable } from '@nestjs/common';
import { createHash } from 'node:crypto';

@Injectable()
export class TokenHashService {
  hash(token: string) {
    return createHash('sha256').update(token).digest('hex');
  }
}
