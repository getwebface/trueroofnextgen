/// <reference path="../.astro/types.d.ts" />
/// <reference types="astro/client" />

declare namespace App {
  interface Locals {
    runtime: {
      cf: any;
    };
    weatherContext: {
      city: string;
      isRaining: boolean;
      temperature: number;
    };
  }
}
