<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Chatbot</title>
</head>
<body>
  <div id="glassBox">
    <span>🗨️ Ollama Quick Chat</span>
    <input class="input" id="input_field" type="text" placeholder="Type your message...">
    <div class="hint">↩️ Enter to send</div>
  </div>


  <script>
    const { ipcRenderer } = require('electron');
    
    // Listen for 'focus-input' message from main process
    ipcRenderer.on('focus-input', () => {
      // Focus the input field
      const inputField = document.getElementById('input_field');
      if (inputField) {
        inputField.focus();
      }
    });
  </script>
</body>
</html>
