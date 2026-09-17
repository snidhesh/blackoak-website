declare global {
  interface Window {
    __splashTimer?: ReturnType<typeof setTimeout>;
    // Google Tag Manager queue; only present when NEXT_PUBLIC_GTM_ID is set.
    dataLayer?: unknown[];
  }
}

export {};
