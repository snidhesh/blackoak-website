declare global {
  interface Window {
    __splashTimer?: ReturnType<typeof setTimeout>;
  }
}

export {};
