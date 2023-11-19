import Editor from "./text-editor.jsx";
import React, { useState, useEffect, useCallback, useRef } from "react";
import { createRoot } from "react-dom/client";

// Render your React component instead
const root = createRoot(document.getElementById("text-editor-container"));
root.render(<Editor/>);