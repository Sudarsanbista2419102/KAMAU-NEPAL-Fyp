// Test script to verify professional registration
const testRegistration = async () => {
  const formData = new FormData();
  
  // Add form data
  formData.append('firstName', 'John');
  formData.append('lastName', 'Doe');
  formData.append('username', 'johndoe' + Date.now());
  formData.append('email', 'john' + Date.now() + '@example.com');
  formData.append('phone', '9841234567');
  formData.append('serviceCategory', 'plumbing');
  formData.append('serviceArea', 'thamel');
  formData.append('hourlyWage', '500');
  formData.append('bio', 'Experienced plumber');

  try {
    const response = await fetch('http://localhost:5000/api/professionals/register', {
      method: 'POST',
      body: formData
    });

    const data = await response.json();
    console.log('Response Status:', response.status);
    console.log('Response Data:', data);

    if (response.ok) {
      console.log('✅ Registration successful!');
    } else {
      console.log('❌ Registration failed');
    }
  } catch (error) {
    console.error('Error:', error);
  }
};

testRegistration();
