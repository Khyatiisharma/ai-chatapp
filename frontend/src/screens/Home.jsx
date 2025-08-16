import { useContext } from "react"
import {UserContext} from '../context/user.context'





export default function Home() {

  const {user , setUser} = useContext(UserContext)

  return (
    <div>
      <h1>user : {JSON.stringify(user)} </h1>
    </div>
  )
}
