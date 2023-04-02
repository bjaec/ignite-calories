import React, { useState } from "react";

type AccordionProps = {
  label: string;
  children: React.ReactNode;
};

const Accordion: React.FC<AccordionProps> = ({ label, children }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className="border border-gray-200 mb-4">
      <div
        className="p-2 cursor-pointer flex justify-between items-center"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div>{label}</div>
        <div>{isExpanded ? "-" : "+"}</div>
      </div>
      {isExpanded && children}
    </div>
  );
};

export default Accordion;