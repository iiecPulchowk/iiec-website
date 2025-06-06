import React, { useState, useEffect } from "react";
import { Save, X, Upload, Link as LinkIcon } from "lucide-react"; // Renamed Link to LinkIcon to avoid conflict

const ItemForm = ({ type, item, onSave, onCancel, loading }) => {
  const [formData, setFormData] = useState(item || getDefaultFormData(type));
  const [imageUploadType, setImageUploadType] = useState("url"); // 'url' or 'file'
  const [imagePreview, setImagePreview] = useState(null);

  useEffect(() => {
    if (item) {
      let currentFormData = { ...item };
      // Ensure date is in YYYY-MM-DD for date inputs if it's not already a string
      if (
        type === "events" &&
        currentFormData.date &&
        !(
          typeof currentFormData.date === "string" &&
          currentFormData.date.match(/^\d{4}-\d{2}-\d{2}$/)
        )
      ) {
        try {
          currentFormData.date = new Date(currentFormData.date)
            .toISOString()
            .split("T")[0];
        } catch (e) {
          console.error("Error formatting date:", e);
          currentFormData.date = ""; // Fallback to empty if date is invalid
        }
      }
      setFormData(currentFormData);

      if (type === "projects" && item.mainImageUrl) {
        setImagePreview(item.mainImageUrl);
      } else if ((type === "events" || type === "products") && item.imageUrl) {
        setImagePreview(item.imageUrl);
      } else {
        setImagePreview(null);
      }
    } else {
      setFormData(getDefaultFormData(type));
      setImagePreview(null);
    }
  }, [item, type]);

  function getDefaultFormData(type) {
    switch (type) {
      case "projects":
        return {
          name: "",
          description: "",
          overview: "",
          mainImageUrl: "", // Ensure this matches the field name used (mainImageUrl vs imageUrl)
          status: "active",
        };
      case "events":
        return {
          title: "",
          description: "",
          date: "", // Should be YYYY-MM-DD
          time: "",
          location: "",
          imageUrl: "",
          url: "",
          // status: "upcoming", // Removed status from default form data
        };
      case "products":
        return {
          name: "",
          description: "",
          price: 0,
          inStock: true,
          imageUrl: "",
        };
      case "orders": // Default fields for orders
        return {
          full_name: "",
          email: "",
          contact: "",
          product_title: "", // ADDED
          quantity: 1,
          total_amount: 0,
        };
      default:
        return {};
    }
  }

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData, type);
  };

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleGenericInputChange = (e) => {
    const { name, value, type: inputType, checked } = e.target;
    handleChange(name, inputType === "checkbox" ? checked : value);
  };

  const handleImageUrlChange = (url) => {
    const imageField = type === "projects" ? "mainImageUrl" : "imageUrl";
    handleChange(imageField, url);
    setImagePreview(url);
  };

  const handleFileUpload = async (file) => {
    if (!file) return;

    // For simplicity, using Data URL for preview.
    // In a real app, you'd upload to a server and get back a URL.
    try {
      const reader = new FileReader();
      reader.onload = (e) => {
        const dataUrl = e.target.result;
        const imageField = type === "projects" ? "mainImageUrl" : "imageUrl";
        handleChange(imageField, dataUrl); // Store Data URL or actual URL from server
        setImagePreview(dataUrl);
      };
      reader.readAsDataURL(file);
      // Example: If you were to upload
      // const uploadFormData = new FormData();
      // uploadFormData.append('image', file);
      // const response = await fetch('/api/upload', { method: 'POST', body: uploadFormData });
      // const result = await response.json();
      // handleChange(imageField, result.imageUrl);
      // setImagePreview(result.imageUrl);
    } catch (error) {
      console.error("Error uploading file:", error);
      // Handle error (e.g., show a notification)
    }
  };

  return (
    <div className="bg-white shadow rounded-lg">
      <div className="px-6 py-4 border-b border-gray-200">
        <h2 className="text-lg font-medium text-gray-900">
          {item ? `Edit ${type.slice(0, -1)}` : `Add New ${type.slice(0, -1)}`}
        </h2>
      </div>

      <form onSubmit={handleSubmit} className="p-6 space-y-6">
        {type === "projects" && (
          <>
            <div>
              <label
                htmlFor="name"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Project Name
              </label>
              <input
                type="text"
                name="name"
                id="name"
                value={formData.name || ""}
                onChange={handleGenericInputChange}
                required
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              />
            </div>
            <div>
              <label
                htmlFor="description"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Description
              </label>
              <textarea
                name="description"
                id="description"
                value={formData.description || ""}
                onChange={handleGenericInputChange}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label
                htmlFor="overview"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Overview
              </label>
              <textarea
                name="overview"
                id="overview"
                value={formData.overview || ""}
                onChange={handleGenericInputChange}
                rows={5}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label
                htmlFor="status"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Status
              </label>
              <select
                name="status"
                id="status"
                value={formData.status || "active"}
                onChange={handleGenericInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="completed">Completed</option>
              </select>
            </div>
            {/* Project Image Upload Section */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Main Project Image
              </label>
              <div className="space-y-4">
                <div className="flex space-x-4">
                  <button
                    type="button"
                    onClick={() => setImageUploadType("url")}
                    className={`px-3 py-2 text-sm font-medium rounded-md flex items-center space-x-2 ${
                      imageUploadType === "url"
                        ? "bg-blue-100 text-blue-700 border border-blue-300"
                        : "bg-gray-100 text-gray-700 border border-gray-300"
                    }`}
                  >
                    <LinkIcon size={16} />
                    <span>URL</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setImageUploadType("file")}
                    className={`px-3 py-2 text-sm font-medium rounded-md flex items-center space-x-2 ${
                      imageUploadType === "file"
                        ? "bg-blue-100 text-blue-700 border border-blue-300"
                        : "bg-gray-100 text-gray-700 border border-gray-300"
                    }`}
                  >
                    <Upload size={16} />
                    <span>Upload</span>
                  </button>
                </div>

                {imageUploadType === "url" && (
                  <div>
                    <input
                      type="url"
                      placeholder="Enter image URL"
                      value={formData.mainImageUrl || ""}
                      onChange={(e) => handleImageUrlChange(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                )}

                {imageUploadType === "file" && (
                  <div>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleFileUpload(e.target.files[0])}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Supported formats: JPG, PNG, GIF (Max 5MB)
                    </p>
                  </div>
                )}

                {imagePreview && (
                  <div className="mt-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Preview
                    </label>
                    <div className="relative inline-block">
                      <img
                        src={imagePreview || "/placeholder.svg"} // Fallback for broken links
                        alt="Preview"
                        className="h-32 w-32 object-cover rounded-lg border"
                        onError={() => setImagePreview("/placeholder.svg")} // Fallback to placeholder on error
                      />
                      <button
                        type="button"
                        onClick={() => {
                          setImagePreview(null);
                          handleChange("mainImageUrl", ""); // Clear the image URL
                        }}
                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                      >
                        <X size={12} />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </>
        )}

        {type === "events" && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label
                  htmlFor="title"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Event Title
                </label>
                <input
                  type="text"
                  name="title"
                  id="title"
                  value={formData.title || ""}
                  onChange={handleGenericInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>
              <div>
                <label
                  htmlFor="location"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Location
                </label>
                <input
                  type="text"
                  name="location"
                  id="location"
                  value={formData.location || ""}
                  onChange={handleGenericInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="description"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Description
              </label>
              <textarea
                name="description"
                id="description"
                value={formData.description || ""}
                onChange={handleGenericInputChange}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label
                  htmlFor="date"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Date
                </label>
                <input
                  type="date"
                  name="date"
                  id="date"
                  value={formData.date || ""} // Ensure value is string YYYY-MM-DD
                  onChange={handleGenericInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>
              <div>
                <label
                  htmlFor="time"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Time
                </label>
                <input
                  type="time"
                  name="time"
                  id="time"
                  value={formData.time || ""}
                  onChange={handleGenericInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="url"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Registration/Event URL
              </label>
              <input
                type="url"
                name="url"
                id="url"
                value={formData.url || ""}
                onChange={handleGenericInputChange}
                placeholder="https://example.com/register"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Event Image Upload Section */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Event Image
              </label>
              <div className="space-y-4">
                <div className="flex space-x-4">
                  <button
                    type="button"
                    onClick={() => setImageUploadType("url")}
                    className={`px-3 py-2 text-sm font-medium rounded-md flex items-center space-x-2 ${
                      imageUploadType === "url"
                        ? "bg-blue-100 text-blue-700 border border-blue-300"
                        : "bg-gray-100 text-gray-700 border border-gray-300"
                    }`}
                  >
                    <LinkIcon size={16} />
                    <span>URL</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setImageUploadType("file")}
                    className={`px-3 py-2 text-sm font-medium rounded-md flex items-center space-x-2 ${
                      imageUploadType === "file"
                        ? "bg-blue-100 text-blue-700 border border-blue-300"
                        : "bg-gray-100 text-gray-700 border border-gray-300"
                    }`}
                  >
                    <Upload size={16} />
                    <span>Upload</span>
                  </button>
                </div>

                {imageUploadType === "url" && (
                  <div>
                    <input
                      type="url"
                      placeholder="Enter image URL"
                      value={formData.imageUrl || ""}
                      onChange={(e) => handleImageUrlChange(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                )}

                {imageUploadType === "file" && (
                  <div>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleFileUpload(e.target.files[0])}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Supported formats: JPG, PNG, GIF (Max 5MB)
                    </p>
                  </div>
                )}

                {imagePreview && (
                  <div className="mt-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Preview
                    </label>
                    <div className="relative inline-block">
                      <img
                        src={imagePreview || "/placeholder.svg"}
                        alt="Preview"
                        className="h-32 w-32 object-cover rounded-lg border"
                        onError={() => setImagePreview("/placeholder.svg")} // Fallback to placeholder on error
                      />
                      <button
                        type="button"
                        onClick={() => {
                          setImagePreview(null);
                          handleChange("imageUrl", "");
                        }}
                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                      >
                        <X size={12} />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </>
        )}

        {type === "products" && (
          <>
            <div>
              <label
                htmlFor="name"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Product Name
              </label>
              <input
                type="text"
                name="name"
                id="name"
                value={formData.name || ""}
                onChange={handleGenericInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>

            <div>
              <label
                htmlFor="description"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Description
              </label>
              <textarea
                name="description"
                id="description"
                value={formData.description || ""}
                onChange={handleGenericInputChange}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>

            {/* Product Image Upload Section */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Product Image
              </label>
              <div className="space-y-4">
                <div className="flex space-x-4">
                  <button
                    type="button"
                    onClick={() => setImageUploadType("url")}
                    className={`px-3 py-2 text-sm font-medium rounded-md flex items-center space-x-2 ${
                      imageUploadType === "url"
                        ? "bg-blue-100 text-blue-700 border border-blue-300"
                        : "bg-gray-100 text-gray-700 border border-gray-300"
                    }`}
                  >
                    <LinkIcon size={16} />
                    <span>URL</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setImageUploadType("file")}
                    className={`px-3 py-2 text-sm font-medium rounded-md flex items-center space-x-2 ${
                      imageUploadType === "file"
                        ? "bg-blue-100 text-blue-700 border border-blue-300"
                        : "bg-gray-100 text-gray-700 border border-gray-300"
                    }`}
                  >
                    <Upload size={16} />
                    <span>Upload</span>
                  </button>
                </div>

                {imageUploadType === "url" && (
                  <div>
                    <input
                      type="url"
                      placeholder="Enter image URL"
                      value={formData.imageUrl || ""}
                      onChange={(e) => handleImageUrlChange(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                )}

                {imageUploadType === "file" && (
                  <div>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleFileUpload(e.target.files[0])}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Supported formats: JPG, PNG, GIF (Max 5MB)
                    </p>
                  </div>
                )}

                {imagePreview && (
                  <div className="mt-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Preview
                    </label>
                    <div className="relative inline-block">
                      <img
                        src={imagePreview || "/placeholder.svg"}
                        alt="Preview"
                        className="h-32 w-32 object-cover rounded-lg border"
                        onError={() => setImagePreview("/placeholder.svg")} // Fallback to placeholder on error
                      />
                      <button
                        type="button"
                        onClick={() => {
                          setImagePreview(null);
                          handleChange("imageUrl", "");
                        }}
                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                      >
                        <X size={12} />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label
                  htmlFor="price"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Price (रु)
                </label>
                <input
                  type="number"
                  name="price"
                  id="price"
                  step="0.01"
                  value={formData.price === undefined ? "" : formData.price} // Handle undefined for initial render
                  onChange={(e) =>
                    handleChange(
                      "price",
                      e.target.value === ""
                        ? ""
                        : Number.parseFloat(e.target.value)
                    )
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  In Stock
                </label>
                <div className="flex items-center mt-2">
                  <input
                    type="checkbox"
                    name="inStock"
                    id="inStock"
                    checked={formData.inStock || false}
                    onChange={handleGenericInputChange}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label
                    htmlFor="inStock"
                    className="ml-2 block text-sm text-gray-900"
                  >
                    Product is in stock
                  </label>
                </div>
              </div>
            </div>
          </>
        )}

        <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
          >
            {loading ? (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
            ) : (
              <Save size={16} />
            )}
            <span>{loading ? "Saving..." : "Save"}</span>
          </button>
        </div>
      </form>
    </div>
  );
};

export default ItemForm;
