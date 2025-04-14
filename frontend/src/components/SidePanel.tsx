// SidePanel.tsx
import React, { useRef } from 'react';
import './SidePanel.css'; // Import the CSS for styling

interface SidePanelProps {
  isOpen: boolean;
  onClose: () => void; // Function to close the panel
  content: React.ReactNode; // Content to display in the side panel
}

const SidePanel: React.FC<SidePanelProps> = ({ isOpen, onClose, content }) => {
  const panelRef = useRef<HTMLDivElement | null>(null);

  // Resize handler with the correct MouseEvent type
  const handleMouseMove = (e: MouseEvent) => {
    if (panelRef.current) {
      const newWidth = e.clientX; // Get the new width based on mouse position
      panelRef.current.style.width = `${newWidth}px`; // Corrected: Adding backticks for template literal
    }
  };

  return (
    <div className={`drawer ${isOpen ? 'open' : ''}`} ref={panelRef}>
      <button className="close-button" onClick={onClose}>Close</button>
      <div className="drawer-content">
        {content} {/* Render the dynamic content here */}
      </div>
      <div
        className="resizer"
        onMouseDown={(e) => {
          e.preventDefault();
          document.addEventListener('mousemove', handleMouseMove); // Start resizing
          document.addEventListener('mouseup', () => {
            document.removeEventListener('mousemove', handleMouseMove); // Stop resizing
          }, { once: true });
        }}
      >
      </div>
    </div>
  );
};

export default SidePanel;