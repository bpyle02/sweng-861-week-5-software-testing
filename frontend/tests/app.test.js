import React from 'react';
import { render } from '@testing-library/react';
import App from '../src/App';
import Navbar from '../src/components/Navbar';

test('renders learn react link', () => {
    render(<App />);
    expect(<Navbar />).toBeInTheDocument();
})