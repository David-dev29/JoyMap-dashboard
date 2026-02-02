import { useEffect, useRef, useState, Children, isValidElement } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence, useDragControls } from 'framer-motion';
import { HiOutlineX } from 'react-icons/hi';

// Custom hook for detecting mobile
const useIsMobile = (breakpoint = 768) => {
  const [isMobile, setIsMobile] = useState(() =>
    typeof window !== 'undefined' ? window.innerWidth < breakpoint : false
  );

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handleResize = () => {
      setIsMobile(window.innerWidth < breakpoint);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [breakpoint]);

  return isMobile;
};

// Footer component marker
const MobileModalFooter = ({ children }) => null;
MobileModalFooter.displayName = 'MobileModalFooter';

const MobileModal = ({
  isOpen,
  onClose,
  title,
  description,
  children,
  size = 'md',
  showCloseButton = true,
  closeOnOverlay = true,
  closeOnEscape = true,
  showDragHandle = true,
  fullHeight = false,
  className = '',
}) => {
  const isMobile = useIsMobile();
  const overlayRef = useRef(null);
  const dragControls = useDragControls();
  const [dragY, setDragY] = useState(0);

  const sizes = {
    sm: 'max-w-md',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl',
    full: 'max-w-full mx-4',
  };

  const mobileHeights = {
    sm: 'max-h-[40vh]',
    md: 'max-h-[60vh]',
    lg: 'max-h-[75vh]',
    xl: 'max-h-[85vh]',
    full: 'max-h-[95vh]',
  };

  useEffect(() => {
    const handleEscape = (e) => {
      if (closeOnEscape && e.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = '';
    };
  }, [isOpen, onClose, closeOnEscape]);

  const handleOverlayClick = (e) => {
    if (closeOnOverlay && e.target === overlayRef.current) {
      onClose();
    }
  };

  const handleDragEnd = (event, info) => {
    // Close if dragged down more than 100px or velocity is high
    if (info.offset.y > 100 || info.velocity.y > 500) {
      onClose();
    }
    setDragY(0);
  };

  // Separate footer from other children
  const childrenArray = Children.toArray(children);
  const footerChild = childrenArray.find(
    (child) => isValidElement(child) && child.type === MobileModalFooter
  );
  const contentChildren = childrenArray.filter(
    (child) => !isValidElement(child) || child.type !== MobileModalFooter
  );

  // Animation variants
  const overlayVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1 },
    exit: { opacity: 0 },
  };

  const mobileSheetVariants = {
    hidden: { y: '100%' },
    visible: {
      y: 0,
      transition: {
        type: 'spring',
        damping: 30,
        stiffness: 300,
      }
    },
    exit: {
      y: '100%',
      transition: {
        type: 'spring',
        damping: 30,
        stiffness: 300,
      }
    },
  };

  const desktopModalVariants = {
    hidden: { opacity: 0, scale: 0.95 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: {
        type: 'spring',
        damping: 25,
        stiffness: 300,
      }
    },
    exit: {
      opacity: 0,
      scale: 0.95,
      transition: {
        duration: 0.15,
      }
    },
  };

  const modalContent = (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          ref={overlayRef}
          onClick={handleOverlayClick}
          variants={overlayVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
          transition={{ duration: 0.2 }}
          className={`fixed inset-0 z-50 bg-black/50 backdrop-blur-sm ${
            isMobile ? 'flex items-end' : 'flex items-center justify-center p-4'
          }`}
        >
          {isMobile ? (
            // Mobile Bottom Sheet
            <motion.div
              variants={mobileSheetVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              drag="y"
              dragControls={dragControls}
              dragConstraints={{ top: 0 }}
              dragElastic={0.2}
              onDragEnd={handleDragEnd}
              className={`
                w-full
                ${fullHeight ? 'h-[95vh]' : mobileHeights[size]}
                bg-white dark:bg-gray-900
                rounded-t-3xl
                shadow-2xl
                flex flex-col
                overflow-hidden
                touch-none
                ${className}
              `}
              style={{ touchAction: 'none' }}
            >
              {/* Drag Handle */}
              {showDragHandle && (
                <div
                  className="flex-shrink-0 pt-3 pb-2 flex justify-center cursor-grab active:cursor-grabbing"
                  onPointerDown={(e) => dragControls.start(e)}
                >
                  <div className="w-10 h-1 bg-gray-300 dark:bg-gray-600 rounded-full" />
                </div>
              )}

              {/* Header */}
              {(title || showCloseButton) && (
                <div className="flex-shrink-0 flex items-start justify-between px-4 pb-3 pt-1">
                  <div className="flex-1 min-w-0 pr-2">
                    {title && (
                      <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                        {title}
                      </h2>
                    )}
                    {description && (
                      <p className="mt-0.5 text-sm text-gray-500 dark:text-gray-400">
                        {description}
                      </p>
                    )}
                  </div>
                  {showCloseButton && (
                    <button
                      onClick={onClose}
                      className="flex-shrink-0 p-2 -mr-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                    >
                      <HiOutlineX className="w-5 h-5" />
                    </button>
                  )}
                </div>
              )}

              {/* Separator line */}
              {(title || showCloseButton) && (
                <div className="flex-shrink-0 h-px bg-gray-100 dark:bg-gray-800 mx-4" />
              )}

              {/* Content - Scrollable */}
              <div className="flex-1 overflow-y-auto overscroll-contain px-4 py-4">
                {contentChildren}
              </div>

              {/* Footer */}
              {footerChild && (
                <div className="flex-shrink-0 px-4 pb-4 pt-3 border-t border-gray-100 dark:border-gray-800 safe-bottom">
                  <div className="flex items-center justify-end gap-3">
                    {footerChild.props.children}
                  </div>
                </div>
              )}
            </motion.div>
          ) : (
            // Desktop Modal
            <motion.div
              variants={desktopModalVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              className={`
                relative w-full ${sizes[size]}
                max-h-[90vh] overflow-hidden flex flex-col
                bg-white dark:bg-gray-800
                rounded-xl shadow-2xl
                ${className}
              `}
            >
              {/* Header */}
              {(title || showCloseButton) && (
                <div className="flex-shrink-0 flex items-start justify-between p-4 border-b border-gray-200 dark:border-gray-700">
                  <div className="min-w-0 flex-1 pr-2">
                    {title && (
                      <h2 className="text-lg font-semibold text-gray-900 dark:text-white truncate">
                        {title}
                      </h2>
                    )}
                    {description && (
                      <p className="mt-1 text-sm text-gray-500 dark:text-gray-400 truncate">
                        {description}
                      </p>
                    )}
                  </div>
                  {showCloseButton && (
                    <button
                      onClick={onClose}
                      className="flex-shrink-0 p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                    >
                      <HiOutlineX className="w-5 h-5" />
                    </button>
                  )}
                </div>
              )}

              {/* Content - Scrollable */}
              <div className="flex-1 overflow-y-auto p-4">
                {contentChildren}
              </div>

              {/* Footer */}
              {footerChild && (
                <div className="flex-shrink-0 p-4 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
                  <div className="flex items-center justify-end gap-3">
                    {footerChild.props.children}
                  </div>
                </div>
              )}
            </motion.div>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );

  return typeof document !== 'undefined'
    ? createPortal(modalContent, document.body)
    : null;
};

// Attach Footer component
MobileModal.Footer = MobileModalFooter;

export default MobileModal;
