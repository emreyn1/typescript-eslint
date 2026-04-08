import { TelegramClient, Api } from "telegram";
import { StringSession } from "telegram/sessions/index.js";
import { config } from "../config.js";

let client: TelegramClient | null = null;

export async function getTelegramClient(): Promise<TelegramClient> {
  if (client?.connected) return client;

  if (!config.tgApiId || !config.tgApiHash) {
    throw new Error("Telegram API credentials not configured");
  }

  const session = new StringSession(config.tgSession);
  client = new TelegramClient(session, config.tgApiId, config.tgApiHash, {
    connectionRetries: 5,
  });

  await client.connect();
  return client;
}

export async function downloadTelegramFile(
  fileId: string,
): Promise<Buffer> {
  const tg = await getTelegramClient();

  const result = await tg.invoke(
    new Api.channels.GetMessages({
      channel: config.tgChannelId,
      id: [new Api.InputMessageID({ id: Number(fileId) })],
    }),
  );

  const messages = "messages" in result ? result.messages : [];
  const msg = messages[0];

  if (!msg || !("media" in msg) || !msg.media) {
    throw new Error(`No media found for file ID ${fileId}`);
  }

  const buffer = await tg.downloadMedia(msg.media, {});
  if (!buffer) throw new Error("Download returned empty");

  return Buffer.isBuffer(buffer)
    ? buffer
    : Buffer.from(buffer as unknown as Uint8Array);
}

export async function streamTelegramFile(
  fileId: string,
  onChunk: (chunk: Buffer) => void,
): Promise<void> {
  const tg = await getTelegramClient();

  const result = await tg.invoke(
    new Api.channels.GetMessages({
      channel: config.tgChannelId,
      id: [new Api.InputMessageID({ id: Number(fileId) })],
    }),
  );

  const messages = "messages" in result ? result.messages : [];
  const msg = messages[0];

  if (!msg || !("media" in msg) || !msg.media) {
    throw new Error(`No media found for file ID ${fileId}`);
  }

  for await (const chunk of tg.iterDownload({
    file: new Api.InputDocumentFileLocation({
      id: (msg.media as any).document.id,
      accessHash: (msg.media as any).document.accessHash,
      fileReference: (msg.media as any).document.fileReference,
      thumbSize: "",
    }),
    requestSize: 1024 * 1024, // 1MB chunks
  })) {
    onChunk(Buffer.from(chunk));
  }
}

export async function disconnectTelegram() {
  if (client?.connected) {
    await client.disconnect();
    client = null;
  }
}
