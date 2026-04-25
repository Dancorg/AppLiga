// @ts-check
import { test, expect } from '@playwright/test';

const localhost = 'http://localhost:3000';


test.afterEach(async ({ request }) => {
  // clean up the usual 4 test users we create in the tests
  await deleteUser(`test@example.com`, request);
  await deleteUser(`test2@example.com`, request);
  await deleteUser(`test3@example.com`, request);
  await deleteUser(`test4@example.com`, request);
  await deleteUser(`test5@example.com`, request);
  await deleteUser(`test6@example.com`, request);
  // clean up any leagues that might have been created in the tests
  const leagueResponse = await request.get(`${localhost}/api/leagues`);  
  const leagues = await leagueResponse.json();
  for (const league of leagues) {
    if (league.name.startsWith(`Test League`)) {
      //console.log(`Deleting league with id:`, league.league_id, `and name:`, league.name);
      await request.delete(`${localhost}/api/leagues/${league.league_id}`);
    }
  }
  // clean up any dates that might have been created in the tests
  const dateResponse = await request.get(`${localhost}/api/dates`);
  const dates = await dateResponse.json();
  const dates_to_delete = dates.map((date) => date.date_date.startsWith('2024-12-'));
  for (const date of dates_to_delete) {
    await request.delete(`${localhost}/api/dates/${date.date_id}`);
  }
  // clean up any matches that might have been created in the tests
  const matchResponse = await request.get(`${localhost}/api/matches`);
  const matches = await matchResponse.json();
  //console.log('matches: ', matches);
  for (const match of matches) {
    if (match.date_id in dates_to_delete.map((date)=>date.date_id)) { 
      await request.delete(`${localhost}/api/matches/${match.id}`);
    }
  }
});


// create user support functions
async function createUser(email, username, password, role, request) {
  const response = await request.post(`${localhost}/api/auth/register`, {
    data: {
      email: email,
      username: username,
      password: password,
      role: role
    }
  });
  return response;
}

// delete user support function
async function deleteUser(email, request) {
  await request.delete(`${localhost}/api/auth/delete`, {
    data: {
      email: email
    }
  });
}

// user login support function, returns a token for the user
async function loginUser(email, password, request) {
  const response = await request.post(`${localhost}/api/auth/login`, {
    data: {
      email: email,
      password: password
    }
  });
  const responseData = await response.json();
  expect(responseData).toHaveProperty(`token`);
  return responseData;
}


// create league support function
async function createLeague(name, request) {
  const response = await request.post(`${localhost}/api/leagues/create`, {
    data: {
      name: name,
    }
  });
  return response;
}




test(`create user`, async ({ request }) => {
  const response = await createUser(`test@example.com`, `testuser`, `password123`, `admin`, request);
  console.log(`Create user response:`, await response.json());
  expect(response.status()).toBe(201);
  const responseData = await response.json();
  expect(responseData).toHaveProperty(`token`);
});

test(`login user`, async ({ request }) => {
  // create user first
  await createUser(`test@example.com`, `testuser`, `password123`, `admin`, request);

  const response = await request.post(`${localhost}/api/auth/login`, {
    data: {
      email: `test@example.com`,
      password: `password123`
    }
  });

  expect(response.status()).toBe(200);
  const responseData = await response.json();
  expect(responseData).toHaveProperty(`token`);
});

test(`login user invalid password`, async ({ request }) => {
  // create user first
  await createUser(`test@example.com`, `testuser`, `password123`, `admin`, request);

  const response = await request.post(`${localhost}/api/auth/login`, {
    data: {
      email: `test@example.com`,
      password: `wrongpassword`
    }
  });

  expect(response.status()).toBe(400);
  const responseData = await response.json();
  expect(responseData).toHaveProperty(`message`, `Invalid email or password`);
});

test(`login user non-existent email`, async ({ request }) => { // same as non-existent user but more specific
  const response = await request.post(`${localhost}/api/auth/login`, {
    data: {
      email: `nonexistent@example.com`,
      password: `password123`
    }
  });

  expect(response.status()).toBe(400);
  const responseData = await response.json();
  expect(responseData).toHaveProperty(`message`, `Invalid email or password`);
});

test(`register user already exists`, async ({ request }) => {
  // First, register the user
  await createUser(`test@example.com`, `testuser`, `password123`, `admin`, request);

  // Now, try to register the same user again
  const response = await request.post(`${localhost}/api/auth/register`, {
    data: {
      email: `test@example.com`,
      username: `testuser`,
      password: `password123`,
      role: `admin`
    }
  });

  expect(response.status()).toBe(400);
  const responseData = await response.json();
  expect(responseData).toHaveProperty(`message`, `User already exists`);
});

test(`register user missing email`, async ({ request }) => {
  const response = await request.post(`${localhost}/api/auth/register`, {
    data: {
      username: `testuser`,
      password: `password123`,
      role: `admin`
    }
  });

  expect(response.status()).toBe(400);
  const responseData = await response.json();
  expect(responseData).toHaveProperty(`message`, `Invalid email format`);
});

test(`register user missing password`, async ({ request }) => {
  const response = await request.post(`${localhost}/api/auth/register`, {
    data: {
      email: `test@example.com`,
      username: `testuser`,
      password: ``,
      role: `admin`
    }
  });

  expect(response.status()).toBe(400);
  const responseData = await response.json();
  expect(responseData).toHaveProperty(`message`, `Password must be at least 8 characters long and include both letters and numbers`);
});

test(`register user missing username`, async ({ request }) => {
  const response = await request.post(`${localhost}/api/auth/register`, {
    data: {
      email: `test@example.com`,
      username: ``,
      password: `password123`,
      role: `admin`
    }
  });

  expect(response.status()).toBe(400);
  const responseData = await response.json();
  expect(responseData).toHaveProperty(`message`, `Username and role are required`);
});

test(`register user missing role`, async ({ request }) => {
  const response = await request.post(`${localhost}/api/auth/register`, {
    data: {
      email: `test@example.com`,
      username: `testuser`,
      password: `password123`,
      role: ``
    }
  });

  expect(response.status()).toBe(400);
  const responseData = await response.json();
  expect(responseData).toHaveProperty(`message`, `Username and role are required`);
});

test(`create league`, async ({ request }) => {
  // don`t need a user to create a league
  const response = await request.post(`${localhost}/api/leagues/create`, {
    data: {
      name: `Test League Create`    }
  });

  expect(response.status()).toBe(201);
  const responseData = await response.json();
  expect(responseData).toHaveProperty(`league_id`);
  expect(responseData).toHaveProperty(`name`, `Test League Create`);
});

test(`delete league`, async ({ request }) => {
  // create a league first to delete
  const response = await request.post(`${localhost}/api/leagues/create`, {
    data: {
      name: `Test League Delete`
    }
  });

  const responseData = await response.json();

  // now delete the league
  const deleteResponse = await request.delete(`${localhost}/api/leagues/${responseData.league_id}`);

  expect(deleteResponse.status()).toBe(200);
  const deleteResponseData = await deleteResponse.json();
  expect(deleteResponseData).toHaveProperty(`message`, `League deleted successfully`);
});

test(`join league`, async ({ request }) => {
  // create a user and a league first to join
  await createUser(`test@example.com`, `testuser`, `password123`, `admin`, request);

  const leagueResponse = await request.post(`${localhost}/api/leagues/create`, {
    data: {
      name: `Test League Join`
    }
  });

  // get the token for the created user
  const loginResponse = await request.post(`${localhost}/api/auth/login`, {
    data: {
      email: `test@example.com`,
      password: `password123`
    }
  });
  //console.log(`login response token: `, await loginResponse.json());

  const { token } = await loginResponse.json();
  //console.log(`Token for joining league:`, { token });

  const leagueData = await leagueResponse.json();

  // now join the league
  const joinResponse = await request.post(`${localhost}/api/leagues/${leagueData.league_id}/join`, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });

  expect(joinResponse.status()).toBe(200);
  const joinResponseData = await joinResponse.json();
  expect(joinResponseData).toHaveProperty(`message`, `Joined league successfully`);
});

test(`join league without token`, async ({ request }) => {
  // create a league first to join
  const leagueResponse = await request.post(`${localhost}/api/leagues/create`, {
    data: {
      name: `Test League Join No Token`,
    }
  });

  const leagueData = await leagueResponse.json();

  // now try to join the league without a token
  const joinResponse = await request.post(`${localhost}/api/leagues/${leagueData.id}/join`);

  expect(joinResponse.status()).toBe(401);
  const joinResponseData = await joinResponse.json();
  expect(joinResponseData).toHaveProperty(`message`, `Unauthorized`);
});

test(`create date for league`, async ({ request }) => {
  // create a user and a league first to create a date for the league
  await createUser(`test@example.com`, `testuser`, `password123`, `admin`, request);

  const leagueResponse = await createLeague(`Test League Date`, request);
  const leagueData = await leagueResponse.json();

  // get the token for the created user
  const loginResponse = await request.post(`${localhost}/api/auth/login`, {
    data: {
      email: `test@example.com`,
      password: `password123`
    }
  });
  const { token } = await loginResponse.json();

  // now create a date for the league
  const dateResponse = await request.post(`${localhost}/api/leagues/${leagueData.league_id}/dates`, {
    headers: {
      Authorization: `Bearer ${token}`
    }, data: {
      date_date: `2024-12-01`
    }
  });

  expect(dateResponse.status()).toBe(201);
  const dateResponseData = await dateResponse.json();
  expect(dateResponseData).toHaveProperty(`date_id`);
});

test(`create match`, async ({ request }) => { // this test is too long and should be broken down into smaller tests but it covers the flow of creating a match which requires multiple steps and entities
  // create two users and a league first to create a match
  await createUser(`test1@example.com`, `testuser1`, `password123`, `admin`, request);
  await createUser(`test2@example.com`, `testuser2`, `password123`, `admin`, request);
  await createUser(`test3@example.com`, `testuser3`, `password123`, `admin`, request);
  await createUser(`test4@example.com`, `testuser4`, `password123`, `admin`, request);
  await createUser(`test5@example.com`, `testuser5`, `password123`, `admin`, request);
  await createUser(`test6@example.com`, `testuser6`, `password123`, `admin`, request);
  

  // create a league using the support function
  const leagueResponse = await createLeague(`Test League Match`, request);
  const leagueData = await leagueResponse.json();

  // get tokens
  const { token: token1 } = await loginUser('test1@example.com','password123', request);
  const { token: token2 } = await loginUser('test2@example.com','password123', request);
  const { token: token3 } = await loginUser('test3@example.com','password123', request);
  const { token: token4 } = await loginUser('test4@example.com','password123', request);
  const { token: token5 } = await loginUser('test5@example.com','password123', request);
  const { token: token6 } = await loginUser('test6@example.com','password123', request);

  // enroll all users in the league
  await request.post(`${localhost}/api/leagues/${leagueData.league_id}/join`, {
    headers: {
      Authorization: `Bearer ${token1}`
    }
  });
  await request.post(`${localhost}/api/leagues/${leagueData.league_id}/join`, {
    headers: {
      Authorization: `Bearer ${token2}`
    }
  });
  await request.post(`${localhost}/api/leagues/${leagueData.league_id}/join`, {
    headers: {
      Authorization: `Bearer ${token3}`
    }
  });
  await request.post(`${localhost}/api/leagues/${leagueData.league_id}/join`, {
    headers: {
      Authorization: `Bearer ${token4}`
    }
  });
  await request.post(`${localhost}/api/leagues/${leagueData.league_id}/join`, {
    headers: {
      Authorization: `Bearer ${token5}`
    }
  });
  await request.post(`${localhost}/api/leagues/${leagueData.league_id}/join`, {
    headers: {
      Authorization: `Bearer ${token6}`
    }
  });

  // create a date for the league first since matches require a date
  const dateResponse = await request.post(`${localhost}/api/leagues/${leagueData.league_id}/dates/`, {
    headers: {
      Authorization: `Bearer ${token1}`
    }, data: {
      date_date: `2024-12-01`
    }
  });
  console.log(`Date creation response:`, await dateResponse.json());

  expect(dateResponse.status()).toBe(201);
  const dateResponseData = await dateResponse.json();
  expect(dateResponseData).toHaveProperty(`date_id`);

  // enroll all users in the date
  const participateResponse1 = await request.post(`${localhost}/api/dates/${dateResponseData.date_id}/join`, {
    headers: {
      Authorization: `Bearer ${token1}`
    }
  });
  expect(participateResponse1.status()).toBe(201);

  const participateResponse2 = await request.post(`${localhost}/api/dates/${dateResponseData.date_id}/join`, {
    headers: {
      Authorization: `Bearer ${token2}`
    }
  });
  expect(participateResponse2.status()).toBe(201);
  const participateResponse3 = await request.post(`${localhost}/api/dates/${dateResponseData.date_id}/join`, {
    headers: {
      Authorization: `Bearer ${token3}`
    }
  });
  expect(participateResponse3.status()).toBe(201);

  const participateResponse4 = await request.post(`${localhost}/api/dates/${dateResponseData.date_id}/join`, {
    headers: {
      Authorization: `Bearer ${token4}`
    }
  });
  expect(participateResponse4.status()).toBe(201);
  const participateResponse5 = await request.post(`${localhost}/api/dates/${dateResponseData.date_id}/join`, {
    headers: {
      Authorization: `Bearer ${token5}`
    }
  });
  expect(participateResponse5.status()).toBe(201);

  const participateResponse6 = await request.post(`${localhost}/api/dates/${dateResponseData.date_id}/join`, {
    headers: {
      Authorization: `Bearer ${token6}`
    }
  });
  expect(participateResponse6.status()).toBe(201);

  console.log(`date id for match creation:`, dateResponseData.date_id, `league id:`, leagueData.league_id);

  // now create a match for that date
  const matchResponse = await request.post(
    `${localhost}/api/leagues/dates/${dateResponseData.date_id}/matches`, {
    headers: {
      Authorization: `Bearer ${token1}`
    }
  });
  console.log(`Match creation response:`, await matchResponse.json());

  expect(matchResponse.status()).toBe(201);
  const matchResponseData = await matchResponse.json();
  matchResponseData.forEach(match => {
    expect(match).toHaveProperty(`matchId`);
    expect(match).toHaveProperty(`player1`);
    expect(match).toHaveProperty(`player2`);
  });
});

test(`create and resolve match`, async ({request}) => {
  await createUser(`test1@example.com`, `testuser1`, `password123`, `admin`, request);
  await createUser(`test2@example.com`, `testuser2`, `password123`, `admin`, request);

  const leagueResponse = await createLeague(`Test League Date`, request);
  const leagueData = await leagueResponse.json();

  // get tokens
  const { token: token1 } = await loginUser('test1@example.com','password123', request);
  const { token: token2 } = await loginUser('test2@example.com','password123', request);

  await request.post(`${localhost}/api/leagues/${leagueData.league_id}/join`, {
    headers: {
      Authorization: `Bearer ${token1}`
    }
  });
  await request.post(`${localhost}/api/leagues/${leagueData.league_id}/join`, {
    headers: {
      Authorization: `Bearer ${token2}`
    }
  });

  const dateResponse = await request.post(`${localhost}/api/leagues/${leagueData.league_id}/dates/`, {
    headers: {
      Authorization: `Bearer ${token1}`
    }, data: {
      date_date: `2024-12-01`
    }
  });
  const dateResponseData = await dateResponse.json();

  const participateResponse1 = await request.post(`${localhost}/api/dates/${dateResponseData.date_id}/join`, {
    headers: {
      Authorization: `Bearer ${token1}`
    }
  });
  expect(participateResponse1.status()).toBe(201);

  const participateResponse2 = await request.post(`${localhost}/api/dates/${dateResponseData.date_id}/join`, {
    headers: {
      Authorization: `Bearer ${token2}`
    }
  });
  expect(participateResponse2.status()).toBe(201);

  const matchResponse = await request.post(
    `${localhost}/api/leagues/dates/${dateResponseData.date_id}/matches`, {
    headers: {
      Authorization: `Bearer ${token1}`
    }
  });
  const matchResponseData = await matchResponse.json();
  console.log("Match response", matchResponseData);
  matchResponseData.forEach(match => {
    expect(match).toHaveProperty(`matchId`);
    expect(match).toHaveProperty(`player1`);
    expect(match).toHaveProperty(`player2`);
  });

  // Submit score
  const scoreResponse = await request.post(`${localhost}/api/matches/${matchResponseData[0].matchId}/score`, {
    data: {
      player1_hits: 3,
      player2_hits: 2
    }
  });
  console.log('Score creation response: ', await scoreResponse.json());

  const scoreResponseData = await scoreResponse.json();
  expect(scoreResponseData).toHaveProperty('results');
});