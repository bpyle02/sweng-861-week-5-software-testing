import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import HomePage from '../src/pages/Home';
import axios from 'axios';
import MockAdapter from 'axios-mock-adapter';

// Mock axios for all tests
const mockAxios = new MockAdapter(axios);

describe('HomePage Component', () => {
    afterEach(() => {
        mockAxios.reset();
    });

    it('renders HomePage component with loader while fetching data', async () => {
        mockAxios.onPost().reply(200, { posts: [] });
        mockAxios.onGet().reply(200, { posts: [] });
        
        render(<HomePage />);
        expect(screen.getByText('Loading...')).toBeInTheDocument();
    });

    // test('loads latest posts when page state is "home"', async () => {
    //     mockAxios.onPost('/latest-posts').reply(200, { posts: [{ id: 1, title: 'Post 1' }] });
    //     mockAxios.onGet('/trending-posts').reply(200, { posts: [{ id: 2, title: 'Trending Post' }] });

    //     render(<HomePage />);
        
    //     await waitFor(() => {
    //         expect(screen.getByText('Post 1')).toBeInTheDocument();
    //     });
    // });

    // test('fetches posts by category when page state changes', async () => {
    //     mockAxios.onPost('/search-posts').reply(200, { posts: [{ id: 3, title: 'Category Post' }] });
    //     mockAxios.onGet('/trending-posts').reply(200, { posts: [{ id: 2, title: 'Trending Post' }] });

    //     const { rerender } = render(<HomePage />);

    //     // Simulate changing to a category
    //     rerender(<HomePage pageState="apologetics" />);
        
    //     await waitFor(() => {
    //         expect(screen.getByText('Category Post')).toBeInTheDocument();
    //     });
    // });

    // test('displays NoDataMessage when there are no posts', async () => {
    //     mockAxios.onPost('/latest-posts').reply(200, { posts: [] });
    //     mockAxios.onGet('/trending-posts').reply(200, { posts: [] });

    //     render(<HomePage />);
        
    //     await waitFor(() => {
    //         expect(screen.getByText('No posts published')).toBeInTheDocument();
    //         expect(screen.getByText('No trending posts')).toBeInTheDocument();
    //     });
    // });

    // test('clicking category buttons changes the page state', async () => {
    //     mockAxios.onPost('/latest-posts').reply(200, { posts: [] });
    //     mockAxios.onGet('/trending-posts').reply(200, { posts: [] });
        
    //     render(<HomePage />);
        
    //     const apologeticsButton = screen.getByText('apologetics');
    //     fireEvent.click(apologeticsButton);
        
    //     // Here we're checking if the button class changes to reflect the active state
    //     expect(apologeticsButton).toHaveClass('bg-black text-white');
    // });

    // test('handles API errors gracefully', async () => {
    //     mockAxios.onPost().networkError();
    //     mockAxios.onGet().networkError();

    //     const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
        
    //     render(<HomePage />);
        
    //     await waitFor(() => {
    //         expect(consoleSpy).toHaveBeenCalled();
    //     });
        
    //     consoleSpy.mockRestore();
    // });

    // test('trending posts section is hidden on mobile', () => {
    //     // Mock window.matchMedia for mobile testing
    //     Object.defineProperty(window, 'matchMedia', {
    //         writable: true,
    //         value: jest.fn().mockImplementation(query => ({
    //             matches: query === '(max-width: 1023px)', // assuming lg breakpoint is 1024px
    //             addListener: jest.fn(),
    //             removeListener: jest.fn(),
    //         })),
    //     });

    //     render(<HomePage />);
    //     expect(screen.queryByText('Categories')).not.toBeInTheDocument();
    // });
});
