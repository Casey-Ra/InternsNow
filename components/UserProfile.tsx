"use client";

import { useUser } from "@auth0/nextjs-auth0";

export default function UserProfile() {
  const { user, error, isLoading } = useUser();

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;
  if (!user) return <div>Not logged in</div>;

  return (
    <div>
      <h2>{user.name}</h2>
      <p>{user.email}</p>
      <img src={user.picture} alt="Profile" />
    </div>
  );
}
