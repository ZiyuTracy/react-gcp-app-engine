import React, {useEffect, useState } from 'react';
import User from './User';
import axios from 'axios';
import './App.css';

function App() {
  const [showConfetti, setShowConfetti] = useState(false);
  const [showImage, setShowImage] = useState(true);
  // const [currentIndex, setCurrentIndex] = useState(0);
  const [buttonText, setButtonText] = useState('Play it!');
  const [phrases, setPhrases] = useState([]);
  const [randomPhrase, setRandomPhrase] = useState('');
  const [hiddenPhrase, setHiddenPhrase] = useState('');
  const [userGuess, setUserGuess] = useState('');
  const [guessedLetters, setGuessedLetters] = useState([]);
  const [feedback, setFeedback] = useState('');
  const [score, setScore] = useState(100);
  const [handle, setHandle] = useState(''); // New state for user ID
  const [googleId, setGoogleId] = useState('');
  const [login, setLogin] = useState(false); // New state to track if ID is entered
  const [enterId, setEnteredId] = useState(false);
  const [feedbackId, setFeedbackId] = useState('');
  const [userRecords, setUserRecords] = useState([]);
  const [allRecords, setAllRecords] = useState([]);
  const [playNxt, setPlayNxt] = useState(false);
  const [error, setError] = useState(null);
  const [users, setUsers] = useState([]);
  const [gamePlayed, setGamePlayed] = useState(false);
  const [userHandles, setUserHandles] = useState({});



  const fetchAllGameRecords = async () => {
    try {
      const response = await axios.get('https://wheeloffortune-406623.ue.r.appspot.com/findAllGames');
      setAllRecords(response.data);

      // Extract unique Google IDs
      const uniqueGoogleIds = Array.from(new Set(response.data.map(record => record.googleId)));

      // Fetch user handles for each unique Google ID
      const handlePromises = uniqueGoogleIds.map(async (googleId) => {
        const userResponse = await axios.get(`https://wheeloffortune-406623.ue.r.appspot.com/findByGoogleId?googleId=${googleId}`);
        return { googleId, handle: userResponse.data[0]?.handle || 'Unknown' };
        console.log(userResponse);

      });
      
      // Wait for all handle promises to resolve
      const handles = await Promise.all(handlePromises);

      // Create a mapping of Google IDs to handles
      const handlesMap = {};
      handles.forEach((item) => {
        handlesMap[item.googleId] = item.handle;
      });

      // Update the userHandles state
      setUserHandles(handlesMap);
    } catch (error) {
      console.error('Error fetching all game records:', error);
    }
  };

  // get all game records
  useEffect(() => {
    fetchAllGameRecords();
  }, []);

  //update gooogle id and login status when user login
  const HandleLogin = (user) => {
    if (user) {
      setGoogleId(user.uid);
      setLogin(true);
    } else {
      setGoogleId('');
      setLogin(false);
      setEnteredId(false);
    }

  };

  //get user records when user login
  useEffect(() => {
    if (googleId) {
      fetchUserListByGoogleId();
    }
  }, [googleId]);

  
  const play = () => {
    if (!login){
      // setButtonText('Play it!');
      setFeedbackId("Please Sign in first.")
    }
    else {
      if (buttonText === 'Quit Game') {
        // Reset the game state
        setRandomPhrase('');
        setHiddenPhrase('');
        setUserGuess('');
        setGuessedLetters([]);
        setFeedback('');
        
        
        setScore(100);
      }
      setRandomPhrase(getRandomPhrase());
      setHiddenPhrase(getHiddenPhrase(randomPhrase));
      setShowImage(current => !current);
      setButtonText((prevText) => (prevText === 'Play it!' ? 'Quit Game' : 'Play it!'));
      setFeedbackId('');
      setPlayNxt(false);
      setGamePlayed(false);
      
    }
  };

  // save handle name and score to user database and game database
  async function save() {
    if (!gamePlayed) {
      console.log("play");
      const postData = {
        googleId,
        handle,
      };
      const postGameData = {
        googleId,
        score,
        date: new Date().toISOString().split('T')[0], 
      };
  
      console.log(postGameData);
      try {
        await axios.post('https://wheeloffortune-406623.ue.r.appspot.com/saveUser', postData);
        await axios.post('https://wheeloffortune-406623.ue.r.appspot.com/saveGame', postGameData);
  
        // Fetch the updated user record
        const response = await axios.get(`https://wheeloffortune-406623.ue.r.appspot.com/findGameByGoogleId?googleId=${googleId}`);
        setUserRecords(response.data);
        
        // setAllRecords(allResponse.data);
        fetchAllGameRecords();
        setGamePlayed(true); // Set the gamePlayed state to true after saving
      } catch (error) {
        console.error('Error posting data:', error);
      }
    } else {
      console.log('Game already played and saved.');
    }
  }
  
  //after succeeding, play next game, reintilize varaibles
  const playnext = () => {
    setRandomPhrase(getRandomPhrase());
    setHiddenPhrase(getHiddenPhrase(randomPhrase));
    setFeedbackId('');
    setUserGuess('');
    setGuessedLetters([]);
    setFeedback('');
    setScore(100);
    setPlayNxt(false);
    setGamePlayed(false);
  }

  //get handle from new user
  const handleIdChange = (event) => {
    setHandle(event.target.value);
    setEnteredId(true);
  };

  //update new handle
  const newHandleIdChange = (event) => {
    setHandle(event.target.value);
    setEnteredId(true);
  };

  //get guess
  const handleGuessChange = (event) => {
    setUserGuess(event.target.value);
  };


  useEffect(() => {
    // Fetch phrases from the server (replace with your server URL or local path)
    fetch('/phrases.txt')
      .then(response => response.text())
      .then(data => setPhrases(data.split('\n').filter(Boolean))) // Split lines and filter out empty lines
      .catch(error => console.error('Error fetching phrases:', error));
      // console.log(phrases)
  }, []);

  // get hidden phrase
  useEffect(() => {
    setHiddenPhrase(getHiddenPhrase(randomPhrase));
  }, [randomPhrase]);

  //get random phrase
  function getRandomPhrase() {
    const randomIndex = Math.floor(Math.random() * phrases.length);
    return phrases[randomIndex];
  }

  //replace charactor by star
  function getHiddenPhrase(p) {
    return p.replace(/[a-zA-Z]/g, '*');

  }

  // check guess
  function check() {
    if (userGuess.length === 1 && /^[a-zA-Z]$/.test(userGuess)) {
      const guessChar = userGuess.toLowerCase();

      if (guessedLetters.includes(guessChar)) {
        setFeedback('You already guessed this character');
        return;
      }

      let updatedHiddenPhrase = '';
      let guessCorrect = false;

      for (let i = 0; i < randomPhrase.length; i++) {
        const character = randomPhrase[i].toLowerCase();
        const guessed = guessedLetters.includes(character);

        if (guessed || guessChar === character || character === ' ') {
          updatedHiddenPhrase += randomPhrase[i];
          if (guessChar === character) {
            guessCorrect = true;
          }
        } else {
          updatedHiddenPhrase += '*';
        }
      }

      setHiddenPhrase(updatedHiddenPhrase);

      if (guessCorrect) {
        setFeedback('You guessed correctly!');
        if (!updatedHiddenPhrase.includes('*')) {
          setFeedback('Congratulations! You win!');
          setShowConfetti(true);
          setPlayNxt(true);

          setTimeout(() => {
            setShowConfetti(false);
          }, 3000); 
        }
      } else {
        setFeedback("It's not correct.");
        setScore(score-1)
      }

      setGuessedLetters((prevGuessed) => [...prevGuessed, guessChar]);
      setUserGuess('');
    }
  }

  //update new handle in database
  const submit = async (event) => {
    try {
      const response = await axios.put(`https://wheeloffortune-406623.ue.r.appspot.com/updateHandle?googleId=${googleId}&newHandle=${handle}`);
      fetchAllGameRecords();
    } catch (error) {
      console.error('Error updating handle:', error);
    }
  };

  // delete all user records
  const deleteRecods = async (event) => {
    try {
      await axios.delete(`https://wheeloffortune-406623.ue.r.appspot.com/deleteByGoogleId?googleId=${googleId}`);
      setUserRecords([]);
      fetchAllGameRecords();
    } catch (error) {
      console.error('Error updating handle:', error);
    }
  };


  const fetchUserListByGoogleId = async () => {
    try {
      
      const response = await axios.get(`https://wheeloffortune-406623.ue.r.appspot.com/findByGoogleId?googleId=${googleId}`);
      const gameresponse = await axios.get(`https://wheeloffortune-406623.ue.r.appspot.com/findGameByGoogleId?googleId=${googleId}`);
      setUserRecords(gameresponse.data);
      const userList = response.data;
      console.log(userList);
      if (userList.length === 0) {
        setEnteredId(false);
        console.log("User ID not found");
      } else {
        setEnteredId(true);
        setHandle(userList[0].handle);
        console.log("User ID found");
      }
    } catch (error) {
      setError(error.message);
      console.error('Error fetching user list by Google ID:', error);
    }
  };

  return (
    <div className="App">
      <header className="App-header" >
        <h1>Wheel Of Fortune</h1>
        <div id = "records">
          <div id = "userrecords">
            <h3>User Records</h3>
            <div id = "delete">
            <button onClick={deleteRecods}>Delete</button>
            </div>
            {login&&
            <table>
              <thead>
                <tr>
                  <th>User ID</th>
                  <th>Score</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {userRecords
                .slice() // Create a copy of the array
                .sort((a, b) => b.score - a.score)
                .map((record, index) => (
                  <tr key={index}>
                    <td>{handle}</td>
                    <td>{record.score}</td>
                    <td>{record.date}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            }
        
          </div>
          <div id="wheel-container">
          {showImage ? (
            <>
              <div id="image">
              <img id="wheel" src="https://thetrainingarcade.com/wp-content/uploads/2020/11/WOF-EXTENDED-logo.png" alt="Wheel of Fortune" width="400" height="400"/>
              </div>
              <div id = "container">
                {/* <p>{feedbackId}</p> */}
                <div>
                
                  <User LoginEvent={HandleLogin} />
      
                </div>
                {login? (
                <div>
                  { enterId? (
                  <div id = "enterId">
                  <p>User ID: {handle}</p>
                  <div>
                      <label>
                        Change your user ID:
                        <input type="text"  onChange={newHandleIdChange} />
                      </label>
                      <button id="Submit" onClick={submit} stype="button">Submit</button>
                    </div>
                  </div>
                  ):(
                    <div>
                      <label>
                        Enter your user ID:
                        <input type="text" value={handle} onChange={handleIdChange} />
                      </label>
                    </div>
                  )}
                </div>
                
                ):(null)
              }   
              </div>  
            </>
            ) : (
            <> 
              <div id= "hidden" >
                <p>User ID: {handle}</p>
                
                <p id = "score"> Your current Score: {score}</p>
                <p>Hidden Phrase: {hiddenPhrase}</p>
                
                <p className={feedback.includes('Congratulations') ? 'celebration-message' : ''}>
                  {feedback}
                  {showConfetti && (
                    <>
                      {/* Add as many confetti elements as you want */}
                      <div className="confetti1" style={{ left: `${Math.random() * 100}vw` }}></div>
                      <div className="confetti2" style={{ left: `${Math.random() * 100}vw` }}></div>
                      <div className="confetti3" style={{ left: `${Math.random() * 100}vw` }}></div>
                      <div className="confetti4" style={{ left: `${Math.random() * 100}vw` }}></div>
                      <div className="confetti5" style={{ left: `${Math.random() * 100}vw` }}></div>
                      <div className="confetti1" style={{ left: `${Math.random() * 100}vw` }}></div>
                      <div className="confetti2" style={{ left: `${Math.random() * 100}vw` }}></div>
                      <div className="confetti3" style={{ left: `${Math.random() * 100}vw` }}></div>
                      <div className="confetti4" style={{ left: `${Math.random() * 100}vw` }}></div>
                      <div className="confetti5" style={{ left: `${Math.random() * 100}vw` }}></div>
                      <div className="confetti1" style={{ left: `${Math.random() * 100}vw` }}></div>
                      <div className="confetti2" style={{ left: `${Math.random() * 100}vw` }}></div>
                      <div className="confetti3" style={{ left: `${Math.random() * 100}vw` }}></div>
                      <div className="confetti4" style={{ left: `${Math.random() * 100}vw` }}></div>
                      <div className="confetti5" style={{ left: `${Math.random() * 100}vw` }}></div>
                      <div className="confetti1" style={{ left: `${Math.random() * 100}vw` }}></div>
                      <div className="confetti2" style={{ left: `${Math.random() * 100}vw` }}></div>
                      <div className="confetti3" style={{ left: `${Math.random() * 100}vw` }}></div>
                      <div className="confetti4" style={{ left: `${Math.random() * 100}vw` }}></div>
                      <div className="confetti5" style={{ left: `${Math.random() * 100}vw` }}></div>
                      <div className="confetti1" style={{ left: `${Math.random() * 100}vw` }}></div>
                      <div className="confetti2" style={{ left: `${Math.random() * 100}vw` }}></div>
                      <div className="confetti3" style={{ left: `${Math.random() * 100}vw` }}></div>
                      <div className="confetti4" style={{ left: `${Math.random() * 100}vw` }}></div>
                      <div className="confetti5" style={{ left: `${Math.random() * 100}vw` }}></div>
                      <div className="confetti1" style={{ left: `${Math.random() * 100}vw` }}></div>
                      <div className="confetti2" style={{ left: `${Math.random() * 100}vw` }}></div>
                      <div className="confetti3" style={{ left: `${Math.random() * 100}vw` }}></div>
                      <div className="confetti4" style={{ left: `${Math.random() * 100}vw` }}></div>
                      <div className="confetti5" style={{ left: `${Math.random() * 100}vw` }}></div>
                      {/* ... */}
                    </>
                  )}
                </p>
                <label>
                  Guess:   
                  <input type="text" value={userGuess} onChange={handleGuessChange} />
                </label>
                <button id="check" onClick={check} stype="button">
                  Check
                </button>
              </div>
            </>
          )}
          </div>
  
          <div id = "allrecords">
            <h3>All Records</h3>
            <table>
              <thead>
                <tr>
                  <th>User ID</th>
                  <th>Score</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
              {allRecords
                .slice() // Create a copy of the array
                .sort((a, b) => b.score - a.score)
                .map((record, index) => (
                  <tr key={index}>
                    <td>{userHandles[record.googleId] || 'Unknown'}</td>
                    <td>{record.score}</td>
                    <td>{record.date}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
        </div>
        {playNxt && (
          <>
          <button id="Save" onClick={save} stype="button">Save</button>
          <button id="PlayNext" onClick={playnext} stype="button">Play Next</button>
        
          </>
          
        )}
        
        <button id="Play" onClick={play} stype="button">
          {buttonText}
        </button>
        
      </header>
    </div>

  );
}



export default App;
