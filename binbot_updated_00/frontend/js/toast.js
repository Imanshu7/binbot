/**
 * BinBot Global Toast Notification System
 * Usage: showToast("Your message", "success|error|warning|info", durationMs)
 */
(function () {
  function getContainer() {
    let container = document.querySelector('.binbot-toast-container');
    if (!container) {
      container = document.createElement('div');
      container.className = 'binbot-toast-container';
      document.body.appendChild(container);
    }
    return container;
  }

  const icons = {
    success: '✓',
    error: '✕',
    warning: '⚠',
    info: 'ℹ'
  };

  window.showToast = function (message, type = 'info', duration = 4000) {
    const container = getContainer();
    const toast = document.createElement('div');
    toast.className = `binbot-toast toast-${type}`;
    toast.innerHTML = `
      <div class="binbot-toast-icon">${icons[type] || icons.info}</div>
      <span class="binbot-toast-msg">${message}</span>
      <button class="binbot-toast-close" onclick="this.parentElement.classList.add('toast-exit'); setTimeout(()=>this.parentElement.remove(),350)">✕</button>
    `;
    container.appendChild(toast);

    // Auto dismiss
    setTimeout(() => {
      if (toast.parentElement) {
        toast.classList.add('toast-exit');
        setTimeout(() => toast.remove(), 350);
      }
    }, duration);
  };

  /**
   * Styled confirmation dialog (replaces browser confirm())
   * Usage: showConfirm("Are you sure?", () => { onConfirm(); });
   */
  window.showConfirm = function (message, onConfirm, onCancel) {
    // Backdrop
    const overlay = document.createElement('div');
    overlay.style.cssText = 'position:fixed;inset:0;z-index:99999;background:rgba(0,0,0,0.7);backdrop-filter:blur(8px);-webkit-backdrop-filter:blur(8px);display:flex;align-items:center;justify-content:center;padding:1rem;animation:fadeIn .2s ease';
    
    // Modal
    overlay.innerHTML = `
      <div style="background:#111;border:1px solid rgba(255,255,255,0.1);border-radius:1.5rem;padding:2rem;max-width:400px;width:100%;box-shadow:0 25px 50px rgba(0,0,0,0.5);animation:toastSlideIn .3s cubic-bezier(0.16,1,0.3,1) forwards">
        <div style="display:flex;align-items:center;gap:0.75rem;margin-bottom:1rem">
          <div style="width:2.5rem;height:2.5rem;border-radius:0.75rem;background:rgba(239,68,68,0.15);display:flex;align-items:center;justify-content:center;flex-shrink:0">
            <span style="color:#ef4444;font-size:1.25rem">⚠</span>
          </div>
          <h3 style="color:white;font-weight:800;font-size:1rem;margin:0">Are you sure?</h3>
        </div>
        <p style="color:#86868B;font-size:0.875rem;line-height:1.5;font-weight:500;margin:0 0 1.5rem 0">${message}</p>
        <div style="display:flex;gap:0.75rem;justify-content:flex-end">
          <button id="confirm-cancel-btn" style="padding:0.625rem 1.25rem;border-radius:0.75rem;background:rgba(255,255,255,0.05);border:1px solid rgba(255,255,255,0.1);color:white;font-weight:700;font-size:0.8125rem;cursor:pointer;transition:all .2s">Cancel</button>
          <button id="confirm-ok-btn" style="padding:0.625rem 1.25rem;border-radius:0.75rem;background:rgba(239,68,68,0.15);border:1px solid rgba(239,68,68,0.3);color:#ef4444;font-weight:700;font-size:0.8125rem;cursor:pointer;transition:all .2s">Confirm</button>
        </div>
      </div>
    `;
    document.body.appendChild(overlay);

    // Close on backdrop click
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) {
        overlay.remove();
        if (onCancel) onCancel();
      }
    });

    overlay.querySelector('#confirm-cancel-btn').addEventListener('click', () => {
      overlay.remove();
      if (onCancel) onCancel();
    });

    overlay.querySelector('#confirm-ok-btn').addEventListener('click', () => {
      overlay.remove();
      if (onConfirm) onConfirm();
    });
  };
})();
