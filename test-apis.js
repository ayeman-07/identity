// Test script to check API endpoints
async function testAPIs() {
  const baseURL = 'http://localhost:3001';
  
  // You'll need to replace this with a valid JWT token from your application
  const token = 'your-jwt-token-here';
  
  const headers = {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  };

  try {
    console.log('Testing /api/labs...');
    const labsResponse = await fetch(`${baseURL}/api/labs`, { headers });
    const labsData = await labsResponse.text();
    console.log('Labs Response:', labsResponse.status, labsData);

    console.log('\nTesting /api/labs/discover...');
    const discoverResponse = await fetch(`${baseURL}/api/labs/discover`, { headers });
    const discoverData = await discoverResponse.text();
    console.log('Discover Response:', discoverResponse.status, discoverData);

    console.log('\nTesting /api/labs/favorites...');
    const favoritesResponse = await fetch(`${baseURL}/api/labs/favorites`, { headers });
    const favoritesData = await favoritesResponse.text();
    console.log('Favorites Response:', favoritesResponse.status, favoritesData);

  } catch (error) {
    console.error('Test error:', error);
  }
}

// Note: You need to get a valid token from your app first
console.log('To test APIs, you need to:');
console.log('1. Login to your app at http://localhost:3001');
console.log('2. Get the JWT token from localStorage');
console.log('3. Replace "your-jwt-token-here" in this script');
console.log('4. Run: node test-apis.js');

// testAPIs();
