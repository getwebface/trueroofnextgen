/// <reference path="../.astro/types.d.ts" />
/// <reference types="astro/client" />

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
    weatherContext: {
      city: string;
      weatherMode: string;
      windSpeed: number;
      precipitation: number;
      temperature: number;
      condition: string;
    };
  }
}
