import http from "node:http";
import https from "node:https";
import { randomUUID } from "node:crypto";
import os from "node:os";

type SplunkEvent = Record<string, unknown>;

const LOCAL_SPLUNK_HOSTS = new Set(["localhost", "127.0.0.1", "::1"]);

function splunkEnabled() {
  return process.env.SPLUNK_ENABLED === "true";
}

function splunkConfig() {
  const url = process.env.SPLUNK_HEC_URL;
  const token = process.env.SPLUNK_HEC_TOKEN;
  if (!splunkEnabled() || !url || !token) return null;
  return {
    url,
    token,
    index: process.env.SPLUNK_INDEX || "main",
    source: process.env.SPLUNK_SOURCE || "434-sandbox",
    sourcetype: process.env.SPLUNK_SOURCETYPE || "434:sandbox",
  };
}

function postToSplunk(body: string, config: NonNullable<ReturnType<typeof splunkConfig>>) {
  const url = new URL(config.url);
  const isHttps = url.protocol === "https:";
  const client = isHttps ? https : http;
  const requestOptions: https.RequestOptions = {
    method: "POST",
    hostname: url.hostname,
    port: url.port || (isHttps ? 443 : 80),
    path: `${url.pathname}${url.search}`,
    headers: {
      Authorization: `Splunk ${config.token}`,
      "Content-Type": "application/json",
      "Content-Length": Buffer.byteLength(body),
      "X-Splunk-Request-Channel": randomUUID(),
    },
    timeout: 1500,
  };

  if (url.hostname === "localhost") {
    requestOptions.family = 4;
  }

  if (isHttps && LOCAL_SPLUNK_HOSTS.has(url.hostname)) {
    requestOptions.rejectUnauthorized = false;
  }

  const req = client.request(requestOptions, (res) => {
    res.resume();
  });

  req.on("timeout", () => req.destroy());
  req.on("error", () => {});
  req.end(body);
}

export function sendSplunkEvent(event: SplunkEvent) {
  const config = splunkConfig();
  if (!config) return;

  const body = JSON.stringify({
    time: Date.now() / 1000,
    host: os.hostname(),
    index: config.index,
    source: config.source,
    sourcetype: config.sourcetype,
    event: {
      app: "434-sandbox",
      environment: process.env.NODE_ENV || "development",
      ...event,
    },
  });

  setImmediate(() => {
    try {
      postToSplunk(body, config);
    } catch {
      // Splunk logging must never affect application requests.
    }
  });
}
