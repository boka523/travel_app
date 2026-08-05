import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";
import "./ProfileForm.css";
import dark_profile_picture from "../../assets/dark_profile_picture.png";
import white_profile_picture from "../../assets/white_profile_picture.png";
import dark_email from "../../assets/dark_email.png";
import white_email from "../../assets/white_email.png";
import dark_password from "../../assets/dark_password.png";
import white_password from "../../assets/white_password.png";
import dark_name from "../../assets/dark_name.png";
import white_name from "../../assets/white_name.png";
import { API_URL } from "../../config";

const ProfileForm = ({ darkMode }) => {
  const [profileImage, setProfileImage] = useState(null);
  const [user, setUser] = useState(null);
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmedPassword, setConfirmedPassword] = useState("");
  const [newName, setNewName] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [showProfileForm, setShowProfileForm] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);
  const [changingProfile, setChangingProfile] = useState(false);
  const [loading, setLoading] = useState(true);

  const handleImageChange = async (e) => {
    const file = e.target.files[0];

    if (!file) {
      return;
    }

    try {
      const token = localStorage.getItem("token");
      const formData = new FormData();

      formData.append("profile_image", file);

      const response = await fetch(`${API_URL}/profile-picture`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        toast.error(data.error || "Image save failed.");
        return;
      }

      setProfileImage(`${API_URL}${data.profile_image}`);
      toast.success(data.message);
    } catch (error) {
      toast.error(error.message);
    }
  };

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const token = localStorage.getItem("token");

        const response = await fetch(`${API_URL}/me`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const data = await response.json();

        if (!response.ok) {
          toast.error(data.error || "User fetch failed.");
          return;
        }

        setUser(data);

        if (data.profile_image) {
          setProfileImage(`${API_URL}${data.profile_image}`);
        }
      } catch (error) {
        console.error("Profile error:", error);
        toast.error("Error fetching profile.");
      } finally {
        setLoading(false);
      }
    };
    fetchUser();
  }, []);

  const handleChangePassword = async (e) => {
    e.preventDefault();

    if (newPassword !== confirmedPassword) {
      toast.error("Confirmed password is not the same as new one.");
      return;
    }

    try {
      setChangingPassword(true);

      const token = localStorage.getItem("token");

      const response = await fetch(`${API_URL}/change_password`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          old_password: oldPassword,
          new_password: newPassword,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        toast.error(data.error || "Password change failed.");
        return;
      }

      toast.success(data.message);

      setOldPassword("");
      setNewPassword("");
      setConfirmedPassword("");

      setTimeout(() => {
        setShowPasswordForm(false);
      }, 2000);
    } catch (error) {
      toast.error(error.message);
    } finally {
      setChangingPassword(false);
    }
  };

  const handleChangeProfile = async (e) => {
    e.preventDefault();

    try {
      setChangingProfile(true);

      const token = localStorage.getItem("token");

      const response = await fetch(`${API_URL}/profile`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: newName,
          email: newEmail,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        toast.error(data.error || "Profile details change failed.");
        return;
      }

      localStorage.setItem("token", data.token);
      toast.success(data.message);

      setNewName("");
      setNewEmail("");

      setTimeout(() => {
        setShowProfileForm(false);
        setUser(data.user);
      }, 2000);
    } catch (error) {
      toast.error(error.message);
    } finally {
      setChangingProfile(false);
    }
  };

  return (
    <div className="profile-form container">
      <div className={`profile-text ${darkMode ? "tint white-letters" : ""}`}>
        <h1>Your profile</h1>
      </div>
      <div
        className={`profile-content ${darkMode ? "tint white-letters" : ""}`}
      >
        <div className="profile-picture">
          <div className="default-profile-picture">
            <img
              src={white_profile_picture}
              className={`profile-image ${darkMode ? "show" : "hide"}`}
              alt=""
            />
            <img
              src={dark_profile_picture}
              className={`profile-image ${darkMode ? "hide" : "show"}`}
              alt=""
            />
            {profileImage && (
              <img src={profileImage} className="profile-image" alt="" />
            )}
            <input
              type="file"
              id="profile-upload"
              accept="image/*"
              onChange={handleImageChange}
              hidden
            />
          </div>
          <label
            htmlFor="profile-upload"
            className={darkMode ? "btn" : "btn dark-btn"}
          >
            Change picture
          </label>
        </div>
        <div className="profile-column">
          <div className="profile-info">
            <div className="profile-info-row">
              <div className="email-icon">
                <img
                  src={white_name}
                  alt=""
                  className={`icon ${darkMode ? "show" : "hide"}`}
                />
                <img
                  src={dark_name}
                  alt=""
                  className={`icon ${darkMode ? "hide" : "show"}`}
                />
              </div>
              <div className="profile-info-label">Name:</div>
              <div className="profile-info-value">
                {loading ? "Loading..." : user?.name}
              </div>
            </div>
            <div className="profile-info-row">
              <div className="email-icon">
                <img
                  src={white_email}
                  alt=""
                  className={`icon ${darkMode ? "show" : "hide"}`}
                />
                <img
                  src={dark_email}
                  alt=""
                  className={`icon ${darkMode ? "hide" : "show"}`}
                />
              </div>
              <div className="profile-info-label">Email:</div>
              <div className="profile-info-value">
                {loading ? "Loading..." : user?.email}
              </div>
            </div>
          </div>
          <button
            type="button"
            className={darkMode ? "btn" : "btn dark-btn"}
            onClick={() => {
              setShowPasswordForm((prev) => !prev);
              (setOldPassword(""),
                setNewPassword(""),
                setConfirmedPassword(""));
            }}
          >
            {showPasswordForm ? "Cancel" : "Change password"}
          </button>
          {showPasswordForm && (
            <form
              onSubmit={handleChangePassword}
              className="change-password-form"
            >
              <input
                type="password"
                placeholder="Old password"
                value={oldPassword}
                onChange={(e) => setOldPassword(e.target.value)}
                required
              />
              <input
                type="password"
                placeholder="New password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
              />
              <input
                type="password"
                placeholder="Confirm new password"
                value={confirmedPassword}
                onChange={(e) => setConfirmedPassword(e.target.value)}
                required
              />
              <button
                type="submit"
                className={darkMode ? "btn" : "btn dark-btn"}
                disabled={changingPassword}
              >
                {changingPassword ? "Changing..." : "Save new password"}
              </button>
            </form>
          )}
          <button
            type="button"
            className={darkMode ? "btn" : "btn dark-btn"}
            onClick={() => {
              setShowProfileForm((prev) => !prev);
              setNewName("");
              setNewEmail("");
            }}
          >
            {showProfileForm ? "Cancel" : "Change profile details"}
          </button>
          {showProfileForm && (
            <form
              onSubmit={handleChangeProfile}
              className="change-password-form"
            >
              <input
                type="text"
                placeholder="Change name"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
              />
              <input
                type="email"
                placeholder="Change email"
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
              />
              <button
                type="submit"
                className={darkMode ? "btn" : "btn dark-btn"}
                disabled={changingProfile}
              >
                {changingProfile ? "Changing..." : "Save new profile details"}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProfileForm;
