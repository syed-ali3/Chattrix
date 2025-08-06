import { use, useState } from "react";
import { useAuth } from '../contexts/AuthContext'
import { useEffect } from "react";
import toast from "react-hot-toast";

const Profile = () => {
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState({ username: '', first_name: '', last_name: '', email: '', bio: '', profile_picture: '' });
    const { user } = useAuth();
    console.log("User data from context:", user);
    useEffect(() => {
        if (user) {
            const newUserData = {
                username: user.username,
                first_name: user.first_name,
                last_name: user.last_name,
                email: user.email,
                bio: user.bio,
                profile_picture: user.profile_picture
            };

            setFormData(newUserData);
        }
    }, [user]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSave = async () => {
        
        try {
            
            console.log("Saving profile data:", formData);
            
            setIsEditing(false);
            // Handle success
            toast.success("Profile updated successfully!");
        } catch (error) {
            console.error("Error saving profile:", error);
            toast.error("Failed to save profile. Please try again.");
        }
    };

    const handleProfilePictureUpdate = () => {
        // Handle profile picture update logic
        console.log("Update profile picture");
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-teal-50">
            {/* Header */}
            <div className="bg-white shadow-sm border-b border-blue-100">
                <div className="max-w-4xl mx-auto px-6 py-4 flex justify-between items-center">
                    <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-blue-700 rounded-lg flex items-center justify-center shadow-md">
                            <span className="text-white font-bold text-sm">C</span>
                        </div>
                        <h1 className="text-xl font-semibold text-gray-900">Chattrix</h1>
                    </div>

                    {!isEditing ? (
                        <button
                            onClick={() => setIsEditing(true)}
                            className="px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all duration-200 text-sm font-medium shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
                        >
                            Edit Profile
                        </button>
                    ) : (
                        <div className="flex space-x-3">
                            <button
                                onClick={() => setIsEditing(false)}
                                className="px-5 py-2.5 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-all duration-200 text-sm font-medium shadow-md hover:shadow-lg"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleSave}
                                className="px-5 py-2.5 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-all duration-200 text-sm font-medium shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
                            >
                                Save Changes
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {/* Main Content */}
            <div className="max-w-3xl mx-auto px-6 py-8">
                <div className="bg-white rounded-2xl shadow-xl p-8 border border-blue-100">
                    {/* Profile Picture Section */}
                    <div className="flex justify-center mb-8">
                        <div
                            className="relative group "
                        >
                            <div className="w-32 h-32 rounded-full bg-gradient-to-br from-blue-500 to-teal-500 flex items-center justify-center text-white text-4xl font-bold shadow-xl border-4 border-white relative overflow-hidden transition-transform duration-300 group-hover:scale-105">
                                {formData.profile_picture ? (
                                    <img
                                        src={formData.profile_picture}
                                        alt="Profile"
                                        className="w-full h-full rounded-full object-cover"
                                    />
                                ) : (
                                    <span className="text-white font-bold text-4xl">
                                        {formData.first_name && formData.first_name[0]}{formData.last_name && formData.last_name[0]}
                                    </span>
                                )}
                            </div>

                            {/* Hover indicator */}
                            <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center shadow-lg transition-all duration-300 group-hover:bg-blue-700 group-hover:scale-110">

                                <label htmlFor="profilePicInput">
                                    <svg className="cursor-pointer  w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                                    </svg>
                                    <input
                                        id="profilePicInput"
                                        type="file"
                                        accept="image/*"
                                        style={{ display: 'none' }}
                                        onChange={e => {
                                            const file = e.target.files[0];
                                            if (file) {
                                                const reader = new FileReader();
                                                reader.onloadend = () => {
                                                    setFormData(prev => ({ ...prev, profile_picture: reader.result }));
                                                };
                                                reader.readAsDataURL(file);
                                            }
                                        }}
                                    />
                                </label>
                            </div>
                        </div>
                    </div>

                    {/* Non-editable Information */}
                    <div className="mb-8 bg-gradient-to-r from-blue-50 to-teal-50 rounded-xl p-6 border border-blue-100">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                            <div className="w-5 h-5 bg-blue-600 rounded-full mr-2"></div>
                            Account Information
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Username</label>
                                <div className="bg-white rounded-lg px-4 py-3 border border-blue-200 text-gray-900 font-medium">
                                    {formData.username}
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                                <div className="bg-white rounded-lg px-4 py-3 border border-blue-200 text-gray-900 font-medium">
                                    {formData.email}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Editable Information */}
                    <div className="space-y-6">
                        <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                            <div className="w-5 h-5 bg-teal-600 rounded-full mr-2"></div>
                            Personal Information
                        </h3>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">First Name</label>
                                {isEditing ? (
                                    <input
                                        type="text"
                                        name="first_name"
                                        value={formData.first_name}
                                        onChange={handleInputChange}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-white shadow-sm"
                                    />
                                ) : (
                                    <div className="px-4 py-3 bg-gray-50 rounded-lg text-gray-900 border border-gray-200">
                                        {formData.first_name}
                                    </div>
                                )}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Last Name</label>
                                {isEditing ? (
                                    <input
                                        type="text"
                                        name="last_name"
                                        value={formData.last_name}
                                        onChange={handleInputChange}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-white shadow-sm"
                                    />
                                ) : (
                                    <div className="px-4 py-3 bg-gray-50 rounded-lg text-gray-900 border border-gray-200">
                                        {formData.last_name}
                                    </div>
                                )}
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Bio</label>
                            {isEditing ? (
                                <textarea
                                    name="bio"
                                    value={formData.bio}
                                    onChange={handleInputChange}
                                    rows={4}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 resize-none bg-white shadow-sm"
                                    placeholder="Tell us about yourself..."
                                />
                            ) : (
                                <div className="px-4 py-3 bg-gray-50 rounded-lg text-gray-900 min-h-[100px] border border-gray-200">
                                    {formData.bio}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
export default Profile;