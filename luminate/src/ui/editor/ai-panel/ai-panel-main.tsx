import AiForm from "./ai-form";
import React, { useState, useEffect, useCallback, useRef } from "react";
import { createRoot } from "react-dom/client";

// Render your React component instead
const root = createRoot(document.getElementById("ai-panel"));
root.render(<AiForm responseHandler={null} selectedContent={null}/>);
console.log("ai-panel loaded");