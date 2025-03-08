import { EventEmitter } from 'events';

export const eventEmitter = new EventEmitter();

export const EVENTS = {
  NEED_INDEXING: 'need_indexing',
};
