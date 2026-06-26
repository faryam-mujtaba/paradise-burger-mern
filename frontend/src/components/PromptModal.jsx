import { useEffect, useState } from "react";
import "../styles/promptModal.css";

function PromptModal({
  isOpen,
  title = "Enter a value",
  message = "",
  label = "Value",
  placeholder = "",
  defaultValue = "",
  confirmText = "Confirm",
  cancelText = "Cancel",
  onConfirm,
  onCancel,
}) {
  const [value, setValue] = useState(defaultValue);

  useEffect(() => {
    if (isOpen) {
      setValue(defaultValue);
    }
  }, [isOpen, defaultValue]);

  if (!isOpen) return null;

  const handleConfirm = () => {
    onConfirm(value);
  };

  return (
    <div className="prompt-modal-overlay">
      <div className="prompt-modal-box">
        <div className="prompt-modal-icon">✎</div>

        <h2>{title}</h2>

        {message && <p>{message}</p>}

        <label className="prompt-modal-label" htmlFor="prompt-input">
          {label}
        </label>

        <textarea
          id="prompt-input"
          className="prompt-modal-input"
          rows={4}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder={placeholder}
        />

        <div className="prompt-modal-actions">
          <button className="prompt-cancel-btn" onClick={onCancel} type="button">
            {cancelText}
          </button>

          <button className="prompt-main-btn" onClick={handleConfirm} type="button">
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}

export default PromptModal;
