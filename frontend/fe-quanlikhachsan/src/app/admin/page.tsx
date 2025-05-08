'use client';
import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function AdminRedirect() {
  const router = useRouter();
  useEffect(() => {
    router.replace("/admin/rooms");
  }, [router]);
  return (
    <div>
      <p>Redirecting to Rooms...</p>
    </div>
  );
}