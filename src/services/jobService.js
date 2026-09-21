/**
 * API Service for AWS Lambda Function URL Integration
 * 
 * When VITE_LAMBDA_FUNCTION_URL is configured in .env, this service will make
 * real HTTP POST requests directly to your AWS Lambda Function URL.
 * Otherwise, it simulates network latency and returns a mock AWS response.
 */

const LAMBDA_FUNCTION_URL = import.meta.env.VITE_LAMBDA_FUNCTION_URL || '';

/**
 * Submit a JSON payload to the Serverless Event-Driven AWS backend.
 * 
 * @param {Object} payload - Valid JSON payload entered by user
 * @param {string} priority - Priority level ('LOW' | 'STANDARD' | 'HIGH')
 * @param {string} [idToken] - Optional Amazon Cognito JWT Token
 * @returns {Promise<Object>} AWS Job Submission Response
 */
export async function submitDataProcessingJob(payload, priority = 'STANDARD', idToken = null) {
  // If an active Lambda Function URL is provided in .env, make the real fetch call
  if (LAMBDA_FUNCTION_URL && !LAMBDA_FUNCTION_URL.includes('your-')) {
    try {
      const headers = {
        'Content-Type': 'application/json',
      };

      // When Amazon Cognito is wired up, pass the ID token in Authorization header
      if (idToken) {
        headers['Authorization'] = `Bearer ${idToken}`;
      }

      const startTime = performance.now();
      const response = await fetch(LAMBDA_FUNCTION_URL, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          payload,
          priority,
          submittedAt: new Date().toISOString()
        })
      });

      const latencyMs = Math.round(performance.now() - startTime);

      if (!response.ok) {
        const errText = await response.text().catch(() => '');
        throw new Error(`AWS Lambda error (${response.status}): ${errText || response.statusText}`);
      }

      let data = {};
      try {
        data = await response.json();
      } catch {
        data = { message: 'Success' };
      }

      return {
        jobId: data.jobId || data.id || data.executionArn || `job-${crypto.randomUUID()}`,
        status: data.status || 'PENDING',
        timestamp: new Date().toLocaleString(),
        payload,
        priority,
        eventType: payload.eventType || payload.detailType || 'CustomEvent',
        latencyMs,
        awsRequestId: data.awsRequestId || response.headers.get('x-amzn-RequestId') || `aws-req-${Math.random().toString(36).substring(2, 10)}`
      };
    } catch (err) {
      console.warn('Real Lambda fetch failed:', err.message);
      throw err;
    }
  }

  // Fallback: Realistic mock network simulation with setTimeout
  return new Promise((resolve, reject) => {
    // Simulate 800ms network round-trip latency to AWS Cloud
    setTimeout(() => {
      // 5% chance of simulated failure for resilience testing if requested
      const isSuccess = true;

      if (!isSuccess) {
        reject(new Error('503 Service Unavailable: EventBridge ingress bus throttling'));
        return;
      }

      const simulatedJobId = `job-${crypto.randomUUID()}`;
      const eventType = payload.eventType || payload.detailType || payload.eventSource || 'DataProcessingTask';

      resolve({
        jobId: simulatedJobId,
        eventType,
        priority,
        status: 'PENDING',
        timestamp: new Date().toLocaleString(),
        latencyMs: Math.floor(Math.random() * 350) + 420,
        payload,
        awsRequestId: `aws-req-${Math.random().toString(36).substring(2, 11)}`
      });
    }, 800);
  });
}
