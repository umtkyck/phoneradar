/**
 * PhoneRadar Utility Functions
 */

import { RadarImageData, ThermalImageData } from './types';

/**
 * Float32'i little-endian byte array'e çevir
 */
export function floatToBytes(value: number): Uint8Array {
  const buffer = new ArrayBuffer(4);
  const view = new DataView(buffer);
  view.setFloat32(0, value, true); // little-endian
  return new Uint8Array(buffer);
}

/**
 * Little-endian byte array'i float32'e çevir
 */
export function bytesToFloat(bytes: Uint8Array): number {
  const buffer = new ArrayBuffer(4);
  const view = new DataView(buffer);
  for (let i = 0; i < 4; i++) {
    view.setUint8(i, bytes[i]);
  }
  return view.getFloat32(0, true); // little-endian
}

/**
 * Uint16'yı little-endian byte array'e çevir
 */
export function uint16ToBytes(value: number): Uint8Array {
  return new Uint8Array([value & 0xff, (value >> 8) & 0xff]);
}

/**
 * Little-endian byte array'i uint16'ya çevir
 */
export function bytesToUint16(bytes: Uint8Array, offset: number = 0): number {
  return bytes[offset] | (bytes[offset + 1] << 8);
}

/**
 * Radar görüntü verisini encode et
 */
export function encodeRadarImage(imageData: RadarImageData): Uint8Array {
  const header = new Uint8Array(4);
  header[0] = imageData.width & 0xff;
  header[1] = (imageData.width >> 8) & 0xff;
  header[2] = imageData.height & 0xff;
  header[3] = (imageData.height >> 8) & 0xff;

  const result = new Uint8Array(4 + imageData.pixels.length);
  result.set(header, 0);
  result.set(imageData.pixels, 4);

  return result;
}

/**
 * Radar görüntü verisini decode et
 */
export function decodeRadarImage(data: Uint8Array): RadarImageData {
  const width = bytesToUint16(data, 0);
  const height = bytesToUint16(data, 2);
  const pixels = data.slice(4);

  return {
    width,
    height,
    pixels,
    timestamp: Date.now(),
  };
}

/**
 * Termal görüntü verisini encode et
 */
export function encodeThermalImage(imageData: ThermalImageData): Uint8Array {
  const header = new Uint8Array(4);
  header[0] = imageData.width & 0xff;
  header[1] = (imageData.width >> 8) & 0xff;
  header[2] = imageData.height & 0xff;
  header[3] = (imageData.height >> 8) & 0xff;

  const result = new Uint8Array(4 + imageData.temperatures.length * 2);
  result.set(header, 0);

  // Temperatures as uint16 little-endian
  for (let i = 0; i < imageData.temperatures.length; i++) {
    const temp = imageData.temperatures[i];
    result[4 + i * 2] = temp & 0xff;
    result[4 + i * 2 + 1] = (temp >> 8) & 0xff;
  }

  return result;
}

/**
 * Termal görüntü verisini decode et
 */
export function decodeThermalImage(data: Uint8Array): ThermalImageData {
  const width = bytesToUint16(data, 0);
  const height = bytesToUint16(data, 2);

  const temperatures = new Uint16Array(width * height);
  for (let i = 0; i < width * height; i++) {
    temperatures[i] = bytesToUint16(data, 4 + i * 2);
  }

  return {
    width,
    height,
    temperatures,
    timestamp: Date.now(),
  };
}

/**
 * Sıcaklık değerini renge çevir (termal palette için)
 */
export function temperatureToColor(
  temp: number,
  minTemp: number,
  maxTemp: number,
  palette: 'iron' | 'rainbow' | 'whiteHot' | 'blackHot' = 'iron'
): { r: number; g: number; b: number } {
  // Normalize temperature to 0-1
  const normalized = Math.max(0, Math.min(1, (temp - minTemp) / (maxTemp - minTemp)));

  switch (palette) {
    case 'iron':
      return ironPalette(normalized);
    case 'rainbow':
      return rainbowPalette(normalized);
    case 'whiteHot':
      return whiteHotPalette(normalized);
    case 'blackHot':
      return blackHotPalette(normalized);
    default:
      return ironPalette(normalized);
  }
}

function ironPalette(value: number): { r: number; g: number; b: number } {
  if (value < 0.25) {
    return { r: 0, g: 0, b: Math.floor(value * 4 * 255) };
  } else if (value < 0.5) {
    return { r: 0, g: Math.floor((value - 0.25) * 4 * 255), b: 255 };
  } else if (value < 0.75) {
    return { r: Math.floor((value - 0.5) * 4 * 255), g: 255, b: 255 - Math.floor((value - 0.5) * 4 * 255) };
  } else {
    return { r: 255, g: 255 - Math.floor((value - 0.75) * 4 * 255), b: 0 };
  }
}

function rainbowPalette(value: number): { r: number; g: number; b: number } {
  const hue = (1 - value) * 300;
  return hsvToRgb(hue, 100, 100);
}

function whiteHotPalette(value: number): { r: number; g: number; b: number } {
  const gray = Math.floor(value * 255);
  return { r: gray, g: gray, b: gray };
}

function blackHotPalette(value: number): { r: number; g: number; b: number } {
  const gray = Math.floor((1 - value) * 255);
  return { r: gray, g: gray, b: gray };
}

function hsvToRgb(h: number, s: number, v: number): { r: number; g: number; b: number } {
  h = h / 60;
  s = s / 100;
  v = v / 100;

  const c = v * s;
  const x = c * (1 - Math.abs((h % 2) - 1));
  const m = v - c;

  let r = 0, g = 0, b = 0;

  if (h >= 0 && h < 1) {
    r = c; g = x; b = 0;
  } else if (h >= 1 && h < 2) {
    r = x; g = c; b = 0;
  } else if (h >= 2 && h < 3) {
    r = 0; g = c; b = x;
  } else if (h >= 3 && h < 4) {
    r = 0; g = x; b = c;
  } else if (h >= 4 && h < 5) {
    r = x; g = 0; b = c;
  } else {
    r = c; g = 0; b = x;
  }

  return {
    r: Math.floor((r + m) * 255),
    g: Math.floor((g + m) * 255),
    b: Math.floor((b + m) * 255),
  };
}

/**
 * Mesafe değerini formatla
 */
export function formatDistance(meters: number): string {
  if (meters < 1) {
    return `${Math.round(meters * 100)} cm`;
  }
  return `${meters.toFixed(2)} m`;
}

/**
 * Sıcaklık değerini formatla
 */
export function formatTemperature(celsius: number, unit: 'C' | 'F' = 'C'): string {
  if (unit === 'F') {
    const fahrenheit = (celsius * 9) / 5 + 32;
    return `${fahrenheit.toFixed(1)}°F`;
  }
  return `${celsius.toFixed(1)}°C`;
}

/**
 * Batarya seviyesini formatla
 */
export function formatBattery(level: number): string {
  return `${level}%`;
}

/**
 * Sinyal gücünü formatla
 */
export function formatSignalStrength(rssi: number): string {
  return `${rssi} dBm`;
}

/**
 * Sinyal gücünü yüzdeye çevir (yaklaşık)
 */
export function rssiToPercentage(rssi: number): number {
  // -30 dBm = 100%, -90 dBm = 0%
  const percentage = Math.min(100, Math.max(0, ((rssi + 90) / 60) * 100));
  return Math.round(percentage);
}
