import React, { useEffect, useState } from "react";
import ReactDOM from "react-dom";
import { Call, CallAction, Message, MessageEvent } from "./../common/types";
import { openPhonePopup } from "./../utils";

export const ContentApp = () => {
  const [selectedText, setSelectedText] = useState("");
  const [counting, setCounting] = useState(0);
  const [position, setPosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    function mouseUpListener(e: any) {
      const text = window.getSelection()?.toString().trim();
      if (text && text.length > 0) {
        const number = validateAndFormatNumber(text);
        setSelectedText(number || "");
        setPosition({ x: e.pageX, y: e.pageY });
      } else {
        setSelectedText("");
      }
    }

    document.addEventListener("mouseup", mouseUpListener);

    return () => {
      document.removeEventListener("mouseup", mouseUpListener);
    };
  }, []);

  const validateAndFormatNumber = (input: string): string | null => {
    const strippedInput = input.replace(/\s+|\.|-|\+|\(|\)/g, ""); // remove all spaces

    // check if the final string contains only numbers
    if (/^\d+$/.test(strippedInput)) {
      return strippedInput;
    } else {
      return null;
    }
  };

  const onClick = () => {
    setSelectedText("");
    const msg: Message<Call> = {
      event: MessageEvent.Call,
      data: {
        action: CallAction.OUTBOUND,
        number: selectedText || "",
      },
    };
    chrome.runtime.sendMessage(msg);
  };

  if (!selectedText) {
    return null;
  }

  return (
    <div
      style={{
        position: "absolute",
        left: `${position.x}px`,
        top: `${position.y}px`,
        backgroundColor: "white",
        height: "80px",
        width: "180px",
        borderRadius: "10px",
        boxShadow: "0 10px 20px rgba(0,0,0,0.19), 0 6px 6px rgba(0,0,0,0.23)",
        padding: "10px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        zIndex: "99999999",
        fontFamily: "Arial, sans-serif",
      }}
    >
      <div style={{ display: "flex", flexDirection: "column" }}>
        <h1
          style={{
            fontSize: "18px",
            color: "#333",
            display: "inline",
            fontWeight: "bold",
          }}
        >
          Number:{" "}
        </h1>
        <span style={{ fontSize: "16px", color: "#666" }}>{selectedText}</span>
      </div>
      <button
        style={{
          padding: "10px",
          color: "white",
          background: "#007BFF",
          border: "none",
          borderRadius: "5px",
          cursor: "pointer",
        }}
        onClick={onClick}
      >
        Call
      </button>
    </div>
  );
};

// Create a new div and attach it to the DOM
const root = document.createElement("div");
document.body.appendChild(root);

ReactDOM.render(<ContentApp />, root);
