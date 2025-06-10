const interests = [
  'Photography', 'Travel', 'Cooking', 'Fitness', 'Reading', 'Music', 'Art', 'Technology',
  'Sports', 'Gaming', 'Fashion', 'Food', 'Nature', 'Movies', 'Books', 'DIY', 'Pets',
  'Yoga', 'Dancing', 'Writing', 'Hiking', 'Cycling', 'Swimming', 'Running', 'Meditation'
];

const professions = [
  'Software Engineer', 'Marketing Manager', 'Graphic Designer', 'Teacher', 'Nurse',
  'Sales Representative', 'Project Manager', 'Data Analyst', 'Consultant', 'Writer',
  'Photographer', 'Chef', 'Architect', 'Lawyer', 'Doctor', 'Accountant', 'Engineer'
];

const companies = [
  'Tech Solutions Inc', 'Global Marketing Co', 'Creative Studios', 'HealthCare Plus',
  'Education First', 'Innovation Labs', 'Digital Agency', 'Consulting Group',
  'Design House', 'Media Company', 'StartUp Inc', 'Enterprise Solutions'
];

const universities = [
  'State University', 'Tech Institute', 'Business College', 'Community College',
  'Design Academy', 'Medical School', 'Engineering University', 'Liberal Arts College'
];

const getRandomItems = (array, count) => {
  const shuffled = array.sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
};

const getRandomNumber = (min, max) => {
  return Math.floor(Math.random() * (max - min + 1)) + min;
};

export const generateSocialMediaProfiles = (profile) => {
  const userInterests = getRandomItems(interests, getRandomNumber(3, 8));
  const profession = professions[Math.floor(Math.random() * professions.length)];
  const company = companies[Math.floor(Math.random() * companies.length)];
  const university = universities[Math.floor(Math.random() * universities.length)];
  
  const baseUsername = `${profile.firstName.toLowerCase()}${profile.lastName.toLowerCase()}`;
  const variations = [
    baseUsername,
    `${baseUsername}${getRandomNumber(10, 99)}`,
    `${profile.firstName.toLowerCase()}_${profile.lastName.toLowerCase()}`,
    `${profile.firstName.toLowerCase()}.${profile.lastName.toLowerCase()}`,
    `${baseUsername}_${getRandomNumber(1000, 9999)}`
  ];
  
  const platforms = [
    {
      platform: 'Facebook',
      username: variations[0],
      bio: `${profession} at ${company}. Love ${userInterests.slice(0, 3).join(', ')}. ${profile.city}, ${profile.country}`,
      followers: getRandomNumber(150, 800),
      following: getRandomNumber(200, 600),
      postsCount: getRandomNumber(50, 300),
      interests: userInterests,
      data: {
        workHistory: [
          { company, position: profession, duration: `${getRandomNumber(1, 5)} years` }
        ],
        education: [
          { school: university, degree: 'Bachelor\'s Degree', field: 'Related Field' }
        ],
        relationship: ['Single', 'In a relationship', 'Married'][Math.floor(Math.random() * 3)],
        hometown: `${profile.city}, ${profile.country}`,
        languages: ['English', 'Native Language'],
        groups: getRandomItems([
          'Local Photography Group', 'Fitness Enthusiasts', 'Book Club',
          'Tech Professionals', 'Travel Lovers', 'Food Enthusiasts'
        ], getRandomNumber(2, 4))
      }
    },
    {
      platform: 'Instagram',
      username: variations[1],
      bio: `${userInterests.slice(0, 2).join(' & ')} enthusiast 📸 ${profile.city} 🌍 ${profession}`,
      followers: getRandomNumber(300, 1500),
      following: getRandomNumber(400, 800),
      postsCount: getRandomNumber(20, 150),
      interests: userInterests,
      data: {
        contentThemes: getRandomItems([
          'Lifestyle', 'Food', 'Travel', 'Fashion', 'Fitness', 'Art', 'Nature', 'Pets'
        ], getRandomNumber(2, 4)),
        hashtagsUsed: getRandomItems([
          '#photography', '#travel', '#food', '#fitness', '#art', '#nature',
          '#lifestyle', '#fashion', '#instagood', '#photooftheday'
        ], getRandomNumber(5, 8)),
        avgLikes: getRandomNumber(20, 100),
        avgComments: getRandomNumber(2, 15)
      }
    },
    {
      platform: 'Twitter',
      username: variations[2],
      bio: `${profession} | ${userInterests.slice(0, 2).join(' & ')} | ${profile.city} | Opinions are my own`,
      followers: getRandomNumber(100, 600),
      following: getRandomNumber(200, 800),
      postsCount: getRandomNumber(100, 1000),
      interests: userInterests,
      data: {
        tweetTypes: ['Personal thoughts', 'Industry news', 'Retweets', 'Photos'],
        avgTweetsPerDay: getRandomNumber(2, 10),
        topicsDiscussed: getRandomItems([
          'Technology', 'Current Events', 'Industry News', 'Personal Life',
          'Hobbies', 'Travel', 'Food', 'Sports'
        ], getRandomNumber(3, 5)),
        postingTimes: ['Morning', 'Lunch', 'Evening']
      }
    },
    {
      platform: 'LinkedIn',
      username: variations[0],
      bio: `${profession} at ${company} | ${userInterests.slice(0, 2).join(' & ')} | ${profile.city}, ${profile.country}`,
      followers: getRandomNumber(200, 1000),
      following: getRandomNumber(300, 700),
      postsCount: getRandomNumber(10, 50),
      interests: userInterests.filter(i => ['Technology', 'Business', 'Marketing'].includes(i)),
      data: {
        currentPosition: {
          title: profession,
          company: company,
          duration: `${getRandomNumber(1, 5)} years`,
          location: `${profile.city}, ${profile.country}`
        },
        previousJobs: [
          {
            title: 'Junior ' + profession,
            company: 'Previous Company',
            duration: `${getRandomNumber(1, 3)} years`
          }
        ],
        education: [
          {
            school: university,
            degree: 'Bachelor\'s Degree',
            field: 'Related Field',
            graduationYear: new Date().getFullYear() - getRandomNumber(5, 15)
          }
        ],
        skills: getRandomItems([
          'Project Management', 'Communication', 'Leadership', 'Analytics',
          'Problem Solving', 'Teamwork', 'Strategic Planning', 'Innovation'
        ], getRandomNumber(5, 8)),
        endorsements: getRandomNumber(10, 50),
        connections: getRandomNumber(200, 800)
      }
    }
  ];
  
  return platforms;
};