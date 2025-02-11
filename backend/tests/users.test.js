import request from "supertest";
import server from "../server.js";
import jwt from "jsonwebtoken";
import admin from "firebase-admin";
import { jest } from "@jest/globals"
import fs from 'fs';

const serviceAccountKey = JSON.parse(
  fs.readFileSync("./etc/secrets/firebase_private_key.json", "utf-8")
);

let access_token = "";
let user_id = "";
let mockUserToken = "";
let mockUserNoOAuthToken = "";

const mockUser = {
  email: "newuser@example.com",
  name: "New User",
  picture: "https://example.com/profile.jpg"
};

const mockUserNoOAuth = {
  email: "no-oath@example.com",
  name: "No oath",
  picture: "https://example.com/profile.jpg"
};

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

  it("should fail if user created account with an oauth provider", async () => {
    const res = await request(server)
      .post("/users/login")
      .send({ email: "mail4brando@gmail.com", password: "Test1234!" });
    expect(res.statusCode).toEqual(403);
    expect(res.body).toHaveProperty("error", "Account was created using an oauth provider. Try logging in with with Facebook or Google.");
  });
});

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

  // it("should return 500 if an unexpected error occurs", async () => {
  //   const mockUserFindOne = jest.fn().mockRejectedValue(new Error('Database Error'));
  //   jest.mock('../Schema/User.js', () => ({
  //     findOne: mockUserFindOne 
  //   }));
  //   const res = await request(server)
  //     .get('/users/testuser')


  //   console.log(res.body)
    
  //   expect(res.statusCode).toEqual(500);
  //   expect(res.body).toHaveProperty('error', 'Database Error');
  //   // expect(mockUserFindOne).toHaveBeenCalledWith({ "personal_info.username": "testuser" });
  // });
});

  // admin.initializeApp({ credential: admin.credential.cert(serviceAccountKey) });


  // describe("POST /google-auth", () => {
  //   mockUserToken = admin.auth().createCustomToken(user_id);
  //   mockUserNoOAuthToken = admin.auth().createCustomToken(user_id);

  //   it('should creat a new user with google auth', async () => {

  //     const response = await request(server)
  //       .post('/google-auth')
  //       .send({ access_token: mockUserToken });

  //     expect(response.statusCode).toEqual(200);
  //     console.log(response.body);
  //     expect(response.body).toHaveProperty('personal_info');
  //     expect(response.body.personal_info.email).toBe(mockUser.email);
  //     expect(response.body.personal_info.fullname).toBe(mockUser.name);
  //   });

  //   it('should login an existing user with Google auth', async () => {
  //     const existingUser = new User({
  //       personal_info: mockUser,
  //       admin: false,
  //       google_auth: true,
  //       facebook_auth: false
  //     });

  //     await existingUser.save();

  //     const response = await request(server)
  //       .post('/google-auth')
  //       .send({ access_token: mockUser });

  //     expect(response.statusCode).toEqual(200);
  //     expect(response.body.personal_info.email).toBe(mockUser.email);
  //   });

  //   it('should not allow login for a user who signed up without google auth', async () => {

  //     const userWithoutGoogle = new User({
  //       personal_info: mockUserNoOAuth,
  //       admin: false,
  //       google_auth: false,
  //       facebook_auth: false
  //     });

  //     await userWithoutGoogle.save();


  //     const response = await request(server)
  //       .post('/google-auth')
  //       .send({ access_token: mockUserNoOAuth });

  //     expect(response.statusCode).toEqual(403);
  //     expect(response.body).toHaveProperty("error", "This email was signed up without google. Please log in with password to access the account");
  //   });

  //   it('should respond with error for invalid Google token', async () => {
  //     const response = await request(server)
  //       .post('/google-auth')
  //       .send({ access_token: "invalid token" });

  //     expect(response.statusCode).toEqual(500);
  //     expect(response.body).toHaveProperty("error", "Failed to authenticate you with google. Try with some other google account");
  //   });
  // });

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
          username: "mail4brando",
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

    // it("should fail to update password if account was created with oauth", async () => {
    //   const res = await request(server)
    //     .post(`/users/${user_id}`)
    //     .set("Authorization", "Bearer " + access_token)
    //     .send({
    //       currentPassword: "WrongPassword123!",
    //       newPassword: "NewPassword123!"
    //     });
    //   expect(res.statusCode).toEqual(403);
    //   expect(res.body).toHaveProperty("error", "Incorrect current password");
    // });

    it("should fail to update if user is not found", async () => {
      const res = await request(server)
        .post(`/users/${user_id}fail`)
        .set("Authorization", "Bearer asdASD" + access_token + "fail")
        .send({
          currentPassword: "WrongPassword123!",
          newPassword: "NewPassword123!"
        });
      expect(res.statusCode).toEqual(500);
      expect(res.body).toHaveProperty("error", "User not found");
    });
  });

  describe("DELETE /users/:id", () => {
    it("should delete a user", async () => {
      const res = await request(server)
        .delete("/users/" + user_id)
        .set("Authorization", "Bearer " + access_token);
      expect(res.statusCode).toEqual(200);
    });
  });