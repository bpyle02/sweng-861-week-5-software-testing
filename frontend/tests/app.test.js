import React from 'react';
import { render } from '@testing-library/react';
import App from '../src/App.jsx';
import Navbar from '../src/components/navbar.jsx';

test('renders learn react link', () => {
    render(<App />);
    expect(<Navbar />).toBeInTheDocument();
})