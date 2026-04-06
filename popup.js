const SETTINGS_KEY = "h_tracker_settings";

const checkboxes = document.querySelectorAll('input[type="checkbox"]');

// Load settings
chrome.storage.local.get([SETTINGS_KEY], (result) => {
  const settings = result[SETTINGS_KEY] || ["h3"];
  checkboxes.forEach((cb) => {
    cb.checked = settings.includes(cb.value);
  });
});

// Save settings when changed
checkboxes.forEach((cb) => {
  cb.addEventListener("change", () => {
    const selected = Array.from(checkboxes)
      .filter((cb) => cb.checked)
      .map((cb) => cb.value);
    
    chrome.storage.local.set({ [SETTINGS_KEY]: selected });
  });
});
