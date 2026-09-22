/**
 * Mock payloads and seed jobs for Serverless Event-Driven AWS Architecture
 */

export const SAMPLE_PAYLOADS = {
  IMAGE_RESIZE: {
    name: 'S3 Image Optimization Pipeline',
    payload: {
      eventType: 's3:ObjectCreated:Put',
      sourceBucket: 'prod-media-assets-raw',
      objectKey: 'uploads/2026/banners/hero_showcase.png',
      fileSizeBytes: 4829104,
      mimeType: 'image/png',
      pipelineConfig: {
        targetFormats: ['webp', 'avif'],
        resolutions: [
          { label: 'thumbnail', width: 320, height: 180 },
          { label: 'hd', width: 1920, height: 1080 }
        ],
        destinationBucket: 'prod-media-assets-cdn',
        watermark: true
      },
      metadata: {
        userId: 'usr_83921a9',
        correlationId: 'corr_img_991823'
      }
    }
  },
  ORDER_PROCESSING: {
    name: 'EventBridge Order Fulfillment Event',
    payload: {
      eventType: 'OrderPlaced',
      eventSource: 'ecommerce.checkout',
      detailType: 'OrderPlaced',
      orderId: 'ord-883491-us',
      currency: 'USD',
      totalAmount: 250,
      customer: {
        customerId: 'cust_90184',
        name: 'Jane Doe',
        email: 'jane.doe@example.com',
        tier: 'AWS_PARTNER_VIP',
        shippingAddress: {
          street: '123 Cloud Way',
          city: 'Seattle',
          state: 'WA',
          postalCode: '98101',
          country: 'USA'
        }
      },
      items: [
        { sku: 'AWS-DEV-HOODIE', quantity: 2, unitPrice: 75 },
        { sku: 'AWS-CERT-VOUCHER', quantity: 1, unitPrice: 100 }
      ],
      fulfillmentRoute: 'SQS_HIGH_PRIORITY_BUS'
    }
  },
  IOT_TELEMETRY: {
    name: 'AWS IoT Core Device Telemetry',
    payload: {
      eventType: 'DeviceTelemetry',
      deviceId: 'edge-sensor-us-west-401',
      deviceType: 'IndustrialTemperatureVibration',
      firmwareVersion: 'v2.4.1',
      timestampUtc: '2026-09-22T20:12:00Z',
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
    }
  }
};

export const INITIAL_JOBS = [
  {
    jobId: 'job-9f3a12b4-7c81-42e1-b384-884013ac9910',
    eventType: 's3:ObjectCreated:Put',
    priority: 'HIGH',
    status: 'COMPLETED',
    timestamp: '2026-09-21 19:42:15',
    latencyMs: 742,
    payload: SAMPLE_PAYLOADS.IMAGE_RESIZE.payload
  },
  {
    jobId: 'job-1d4e88c2-3a99-4710-a102-bc3992a0149f',
    eventType: 'OrderPlaced',
    priority: 'STANDARD',
    status: 'COMPLETED',
    timestamp: '2026-09-21 19:58:30',
    latencyMs: 512,
    payload: SAMPLE_PAYLOADS.ORDER_PROCESSING.payload
  },
  {
    jobId: 'job-6c8a77f1-88d4-42b1-9104-e39029bf77a1',
    eventType: 'DeviceTelemetry',
    priority: 'LOW',
    status: 'PENDING',
    timestamp: '2026-09-21 20:05:10',
    latencyMs: null,
    payload: SAMPLE_PAYLOADS.IOT_TELEMETRY.payload
  }
];
