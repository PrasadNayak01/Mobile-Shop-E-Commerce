import jwt_decode from 'https://cdn.jsdelivr.net/npm/jwt-decode@3.1.2/build/jwt-decode.esm.js';


export async function getCustomerEmail() {
  try {
    const response = await fetch("/me", { credentials: "include" });
    if (!response.ok) {
      console.error("Not authenticated");
      return null;
    }
    const data = await response.json();
    return data.user ? data.user.email : null;
  } catch (error) {
    console.error("Error fetching user data:", error);
    return null;
  }
}