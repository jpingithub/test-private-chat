import React, { useState, useEffect } from "react";
import { Client } from "@stomp/stompjs";

const ChatComponent = ({ senderId, receiverId }) => {
  const [client, setClient] = useState(null);
  const [connected, setConnected] = useState(false);
  const [message, setMessage] = useState(null);
  const [chatMessages, setChatMessages] = useState([]);

  useEffect(() => {
    if (!receiverId) return; // Only connect if receiverId is set

    const stompClient = new Client({
      webSocketFactory: () => new WebSocket("ws://localhost:8080/ws"), // Connect directly
      debug: (str) => console.log(str), // Enable debugging
      reconnectDelay: 5000, // Reconnect every 5 seconds if disconnected
    });

    stompClient.onConnect = () => {
      console.log("Connected to WebSocket");
      setConnected(true);

      stompClient.subscribe(`/topic/publish/${receiverId}`, (msg) => {
        const receivedMessage = JSON.parse(msg.body);
        setChatMessages((prev) => [...prev, receivedMessage]);
      });
    };

    stompClient.onDisconnect = () => {
      console.log("Disconnected from WebSocket");
      setConnected(false);
    };

    stompClient.onStompError = (frame) => {
      console.error("Broker error:", frame.headers["message"]);
    };

    stompClient.activate();
    setClient(stompClient);

    return () => {
      if (stompClient) stompClient.deactivate();
    };
  }, [senderId, receiverId]); // Reconnect whenever senderId or receiverId changes

  const sendMessage = () => {
    if (client && connected) {
      client.publish({
        destination: `/app/send/`,
        body: JSON.stringify({
          senderId: senderId,
          receiverId: receiverId,
          messageContent: message,
        }),
      });
      setMessage("");
    } else {
      console.error("Not connected to WebSocket");
    }
  };

  return (
    <div style={styles.container}>
      <h2 style={styles.title}>Chat Application</h2>
      <div style={styles.chatWindow}>
        {chatMessages.map((msg, index) => (
          <div key={index} style={styles.chatMessage}>
            {msg.content}
          </div>
        ))}
      </div>
      <input
        style={styles.input}
        type="text"
        placeholder="Type a message"
        value={message}
        onChange={(e) => setMessage(e.target.value)}
      />
      <button style={styles.button} onClick={sendMessage} disabled={!receiverId}>
        Send
      </button>
    </div>
  );
};

const styles = {
  container: {
    width: "400px",
    margin: "50px auto",
    textAlign: "center",
    fontFamily: "Arial, sans-serif",
  },
  title: {
    fontSize: "24px",
    marginBottom: "20px",
  },
  chatWindow: {
    height: "300px",
    overflowY: "auto",
    border: "1px solid #ccc",
    padding: "10px",
    marginBottom: "20px",
    borderRadius: "5px",
  },
  chatMessage: {
    padding: "5px",
    marginBottom: "5px",
    backgroundColor: "#f1f1f1",
    borderRadius: "5px",
    textAlign: "left",
  },
  input: {
    width: "80%",
    padding: "10px",
    marginBottom: "10px",
    border: "1px solid #ccc",
    borderRadius: "5px",
  },
  button: {
    padding: "10px 20px",
    backgroundColor: "#007bff",
    color: "#fff",
    border: "none",
    borderRadius: "5px",
    cursor: "pointer",
  },
};

export default ChatComponent;
