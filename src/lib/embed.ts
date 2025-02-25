// Utilities for embedding the application in other websites

/**
 * Types of messages that can be sent between the parent and the iframe
 */
export type EmbedMessageType = 
  | 'INITIALIZE'
  | 'SET_THEME'
  | 'RESIZE_HEIGHT'
  | 'NAVIGATE'
  | 'EVENT';

/**
 * Message structure for communication between parent and iframe
 */
export interface EmbedMessage {
  type: EmbedMessageType;
  payload?: any;
}

/**
 * Configuration options for embedding
 */
export interface EmbedConfig {
  targetOrigin?: string;
  autoResize?: boolean;
  theme?: {
    [key: string]: string;
  };
  initialPath?: string;
}

/**
 * Default configuration
 */
const defaultConfig: EmbedConfig = {
  targetOrigin: '*', // In production, set this to the exact origin
  autoResize: true,
  theme: {},
  initialPath: '/',
};

/**
 * Client-side utilities for the embedded application
 */
export const embedClient = {
  /**
   * Initialize the embedded application
   */
  initialize: (config: EmbedConfig = {}) => {
    if (typeof window === 'undefined') return;

    const mergedConfig = { ...defaultConfig, ...config };
    
    // Listen for messages from parent
    window.addEventListener('message', (event) => {
      if (mergedConfig.targetOrigin !== '*' && event.origin !== mergedConfig.targetOrigin) {
        return;
      }

      const message = event.data as EmbedMessage;
      if (!message || !message.type) return;

      switch (message.type) {
        case 'SET_THEME':
          // Apply theme settings
          if (message.payload) {
            document.documentElement.style.setProperty('--embedded', 'true');
            Object.entries(message.payload).forEach(([key, value]) => {
              document.documentElement.style.setProperty(`--${key}`, value as string);
            });
          }
          break;
        case 'NAVIGATE':
          // Handle navigation
          if (message.payload && typeof message.payload === 'string') {
            window.history.pushState({}, '', message.payload);
          }
          break;
        default:
          // Handle other message types
          break;
      }
    });

    // Send initialization message to parent
    window.parent.postMessage({
      type: 'INITIALIZE',
      payload: { initialized: true }
    }, mergedConfig.targetOrigin);

    // Auto-resize if enabled
    if (mergedConfig.autoResize) {
      setInterval(() => {
        const height = document.body.scrollHeight;
        window.parent.postMessage({
          type: 'RESIZE_HEIGHT',
          payload: { height }
        }, mergedConfig.targetOrigin);
      }, 500);
    }
  },

  /**
   * Send an event to the parent window
   */
  sendEvent: (eventName: string, data?: any) => {
    if (typeof window === 'undefined') return;
    
    window.parent.postMessage({
      type: 'EVENT',
      payload: { event: eventName, data }
    }, '*');
  }
};

/**
 * Server-side utilities for generating embed code
 */
export const embedServer = {
  /**
   * Generate HTML code for embedding
   */
  generateEmbedCode: (options: {
    url: string;
    width?: string;
    height?: string;
    allowFullscreen?: boolean;
    style?: string;
  }) => {
    const {
      url,
      width = '100%',
      height = '600px',
      allowFullscreen = true,
      style = ''
    } = options;

    return `<iframe 
  src="${url}" 
  width="${width}" 
  height="${height}" 
  frameborder="0" 
  ${allowFullscreen ? 'allowfullscreen' : ''} 
  style="border: none; ${style}"
></iframe>
<script>
  window.addEventListener('message', function(event) {
    if (event.data && event.data.type === 'RESIZE_HEIGHT') {
      const iframe = document.querySelector('iframe[src="${url}"]');
      if (iframe && event.data.payload && event.data.payload.height) {
        iframe.style.height = event.data.payload.height + 'px';
      }
    }
  });
</script>`;
  }
}; 