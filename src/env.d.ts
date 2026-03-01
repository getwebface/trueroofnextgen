/// <reference path="../.astro/types.d.ts" />
/// <reference types="astro/client" />

import type { WeatherContext } from './utils/weatherProcessor';

declare namespace App {
  interface Locals {
    runtime: {
      cf: any;
      caches?: {
        default: Cache;
      };
      env?: any;
      waitUntil?: (promise: Promise<any>) => void;
    };
    weatherContext: WeatherContext;
    weatherCSSMode: string; // e.g. 'weather-storm', 'weather-rain', 'weather-clear'
  }
}
