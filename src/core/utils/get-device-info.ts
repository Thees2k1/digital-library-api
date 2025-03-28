import { Request } from 'express';
import { UAParser } from 'ua-parser-js';
import * as geoip from 'geoip-lite'; // Optional for location

interface DeviceInfo {
  ip: string;
  userAgent: string;
  device: string;
  location?: string;
}

export function getDeviceInfo(req: Request): DeviceInfo {
  const parser = new UAParser(req.headers['user-agent']);
  const uaResult = parser.getResult();

  // Format device info
  const device = [
    uaResult.browser.name,
    uaResult.browser.version,
    'on',
    uaResult.os.name,
    uaResult.device.type
      ? `(${uaResult.device.vendor} ${uaResult.device.model})`
      : '',
  ]
    .filter(Boolean)
    .join(' ');

  // Get location from IP (optional)
  const geo = geoip.lookup(req.ip as string);
  const location = geo ? `${geo.country}, ${geo.city}` : undefined;

  return {
    ip: req.ip as string,
    userAgent: req.headers['user-agent'] || 'unknown',
    device,
    location,
  };
}
