import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";

export default function VisitForm({ selectedDate }) {
  const { user, token } = useAuth();
  const [visits, setVisits] = useState([]);
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [products, setProducts] = useState([]);
  const [users, setUsers] = useState([]);
  const [loadingProducts, setLoadingProducts] = useState(false);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [submitError, setSubmitError] = useState('');

  // Helper function to get day name
  const getDayName = (date) => {
    const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    return days[date.getDay()];
  };

  // Helper function to format date for input (timezone-safe)
  const formatDateForInput = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  // Helper function to get initial visit state
  const getInitialVisitState = () => ({
    dateOfVisit: selectedDate ? formatDateForInput(selectedDate) : "",
    dayOfWeek: selectedDate ? getDayName(selectedDate) : "",
    areaTerritory: "",
    visitedWithCoworker: "",
    doctorChemistName: "",
    specialisation: "",
    purposeOfVisit: "",
    productsPromoted: [],
    keyDiscussionPoints: "",
    doctorInterestLevel: "",
    doctorQueries: "",
    productsAgreedToPrescribe: [],
    productsNotAgreedToPrescribe: [],
    expectedMonthlyVolume: "",
    actualOrdersSales: "",
    followUpDate: "",
    competitorBrands: "",
    reasonsForPreferringCompetitor: "",
    marketFeedback: "",
    challengesFaced: "",
    additionalNotes: ""
  });

  // Form validation
  const validateCurrentStep = () => {
    const requiredFields = {
      1: ['dateOfVisit', 'dayOfWeek', 'areaTerritory'],
      2: ['doctorChemistName', 'specialisation', 'purposeOfVisit'],
      3: ['keyDiscussionPoints', 'doctorInterestLevel'],
      4: []
    };

    const fields = requiredFields[currentStep] || [];
    return fields.every(field => {
      const value = currentVisit[field];
      return value && value.toString().trim() !== "";
    });
  };

  const [currentVisit, setCurrentVisit] = useState(getInitialVisitState());

  // Update date and day when selectedDate changes
  useEffect(() => {
    if (selectedDate) {
      setCurrentVisit(prev => ({
        ...prev,
        dateOfVisit: formatDateForInput(selectedDate),
        dayOfWeek: getDayName(selectedDate)
      }));
    }
  }, [selectedDate]);

  // Fetch products from API
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoadingProducts(true);
        const response = await fetch('https://api.gluckscare.com/api/products');
        if (response.ok) {
          const data = await response.json();
          setProducts(data);
        } else {
          console.error('Failed to fetch products');
        }
      } catch (error) {
        console.error('Error fetching products:', error);
      } finally {
        setLoadingProducts(false);
      }
    };

    fetchProducts();
  }, []);

  // Fetch users from API (excluding certain roles)
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoadingUsers(true);
        const response = await fetch('http://localhost:5050/api/users');
        if (response.ok) {
          const data = await response.json();
          // Filter out excluded roles
          const excludedRoles = ['Super Admin', 'Admin', 'Opps Team', 'National Head'];
          const filteredUsers = data.filter(user => !excludedRoles.includes(user.role));
          setUsers(filteredUsers);
        } else {
          console.error('Failed to fetch users');
        }
      } catch (error) {
        console.error('Error fetching users:', error);
      } finally {
        setLoadingUsers(false);
      }
    };

    fetchUsers();
  }, []);

  const handleInputChange = (field, value) => {
    setCurrentVisit(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Helper function for handling multi-select products
  const handleProductSelect = (field, productId) => {
    setCurrentVisit(prev => {
      const currentProducts = prev[field] || [];
      const isSelected = currentProducts.includes(productId);
      
      if (isSelected) {
        // Remove product if already selected
        return {
          ...prev,
          [field]: currentProducts.filter(id => id !== productId)
        };
      } else {
        // Add product if not selected
        return {
          ...prev,
          [field]: [...currentProducts, productId]
        };
      }
    });
  };

  // Component for multi-select product dropdown
  const ProductMultiSelect = ({ field, label, required = false, optional = false }) => {
    const selectedProducts = currentVisit[field] || [];
    
    return (
      <div className="space-y-2">
        <label className="flex items-center text-sm font-semibold text-gray-700">
          💊 {label} 
          {required && <span className="text-red-500 ml-1">*</span>}
          {optional && <span className="text-gray-500 ml-1"></span>}
        </label>
        
        {/* Selected Products Display */}
        {selectedProducts.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-2">
            {selectedProducts.map(productId => {
              const product = products.find(p => p._id === productId);
              return product ? (
                <span
                  key={productId}
                  className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-800"
                >
                  {product.name}
                  <button
                    type="button"
                    onClick={() => handleProductSelect(field, productId)}
                    className="ml-2 text-blue-600 hover:text-blue-800"
                  >
                    ×
                  </button>
                </span>
              ) : null;
            })}
          </div>
        )}
        
        {/* Product Selection Dropdown */}
        <select
          onChange={(e) => {
            if (e.target.value) {
              handleProductSelect(field, e.target.value);
              e.target.value = ""; // Reset dropdown
            }
          }}
          className="w-full border-2 border-gray-200 rounded-lg px-4 py-3 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
          disabled={loadingProducts}
        >
          <option value="">Select Product to Add</option>
          {loadingProducts ? (
            <option disabled>Loading products...</option>
          ) : (
            products
              .filter(product => !selectedProducts.includes(product._id))
              .map((product) => (
                <option key={product._id} value={product._id}>
                  {product.name}
                </option>
              ))
          )}
        </select>
        
        {selectedProducts.length === 0 && (
          <p className="text-sm text-gray-500">No products selected</p>
        )}
      </div>
    );
  };

  const addAnotherVisit = () => {
    // Check if current visit has any data (handle arrays properly)
    const hasData = Object.entries(currentVisit).some(([key, value]) => {
      if (Array.isArray(value)) {
        return value.length > 0;
      }
      return value && value.toString().trim() !== "";
    });

    if (hasData) {
      setVisits(prev => [...prev, { ...currentVisit, id: Date.now() }]);
      setCurrentVisit(getInitialVisitState());
    }
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    setSubmitError('');
    setSubmitSuccess(false);

    try {
      // Prepare visits to submit
      let visitsToSubmit = [];
      
      // Add current visit if it has data (handle arrays properly)
      const hasCurrentVisitData = Object.entries(currentVisit).some(([key, value]) => {
        if (Array.isArray(value)) {
          return value.length > 0;
        }
        return value && value.toString().trim() !== "";
      });

      if (hasCurrentVisitData) {
        visitsToSubmit = [...visits, currentVisit];
      } else if (visits.length > 0) {
        visitsToSubmit = visits;
      } else {
        setSubmitError("Please fill at least one visit form.");
        setIsSubmitting(false);
        return;
      }

      // Submit each visit to the backend
      const submitPromises = visitsToSubmit.map(async (visit) => {
        // Prepare visit data for backend
        const visitData = {
          ...visit,
          representativeName: user?.name, // Add representative name from logged-in user
          // Handle empty visitedWithCoworker - convert empty string to null
          visitedWithCoworker: visit.visitedWithCoworker && visit.visitedWithCoworker.trim() !== '' 
            ? visit.visitedWithCoworker 
            : undefined
        };

        // Debug: Log the data being sent
        console.log('Sending visit data:', visitData);

        const response = await fetch('http://localhost:5050/api/visits', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify(visitData)
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Failed to submit visit');
        }

        return response.json();
      });

      const results = await Promise.all(submitPromises);
      
      setSubmitSuccess(true);
      setVisits([]);
      setCurrentVisit(getInitialVisitState());
      setCurrentStep(1);

      console.log("Visits submitted successfully:", results);
      
    } catch (error) {
      console.error('Submit error:', error);
      setSubmitError(error.message || 'Failed to submit visits. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmitAndNext = () => {
    handleSubmit();
    // Navigate to next page - you can implement routing here
    console.log("Navigating to next page...");
  };

  const removeVisit = (id) => {
    setVisits(prev => prev.filter(visit => visit.id !== id));
  };

  const steps = [
    { id: 1, title: "Visit Information", icon: "📅" },
    { id: 2, title: "Doctor Details", icon: "👨‍⚕️" },
    { id: 3, title: "Discussion & Products", icon: "💊" },
    { id: 4, title: "Results & Follow-up", icon: "📊" },
    { id: 5, title: "Market Analysis", icon: "📈" }
  ];

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="flex items-center text-sm font-semibold text-gray-700">
                  📅 Date of Visit <span className="text-red-500 ml-1">*</span>
                </label>
                <input
                  type="date"
                  value={currentVisit.dateOfVisit}
                  onChange={(e) => handleInputChange("dateOfVisit", e.target.value)}
                  className="w-full border-2 border-gray-200 rounded-lg px-4 py-3 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
                />
              </div>

              <div className="space-y-2">
                <label className="flex items-center text-sm font-semibold text-gray-700">
                  📆 Day of Week <span className="text-red-500 ml-1">*</span>
                </label>
                <select
                  value={currentVisit.dayOfWeek}
                  onChange={(e) => handleInputChange("dayOfWeek", e.target.value)}
                  className="w-full border-2 border-gray-200 rounded-lg px-4 py-3 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
                >
                  <option value="">Select Day</option>
                  <option value="Monday">Monday</option>
                  <option value="Tuesday">Tuesday</option>
                  <option value="Wednesday">Wednesday</option>
                  <option value="Thursday">Thursday</option>
                  <option value="Friday">Friday</option>
                  <option value="Saturday">Saturday</option>
                  <option value="Sunday">Sunday</option>
                </select>
              </div>

              {/* Representative Name - Auto-populated from logged-in user */}
              <div className="space-y-2">
                <label className="flex items-center text-sm font-semibold text-gray-700">
                  👤 Representative Name
                </label>
                <div className="w-full border-2 border-gray-200 rounded-lg px-4 py-3 bg-gray-50 text-gray-700 font-medium">
                  {user?.name || 'Loading...'}
                </div>
                <p className="text-xs text-gray-500">Automatically filled from your account</p>
              </div>

              <div className="space-y-2">
                <label className="flex items-center text-sm font-semibold text-gray-700">
                  🗺️ Area / Territory <span className="text-red-500 ml-1">*</span>
                </label>
                <input
                  type="text"
                  value={currentVisit.areaTerritory}
                  onChange={(e) => handleInputChange("areaTerritory", e.target.value)}
                  className="w-full border-2 border-gray-200 rounded-lg px-4 py-3 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
                  placeholder="Enter area or territory"
                />
              </div>

              <div className="space-y-2">
                <label className="flex items-center text-sm font-semibold text-gray-700">
                  👥 Visited with Coworker (Optional)
                </label>
                <select
                  value={currentVisit.visitedWithCoworker}
                  onChange={(e) => handleInputChange("visitedWithCoworker", e.target.value)}
                  className="w-full border-2 border-gray-200 rounded-lg px-4 py-3 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
                  disabled={loadingUsers}
                >
                  <option value="">Select Coworker (Optional)</option>
                  {loadingUsers ? (
                    <option disabled>Loading users...</option>
                  ) : (
                    users.map((user) => (
                      <option key={user._id} value={user._id}>
                        {user.name} ({user.role})
                      </option>
                    ))
                  )}
                </select>
              </div>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="flex items-center text-sm font-semibold text-gray-700">
                  👨‍⚕️ Doctor / Chemist Name <span className="text-red-500 ml-1">*</span>
                </label>
                <input
                  type="text"
                  value={currentVisit.doctorChemistName}
                  onChange={(e) => handleInputChange("doctorChemistName", e.target.value)}
                  className="w-full border-2 border-gray-200 rounded-lg px-4 py-3 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
                  placeholder="Enter doctor or chemist name"
                />
              </div>

              <div className="space-y-2">
                <label className="flex items-center text-sm font-semibold text-gray-700">
                  🎓 Specialisation <span className="text-red-500 ml-1">*</span>
                </label>
                <input
                  type="text"
                  value={currentVisit.specialisation}
                  onChange={(e) => handleInputChange("specialisation", e.target.value)}
                  className="w-full border-2 border-gray-200 rounded-lg px-4 py-3 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
                  placeholder="Enter specialisation"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="flex items-center text-sm font-semibold text-gray-700">
                🎯 Purpose of Visit <span className="text-red-500 ml-1">*</span>
              </label>
              <textarea
                value={currentVisit.purposeOfVisit}
                onChange={(e) => handleInputChange("purposeOfVisit", e.target.value)}
                rows="4"
                className="w-full border-2 border-gray-200 rounded-lg px-4 py-3 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
                placeholder="Describe the purpose of your visit..."
              />
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <ProductMultiSelect 
              field="productsPromoted" 
              label="Products Promoted" 

            />

            <div className="space-y-2">
              <label className="flex items-center text-sm font-semibold text-gray-700">
                💬 Key Discussion Points <span className="text-red-500 ml-1">*</span>
              </label>
              <textarea
                value={currentVisit.keyDiscussionPoints}
                onChange={(e) => handleInputChange("keyDiscussionPoints", e.target.value)}
                rows="3"
                className="w-full border-2 border-gray-200 rounded-lg px-4 py-3 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
                placeholder="Enter key discussion points..."
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="flex items-center text-sm font-semibold text-gray-700">
                  📊 Doctor's Interest Level <span className="text-red-500 ml-1">*</span>
                </label>
                <select
                  value={currentVisit.doctorInterestLevel}
                  onChange={(e) => handleInputChange("doctorInterestLevel", e.target.value)}
                  className="w-full border-2 border-gray-200 rounded-lg px-4 py-3 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
                >
                  <option value="">Select Interest Level</option>
                  <option value="Very High">🔥 Very High</option>
                  <option value="High">⬆️ High</option>
                  <option value="Medium">➡️ Medium</option>
                  <option value="Low">⬇️ Low</option>
                  <option value="Very Low">❄️ Very Low</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="flex items-center text-sm font-semibold text-gray-700">
                  📈 Expected Monthly Volume
                </label>
                <input
                  type="number"
                  value={currentVisit.expectedMonthlyVolume}
                  onChange={(e) => handleInputChange("expectedMonthlyVolume", e.target.value)}
                  className="w-full border-2 border-gray-200 rounded-lg px-4 py-3 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
                  placeholder="Enter expected volume"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="flex items-center text-sm font-semibold text-gray-700">
                ❓ Doctor's Queries / Concerns
              </label>
              <textarea
                value={currentVisit.doctorQueries}
                onChange={(e) => handleInputChange("doctorQueries", e.target.value)}
                rows="3"
                className="w-full border-2 border-gray-200 rounded-lg px-4 py-3 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
                placeholder="Enter doctor's queries or concerns..."
              />
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-6">
            <ProductMultiSelect 
              field="productsAgreedToPrescribe" 
              label="Products Doctor Agreed to Prescribe" 
              optional={true}
            />

            <ProductMultiSelect 
              field="productsNotAgreedToPrescribe" 
              label="Products Doctor Did Not Agree to Prescribe" 
              optional={true}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="flex items-center text-sm font-semibold text-gray-700">
                  💰 Actual Orders / Sales Generated
                </label>
                <input
                  type="number"
                  value={currentVisit.actualOrdersSales}
                  onChange={(e) => handleInputChange("actualOrdersSales", e.target.value)}
                  className="w-full border-2 border-gray-200 rounded-lg px-4 py-3 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
                  placeholder="Enter actual orders/sales"
                />
              </div>

              <div className="space-y-2">
                <label className="flex items-center text-sm font-semibold text-gray-700">
                  📅 Follow-up Date
                </label>
                <input
                  type="date"
                  value={currentVisit.followUpDate}
                  onChange={(e) => handleInputChange("followUpDate", e.target.value)}
                  className="w-full border-2 border-gray-200 rounded-lg px-4 py-3 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
                />
              </div>
            </div>
          </div>
        );

      case 5:
        return (
          <div className="space-y-6">
            <div className="space-y-2">
              <label className="flex items-center text-sm font-semibold text-gray-700">
                🏢 Competitor Brands Prescribed
              </label>
              <textarea
                value={currentVisit.competitorBrands}
                onChange={(e) => handleInputChange("competitorBrands", e.target.value)}
                rows="3"
                className="w-full border-2 border-gray-200 rounded-lg px-4 py-3 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
                placeholder="List competitor brands prescribed..."
              />
            </div>

            <div className="space-y-2">
              <label className="flex items-center text-sm font-semibold text-gray-700">
                🤔 Reasons for Preferring Competitor
              </label>
              <textarea
                value={currentVisit.reasonsForPreferringCompetitor}
                onChange={(e) => handleInputChange("reasonsForPreferringCompetitor", e.target.value)}
                rows="3"
                className="w-full border-2 border-gray-200 rounded-lg px-4 py-3 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
                placeholder="Enter reasons for preferring competitor..."
              />
            </div>

            <div className="space-y-2">
              <label className="flex items-center text-sm font-semibold text-gray-700">
                📊 Market Feedback / Price Issues / Stock Problems
              </label>
              <textarea
                value={currentVisit.marketFeedback}
                onChange={(e) => handleInputChange("marketFeedback", e.target.value)}
                rows="3"
                className="w-full border-2 border-gray-200 rounded-lg px-4 py-3 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
                placeholder="Enter market feedback, price issues, or stock problems..."
              />
            </div>

            <div className="space-y-2">
              <label className="flex items-center text-sm font-semibold text-gray-700">
                ⚠️ Challenges Faced in This Visit
              </label>
              <textarea
                value={currentVisit.challengesFaced}
                onChange={(e) => handleInputChange("challengesFaced", e.target.value)}
                rows="3"
                className="w-full border-2 border-gray-200 rounded-lg px-4 py-3 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
                placeholder="Describe challenges faced during visit..."
              />
            </div>

            <div className="space-y-2">
              <label className="flex items-center text-sm font-semibold text-gray-700">
                📝 Additional Notes / Suggestions for Management
              </label>
              <textarea
                value={currentVisit.additionalNotes}
                onChange={(e) => handleInputChange("additionalNotes", e.target.value)}
                rows="4"
                className="w-full border-2 border-gray-200 rounded-lg px-4 py-3 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
                placeholder="Enter additional notes or suggestions for management..."
              />
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      <div className="max-w-5xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">Professional Visit Report</h1>
          <p className="text-gray-600">Complete your visit details step by step</p>
          {selectedDate && (
            <div className="mt-4 inline-flex items-center px-4 py-2 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
              📅 Visit Date: {selectedDate.toDateString()}
            </div>
          )}
        </div>

        {/* Success Message */}
        {submitSuccess && (
          <div className="mb-8 p-4 bg-green-50 border border-green-200 rounded-xl flex items-center">
            <div className="w-5 h-5 text-green-600 mr-3">✅</div>
            <span className="text-green-800 font-medium">Visit reports submitted successfully!</span>
          </div>
        )}

        {/* Error Message */}
        {submitError && (
          <div className="mb-8 p-4 bg-red-50 border border-red-200 rounded-xl flex items-center">
            <div className="w-5 h-5 text-red-600 mr-3">❌</div>
            <span className="text-red-800 font-medium">{submitError}</span>
          </div>
        )}

        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            {steps.map((step, index) => (
              <div key={step.id} className="flex items-center">
                <div className={`flex items-center justify-center w-12 h-12 rounded-full text-lg font-bold transition-all ${currentStep >= step.id
                  ? 'bg-blue-500 text-white shadow-lg'
                  : 'bg-gray-200 text-gray-500'
                  }`}>
                  {currentStep > step.id ? '✓' : step.icon}
                </div>
                {index < steps.length - 1 && (
                  <div className={`w-16 h-1 mx-2 transition-all ${currentStep > step.id ? 'bg-blue-500' : 'bg-gray-200'
                    }`} />
                )}
              </div>
            ))}
          </div>
          <div className="text-center">
            <h2 className="text-xl font-semibold text-gray-800">
              Step {currentStep}: {steps[currentStep - 1]?.title}
            </h2>
            <div className="text-sm text-gray-500 mt-1">
              {currentStep} of {steps.length} steps completed
            </div>
          </div>
        </div>

        {/* Saved Visits Cards */}
        {visits.length > 0 && (
          <div className="mb-8">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">📋 Saved Visits ({visits.length})</h3>
            <div className="grid gap-4">
              {visits.map((visit, index) => (
                <div key={visit.id} className="bg-white rounded-xl shadow-md p-6 border-l-4 border-green-500 hover:shadow-lg transition-shadow">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center space-x-2">
                      <span className="text-2xl">✅</span>
                      <h4 className="text-lg font-semibold text-gray-800">Visit {index + 1}</h4>
                    </div>
                    <button
                      onClick={() => removeVisit(visit.id)}
                      className="text-red-500 hover:text-red-700 hover:bg-red-50 px-3 py-1 rounded-lg transition-colors text-sm font-medium"
                    >
                      🗑️ Remove
                    </button>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                    <div className="flex items-center space-x-2">
                      <span>📅</span>
                      <span><strong>Date:</strong> {visit.dateOfVisit}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span>👨‍⚕️</span>
                      <span><strong>Doctor:</strong> {visit.doctorChemistName}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span>🎓</span>
                      <span><strong>Specialisation:</strong> {visit.specialisation}</span>
                    </div>
                    {visit.productsPromoted && visit.productsPromoted.length > 0 && (
                      <div className="col-span-full">
                        <div className="flex items-start space-x-2">
                          <span>💊</span>
                          <div>
                            <strong>Products Promoted:</strong>
                            <div className="flex flex-wrap gap-1 mt-1">
                              {visit.productsPromoted.map(productId => {
                                const product = products.find(p => p._id === productId);
                                return product ? (
                                  <span key={productId} className="inline-block px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                                    {product.name}
                                  </span>
                                ) : null;
                              })}
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Main Form */}
        <div className="bg-white rounded-xl shadow-lg p-8 mb-8">
          <div className="mb-6">
            <h3 className="text-2xl font-semibold text-gray-800 mb-2">
              {visits.length === 0 ? "New Visit Details" : `Visit ${visits.length + 1} Details`}
            </h3>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                style={{ width: `${(currentStep / steps.length) * 100}%` }}
              />
            </div>
          </div>

          {renderStepContent()}

          {/* Navigation Buttons */}
          <div className="flex justify-between items-center mt-8 pt-6 border-t border-gray-200">
            <button
              onClick={() => setCurrentStep(Math.max(1, currentStep - 1))}
              disabled={currentStep === 1}
              className={`flex items-center space-x-2 px-6 py-3 rounded-lg font-medium transition-all ${currentStep === 1
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                : 'bg-gray-500 text-white hover:bg-gray-600 shadow-md hover:shadow-lg'
                }`}
            >
              <span>←</span>
              <span>Previous</span>
            </button>

            <div className="flex space-x-3">
              {currentStep < steps.length ? (
                <button
                  onClick={() => setCurrentStep(Math.min(steps.length, currentStep + 1))}
                  className="flex items-center space-x-2 bg-blue-500 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-600 shadow-md hover:shadow-lg transition-all"
                >
                  <span>Next</span>
                  <span>→</span>
                </button>
              ) : (
                <div className="flex space-x-3">
                  <button
                    onClick={addAnotherVisit}
                    disabled={isSubmitting}
                    className="flex items-center space-x-2 bg-green-500 text-white px-6 py-3 rounded-lg font-medium hover:bg-green-600 shadow-md hover:shadow-lg transition-all disabled:opacity-50"
                  >
                    <span>➕</span>
                    <span>Add Another Visit</span>
                  </button>

                  <button
                    onClick={handleSubmit}
                    disabled={isSubmitting}
                    className="flex items-center space-x-2 bg-blue-500 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-600 shadow-md hover:shadow-lg transition-all disabled:opacity-50"
                  >
                    <span>💾</span>
                    <span>{isSubmitting ? 'Submitting...' : 'Submit'}</span>
                  </button>

                  <button
                    onClick={handleSubmitAndNext}
                    disabled={isSubmitting}
                    className="flex items-center space-x-2 bg-purple-500 text-white px-6 py-3 rounded-lg font-medium hover:bg-purple-600 shadow-md hover:shadow-lg transition-all disabled:opacity-50"
                  >
                    <span>🚀</span>
                    <span>Submit & Next</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}