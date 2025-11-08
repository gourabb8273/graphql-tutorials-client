import "./App.css";
import { useQuery } from '@apollo/client/react';
import {  gql, useSubscription } from '@apollo/client';
import { useEffect, useState } from "react";
const GET_TODOS = gql`
  query {
    getTodos {
      title
      completed
      user {
        id
        name
        email
        phone
      }
    }
  }
`;

const TODO_ADDED = gql`
  subscription {
    todoAdded {
      id
      title
      completed
      user {
        name
        email
        phone
      }
    }
  }
`;

export default function App() {
  const { data, loading, error } = useQuery(GET_TODOS);
  const { data: subData } = useSubscription(TODO_ADDED);

  const [todos, setTodos] = useState([]);

  // When query data arrives initially
  useEffect(() => {
    if (data?.getTodos) {
      setTodos(data.getTodos);
    }
  }, [data]);

  // When a new todo comes via subscription
  useEffect(() => {
    if (subData?.todoAdded) {
      setTodos((prev) => {
        // avoid duplicates
        if (prev.some((t) => t.id === subData.todoAdded.id)) return prev;
        return [subData.todoAdded, ...prev];
      });
    }
  }, [subData]);

  if (loading) return <p style={{ textAlign: "center", marginTop: "2rem" }}>⏳ Loading todos...</p>;
  if (error) return <p style={{ color: "red", textAlign: "center" }}>❌ Error: {error.message}</p>;

  return (
    <div style={styles.container}>
      <h1 style={styles.header}>📋 Todo List</h1>
      <div style={styles.grid}>
        {todos.map((todo) => (
          <div key={todo.id} style={styles.card}>
            <h2 style={styles.title}>
              {todo.title}
              <span
                style={{
                  ...styles.badge,
                  backgroundColor: todo.completed ? "#16a34a" : "#dc2626",
                }}
              >
                {todo.completed ? "Done" : "Pending"}
              </span>
            </h2>
            {todo.user ? (
              <div style={styles.userSection}>
                <p>
                  <strong>👤 {todo.user.name}</strong>
                </p>
                <p style={styles.detail}>📧 {todo.user.email}</p>
                {todo.user.phone && <p style={styles.detail}>📞 {todo.user.phone}</p>}
              </div>
            ) : (
              <p style={{ color: "#64748b", fontStyle: "italic" }}>No user info available</p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}


const styles = {
  container: {
    fontFamily: "'Inter', sans-serif",
    backgroundColor: "#f8fafc",
    minHeight: "100vh",
    padding: "40px 60px",
  },

  header: {
    textAlign: "center",
    marginBottom: "30px",
    color: "#1e293b",
    fontSize: "2rem",
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
    gap: "20px",
  },
  card: {
    backgroundColor: "white",
    padding: "20px",
    borderRadius: "12px",
    boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
    transition: "transform 0.2s ease",
  },
  title: {
    fontSize: "1.1rem",
    color: "#0f172a",
    marginBottom: "12px",
    position: "relative",
  },
  badge: {
    fontSize: "0.8rem",
    color: "white",
    padding: "4px 8px",
    borderRadius: "6px",
    marginLeft: "10px",
  },
  userSection: {
    fontSize: "0.9rem",
    color: "#334155",
    borderTop: "1px solid #e2e8f0",
    paddingTop: "10px",
    marginTop: "10px",
  },
  detail: {
    margin: "4px 0",
  },
};