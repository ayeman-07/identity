const testStatusUpdate = async () => {
  const token = localStorage.getItem('token');
  
  try {
    const response = await fetch('/api/case/ed6801af-b453-40dc-9c8d-50f71ef90351/status', {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ status: 'DESIGNING' })
    });
    
    const data = await response.text();
    console.log('Response status:', response.status);
    console.log('Response data:', data);
    
    if (!response.ok) {
      console.error('Error response:', data);
    }
  } catch (error) {
    console.error('Fetch error:', error);
  }
};

// Run the test
testStatusUpdate();
