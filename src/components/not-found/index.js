import React from 'react';
import { Link } from 'react-router-dom';
import './not-found.css';

const NotFound = () =>
    <div className="page-wrapper">
        <main className="main main--single">
            <div className="not-found">
                <h3>404 page not found</h3>
                <p>We are sorry but the page you are looking for does not exist.</p>
                <p>Go to the <Link to="/">home page</Link>.</p>
            </div>
        </main>
    </div>;

export default NotFound;
