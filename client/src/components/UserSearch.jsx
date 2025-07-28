import React, { useState } from 'react'
import { Search, X, User } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import axios from 'axios'

const UserSearch = ({ onClose, onUserSelect }) => {
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState([])
  const [loading, setLoading] = useState(false)
  const { user } = useAuth()

  const handleSearch = async (query) => {
    if (!query.trim()) {
      setSearchResults([])
      return
    }

    setLoading(true)
    try {
      const response = await axios.get(`/api/users/search?username=${query}&userId=${user.id}`)
      setSearchResults(response.data.users)
    } catch (error) {
      console.error('Error searching users:', error)
      setSearchResults([])
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (e) => {
    const query = e.target.value
    setSearchQuery(query)
    handleSearch(query)
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-4">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Find Users</h3>
          <button
            onClick={onClose}
            className="p-1 text-gray-400 hover:text-gray-600 rounded"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Search */}
        <div className="p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={handleInputChange}
              placeholder="Search by username..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              autoFocus
            />
          </div>
        </div>

        {/* Results */}
        <div className="max-h-64 overflow-y-auto">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
            </div>
          ) : searchResults.length > 0 ? (
            <div className="space-y-1 px-4 pb-4">
              {searchResults.map((searchUser) => (
                <button
                  key={searchUser.id}
                  onClick={() => onUserSelect(searchUser)}
                  className="w-full p-3 text-left hover:bg-gray-50 rounded-lg transition-colors"
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-teal-600 rounded-full flex items-center justify-center">
                      <User className="h-5 w-5 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-900 truncate">
                        {searchUser.first_name} {searchUser.last_name}
                      </p>
                      <p className="text-sm text-gray-500 truncate">@{searchUser.username}</p>
                      {searchUser.bio && (
                        <p className="text-xs text-gray-400 truncate">{searchUser.bio}</p>
                      )}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          ) : searchQuery.trim() ? (
            <div className="text-center py-8 text-gray-500">
              <User className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No users found</p>
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <Search className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Search for users by username</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default UserSearch