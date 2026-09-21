import React, { useState } from 'react';
import { Send, CheckCircle, AlertCircle, FileCode, Sparkles, RefreshCw, Cpu } from 'lucide-react';
import { SAMPLE_PAYLOADS } from '../utils/mockData';
import { submitDataProcessingJob } from '../services/jobService';

export default function JobSubmitForm({ onJobCreated, addToast }) {
  const defaultInitialJson = JSON.stringify(SAMPLE_PAYLOADS.IMAGE_RESIZE.payload, null, 2);
  const [jsonText, setJsonText] = useState(defaultInitialJson);
  const [priority, setPriority] = useState('HIGH');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [validation, setValidation] = useState({ isValid: true, error: null });

  // Validate JSON on each keystroke or load
  const handleJsonChange = (val) => {
    setJsonText(val);
    if (!val.trim()) {
      setValidation({ isValid: false, error: 'Payload cannot be empty' });
      return;
    }
    try {
      JSON.parse(val);
      setValidation({ isValid: true, error: null });
    } catch (err) {
      setValidation({ isValid: false, error: err.message });
    }
  };

  // Format / Prettify current JSON
  const formatJson = () => {
    try {
      const parsed = JSON.parse(jsonText);
      setJsonText(JSON.stringify(parsed, null, 2));
      setValidation({ isValid: true, error: null });
      addToast('JSON formatted successfully', 'info');
    } catch (err) {
      addToast('Cannot format invalid JSON: ' + err.message, 'error');
    }
  };

  // Quick load pre-built sample payloads
  const loadSample = (sampleKey) => {
    const sample = SAMPLE_PAYLOADS[sampleKey];
    if (sample) {
      const formatted = JSON.stringify(sample.payload, null, 2);
      setJsonText(formatted);
      setValidation({ isValid: true, error: null });
      addToast(`Loaded: ${sample.name}`, 'info');
    }
  };

  /**
   * Placeholder handleSubmit async function
   * Simulates sending JSON payload to AWS Lambda Function URL via fetch / setTimeout
   */
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validation.isValid) {
      addToast('Please correct the JSON syntax errors before submitting.', 'error');
      return;
    }

    let parsedPayload;
    try {
      parsedPayload = JSON.parse(jsonText);
    } catch (err) {
      addToast('Invalid JSON structure: ' + err.message, 'error');
      return;
    }

    setIsSubmitting(true);

    try {
      // Calls the abstracted jobService (which handles fetch to Lambda URL or mock setTimeout)
      const newJob = await submitDataProcessingJob(parsedPayload, priority);

      onJobCreated(newJob);
      addToast(`Job ${newJob.jobId.slice(0, 16)}... submitted to EventBridge!`, 'success');
    } catch (err) {
      console.error('Job submission failure:', err);
      addToast(`Submission failed: ${err.message}`, 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const byteSize = new Blob([jsonText]).size;

  return (
    <div className="card">
      <div className="card-header">
        <div>
          <h2 className="card-title">
            <Cpu size={18} color="var(--aws-amber)" />
            Submit Data Processing Job
          </h2>
          <p className="card-subtitle">
            Dispatches an asynchronous event payload to AWS Lambda Function URL
          </p>
        </div>
      </div>

      {/* Cloud Endpoint Indicator */}
      <div className="endpoint-notice">
        <div className="endpoint-header">
          <FileCode size={13} />
          <span>TARGET INGRESS ENDPOINT:</span>
        </div>
        <div className="endpoint-url">
          POST {import.meta.env.VITE_LAMBDA_FUNCTION_URL || 'https://mock-ingress.lambda-url.us-east-1.on.aws/jobs'}
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        {/* Sample Payload Quick Buttons */}
        <div className="form-group">
          <div className="form-label">
            <span>Payload Templates</span>
            <div className="form-actions-inline">
              <button 
                type="button" 
                className="action-chip" 
                onClick={() => loadSample('IMAGE_RESIZE')}
                title="S3 Image Processing Pipeline"
              >
                S3 Image Pipeline
              </button>
              <button 
                type="button" 
                className="action-chip" 
                onClick={() => loadSample('ORDER_PROCESSING')}
                title="EventBridge Order Event"
              >
                Order Event
              </button>
              <button 
                type="button" 
                className="action-chip" 
                onClick={() => loadSample('IOT_TELEMETRY')}
                title="IoT Device Telemetry"
              >
                IoT Sensor
              </button>
            </div>
          </div>
        </div>

        {/* JSON Payload Editor */}
        <div className="form-group">
          <div className="form-label">
            <span>JSON Payload</span>
            <button 
              type="button" 
              className="action-chip" 
              onClick={formatJson}
              title="Prettify JSON indentation"
            >
              <Sparkles size={11} style={{ display: 'inline', marginRight: '3px' }} />
              Prettify JSON
            </button>
          </div>

          <div className={`code-editor-wrapper ${!validation.isValid ? 'has-error' : ''}`}>
            <textarea
              id="job-json-payload"
              className="json-textarea"
              value={jsonText}
              onChange={(e) => handleJsonChange(e.target.value)}
              placeholder='{ "eventType": "DataProcessing", "records": [] }'
              rows={10}
              spellCheck="false"
            />
            <div className="editor-footer">
              <div>
                {validation.isValid ? (
                  <span className="validation-tag valid">
                    <CheckCircle size={13} /> Valid JSON ({byteSize} bytes)
                  </span>
                ) : (
                  <span className="validation-tag invalid" title={validation.error}>
                    <AlertCircle size={13} /> Invalid JSON: {validation.error?.slice(0, 45)}...
                  </span>
                )}
              </div>
              <span>UTF-8 Encoding</span>
            </div>
          </div>
        </div>

        {/* Priority Selector */}
        <div className="form-group">
          <label className="form-label" htmlFor="job-priority">
            <span>Job Execution Priority</span>
          </label>
          <select 
            id="job-priority"
            className="form-select"
            value={priority}
            onChange={(e) => setPriority(e.target.value)}
          >
            <option value="HIGH">HIGH (SQS Priority FIFO Queue)</option>
            <option value="STANDARD">STANDARD (EventBridge Standard Bus)</option>
            <option value="LOW">LOW (Batch Processing / Spot Lambda)</option>
          </select>
        </div>

        {/* Submit Button with Loading State */}
        <button
          id="submit-job-btn"
          type="submit"
          className="btn btn-primary"
          style={{ width: '100%', padding: '0.75rem', fontSize: '0.95rem' }}
          disabled={isSubmitting || !validation.isValid}
        >
          {isSubmitting ? (
            <>
              <RefreshCw size={16} className="spin" />
              <span>Invoking Lambda Function URL...</span>
            </>
          ) : (
            <>
              <Send size={16} />
              <span>Submit Data Processing Job</span>
            </>
          )}
        </button>
      </form>
    </div>
  );
}
