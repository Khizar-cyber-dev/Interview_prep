import Agent from '@/components/Agent'
import React from 'react'
import { getCurrentUser } from "@/lib/actions/auth.action";

const page = async () => {
    const user = await getCurrentUser();
    console.log(user?.id || "no user found");
  return (
    <div>
        <h3>Interview Generation</h3>
        <Agent userName={user?.name!} userId={user?.id} type="generate"/>
    </div>
  )
}

export default page;