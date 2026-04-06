const PAGE_ID = window.location.host + window.location.pathname;
const STORAGE_KEY = `h3_tracker_${PAGE_ID}`;
const SETTINGS_KEY = "h_tracker_settings";

/**
 * Loads the progress from storage for the current page.
 */
async function getProgress() {
  return new Promise((resolve) => {
    try {
      chrome.storage.local.get([STORAGE_KEY], (result) => {
        resolve(result[STORAGE_KEY] || {});
      });
    } catch (e) {
      resolve({});
    }
  });
}

/**
 * Saves the progress to storage for the current page.
 */
async function saveProgress(progress) {
  return new Promise((resolve) => {
    try {
      chrome.storage.local.set({ [STORAGE_KEY]: progress }, () => {
        resolve();
      });
    } catch (e) {
      resolve();
    }
  });
}

/**
 * Loads the heading tags to monitor from settings.
 */
async function getSettings() {
  return new Promise((resolve) => {
    try {
      chrome.storage.local.get([SETTINGS_KEY], (result) => {
        resolve(result[SETTINGS_KEY] || ["h3"]);
      });
    } catch (e) {
      resolve(["h3"]);
    }
  });
}

/**
 * Calculates the height of sticky/fixed headers on the page.
 */
function updateHeaderHeight() {
  let maxHeight = 0;
  const candidates = document.querySelectorAll('header, nav, [style*="fixed"], [style*="sticky"]');
  
  candidates.forEach(el => {
    const style = window.getComputedStyle(el);
    if (style.position === 'fixed' || style.position === 'sticky') {
      const rect = el.getBoundingClientRect();
      if (rect.top <= 10 && rect.bottom > 0 && rect.width > (window.innerWidth / 3)) {
        maxHeight = Math.max(maxHeight, rect.height);
      }
    }
  });

  if (maxHeight === 0) {
     const allElements = document.body.querySelectorAll('*');
     for (let i = 0; i < Math.min(allElements.length, 100); i++) {
         const el = allElements[i];
         const style = window.getComputedStyle(el);
         if (style.position === 'fixed' || style.position === 'sticky') {
             const rect = el.getBoundingClientRect();
             if (rect.top <= 5 && rect.bottom > 0 && rect.width > (window.innerWidth / 2)) {
                 maxHeight = Math.max(maxHeight, rect.height);
                 break; 
             }
         }
     }
  }

  const finalHeight = maxHeight > 0 ? maxHeight + 20 : 20;
  document.documentElement.style.setProperty('--h-tracker-header-height', `${finalHeight}px`);
  return finalHeight;
}

/**
 * Normalizes text to use as a key.
 */
function getHeadingKey(el) {
  const clone = el.cloneNode(true);
  const checkbox = clone.querySelector(".h3-checkbox");
  const toggle = clone.querySelector(".h3-toggle");
  if (checkbox) checkbox.remove();
  if (toggle) toggle.remove();
  return clone.innerText.trim();
}

/**
 * Gets all the content elements following a heading until the next heading.
 */
function getSectionContent(el) {
  const content = [];
  const level = parseInt(el.tagName.substring(1));
  let next = el.nextElementSibling;
  
  while (next) {
    if (/^H[1-6]$/.test(next.tagName)) {
      const nextLevel = parseInt(next.tagName.substring(1));
      if (nextLevel <= level) break;
    }
    content.push(next);
    next = next.nextElementSibling;
  }
  return content;
}

/**
 * Updates the visibility and TOC state for a section.
 */
function updateSectionVisibility(el, isCollapsed) {
  const toggle = el.querySelector(".h3-toggle");
  if (toggle) {
    toggle.innerHTML = isCollapsed ? "▶" : "▼";
    toggle.classList.toggle("collapsed", isCollapsed);
  }

  const content = getSectionContent(el);
  content.forEach((contentEl) => {
    contentEl.classList.toggle("h3-section-content", true);
    contentEl.classList.toggle("hidden", isCollapsed);
  });

  if (isCollapsed) {
    el.classList.add("completed");
  } else {
    el.classList.remove("completed");
  }
  
  // Find and update TOC item safely
  const key = getHeadingKey(el);
  const tocItems = document.querySelectorAll('.h-tracker-toc-item');
  tocItems.forEach(item => {
    if (item.dataset.key === key) {
      item.classList.toggle("completed", isCollapsed);
    }
  });
}

/**
 * Syncs the UI with the provided progress object.
 */
async function syncUI(progress) {
  const settings = await getSettings();
  const selector = settings.join(",");
  if (!selector) return;

  const headings = document.querySelectorAll(selector);
  headings.forEach((el) => {
    const key = getHeadingKey(el);
    const checkbox = el.querySelector(".h3-checkbox");
    if (checkbox && key) {
      const isChecked = !!progress[key];
      checkbox.checked = isChecked;
      updateSectionVisibility(el, isChecked);
    }
  });
}

/**
 * Creates and injects the TOC UI.
 */
function createTOC() {
  if (document.getElementById("h-tracker-toc-btn")) return;

  const btn = document.createElement("button");
  btn.id = "h-tracker-toc-btn";
  btn.innerHTML = "☰";
  document.body.appendChild(btn);

  const popup = document.createElement("div");
  popup.id = "h-tracker-toc-popup";
  popup.innerHTML = `
    <div class="h-tracker-toc-header">
      Table of Contents
      <span style="cursor:pointer" id="h-tracker-toc-close">✕</span>
    </div>
    <div class="h-tracker-toc-list" id="h-tracker-toc-list"></div>
  `;
  document.body.appendChild(popup);

  btn.addEventListener("click", (e) => {
    e.stopPropagation();
    popup.classList.toggle("show");
    if (popup.classList.contains("show")) {
      updateTOCList();
    }
  });

  document.getElementById("h-tracker-toc-close").addEventListener("click", () => {
    popup.classList.remove("show");
  });

  document.addEventListener("click", (e) => {
    if (!popup.contains(e.target) && e.target !== btn) {
      popup.classList.remove("show");
    }
  });
}

/**
 * Updates the TOC list items.
 */
async function updateTOCList() {
  const list = document.getElementById("h-tracker-toc-list");
  if (!list) return;

  const settings = await getSettings();
  const selector = settings.join(",");
  if (!selector) {
    list.innerHTML = '<div style="padding:16px;font-size:12px;color:#666">No headings selected.</div>';
    return;
  }

  const headings = Array.from(document.querySelectorAll(selector));
  if (headings.length === 0) {
    list.innerHTML = '<div style="padding:16px;font-size:12px;color:#666">No sections found.</div>';
    return;
  }

  const progress = await getProgress();
  list.innerHTML = "";
  
  headings.forEach((h) => {
    const key = getHeadingKey(h);
    if (!key) return;

    const isCompleted = !!progress[key];
    const item = document.createElement("div");
    item.className = `h-tracker-toc-item level-${h.tagName.toLowerCase()}`;
    if (isCompleted) item.classList.add("completed");
    item.textContent = key;
    item.dataset.key = key;

    item.addEventListener("click", () => {
      const headerHeight = updateHeaderHeight();
      const rect = h.getBoundingClientRect();
      const absoluteTop = rect.top + window.scrollY;
      
      window.scrollTo({
        top: absoluteTop - headerHeight,
        behavior: "smooth"
      });
      
      document.getElementById("h-tracker-toc-popup").classList.remove("show");
    });

    list.appendChild(item);
  });
}

/**
 * Re-scans the page for headings and processes them.
 */
async function updateAllHeadings() {
  const progress = await getProgress();
  const settings = await getSettings();
  const selector = settings.join(",");
  if (!selector) return;

  const headings = document.querySelectorAll(selector);
  headings.forEach((el) => {
    processHeading(el, progress);
  });
}

/**
 * Adds a checkbox and toggle to a heading element and attaches logic.
 */
function processHeading(el, progress) {
  if (el.dataset.h3TrackerProcessed) return;

  const toggle = document.createElement("span");
  toggle.className = "h3-toggle";
  toggle.innerHTML = "▼";
  el.prepend(toggle);

  const checkbox = document.createElement("input");
  checkbox.type = "checkbox";
  checkbox.className = "h3-checkbox";
  el.prepend(checkbox);

  const key = getHeadingKey(el);
  if (!key) {
    checkbox.remove();
    toggle.remove();
    return;
  }

  el.dataset.h3TrackerProcessed = "true";
  const isChecked = !!progress[key];
  checkbox.checked = isChecked;

  updateSectionVisibility(el, isChecked);

  checkbox.addEventListener("change", async () => {
    const currentProgress = await getProgress();
    const state = checkbox.checked;
    updateSectionVisibility(el, state);
    currentProgress[key] = state;
    await saveProgress(currentProgress);
  });

  el.addEventListener("click", (e) => {
    if (e.target === checkbox) return;
    checkbox.checked = !checkbox.checked;
    checkbox.dispatchEvent(new Event("change"));
  });
}

/**
 * Initializes the tracker on the current page.
 */
async function init() {
  createTOC();
  updateHeaderHeight();
  await updateAllHeadings();

  window.addEventListener('resize', updateHeaderHeight);
  
  chrome.storage.onChanged.addListener((changes, areaName) => {
    if (areaName === "local") {
      try {
        if (changes[STORAGE_KEY]) {
          syncUI(changes[STORAGE_KEY].newValue || {});
        }
        if (changes[SETTINGS_KEY]) {
          location.reload(); 
        }
      } catch (e) {
        // Handle context invalidation
      }
    }
  });

  const observer = new MutationObserver((mutations) => {
    let shouldUpdate = false;
    mutations.forEach((mutation) => {
      mutation.addedNodes.forEach((node) => {
        if (node.nodeType === Node.ELEMENT_NODE) {
          if (/^H[1-6]$/.test(node.tagName) || node.querySelector("h1,h2,h3,h4,h5,h6")) {
            shouldUpdate = true;
          }
        }
      });
    });
    if (shouldUpdate) {
      updateAllHeadings();
      updateTOCList();
    }
  });

  observer.observe(document.body, {
    childList: true,
    subtree: true,
  });
}

init();
