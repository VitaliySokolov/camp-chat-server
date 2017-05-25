import React from 'react';
import './not-found.css';

const NotFound = () =>
    <div className="page-wrapper">
        <main className="main main--single">
            <div className="not-found">
                <h3>404 page not found</h3>
                <p>We are sorry but the page you are looking for does not exist.</p>
                <p>Go to the <a href="/">home page.</a></p>
            </div>
        </main>
    </div>;

export default NotFound;
