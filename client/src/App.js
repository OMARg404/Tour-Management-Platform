import 'bootstrap/dist/css/bootstrap.min.css';
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

import Navbar from './components/Navbar';
import Home from './components/Home';

import ToursList from './features/tours/ToursList';
import TourDetails from './features/tours/TourDetails';
import TourForm from './features/tours/TourForm';

import UsersList from './features/users/UsersList';
import UserForm from './features/users/UserForm';
import UserDetails from './features/users/UserDetails';
import Dashboard from './features/dashboard/Dashboard';

function App() {
    return ( <
        Router >
        <
        Navbar / >

        <
        div className = "container mt-4" >
        <
        h1 className = "text-center mb-4" > 🌍Tour Management < /h1>

        <
        Routes >
        <
        Route path = "/"
        element = { < Home / > }
        />

        <
        Route path = "/tours"
        element = { < ToursList / > }
        /> <
        Route path = "/tour/new"
        element = { < TourForm / > }
        /> <
        Route path = "/tour/:id"
        element = { < TourDetails / > }
        />

        <
        Route path = "/users"
        element = { < UsersList / > }
        /> <
        Route path = "/users/add"
        element = { < UserForm / > }
        /> <
        Route path = "/users/:id"
        element = { < UserDetails / > }
        /> <
        Route path = "/users/edit/:id"
        element = { < UserForm / > }
        />

        <
        Route path = "/dashboard"
        element = { < Dashboard / > }
        /> <
        /Routes> <
        /div> <
        /Router>
    );
}

export default App;