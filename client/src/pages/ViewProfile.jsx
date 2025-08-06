import React from 'react';
import { MessageCircle, ArrowLeft, View } from 'lucide-react';
import { useState,useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLocation } from 'react-router-dom';
import axios from 'axios';

function ViewProfile() {

  const location = useLocation();
  const { username } = location.state || {};

  const [dataSet, setdataSet] = useState({username: "Ali_Xyed",
    first_name: "Ali",
    last_name: "Ahmed",
    bio: "my life is to serve humanity",
    profile_picture: null,
    total_chats: 0});

  useEffect(() => {
    (async () => {
      try {
        const response = await axios.get(`/api/users/by-username/${username}`, { withCredentials: true });
        setdataSet(response.data);
      } catch (error) {
        console.error('Error fetching user data:', error);
      }
    })();
  }, [])

  const getInitials = (firstName, lastName) => {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <button className="p-1 text-gray-600 hover:text-gray-800 transition-colors">
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div className="w-6 h-6 bg-blue-600 rounded flex items-center justify-center">
              <MessageCircle className="w-4 h-4 text-white" />
            </div>
            <h1 className="text-lg font-medium text-gray-900">Chattrix</h1>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 py-8">
        {/* Profile Card */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          {/* Cover Area */}
          <div className="h-32 bg-gradient-to-r from-blue-600 to-teal-600"></div>
          
          {/* Profile Info */}
          <div className="px-6 pb-6 -mt-20 relative text-center">
            {/* Avatar */}
            <div className="mb-4">
              {dataSet.profile_picture ? (
                <img 
                  src={dataSet.profile_picture} 
                  alt="Profile" 
                  className="w-32 h-32 rounded-full border-4 border-white shadow-lg mx-auto"
                />
              ) : (
                <div className="w-32 h-32 rounded-full border-4 border-white shadow-lg bg-gradient-to-r from-blue-600 to-teal-600 flex items-center justify-center mx-auto">
                  <span className="text-white text-2xl font-semibold">
                    {getInitials(dataSet.first_name, dataSet.last_name)}
                  </span>
                </div>
              )}
            </div>

            {/* User Details */}
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-1">
                {dataSet.first_name} {dataSet.last_name}
              </h2>
              <p className="text-gray-600 mb-3">@{dataSet.username}</p>
              
              {dataSet.bio && (
                <div className="mb-4">
                  <h3 className="text-sm font-semibold text-gray-900 mb-2">Bio</h3>
                  <p className="text-gray-700 leading-relaxed">{dataSet.bio}</p>
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex justify-center mb-6">
              <button className="flex items-center px-4 py-2 bg-gradient-to-r from-blue-600 to-teal-600 text-white rounded-lg hover:from-blue-700 hover:to-teal-700 transition-all duration-200 shadow-sm font-medium">
                <MessageCircle className="w-4 h-4 mr-2" />
                Message
              </button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 gap-6 pt-6 border-t border-gray-100">
              <div className="text-center">
                <div className="flex items-center justify-center mb-2">
                  <MessageCircle className="w-5 h-5 text-purple-600 mr-1" />
                  <span className="text-xl font-bold text-gray-900">{dataSet.total_chats}</span>
                </div>
                <p className="text-sm text-gray-600">Chats</p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default ViewProfile;