import { parse, stringify } from 'uuid';

export function uuidToBinary(uuid: string): Buffer {
  return Buffer.from(parse(uuid));
}

export function binaryToUuid(buffer: Buffer): string {
  return stringify(buffer);
}

export const uuidUtils = {
  uuidToBinary,
  binaryToUuid,
};
