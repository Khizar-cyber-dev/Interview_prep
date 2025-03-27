import Agent from '@/components/Agent'
import React from 'react'
import { getCurrentUser } from "@/lib/actions/auth.action";

const page = async () => {
    const user = await getCurrentUser();
  return (
    <div>
        <h3>Interview Generation</h3>
        <Agent userName={user?.name!} userId={user?.id} profileImage={user?.profileURL} type="generate"/>
    </div>
  )
}

export default page;