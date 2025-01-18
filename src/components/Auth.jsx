import React, { useState } from "react";
import axios from "axios";
import ChatComponent from "./chat";

const AuthComponent = () => {
  const [isLogin, setIsLogin] = useState(true); // Toggle between login and registration
  const [formData, setFormData] = useState({
    username: "",
    password: "",
  });
  const [message, setMessage] = useState("");
  const [users, setUsers] = useState([]); // State to store the list of users
  const [loggedInUser, setLoggedInUser] = useState(null); // State for logged-in user
  const [selectedUser, setSelectedUser] = useState(null); // State for selected user

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const url = isLogin
      ? "http://localhost:8080/api/v1/users/login" // Login endpoint
      : "http://localhost:8080/api/v1/users/"; // Registration endpoint

    try {
      const response = await axios.post(url, formData, {
        headers: {
          "Content-Type": "application/json",
        },
      });
      setMessage(response.data.message || "Success!");

      if (isLogin) {
        setLoggedInUser(response.data); // Set the logged-in user details
        fetchAllUsers(); // Fetch all users after login
      }
    } catch (error) {
      setMessage(
        error.response?.data?.message || "An error occurred. Please try again."
      );
    }
  };

  const fetchAllUsers = async () => {
    try {
      const response = await axios.get("http://localhost:8080/api/v1/users/");
      setUsers(response.data);
    } catch (error) {
      console.error("Failed to fetch users:", error);
    }
  };

  const handleUserClick = (user) => {
    setSelectedUser(user); 
  };

  return (
    <div style={styles.container}>
      <h2 style={styles.title}>{isLogin ? "Login" : "Register"}</h2>
      <form onSubmit={handleSubmit} style={styles.form}>
        <input
          type="text"
          name="username"
          placeholder="Username"
          value={formData.username}
          onChange={handleInputChange}
          style={styles.input}
          required
        />
        <input
          type="password"
          name="password"
          placeholder="Password"
          value={formData.password}
          onChange={handleInputChange}
          style={styles.input}
          required
        />
        <button type="submit" style={styles.button}>
          {isLogin ? "Login" : "Register"}
        </button>
      </form>
      <p style={styles.message}>{message}</p>
      <p style={styles.toggle}>
        {isLogin
          ? "Don't have an account?"
          : "Already have an account?"}{" "}
        <span
          style={styles.link}
          onClick={() => {
            setIsLogin(!isLogin);
            setMessage("");
          }}
        >
          {isLogin ? "Register" : "Login"}
        </span>
      </p>

      {/* Display users as buttons after login */}
      {isLogin && users.length > 0 && (
        <div style={styles.userList}>
          <h3>Registered Users:</h3>
          <div style={styles.buttonGroup}>
            {users
              .filter((user) => user.id !== loggedInUser.id) // Exclude the logged-in user
              .map((user) => (
                <button
                  key={user.id}
                  style={styles.userButton}
                  onClick={() => handleUserClick(user)}
                >
                  {user.username}
                </button>
              ))}
          </div>
        </div>
      )}

      {/* Conditionally render ChatComponent if a user is selected */}
      {selectedUser && (
        <ChatComponent senderId={loggedInUser.id} receiverId={selectedUser.id} />
      )}
    </div>
  );
};

const styles = {
  container: {
    width: "400px",
    margin: "50px auto",
    padding: "20px",
    border: "1px solid #ccc",
    borderRadius: "10px",
    textAlign: "center",
    fontFamily: "Arial, sans-serif",
    backgroundColor: "#f9f9f9",
    boxShadow: "0 2px 5px rgba(0, 0, 0, 0.1)",
  },
  title: {
    fontSize: "24px",
    marginBottom: "20px",
  },
  form: {
    display: "flex",
    flexDirection: "column",
  },
  input: {
    padding: "10px",
    margin: "10px 0",
    border: "1px solid #ccc",
    borderRadius: "5px",
  },
  button: {
    padding: "10px",
    backgroundColor: "#007bff",
    color: "#fff",
    border: "none",
    borderRadius: "5px",
    cursor: "pointer",
  },
  message: {
    color: "green",
    marginTop: "15px",
  },
  toggle: {
    marginTop: "10px",
  },
  link: {
    color: "#007bff",
    cursor: "pointer",
    textDecoration: "underline",
  },
  userList: {
    marginTop: "20px",
    textAlign: "left",
  },
  buttonGroup: {
    display: "flex",
    flexDirection: "column",
    marginTop: "10px",
  },
  userButton: {
    padding: "10px",
    marginBottom: "10px",
    backgroundColor: "#f1f1f1",
    border: "none",
    borderRadius: "5px",
    cursor: "pointer",
  },
};

export default AuthComponent;
