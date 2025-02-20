import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import EditProfile from '../src/pages/edit-profile.jsx';
import axios from 'axios';
import MockAdapter from 'axios-mock-adapter';
import { UserContext } from '../src/App.jsx';
import { MemoryRouter } from 'react-router-dom';

// Mock axios for all tests
const mockAxios = new MockAdapter(axios);

// Mock jwtDecode
jest.mock('jwt-decode', () => ({
    __esModule: true,
    default: jest.fn(() => ({ id: 1, username: 'testuser' })),
}));

describe('EditProfile Component', () => {
    const mockUserAuth = {
        access_token: 'mock-token',
        username: 'testuser',
        profile_img: 'mock-image-url'
    };

    const mockProfileData = {
        personal_info: {
            fullname: "Test User",
            username: "testuser",
            profile_img: "mock-image-url",
            email: "test@example.com",
            bio: "Test bio"
        },
        social_links: {
            youtube: "youtube.com/test",
            facebook: "facebook.com/test",
            twitter: "twitter.com/test",
            github: "github.com/test",
            instagram: "instagram.com/test",
            website: "testwebsite.com"
        }
    };

    beforeEach(() => {
        mockAxios.reset();
        mockAxios.onGet('/users/testuser').reply(200, mockProfileData);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    test('renders EditProfile component with loading state', () => {
        render(
            <MemoryRouter>
                <UserContext.Provider value={{ userAuth: mockUserAuth, setUserAuth: jest.fn() }}>
                    <EditProfile />
                </UserContext.Provider>
            </MemoryRouter>
        );
        expect(screen.getByText('Loading...')).toBeInTheDocument(); // Assuming Loader shows "Loading..."
    });

    test('displays profile data after loading', async () => {
        render(
            <MemoryRouter>
                <UserContext.Provider value={{ userAuth: mockUserAuth, setUserAuth: jest.fn() }}>
                    <EditProfile />
                </UserContext.Provider>
            </MemoryRouter>
        );
        await waitFor(() => {
            expect(screen.getByDisplayValue('Test User')).toBeInTheDocument();
            expect(screen.getByDisplayValue('testuser')).toBeInTheDocument();
            expect(screen.getByDisplayValue('test@example.com')).toBeInTheDocument();
        });
    });

    test('handles profile image upload', async () => {
        const mockFile = new File(['(⌐□_□)'], 'profile.png', { type: 'image/png' });
        render(
            <MemoryRouter>
                <UserContext.Provider value={{ userAuth: mockUserAuth, setUserAuth: jest.fn() }}>
                    <EditProfile />
                </UserContext.Provider>
            </MemoryRouter>
        );

        // Simulate file selection
        const fileInput = screen.getByLabelText(/upload image/i);
        fireEvent.change(fileInput, { target: { files: [mockFile] } });

        // Check if image preview updates
        await waitFor(() => {
            expect(screen.getByAltText('profile image')).toHaveAttribute('src', expect.stringContaining('blob:'));
        });

        // Simulate upload
        mockAxios.onPut('/users/1').reply(200, { profile_img: 'new-image-url' });
        const uploadButton = screen.getByText('Upload');
        fireEvent.click(uploadButton);

        await waitFor(() => {
            expect(screen.getByAltText('profile image')).toHaveAttribute('src', 'new-image-url');
        });
    });

    test('updates profile on form submission', async () => {
        mockAxios.onPut('/users/1').reply(200, { updatedUser: { ...mockProfileData, personal_info: { ...mockProfileData.personal_info, username: 'newusername' } } });
        
        render(
            <MemoryRouter>
                <UserContext.Provider value={{ userAuth: mockUserAuth, setUserAuth: jest.fn() }}>
                    <EditProfile />
                </UserContext.Provider>
            </MemoryRouter>
        );

        fireEvent.change(screen.getByLabelText(/username/i), { target: { value: 'newusername' } });
        fireEvent.click(screen.getByText('Update'));

        await waitFor(() => {
            expect(screen.getByDisplayValue('newusername')).toBeInTheDocument();
        });
    });

    test('deletes profile', async () => {
        const mockNavigate = jest.fn();
        jest.mock('react-router-dom', () => ({
            ...jest.requireActual('react-router-dom'),
            useNavigate: () => mockNavigate
        }));
        
        mockAxios.onDelete('/users/1').reply(200);

        render(
            <MemoryRouter>
                <UserContext.Provider value={{ userAuth: mockUserAuth, setUserAuth: jest.fn() }}>
                    <EditProfile />
                </UserContext.Provider>
            </MemoryRouter>
        );

        window.confirm = jest.fn(() => true); // Mock confirmation

        fireEvent.click(screen.getByText('Delete Profile'));

        await waitFor(() => {
            expect(mockNavigate).toHaveBeenCalledWith('/signup');
        });
    });

    test('handles errors during profile update', async () => {
        mockAxios.onPut('/users/1').reply(400, { error: 'Validation Error' });
        
        render(
            <MemoryRouter>
                <UserContext.Provider value={{ userAuth: mockUserAuth, setUserAuth: jest.fn() }}>
                    <EditProfile />
                </UserContext.Provider>
            </MemoryRouter>
        );

        fireEvent.click(screen.getByText('Update'));

        await waitFor(() => {
            expect(screen.getByText('Validation Error')).toBeInTheDocument();
        });
    });
});
