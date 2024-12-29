import * as React from 'react';

declare global {
  namespace JSX {
    interface IntrinsicElements {
      [elemName: string]: string;
    }
  }
}

declare module "jwt-decode" {
  export default function jwtDecode<T = string>(token: string): T;
}
