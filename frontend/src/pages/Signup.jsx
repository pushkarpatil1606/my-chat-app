import React,{useState} from "react";
import { Link } from "react-router-dom";
import API from "../api/axios";

export default function Signup(){

  const [name,setName]=useState("");
  const [email,setEmail]=useState("");
  const [password,setPassword]=useState("");

  const submit=async(e)=>{
    e.preventDefault();

    await API.post("/auth/register",{name,email,password});

    window.location.href="/";
  };

  return(

    <div style={{
      height:"100vh",
      display:"flex",
      justifyContent:"center",
      alignItems:"center",
      background:"#f0f2f5"
    }}>

      <div style={{
        width:"350px",
        background:"white",
        padding:"30px",
        borderRadius:"10px",
        boxShadow:"0 5px 20px rgba(0,0,0,0.1)"
      }}>

        <h2 style={{textAlign:"center",marginBottom:"20px"}}>
          Sign Up
        </h2>

        <form onSubmit={submit}>

          <input
            placeholder="Name"
            value={name}
            onChange={(e)=>setName(e.target.value)}
            style={inputStyle}
          />

          <input
            placeholder="Email"
            value={email}
            onChange={(e)=>setEmail(e.target.value)}
            style={inputStyle}
          />

          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e)=>setPassword(e.target.value)}
            style={inputStyle}
          />

          <button style={buttonStyle}>
            Create Account
          </button>

        </form>

        <p style={{textAlign:"center",marginTop:"15px"}}>
          Already have an account? <Link to="/">Login</Link>
        </p>

      </div>

    </div>

  );

}

const inputStyle={
  width:"100%",
  padding:"10px",
  marginBottom:"12px",
  border:"1px solid #ddd",
  borderRadius:"6px"
};

const buttonStyle={
  width:"100%",
  padding:"10px",
  background:"#0084ff",
  color:"white",
  border:"none",
  borderRadius:"6px",
  cursor:"pointer"
};