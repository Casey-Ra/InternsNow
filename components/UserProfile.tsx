"use client";

import { useUser } from "@auth0/nextjs-auth0";
import Image from "next/image";

export default function UserProfile() {
  const { user, error, isLoading } = useUser();

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;
  if (!user) return <div>Not logged in</div>;

  return (
    <div>
      <h2>{user.name}</h2>
      <p>{user.email}</p>
      {user.picture ? (
        <Image src={user.picture} alt="Profile" width={96} height={96} />
      ) : null}
    </div>
  );
}
