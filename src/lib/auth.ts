interface User {
  name: string;
  phoneNumber: string;
  countryCode: string;
}

// Get authenticated user from localStorage
export const getUser = (): User | null => {
  const userStr = localStorage.getItem("user");
  if (!userStr) return null;

  try {
    return JSON.parse(userStr) as User;
  } catch (error) {
    console.error("Error parsing user data:", error);
    return null;
  }
};

// Check if user is authenticated
export const isAuthenticated = (): boolean => {
  return !!getUser();
};

// Store user info in localStorage
export const setUser = (user: User): void => {
  localStorage.setItem("user", JSON.stringify(user));
};

// Clear user info from localStorage (logout)
export const logout = (): void => {
  localStorage.removeItem("user");
};
