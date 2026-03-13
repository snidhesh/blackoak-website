interface WebhookPayload {
  type: string;
  data: Record<string, unknown>;
  timestamp: string;
}

interface WebhookResponse {
  success: boolean;
  statusCode?: number;
  error?: string;
}

export async function forwardToWebhook(payload: WebhookPayload): Promise<WebhookResponse> {
  const webhookUrl = process.env.FORM_WEBHOOK_URL;
  const webhookSecret = process.env.WEBHOOK_SECRET;

  if (!webhookUrl) {
    console.error('[webhook] FORM_WEBHOOK_URL is not configured');
    return { success: false, error: 'Webhook not configured' };
  }

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(webhookSecret ? { 'X-Webhook-Secret': webhookSecret } : {}),
  };

  const body = JSON.stringify(payload);

  for (let attempt = 0; attempt < 2; attempt++) {
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 10000);

      const response = await fetch(webhookUrl, {
        method: 'POST',
        headers,
        body,
        signal: controller.signal,
      });

      clearTimeout(timeout);

      if (response.ok) {
        return { success: true, statusCode: response.status };
      }

      if (response.status >= 500 && attempt === 0) {
        console.warn(`[webhook] 5xx response (${response.status}), retrying...`);
        continue;
      }

      return { success: false, statusCode: response.status, error: `Webhook returned ${response.status}` };
    } catch (error) {
      if (attempt === 0) {
        console.warn('[webhook] Request failed, retrying...', error);
        continue;
      }
      console.error('[webhook] Request failed after retry', error);
      return { success: false, error: 'Webhook request failed' };
    }
  }

  return { success: false, error: 'Webhook request failed after retries' };
}

export async function forwardMultipartToWebhook(formData: FormData, type: string): Promise<WebhookResponse> {
  const webhookUrl = process.env.FORM_WEBHOOK_URL;
  const webhookSecret = process.env.WEBHOOK_SECRET;

  if (!webhookUrl) {
    console.error('[webhook] FORM_WEBHOOK_URL is not configured');
    return { success: false, error: 'Webhook not configured' };
  }

  formData.append('_type', type);
  formData.append('_timestamp', new Date().toISOString());

  const headers: Record<string, string> = {
    ...(webhookSecret ? { 'X-Webhook-Secret': webhookSecret } : {}),
  };

  for (let attempt = 0; attempt < 2; attempt++) {
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 10000);

      const response = await fetch(webhookUrl, {
        method: 'POST',
        headers,
        body: formData,
        signal: controller.signal,
      });

      clearTimeout(timeout);

      if (response.ok) {
        return { success: true, statusCode: response.status };
      }

      if (response.status >= 500 && attempt === 0) {
        console.warn(`[webhook] 5xx response (${response.status}), retrying...`);
        continue;
      }

      return { success: false, statusCode: response.status, error: `Webhook returned ${response.status}` };
    } catch (error) {
      if (attempt === 0) {
        console.warn('[webhook] Multipart request failed, retrying...', error);
        continue;
      }
      console.error('[webhook] Multipart request failed after retry', error);
      return { success: false, error: 'Webhook request failed' };
    }
  }

  return { success: false, error: 'Webhook request failed after retries' };
}
