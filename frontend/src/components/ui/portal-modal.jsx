import { useEffect } from 'react';
import ReactDOM from 'react-dom';

/**
 * PortalModal — renders children directly into document.body via a React Portal.
 * This completely bypasses any parent stacking context (z-index, transform, filter)
 * that would otherwise cause the modal to render behind other elements.
 */
const PortalModal = ({ children, isOpen }) => {
  // Prevent body scroll while modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return ReactDOM.createPortal(children, document.body);
};

export default PortalModal;
