import "../styles/confirmModal.css";

function ConfirmModal({
  isOpen,
  title = "Are you sure?",
  message = "",
  confirmText = "Confirm",
  cancelText = "Cancel",
  onConfirm,
  onCancel,
}) {
  if (!isOpen) return null;

  return (
    <div className="confirm-modal-overlay">
      <div className="confirm-modal-box">
        <div className="confirm-modal-icon">?</div>

        <h2>{title}</h2>

        {message && <p>{message}</p>}

        <div className="confirm-modal-actions">
          <button className="confirm-cancel-btn" onClick={onCancel}>
            {cancelText}
          </button>

          <button className="confirm-main-btn" onClick={onConfirm}>
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}

export default ConfirmModal;