import request from "supertest";
import server from "../server.js";
import { verifyJWT, generateUsername, formatDatatoSend } from "../server.js";
import jwt from "jsonwebtoken";
import { jest } from "@jest/globals"
import User from "../Schema/User.js";
import bcrypt from 'bcrypt';

let access_token = "";
let user_id = "";

describe('verifyJWT', () => {
  let mockReq;
  let mockRes;
  let nextFunction;

  beforeEach(() => {
    mockReq = {
      headers: {}
    };
    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
    nextFunction = jest.fn();
  });

  test('should fail if no token is provided', () => {
    verifyJWT(mockReq, mockRes, nextFunction);

    console.log(mockRes)

    expect(mockRes.status).toHaveBeenCalledWith(401);
    expect(mockRes.json).toHaveBeenCalledWith({ error: "No access token" });
  });

  test('should fail if token is invalid', () => {
    mockReq.headers['authorization'] = 'Bearer invalid_token';

    verifyJWT(mockReq, mockRes, nextFunction);

    expect(mockRes.status).toHaveBeenCalledWith(403);
    expect(mockRes.json).toHaveBeenCalledWith({ error: "Access token is invalid" });
  });

  test('should call next() and set user data if token is valid', () => {
    const validToken = jwt.sign(
      { id: '123', admin: true },
      process.env.SECRET_ACCESS_KEY
    );
    mockReq.headers['authorization'] = `Bearer ${validToken}`;

    verifyJWT(mockReq, mockRes, nextFunction);

    expect(mockReq.user).toBe('123');
    expect(mockReq.admin).toBe(true);
    expect(nextFunction).toHaveBeenCalled();
    expect(mockRes.status).not.toHaveBeenCalled();
    expect(mockRes.json).not.toHaveBeenCalled();
  });
});

describe("POST /users", () => {
  it("should create a new user", async () => {
    const res = await request(server)
      .post("/users")
      .send({ fullname: "Test User", email: "test8@email.com", password: "Test1234!" });

    access_token = res.body.access_token
    const decoded = jwt.decode(access_token);
    user_id = decoded.id

    expect(res.statusCode).toEqual(201);
    expect(res.body).toHaveProperty("access_token");
    expect(res.body).toHaveProperty("profile_img");
    expect(res.body).toHaveProperty("username");
    expect(res.body).toHaveProperty("fullname");
    expect(res.body).toHaveProperty("isAdmin");
  });

  it("should fail if fullname is too short", async () => {
    const res = await request(server)
      .post("/users")
      .send({ fullname: "Te", email: "test9@email.com", password: "Test1234!" });
    expect(res.statusCode).toEqual(403);
    expect(res.body).toHaveProperty("error", "Fullname must be at least 3 letters long");
  });

  it("should fail if email is missing", async () => {
    const res = await request(server)
      .post("/users")
      .send({ fullname: "Test User", email: "", password: "Test1234!" });
    expect(res.statusCode).toEqual(403);
    expect(res.body).toHaveProperty("error", "Enter Email");
  });

  it("should fail if email is invalid", async () => {
    const res = await request(server)
      .post("/users")
      .send({ fullname: "Test User", email: "testemail.com", password: "Test1234!" });
    expect(res.statusCode).toEqual(403);
    expect(res.body).toHaveProperty("error", "Email is invalid");
  });

  it("should fail if password does not meet complexity requirements", async () => {
    const res = await request(server)
      .post("/users")
      .send({ fullname: "Test User", email: "test10@email.com", password: "test" });
    expect(res.statusCode).toEqual(403);
    expect(res.body).toHaveProperty("error", "Password should be 6 to 20 characters long with a numeric, 1 lowercase and 1 uppercase letters");
  });

  it("should fail if email is not unique", async () => {
    const res = await request(server)
      .post("/users")
      .send({ fullname: "Test User", email: "test8@email.com", password: "Test1234!" });
    expect(res.statusCode).toEqual(500);
    expect(res.body).toHaveProperty("error", "Email already exists");
  });

  it('should fail if there is an unexpected server error', async () => {
    const mockSave = jest.fn().mockRejectedValueOnce(new Error('Some server error'));

    User.prototype.save = mockSave;

    jest.mock('bcrypt', () => ({
      hash: jest.fn((password, saltRounds, callback) => {
        callback(null, 'hashed_password');
      }),
    }));

    jest.mock('../server.js', () => ({
      generateUsername: jest.fn(() => 'testuser')
    }));

    const userDetails = {
      fullname: 'Test User',
      email: 'test10@email.com',
      password: 'Test1234!'
    };

    const response = await request(server)
      .post('/users')
      .send(userDetails);

    expect(response.statusCode).toBe(500);
    expect(response.body).toHaveProperty("error", "Some server error");
    expect(mockSave).toHaveBeenCalled();
  });
});

describe("POST /users/login", () => {
  it("should login successfully", async () => {
    const res = await request(server)
      .post("/users/login")
      .send({ email: "test8@email.com", password: "Test1234!" });

    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty("access_token");
    expect(res.body).toHaveProperty("profile_img");
    expect(res.body).toHaveProperty("username");
    expect(res.body).toHaveProperty("fullname");
    expect(res.body).toHaveProperty("isAdmin");
  });

  it("should fail if email is incorrect", async () => {
    const res = await request(server)
      .post("/users/login")
      .send({ email: "wrongemail@email.com", password: "Test1234!" });
    expect(res.statusCode).toEqual(403);
    expect(res.body).toHaveProperty("error", "Email not found");
  });

  it("should fail if bcrypt returns an error ", async () => {
    const res = await request(server)
      .post("/users/login")
      .send({ email: "test8@email.com", password: null });
    expect(res.statusCode).toEqual(403);
    expect(res.body).toHaveProperty("error", "Error occured while logging in. Please try again");
  });

  it("should fail if password is incorrect", async () => {
    const res = await request(server)
      .post("/users/login")
      .send({ email: "test8@email.com", password: "WrongPassword123!" });
    expect(res.statusCode).toEqual(403);
    expect(res.body).toHaveProperty("error", "Incorrect password");
  });

  test('should fail if user account was created with oauth', async () => {
    const mockUser = {
      personal_info: {
        email: 'test@example.com',
      },
      google_auth: true,
      facebook_auth: false
    };

    jest.spyOn(User, 'findOne').mockImplementationOnce(() => Promise.resolve(mockUser));

    jest.spyOn(bcrypt, 'compare').mockImplementationOnce((password, hash, callback) => {
      callback(null, false);
    });

    const response = await request(server)
      .post('/users/login')
      .send({
        email: 'test@example.com',
        password: 'anypassword'
      });

    expect(response.statusCode).toEqual(403);
    expect(response.body).toHaveProperty("error", "Account was created using an oauth provider. Try logging in with with Facebook or Google.")
    expect(User.findOne).toHaveBeenCalledWith({ "personal_info.email": "test@example.com" });
    expect(bcrypt.compare).not.toHaveBeenCalled();

    jest.restoreAllMocks();
  });

  it('should fail if there is an unexpected server error', async () => {
    const originalFindOne = User.findOne;

    User.findOne = jest.fn(() => {
      return Promise.reject(new Error('Simulated server error'));
    });

    const response = await request(server)
      .post('/users/login')
      .send({
        email: 'test@example.com',
        password: 'Test1234!'
      });

    expect(response.statusCode).toEqual(500);
    expect(response.body).toHaveProperty('error', 'Simulated server error');

    User.findOne = originalFindOne;
  });
});

// test('Successful Google Sign Up for New User', async () => {  
//   // Mock the request and response objects
//   const req = { body: { access_token: 'mock_access_token' } };
  
//   const res = {
//     status: jest.fn(() => res),
//     json: jest.fn()
//   };

//   const next = jest.fn();

//   // Mock User model methods
//   const mockedUser = {
//       findOne: jest.fn().mockResolvedValue(null),  // No existing user
//       save: jest.fn().mockResolvedValue({ _id: 'newUserId' })
//   };
//   jest.mock('../Schema/User.js', () => ({
//       User: jest.fn(() => mockedUser)
//   }));

//   // Mock other dependencies
//   jest.mock('firebase-admin/auth', () => ({
//       getAuth: jest.fn().mockReturnValue({
//           verifyIdToken: jest.fn().mockResolvedValue({
//               email: 'new@user.com',
//               name: 'New User',
//               picture: 'user-picture-url'
//           })
//       })
//   }));

//   jest.mock('../server.js', () => ({
//       generateUsername: jest.fn().mockResolvedValue('newuser123'),
//       formatDatatoSend: jest.fn().mockReturnValue({ user: 'formatted-user-data' }),
//       default: jest.fn() // Ensure server.js doesn't interfere
//   }));

//   // Get the route handler for "/google-auth"
//   const googleAuthHandler = server._router.stack.find(
//     (layer) => layer.route?.path === "/google-auth" && layer.route.methods.post
//   )?.route.stack[0].handle;

//   if (!googleAuthHandler) {
//     throw new Error("Route handler for /google-auth not found");
//   }

//   // Execute the route handler
//   await googleAuthHandler(req, res, next);

//   // expect(next).not.toHaveBeenCalled();

//   console.log(res)

//   // Assertions
//   expect(res.status).toHaveBeenCalledWith(200);
//   expect(res.json).toHaveBeenCalledWith({ user: 'formatted-user-data' });
//   expect(console.log).toHaveBeenCalledWith("You successfully signed in with Google!");
// });

// beforeEach(async () => {
//   await User.deleteMany({});
// });

// afterAll(async () => {
//   await mongoose.connection.close();
// });

// describe('POST /google-auth', () => {
//   test('should log in existing user with google_auth enabled', async () => {
//       const user = new User({
//           personal_info: {
//               fullname: 'Test User',
//               email: 'testuser@gmail.com',
//               username: 'testuser',
//               profile_img: 'https://example.com/image.jpg'
//           },
//           admin: false,
//           google_auth: true,
//           facebook_auth: false
//       });
//       await user.save();

//       jest.spyOn(getAuth(), 'verifyIdToken').mockResolvedValue({
//           email: 'testuser@gmail.com',
//           name: 'Test User',
//           picture: 'https://example.com/s96-c/image.jpg'
//       });

//       const response = await request(server)
//           .post('/google-auth')
//           .send({ access_token: access_token });

//       console.log(response.body)

//       expect(response.status).toBe(200);
//       expect(response.body.personal_info.email).toBe('testuser@gmail.com');
//   });

//   test('should prevent login if google_auth is disabled', async () => {
//       const user = new User({
//           personal_info: {
//               fullname: 'Test User',
//               email: 'testuser@gmail.com',
//               username: 'testuser',
//               profile_img: 'https://example.com/image.jpg'
//           },
//           admin: false,
//           google_auth: false,
//           facebook_auth: false
//       });
//       await user.save();

//       jest.spyOn(getAuth(), 'verifyIdToken').mockResolvedValue({
//           email: 'testuser@gmail.com',
//           name: 'Test User',
//           picture: 'https://example.com/s96-c/image.jpg'
//       });

//       const response = await request(server)
//           .post('/google-auth')
//           .send({ access_token: access_token });

//       expect(response.status).toBe(403);
//       expect(response.body.error).toBe('This email was signed up without google. Please log in with password to access the account');
//   });

//   test('should sign up new user', async () => {
//       jest.spyOn(getAuth(), 'verifyIdToken').mockResolvedValue({
//           email: 'newuser@gmail.com',
//           name: 'New User',
//           picture: 'https://example.com/s96-c/image.jpg'
//       });

//       const response = await request(server)
//           .post('/google-auth')
//           .send({ access_token: access_token });

//       expect(response.status).toBe(200);
//       expect(response.body.personal_info.email).toBe('newuser@gmail.com');
//   });

//   test('should return 500 if token verification fails', async () => {
//       jest.spyOn(getAuth(), 'verifyIdToken').mockRejectedValue(new Error('Invalid token'));

//       const response = await request(server)
//           .post('/google-auth')
//           .send({ access_token: 'invalid_token' });

//       expect(response.status).toBe(500);
//       expect(response.body.error).toBe('Failed to authenticate you with google. Try with some other google account');
//   });
// });


describe("GET /users/:username", () => {
  it("should get user data", async () => {
    const res = await request(server)
      .get("/users/test8")

    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty("personal_info");
    expect(res.body).toHaveProperty("social_links");
    expect(res.body).toHaveProperty("account_info");
  });

  it("should fail if user is not found", async () => {
    const res = await request(server)
      .get("/users/usernotfound")

    expect(res.statusCode).toEqual(404);
    expect(res.body).toHaveProperty("error", "User not found");
  });
});

describe("PUT /users/:id", () => {
  it("should update user profile", async () => {
    const res = await request(server)
      .put(`/users/${user_id}`)
      .set("Authorization", "Bearer " + access_token)
      .send({
        username: "newUsername",
        bio: "Updated bio",
        social_links: { twitter: "https://twitter.com/newTwitterHandle" }
      });

    expect(res.statusCode).toEqual(200);
    expect(res.body.updatedUser.personal_info).toHaveProperty("username", "newUsername");
    expect(res.body.updatedUser.personal_info).toHaveProperty("bio", "Updated bio");
    expect(res.body.updatedUser.social_links).toHaveProperty("twitter", "https://twitter.com/newTwitterHandle");
  });

  it("should fail to update with unauthorized user", async () => {
    const res = await request(server)
      .put(`/users/${user_id}altered`)
      .set("Authorization", "Bearer " + access_token)
      .send({
        username: "anotherUsername",
        bio: "Another bio"
      });
    expect(res.statusCode).toEqual(403);
    expect(res.body).toHaveProperty("error", "Forbidden");
  });

  it("should fail to update if new username already exists", async () => {
    const res = await request(server)
      .put(`/users/${user_id}`)
      .set("Authorization", "Bearer " + access_token)
      .send({
        username: "testacc",
        bio: "Another bio"
      });
    expect(res.statusCode).toEqual(409);
    expect(res.body).toHaveProperty("error", "Username already taken");
  });
});

describe("POST /users/:id", () => {
  it("should update user password with correct credentials", async () => {
    const res = await request(server)
      .post(`/users/${user_id}`)
      .set("Authorization", "Bearer " + access_token)
      .send({
        currentPassword: "Test1234!",
        newPassword: "NewPassword123!"
      });
    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty("status", "password changed");
  });

  it("should fail to update password with invalid new password", async () => {
    const res = await request(server)
      .post(`/users/${user_id}`)
      .set("Authorization", "Bearer " + access_token)
      .send({
        currentPassword: "NewPassword123!",
        newPassword: "NewPassword"
      });
    expect(res.statusCode).toEqual(403);
    expect(res.body).toHaveProperty("error", "Password should be 6 to 20 characters long with a numeric, 1 lowercase and 1 uppercase letters");
  });

  it("should fail to update password with incorrect current password", async () => {
    const res = await request(server)
      .post(`/users/${user_id}`)
      .set("Authorization", "Bearer " + access_token)
      .send({
        currentPassword: "WrongPassword123!",
        newPassword: "NewPassword123!"
      });
    expect(res.statusCode).toEqual(403);
    expect(res.body).toHaveProperty("error", "Incorrect current password");
  });

  it('should fail if user account was created with oauth', async () => {
    const mockUser = {
      personal_info: {
        email: 'test@example.com',
      },
      google_auth: true,
      facebook_auth: false
    };

    jest.spyOn(User, 'findOne').mockImplementationOnce(() => Promise.resolve(mockUser));

    jest.spyOn(bcrypt, 'compare').mockImplementationOnce((password, hash, callback) => {
      callback(null, false);
    });

    const response = await request(server)
      .post(`/users/${user_id}`)
      .set("Authorization", "Bearer " + access_token)
      .send({
        currentPassword: "WrongPassword123!",
        newPassword: "NewPassword123!"
      });

    expect(response.statusCode).toEqual(403);
    expect(response.body).toHaveProperty("error", "You can't change account's password because you logged in through google");
    expect(bcrypt.compare).not.toHaveBeenCalled();

    jest.restoreAllMocks();
  });

  it("should fail to update if User ID does not match logged in user", async () => {
    const res = await request(server)
      .post(`/users/${user_id}fail`)
      .set("Authorization", "Bearer " + access_token)
      .send({
        currentPassword: "WrongPassword123!",
        newPassword: "NewPassword123!"
      });
    console.log(res.body)
    expect(res.statusCode).toEqual(403);
    expect(res.body).toHaveProperty("error", "Incorrect User ID. You can only edit your account");
  });

  // it('should fail if there is an unexpected server error', async () => {
  //   const originalBcrypt = bcrypt.compare;

  //   bcrypt.compare = jest.fn(() => {
  //     return Promise.reject(new Error('Some error occured while changing the password, please try again later'));
  //   });

  //   const response = await request(server)
  //     .post(`/users/${user_id}`)
  //     .set("Authorization", "Bearer " + access_token)
  //     .send({
  //       currentPassword: "WrongPassword123!",
  //       newPassword: "NewPassword123!"
  //     });

  //   expect(response.statusCode).toEqual(500);
  //   expect(response.body).toHaveProperty('error', 'Some error occured while changing the password, please try again later');

  //   bcrypt.compare = originalBcrypt;
  // });

  it('should fail if there is an unexpected server error', async () => {
    const originalFindOne = User.findOne;

    User.findOne = jest.fn(() => {
      return Promise.reject(new Error('Unexpected server error'));
    });

    const response = await request(server)
      .post(`/users/${user_id}`)
      .set("Authorization", "Bearer " + access_token)
      .send({
        currentPassword: "WrongPassword123!",
        newPassword: "NewPassword123!"
      });

    expect(response.statusCode).toEqual(500);
    expect(response.body).toHaveProperty('error', 'Unexpected server error');

    User.findOne = originalFindOne;
  });
});

describe("DELETE /users/:id", () => {
  it("should delete a user", async () => {
    const res = await request(server)
      .delete("/users/" + user_id)
      .set("Authorization", "Bearer " + access_token);
    expect(res.statusCode).toEqual(200);
  });

  it("should fail if User ID does not match logged in user", async () => {
    const res = await request(server)
      .delete(`/users/${user_id}fail`)
      .set("Authorization", "Bearer " + access_token);
    expect(res.statusCode).toEqual(403);
    expect(res.body).toHaveProperty("error", "Forbidden");
  });

  it('should fail if there is an unexpected server error', async () => {
    const originalFinByIdAndDelete = User.findByIdAndDelete;

    User.findByIdAndDelete = jest.fn(() => {
      return Promise.reject(new Error('Error deleting user'));
    });

    const response = await request(server)
      .delete(`/users/${user_id}`)
      .set("Authorization", "Bearer " + access_token)

    expect(response.statusCode).toEqual(500);
    expect(response.body).toHaveProperty('error', 'Error deleting user');

    User.findByIdAndDelete = originalFinByIdAndDelete;
  });
});