import React, { Component } from "react";
import { validateCredentials } from '../api'

export default function Login() {

        const [userName, setUserName] = React.useState('');
        const [password, setPassword] = React.useState('');

        const handleSubmit = (event) => {
            event.preventDefault();
            console.log(userName)
            validateCredentials({user: userName, password: password})
        }
        return (
            <form onSubmit={handleSubmit}>
                <h3>Sign In</h3>
                <div className="form-group">
                    <label>Email address</label>
                    <input type="text" className="form-control" placeholder="Enter email" onChange={(e) => setUserName(e.target.value)}/>
                </div>
                <div className="form-group">
                    <label>Password</label>
                    <input type="password" className="form-control" placeholder="Enter password"  onChange={(e) => setPassword(e.target.value)}/>
                </div>
                <div className="form-group" style={{marginTop: '10px'}}>
                    
                </div>
                <button type="submit" className="btn btn-primary btn-block">Submit</button>
            </form>
        );

}