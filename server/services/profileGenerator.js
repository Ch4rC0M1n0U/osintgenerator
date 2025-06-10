import axios from 'axios';
import { v4 as uuidv4 } from 'uuid';

export const generateProfile = async (options = {}) => {
  try {
    const { nationality, gender, minAge, maxAge } = options;
    
    // Build randomuser.me API URL
    let apiUrl = 'https://randomuser.me/api/';
    const params = new URLSearchParams();
    
    if (nationality) params.append('nat', nationality);
    if (gender) params.append('gender', gender);
    
    if (params.toString()) {
      apiUrl += '?' + params.toString();
    }
    
    const response = await axios.get(apiUrl);
    const userData = response.data.results[0];
    
    // Filter by age if specified
    const userAge = userData.dob.age;
    if (minAge && userAge < minAge) {
      return generateProfile(options); // Retry
    }
    if (maxAge && userAge > maxAge) {
      return generateProfile(options); // Retry
    }
    
    // Transform the data
    const profile = {
      id: uuidv4(),
      firstName: userData.name.first,
      lastName: userData.name.last,
      email: userData.email,
      phone: userData.phone,
      gender: userData.gender,
      nationality: userData.nat,
      age: userAge,
      photoUrl: userData.picture.large,
      address: `${userData.location.street.number} ${userData.location.street.name}`,
      city: userData.location.city,
      state: userData.location.state,
      country: userData.location.country,
      postcode: userData.location.postcode.toString(),
      dateOfBirth: userData.dob.date,
      registeredDate: userData.registered.date
    };
    
    return profile;
  } catch (error) {
    console.error('Error generating profile:', error);
    throw new Error('Failed to generate profile from randomuser.me API');
  }
};