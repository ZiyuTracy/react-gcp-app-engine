import React, {useEffect, useState } from 'react';
import User from './User';
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
  const [currentScore, setCurrentScore] = useState(100);
  const [userId, setUserId] = useState(''); // New state for user ID
  const [loginId, setLoginId] = useState('');
  const [login, setLogin] = useState(false); // New state to track if ID is entered
  const [enterId, setEnteredId] = useState(false);
  const [feedbackId, setFeedbackId] = useState('');
  const [userRecords, setUserRecords] = useState([]);
  const [allRecords, setAllRecords] = useState([]);

  function HandleLogin(user) {
    if(user){
      setLoginId(user.uid);
      setLogin(true);
    }else{
      setLoginId('');
      setLogin(false);
    }
    console.log("user id:", user.uid);
	}
  
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
        // setUserRecords((prevUserRecords) => [...prevUserRecords, newUserRecord]);

        // // Update all records
        // setAllRecords((prevAllRecords) => [...prevAllRecords, newUserRecord]);

        // // Save records to local storage
        // localStorage.setItem('userRecords', JSON.stringify(userRecords));
        // localStorage.setItem('allRecords', JSON.stringify(allRecords));

        // Clear user ID
        setEnteredId(false);
        setLoginId('');
        setCurrentScore(100);
      }
      setRandomPhrase(getRandomPhrase());
      setHiddenPhrase(getHiddenPhrase(randomPhrase));
      setShowImage(current => !current);
      setButtonText((prevText) => (prevText === 'Play it!' ? 'Quit Game' : 'Play it!'));
      setFeedbackId('');
      // setCurrentIndex(phrases.indexOf(randomPhrase));
    }
  };

  const handleIdChange = (event) => {
    setUserId(event.target.value);
    setEnteredId(true);
  };

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

  useEffect(() => {
    setHiddenPhrase(getHiddenPhrase(randomPhrase));
  }, [randomPhrase]);

  function getRandomPhrase() {
    const randomIndex = Math.floor(Math.random() * phrases.length);
    return phrases[randomIndex];
  }

  function getHiddenPhrase(p) {
    return p.replace(/[a-zA-Z]/g, '*');

  }

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

          const newUserRecord = {
          userId,
          score: currentScore,
          };
          setUserRecords((prevUserRecords) => [...prevUserRecords, newUserRecord]);
          // Update all records
          setAllRecords((prevAllRecords) => [...prevAllRecords, newUserRecord]);

          // Save records to local storage
          localStorage.setItem('userRecords', JSON.stringify(userRecords));
          localStorage.setItem('allRecords', JSON.stringify(allRecords));
          
          setTimeout(() => {
            setShowConfetti(false);
          }, 3000); 
        }
      } else {
        setFeedback("It's not correct.");
        setCurrentScore(currentScore-1)
      }

      setGuessedLetters((prevGuessed) => [...prevGuessed, guessChar]);
      setUserGuess('');
    }
  }

  return (
    <div className="App">
      <header className="App-header" >
        <h1>Wheel Of Fortune</h1>
        <div id = "records">
          <div id = "userrecords">
            <h3>User Records</h3>
            <table>
              <thead>
                <tr>
                  <th>User ID</th>
                  <th>Score</th>
                </tr>
              </thead>
              <tbody>
                {userRecords.map((record, index) => (
                  <tr key={index}>
                    <td>{record.userId}</td>
                    <td>{record.score}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div id="wheel-container">
          {showImage ? (
            <>
              <img id="wheel" src="https://thetrainingarcade.com/wp-content/uploads/2020/11/WOF-EXTENDED-logo.png" alt="Wheel of Fortune" width="400" height="400"/>
              <div id = "container">
                <p>{feedbackId}</p>
                <div>
                
                  <User LoginEvent={HandleLogin} />
                  {userId}
      
                </div>
                {enterId? (
                <p>User ID: {userId}</p>
                
                ):(
                  <div>
                    <label>
                      Enter your user ID:
                      <input type="text" value={userId} onChange={handleIdChange} />
                    </label>
                 </div>
                )}
                
              </div>
            
            </>
            ) : (
            <> 
              <div id= "hidden" >
                <p>User ID: {userId}</p>
                {/* <p>{randomPhrase}</p> */}
                <p id = "score"> Your current Score: {currentScore}</p>
                <p>Hidden Phrase: {hiddenPhrase}</p>
                {/* <p>{feedback}</p> */}
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
      
          {/* <div id = "records"> */}
          {/* <div id = "userrecords">
            <h3>User Records</h3>
            <table>
              <thead>
                <tr>
                  <th>User ID</th>
                  <th>Score</th>
                </tr>
              </thead>
              <tbody>
                {userRecords.map((record, index) => (
                  <tr key={index}>
                    <td>{record.userId}</td>
                    <td>{record.score}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div> */}
          <div id = "allrecords">
            <h3>All Records</h3>
            <table>
              <thead>
                <tr>
                  <th>User ID</th>
                  <th>Score</th>
                </tr>
              </thead>
              <tbody>
                {allRecords.map((record, index) => (
                  <tr key={index}>
                    <td>{record.userId}</td>
                    <td>{record.score}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
        </div>
        <button id="Play" onClick={play} stype="button">
          {buttonText}
          </button>
      </header>
    </div>

  );
}



export default App;
