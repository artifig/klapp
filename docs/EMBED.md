# Embedding Guide

## Basic Implementation

To embed the assessment tool in your website, add the following code to your HTML:

```html
<iframe
  id="assessment-frame"
  src="https://your-app-url.com"
  width="100%"
  style="border: none; width: 100%; min-height: 500px;"
  allow="clipboard-write"
></iframe>

<script>
  // Handle responsive iframe resizing
  window.addEventListener('message', function(event) {
    if (event.data.type === 'resize') {
      const iframe = document.getElementById('assessment-frame');
      iframe.style.height = `${event.data.height}px`;
    }
  });
</script>
```

## Configuration Options

You can customize the embedded experience by adding URL parameters:

```html
<iframe
  src="https://your-app-url.com?theme=light&hideHeader=true"
  ...
></iframe>
```

Available parameters:
- `theme`: 'light' or 'dark'
- `hideHeader`: true/false
- `hideFooter`: true/false

## Styling Recommendations

For the best experience, we recommend:

1. Using a container with minimum width of 320px
2. Setting a minimum height of 500px
3. Removing iframe borders
4. Using 100% width for responsiveness

## Communication API

The embedded app supports two-way communication:

```javascript
// Listen for events from the embedded app
window.addEventListener('message', function(event) {
  if (event.origin !== 'https://your-app-url.com') return;
  
  switch(event.data.type) {
    case 'completed':
      console.log('Assessment completed:', event.data.result);
      break;
    case 'resize':
      // Handle iframe resize
      break;
  }
});

// Send messages to the embedded app
const iframe = document.getElementById('assessment-frame');
iframe.contentWindow.postMessage({
  type: 'setTheme',
  theme: 'dark'
}, 'https://your-app-url.com');
```

## Security Considerations

1. Always specify the exact origin in postMessage calls
2. Validate incoming message origins
3. Use HTTPS for secure communication
4. Set appropriate Content Security Policy (CSP) headers 