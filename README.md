# Frontend Development

- GitHub Repo can be found here: [https://github.com/bpyle02/sweng-861-week-4-frontend-development](https://github.com/bpyle02/sweng-861-week-4-frontend-development)

## Setting up the Environment

- The environment I am using is MERN (MongoDB, Express JS, React, and Node JS), however, I have added some extra goodies to make things a little easier
  - Vite — A usability tool to make building the frontend super easy
  - Tailwind CSS — A usability tool to make designing the UI super simple and easy
- To run this web app locally, clone the repository and run `npm i` in the frontend and backend folders
- After the frontend and backend are initialized, you can start up the backend by typing `npm start` in the terminal and the frontend by executing the `npm run dev` command
- You will then be able to access the website from [http://localhost:5173](http://localhost:5173). Right now, the website only has functionality to sign in, sign out, and edit your profile, but if you would like to see the fully built application, you can check out [https://christisking.info](https://christisking.info)
- You can also view the API documentation, built with Swagger UI, [http://localhost:3173/api-docs](http://localhost:3173/api-docs)

## UI Design and Component Architecture

- Design Principles
  - Tailwind CSS is used to enable rapid prototyping and assist with implementing a responsive design.
  - A very simple two-tone color scheme is being used for both light and dark mode:
    - Light theme -- Background is `#ffffff`, foregoround/text is `#242424`, tertiary color is `#f3f3f3`
    - Dark theme -- Background is `#242424` and foreground/text is `#f3f3f3`, tertiary color is `#2a2a2a`
  - The website layout utilizes a combination of flexbox and CSS grid to create a user-friendly interface that is easy to modify and build upon
- Component Architecture
  - Three main folders within the `src` folder are used to differentiate between pages, components, and utilities (backend connections, animations, etc.)
    - Pages Folder
      - The pages folder contains the actual pages that users will navigate between when using the webapp
    - Components Folder
      - The components folder contains portions of code that are used on multiple pages, repeated multiple times on one page, or to separate large portions of a page's code in order to make things cleaner
    - Common Folder
      - This folder contains things like date and animation utilities, connections to firebase, and other useful items that are not typically user-facing
  - React is used to manage states in this application
  - Styling is done inside the `.jsx` files themselves using tailwind css to make editing styles easier and more efficient
  - File naming scheme is all lowercase with '-' characters used in place of spacing
  

## Integration with Social Media Login and API Functionality

- The same integrations from the previous three assignments are utilized in this assignment. Users can log in and edit their account info using the APIs I developed and outlined in the previous assignment.

## Error Handling and Security Measures

- Error handling is outlined previous assignments and in the API documentation, which can be found at [http://localhost:3173/api-docs](http://localhost:3173/api-docs)