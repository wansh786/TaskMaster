import React, { useEffect, useState } from "react";
import "./headers.css";
import { NavLink } from "react-router-dom";
import axios from "axios";


const Headers = () => {
  const [userdata, getUserData] = useState({});
  console.log("response in DOM",userdata)


  const getData = async () => {
    try {
      const response = await axios.get("http://localhost:6005/login/success", {
        withCredentials: true,
      });
      getUserData(response.data.user);
    } catch (error) {
      console.log("error in getting data", error);
    }
  };

 // logout
    const logout = ()=>{
        window.open("http://localhost:6005/logout","_self")
    }
  useEffect(() => {
    getData();
  }, []);

  return (
    <>
      <header>
        <nav>
          <div className="left">
            <h1>Diptajit Das</h1>
          </div>
          <div className="right">
            <ul>
              <li>
                <NavLink to="/">Home</NavLink>
              </li>
              {Object.keys(userdata).length > 0 ? (
                <>
                
                  <li>
                    <NavLink to="/dashboard">Dashboard</NavLink>
                  </li>
                  <li onClick={logout}>Logout</li>
                  <li>
                    <img
                      src={userdata.image}
                      style={{
                        width: "50px",
                        borderRadius: "50%",
                        paddingLeft: "40px",
                      }}
                      alt=""
                    />
                  </li>
                  <li>{userdata.displayName}</li>
                </>
              ) : (
                <li>
                  <NavLink to="/login">Login</NavLink>
                </li>
              )}
            </ul>
          </div>
        </nav>
      </header>
    </>
  );
};

export default Headers;
