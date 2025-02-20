// import { render, screen, fireEvent, waitFor } from '@testing-library/react';
// import userEvent from '@testing-library/user-event';
// import axios from 'axios';
// import { toast } from 'react-hot-toast';
// import { jwtDecode } from 'jwt-decode';
// import ChangePassword from '../src/pages/change-password.jsx';
// import { UserContext } from '../src/App.jsx';
// import React from 'react';

// // Mock dependencies
// jest.mock('axios');
// jest.mock('react-hot-toast', () => ({
//   toast: {
//     loading: jest.fn(() => 'loading-toast'),
//     dismiss: jest.fn(),
//     success: jest.fn(),
//     error: jest.fn(),
//   },
// }));
// jest.mock('jwt-decode', () => jest.fn(() => ({ id: 'some-id' })));

// // Test wrapper to provide UserContext
// const TestComponent = () => {
//   const userAuth = { access_token: 'mock-token' };
//   return (
//     <UserContext.Provider value={{ userAuth }}>
//       <ChangePassword />
//     </UserContext.Provider>
//   );
// };

// describe('ChangePassword Component', () => {
//   // Clear mocks before each test to ensure isolation
//   beforeEach(() => {
//     jest.clearAllMocks();
//   });

//   // Test 1: Rendering the form
//   test('renders change password form', () => {
//     render(<TestComponent />);
//     expect(screen.getByPlaceholderText('Current Password')).toBeInTheDocument();
//     expect(screen.getByPlaceholderText('New Password')).toBeInTheDocument();
//     expect(screen.getByText('Change Password')).toBeInTheDocument();
//   });

//   // Test 2: Empty form submission
//   test('shows error when submitting empty form', () => {
//     render(<TestComponent />);
//     const button = screen.getByText('Change Password');
//     fireEvent.click(button);
//     expect(toast.error).toHaveBeenCalledWith('Please fill in all the inputs');
//     expect(toast.loading).not.toHaveBeenCalled();
//   });

//   // Test 3: Invalid password submission
//   test('shows error for invalid passwords', async () => {
//     render(<TestComponent />);
//     const currentPasswordInput = screen.getByPlaceholderText('Current Password');
//     const newPasswordInput = screen.getByPlaceholderText('New Password');
//     const button = screen.getByText('Change Password');

//     await userEvent.type(currentPasswordInput, '123');
//     await userEvent.type(newPasswordInput, '123');
//     fireEvent.click(button);

//     expect(toast.error).toHaveBeenCalledWith(
//       'Password should be 6 to 20 characters long with at least 1 number, 1 lowercase and 1 uppercase letter'
//     );
//     expect(toast.loading).not.toHaveBeenCalled();
//   });

//   // Test 4: Successful password change
//   test('successfully changes password', async () => {
//     axios.post.mockResolvedValue({ data: {} });
//     render(<TestComponent />);
//     const currentPasswordInput = screen.getByPlaceholderText('Current Password');
//     const newPasswordInput = screen.getByPlaceholderText('New Password');
//     const button = screen.getByText('Change Password');

//     await userEvent.type(currentPasswordInput, 'Password1');
//     await userEvent.type(newPasswordInput, 'NewPassword1');
//     fireEvent.click(button);

//     // Button should be disabled during API call
//     expect(button).toHaveAttribute('disabled');
//     expect(toast.loading).toHaveBeenCalledWith('Updating....');

//     // Wait for API resolution and toast updates
//     await waitFor(() => expect(toast.dismiss).toHaveBeenCalledWith('loading-toast'));
//     await waitFor(() => expect(toast.success).toHaveBeenCalledWith('Password Updated'));

//     // Button should be re-enabled
//     expect(button).not.toHaveAttribute('disabled');

//     // Verify API call
//     expect(axios.post).toHaveBeenCalledWith(
//       expect.stringContaining('/users/some-id'),
//       { currentPassword: 'Password1', newPassword: 'NewPassword1' },
//       { headers: { Authorization: 'Bearer mock-token' } }
//     );
//   });

//   // Test 5: API failure
//   test('shows error when API call fails', async () => {
//     axios.post.mockRejectedValue({ response: { data: { error: 'Invalid current password' } } });
//     render(<TestComponent />);
//     const currentPasswordInput = screen.getByPlaceholderText('Current Password');
//     const newPasswordInput = screen.getByPlaceholderText('New Password');
//     const button = screen.getByText('Change Password');

//     await userEvent.type(currentPasswordInput, 'Password1');
//     await userEvent.type(newPasswordInput, 'NewPassword1');
//     fireEvent.click(button);

//     // Button should be disabled during API call
//     expect(button).toHaveAttribute('disabled');
//     expect(toast.loading).toHaveBeenCalledWith('Updating....');

//     // Wait for API rejection and toast updates
//     await waitFor(() => expect(toast.dismiss).toHaveBeenCalledWith('loading-toast'));
//     await waitFor(() => expect(toast.error).toHaveBeenCalledWith('Invalid current password'));

//     // Button should be re-enabled
//     expect(button).not.toHaveAttribute('disabled');
//   });
// });