import React, { useState } from 'react';
import { fetchAuthSession } from 'aws-amplify/auth';
import {
  Send,
  RefreshCw,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Info,
  Globe,
  Copy,
  Check,
  Zap
} from 'lucide-react';

// =============================================================================
// 1. STRICT JSON TEMPLATE DATA STRUCTURES
// Ensures fully closed objects, no trailing commas, valid integer values, and strict JSON
// =============================================================================

export const orderEventTemplate = JSON.stringify(
  {
    eventType: "OrderPlaced",
    orderId: "ord-883491-us",
    currency: "USD",
    totalAmount: 250,
    customer: {
      customerId: "cust_90184",
      name: "Jane Doe",
      email: "jane.doe@example.com",
      tier: "AWS_PARTNER_VIP",
      shippingAddress: {
        street: "123 Cloud Way",
        city: "Seattle",
        state: "WA",
        postalCode: "98101",
        country: "USA"
      }
    },
    items: [
      {
        sku: "AWS-DEV-HOODIE",
        quantity: 2,
        unitPrice: 75
      },
      {
        sku: "AWS-CERT-VOUCHER",
        quantity: 1,
        unitPrice: 100
      }
    ],
    fulfillmentRoute: "SQS_HIGH_PRIORITY_BUS"
  },
  null,
  2
);

export const s3PipelineTemplate = JSON.stringify(
  {
    eventType: "s3:ObjectCreated:Put",
    sourceBucket: "prod-media-assets-raw",
    objectKey: "uploads/2026/banners/hero_showcase.png",
    fileSizeBytes: 4829104,
    mimeType: "image/png",
    pipelineConfig: {
      targetFormats: ["webp", "avif"],
      resolutions: [
        { label: "thumbnail", width: 320, height: 180 },
        { label: "hd", width: 1920, height: 1080 }
      ],
      destinationBucket: "prod-media-assets-cdn",
      watermark: true
    },
    metadata: {
      userId: "usr_83921a9",
      correlationId: "corr_img_991823"
    }
  },
  null,
  2
);

export const iotDeviceTemplate = JSON.stringify(
  {
    eventType: "DeviceTelemetry",
    deviceId: "edge-sensor-us-west-401",
    deviceType: "IndustrialTemperatureVibration",
    firmwareVersion: "v2.4.1",
    timestampUtc: "2026-09-22T20:12:00Z",
    sensorData: {
      temperature: 68,
      humidity: 42,
      vibration: 8,
      battery: 95
    },
    alertThresholds: {
      maxTempAllowed: 85,
      triggerSnsAlertOnBreach: true
    }
  },
  null,
  2
);

const DEFAULT_LAMBDA_URL =
  import.meta.env.VITE_LAMBDA_FUNCTION_URL ||
  'https://xvctobmuszfdur5l2tvyve5j5e0hzdtw.lambda-url.ap-south-1.on.aws/';

/**
 * Job Ingestion Playground Component
 * Dispatches raw JSON payloads to the live AWS Lambda Function URL
 */
export default function JobIngestionPlayground({
  onJobCreated,
  onJobFailed,
  addToast,
  setPulseKey,
  endpointUrl = DEFAULT_LAMBDA_URL
}) {
  // State management
  const [payloadText, setPayloadText] = useState(orderEventTemplate);
  const [activeTemplate, setActiveTemplate] = useState('order');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');
  const [statusType, setStatusType] = useState('info'); // 'success' | 'error' | 'info'
  const [copiedPayload, setCopiedPayload] = useState(false);
  const [copiedUrl, setCopiedUrl] = useState(false);

  // Pre-load Predefined Templates
  const handleSelectTemplate = (templateType) => {
    setActiveTemplate(templateType);
    let selected = '';
    let name = '';

    switch (templateType) {
      case 'order':
        selected = orderEventTemplate;
        name = 'Order event';
        break;
      case 's3':
        selected = s3PipelineTemplate;
        name = 'S3 pipeline';
        break;
      case 'iot':
        selected = iotDeviceTemplate;
        name = 'IoT device';
        break;
      default:
        selected = orderEventTemplate;
        name = 'Order event';
    }

    setPayloadText(selected);
    setStatusMessage(`Loaded template: ${name}`);
    setStatusType('info');
    if (addToast) addToast(`Loaded template: ${name}`, 'info');
  };

  // Copy current payload to clipboard
  const handleCopyPayload = () => {
    navigator.clipboard.writeText(payloadText);
    setCopiedPayload(true);
    if (addToast) addToast('Payload JSON copied to clipboard', 'info');
    setTimeout(() => setCopiedPayload(false), 2000);
  };

  // Copy Lambda endpoint URL
  const handleCopyUrl = () => {
    navigator.clipboard.writeText(endpointUrl);
    setCopiedUrl(true);
    if (addToast) addToast('Lambda Function URL copied', 'info');
    setTimeout(() => setCopiedUrl(false), 2000);
  };

  // Helper: Format / Prettify JSON
  const handleFormatJson = () => {
    try {
      const parsed = JSON.parse(payloadText);
      setPayloadText(JSON.stringify(parsed, null, 2));
      setStatusMessage('JSON structure validated and formatted.');
      setStatusType('success');
      if (addToast) addToast('JSON formatted successfully', 'info');
    } catch (err) {
      setStatusMessage(`Validation Error: ${err.message}`);
      setStatusType('error');
      if (addToast) addToast(`JSON syntax error: ${err.message}`, 'error');
    }
  };

  // 2. Submit Handler with Strict Pre-flight JSON Validation
  const handleSubmit = async (e) => {
    if (e) e.preventDefault();

    // 2.1 PRE-FLIGHT VALIDATION: Try parsing JSON before network request
    let parsedPayload;
    try {
      parsedPayload = JSON.parse(payloadText);
    } catch (err) {
      // 3. ENHANCE ERROR UI: Display exact syntax error in red error badge
      const validationErrorMessage = `Validation Error: ${err.message}`;
      setStatusMessage(validationErrorMessage);
      setStatusType('error');
      if (addToast) {
        addToast(validationErrorMessage, 'error');
      }
      return; // Stop execution before fetch
    }

    // 2.2 DISPATCH VALIDATED PAYLOAD TO AWS LAMBDA FUNCTION URL
    setIsSubmitting(true);
    setStatusMessage('Dispatching payload to AWS Lambda Function URL...');
    setStatusType('info');
    if (setPulseKey) setPulseKey((prev) => prev + 1);

    const startTime = performance.now();

    try {
      // Optional Cognito JWT Auth
      let token = null;
      try {
        const session = await fetchAuthSession();
        token = session.tokens?.idToken?.toString();
      } catch {
        // Authenticator session absent in dev
      }

      const response = await fetch(endpointUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
        body: JSON.stringify({
          data: payloadText,
          payload: parsedPayload,
          priority: 'HIGH',
          submittedAt: new Date().toISOString()
        })
      });

      const latencyMs = Math.round(performance.now() - startTime);

      if (response.ok) {
        let result = {};
        try {
          result = await response.json();
        } catch {
          result = { message: 'Event accepted by Lambda Function URL' };
        }

        const jobId = result.jobId || result.id || `job-${crypto.randomUUID()}`;
        const message = result.message || 'Job queued for asynchronous processing';

        const successText = `Success: ${message} (Job ID: ${jobId.slice(0, 18)}...)`;
        setStatusMessage(successText);
        setStatusType('success');
        if (addToast) addToast(successText, 'success');

        const newJob = {
          jobId,
          eventType: parsedPayload.eventType || parsedPayload.detailType || 'OrderFulfillment',
          status: 'COMPLETED',
          timestamp: new Date().toLocaleString(),
          latencyMs,
          payload: parsedPayload,
          message
        };

        if (onJobCreated) onJobCreated(newJob);
      } else {
        const errorBody = await response.text().catch(() => '');
        const errText = `AWS Lambda Invocation Error (${response.status}): ${errorBody || response.statusText}`;
        setStatusMessage(errText);
        setStatusType('error');
        if (addToast) addToast(errText, 'error');

        const failedJob = {
          jobId: `err-${crypto.randomUUID().slice(0, 8)}`,
          eventType: parsedPayload.eventType || 'FailedIngress',
          status: 'FAILED',
          timestamp: new Date().toLocaleString(),
          latencyMs,
          payload: parsedPayload,
          message: errText
        };

        if (onJobFailed) onJobFailed(failedJob);
      }
    } catch (error) {
      console.error('Job submission network error:', error);
      const failText = `Network/Endpoint Error: ${error.message}`;
      setStatusMessage(failText);
      setStatusType('error');
      if (addToast) addToast(failText, 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const byteSize = new Blob([payloadText]).size;

  return (
    <section className="panel" aria-label="Ingestion Playground">
      <div className="section-head">
        <h2 className="section-title">
          <Send size={18} color="var(--amber)" />
          <span>Ingestion Playground</span>
        </h2>
        <p className="section-sub">Direct serverless HTTP POST dispatch to AWS Lambda Function URL</p>
      </div>

      <div className="ingestion-body">
        {/* Cloud Ingress Endpoint Indicator */}
        <div className="endpoint-strip">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div className="endpoint-strip-label">
              <Globe size={12} />
              <span>Target Lambda Ingress Endpoint</span>
            </div>
            <button 
              type="button" 
              onClick={handleCopyUrl} 
              className="icon-btn" 
              title="Copy Endpoint URL"
            >
              {copiedUrl ? <Check size={12} color="var(--mint)" /> : <Copy size={12} />}
            </button>
          </div>
          <div className="endpoint-strip-url">POST {endpointUrl}</div>
        </div>

        {/* Quick Template Switcher */}
        <div>
          <div className="field-label-row">
            <span className="field-label">Pre-configured Event Templates</span>
            <div className="template-chips">
              <button
                type="button"
                className={`chip ${activeTemplate === 'order' ? 'active' : ''}`}
                onClick={() => handleSelectTemplate('order')}
              >
                Order event
              </button>
              <button
                type="button"
                className={`chip ${activeTemplate === 's3' ? 'active' : ''}`}
                onClick={() => handleSelectTemplate('s3')}
              >
                S3 pipeline
              </button>
              <button
                type="button"
                className={`chip ${activeTemplate === 'iot' ? 'active' : ''}`}
                onClick={() => handleSelectTemplate('iot')}
              >
                IoT device
              </button>
            </div>
          </div>
        </div>

        {/* Code Editor Area */}
        <div>
          <div className="field-label-row">
            <span className="field-label">Event Payload (JSON Body)</span>
            <div style={{ display: 'flex', gap: '0.45rem' }}>
              <button type="button" className="chip" onClick={handleCopyPayload} title="Copy JSON">
                {copiedPayload ? (
                  <Check size={11} color="var(--mint)" style={{ display: 'inline', marginRight: '4px' }} />
                ) : (
                  <Copy size={11} style={{ display: 'inline', marginRight: '4px' }} />
                )}
                {copiedPayload ? 'Copied' : 'Copy'}
              </button>
              <button type="button" className="chip" onClick={handleFormatJson} title="Prettify JSON indentation">
                <Sparkles size={11} style={{ display: 'inline', marginRight: '4px' }} />
                Format
              </button>
            </div>
          </div>

          <div className="editor-shell">
            <textarea
              id="job-json-payload"
              rows="9"
              className="editor-textarea"
              placeholder="Paste JSON payload here..."
              value={payloadText}
              onChange={(e) => setPayloadText(e.target.value)}
              spellCheck="false"
            />
            <div className="editor-footer">
              <span>UTF-8 Encoding</span>
              <span>{byteSize} bytes</span>
            </div>
          </div>
        </div>

        {/* Primary Action Button */}
        <button
          id="submit-job-btn"
          onClick={handleSubmit}
          className="submit-btn"
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <>
              <RefreshCw size={17} className="spin" />
              <span>Invoking AWS Lambda Function URL...</span>
            </>
          ) : (
            <>
              <Zap size={17} />
              <span>Send Event to Cloud Ingress</span>
            </>
          )}
        </button>

        {/* Status Message / Red Error Badge */}
        {statusMessage && (
          <div className={`status-box ${statusType}`}>
            {statusType === 'success' && <CheckCircle2 size={16} style={{ flexShrink: 0, marginTop: '2px' }} />}
            {statusType === 'error' && <AlertCircle size={16} style={{ flexShrink: 0, marginTop: '2px' }} />}
            {statusType === 'info' && <Info size={16} style={{ flexShrink: 0, marginTop: '2px' }} />}
            <div>{statusMessage}</div>
          </div>
        )}
      </div>
    </section>
  );
}
