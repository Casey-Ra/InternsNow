"use client";
import { useUser } from "@auth0/nextjs-auth0";

export default function TestUser() {
  const { user, isLoading } = useUser();

  if (isLoading) return <div>Loading...</div>;
  return <div>User: {user ? user.email : "Not Logged In"}</div>;
}
