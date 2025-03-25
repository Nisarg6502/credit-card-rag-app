const submitBtn = document.getElementById("submitBtn");
const queryInput = document.getElementById("queryInput");
const responseContainer = document.getElementById("responseContainer");
const responseText = document.getElementById("responseText");
const copyBtn = document.getElementById("copyBtn");
// Add this at the top with other constants
const micBtn = document.getElementById("micBtn");


// Replace with your actual Cloud Run endpoint URL
const API_URL = "https://gemini-service-309166419585.asia-south1.run.app/recommend";

submitBtn.addEventListener("click", handleSubmit);
queryInput.addEventListener("keypress", (e) => {
  if (e.key === "Enter") handleSubmit();
});
copyBtn.addEventListener("click", handleCopy);

// Add this after other event listeners
micBtn.addEventListener("click", handleSpeechInput);


async function handleSubmit() {
  const queryText = queryInput.value.trim();
  if (!queryText) {
    showError("Please enter a query.");
    return;
  }

  // Show loading state
  showLoading();
  // Disable button while processing
  submitBtn.disabled = true;

  try {
    const response = await fetch(API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ query: queryText }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      throw new Error(
        errorData?.error || 
        `Server error (${response.status}). Please try again later.`
      );
    }

    const data = await response.json();
    showSuccess(data.recommendation || "No recommendation found.");

  } catch (err) {
    showError(err.message);
    console.error("API Error:", err);
  } finally {
    submitBtn.disabled = false;
  }
}

function showLoading() {
  responseText.innerHTML = `
    <div class="loading">
      <p>Processing your query...</p>
    </div>
  `;
}

function showError(message) {
  responseText.innerHTML = `
    <div class="error">
      <p>⚠️ ${message}</p>
    </div>
  `;
}

function showSuccess(message) {
  responseText.innerHTML = `
    <div class="success">
      <p>${message}</p>
    </div>
  `;
}

function handleCopy() {
  const textToCopy = responseText.innerText;
  if (!textToCopy) return;

  navigator.clipboard.writeText(textToCopy)
    .then(() => {
      // Change icon to a checkmark on success
      copyBtn.innerHTML = `
        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                d="M5 13l4 4L19 7" />
        </svg>
      `;
      // Revert icon after 2 seconds
      setTimeout(() => {
        copyBtn.innerHTML = `
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                  d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2M16 8h2a2 2 0 012 2v8a2 2 0 01-2 2h-2M8 16l8-8" />
          </svg>
        `;
      }, 2000);
    })
    .catch((err) => {
      console.error("Copy error:", err);
    });
}

function handleSpeechInput() {
  if (!('webkitSpeechRecognition' in window)) {
    alert('Speech recognition is not supported in this browser. Please use Chrome.');
    return;
  }

  const recognition = new webkitSpeechRecognition();
  recognition.continuous = false;
  recognition.interimResults = false;
  recognition.lang = 'en-US';

  // Change mic button appearance to indicate recording
  micBtn.classList.add('recording');
  micBtn.innerHTML = `
    <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
    </svg>
  `;

  recognition.onresult = (event) => {
    const transcript = event.results[0][0].transcript;
    queryInput.value = transcript;
  };

  recognition.onend = () => {
    // Reset mic button appearance
    micBtn.classList.remove('recording');
    micBtn.innerHTML = `
      <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
      </svg>
    `;
  };

  recognition.onerror = (event) => {
    console.error('Speech recognition error:', event.error);
    micBtn.classList.remove('recording');
  };

  recognition.start();
}