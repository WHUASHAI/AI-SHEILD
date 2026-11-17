import 'react';
declare module 'react' {
  // Firefox supports this attribute to disable dynamic button-state restoration.
  interface ButtonHTMLAttributes<T> { autoComplete?: 'on' | 'off'; }
}
