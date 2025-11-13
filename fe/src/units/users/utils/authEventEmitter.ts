import EventEmitter from 'eventemitter3';

import {AppEmitter} from '@/typings/common';

const eventEmitter = new EventEmitter();

export const AuthEmitter: AppEmitter = {
    on: (event, fn) => eventEmitter.on(event, fn),
    off: (event, fn) => eventEmitter.off(event, fn),
    emit: (event, fn) => eventEmitter.emit(event, fn),
    once: (event, fn) => eventEmitter.once(event, fn),
};

Object.freeze(AuthEmitter);
