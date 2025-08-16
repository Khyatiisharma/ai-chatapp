import { createContext, useContext, useState } from "react";

// Create the context
export const UserContext = createContext();

// Provider component
export function UserProvider({ children }) {
  const [user, setUser] = useState(null);

  // You can add login, logout, and update user functions here
  const login = (userData) => setUser(userData);
  const logout = () => setUser(null);

  return (
    <UserContext.Provider value={{ user, setUser, login, logout }}>
      {children}
    </UserContext.Provider>
  );
}

// Custom hook for easy usage
