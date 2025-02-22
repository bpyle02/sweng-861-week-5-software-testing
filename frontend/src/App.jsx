import { Routes, Route } from "react-router-dom";
import Navbar from "./components/navbar.jsx";
import UserAuthForm from "./pages/user-auth-form.jsx";
import { createContext, useEffect, useState } from "react";
import HomePage from "./pages/home.jsx";
import ChangePassword from "./pages/change-password.jsx";
import PageNotFound from "./pages/404.jsx";
import ProfilePage from "./pages/profile.jsx";
import SideNav from "./components/sidenavbar.jsx";
import PrivacyPolicy from "./pages/privacy-policy.jsx";
import DataDeletion from "./pages/data-deletion.jsx";
import EditProfile from "./pages/edit-profile.jsx";

export const UserContext = createContext({})

export const ThemeContext = createContext({});

const darkThemePreference = () => window.matchMedia("(prefers-color-scheme: dark)").matches;

const App = () => {

    const [userAuth, setUserAuth] = useState({});

    const [theme, setTheme] = useState(() => darkThemePreference() ? "dark" : "light");

    useEffect(() => {

        let userInSession = sessionStorage.getItem("user");
        let themeInSession = sessionStorage.getItem("theme");

        userInSession ? setUserAuth(JSON.parse(userInSession)) : setUserAuth({ access_token: null })

        if (themeInSession) {
            setTheme(() => {

                document.body.setAttribute('data-theme', themeInSession);

                return themeInSession;

            })
        } else {
            document.body.setAttribute('data-theme', theme)
        }

    }, [])


    return (
        <>
        Test
            <ThemeContext.Provider value={{ theme, setTheme }}>
                <UserContext.Provider value={{ userAuth, setUserAuth }}>
                    <Routes>
                        <Route path="/" element={<Navbar />}>
                            <Route index element={<HomePage />} />
                            <Route path="dashboard" element={<SideNav />} />
                            <Route path="settings" element={<SideNav />}>
                                <Route path="edit-profile" element={<EditProfile />} />
                                <Route path="change-password" element={<ChangePassword />} />
                            </Route>
                            <Route path="signin" element={<UserAuthForm type="sign-in" />} />
                            <Route path="signup" element={<UserAuthForm type="sign-up" />} />
                            <Route path="user/:id" element={<ProfilePage />} />
                            <Route path="privacy-policy" element={<PrivacyPolicy />} />
                            <Route path="data-deletion" element={<DataDeletion />} />
                            <Route path="*" element={<PageNotFound />} />
                        </Route>
                    </Routes>
                </UserContext.Provider>
            </ThemeContext.Provider>
        </>
    );

}

export default App;